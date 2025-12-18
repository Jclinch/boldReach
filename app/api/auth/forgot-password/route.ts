// app/api/auth/forgot-password/route.ts
// Custom password reset: generate token, store it, and send email

import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log('🔑 Forgot password request for:', email);

    // Use admin client to query auth.users (requires service role key)
    console.log('🔍 Querying auth.users with service role...');
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || ''
    );

    if (!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ SERVICE_ROLE_KEY not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { data: { users: authUsers }, error: queryError } = await supabaseAdmin.auth.admin.listUsers();

    if (queryError) {
      console.error('❌ Failed to query auth.users:', queryError);
      return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }

    console.log('✅ Query result:', authUsers?.length || 0, 'total auth users found');
    const user = authUsers?.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Don't reveal if user exists for security; always return success
      console.log('⚠️ No user found with email:', email);
      return NextResponse.json({ success: true, message: 'If an account with this email exists, a reset link has been sent.' });
    }

    console.log('✅ User found:', user.id);

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    console.log('🎫 Generated token, storing in database...');
    // Store token in password_reset_tokens table using admin client
    const { error: insertError } = await supabaseAdmin
      .from('password_reset_tokens')
      .insert([
        {
          user_id: user.id,
          token,
          email: user.email,
          expires_at: expiresAt,
        },
      ]);

    if (insertError) {
      console.error('❌ Failed to store reset token:', insertError);
      return NextResponse.json({ error: 'Failed to generate reset link' }, { status: 500 });
    }

    console.log('✅ Token stored successfully');

    // Construct reset link
    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    console.log('📧 Sending password reset email...');
    // Send email
    const emailResult = await sendPasswordResetEmail(user.email || '', resetLink);

    if (!emailResult.success) {
      console.error('❌ Email send failed:', emailResult.error);
      return NextResponse.json({ error: 'Failed to send reset email' }, { status: 500 });
    }

    console.log('✅ Password reset flow completed successfully');
    return NextResponse.json({ success: true, message: 'If an account with this email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
