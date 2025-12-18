// app/api/auth/reset-password/route.ts
// Custom password reset: validate token and update password in Supabase auth

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { token, password, email } = await request.json();

    if (!token || !password || !email) {
      return NextResponse.json({ error: 'Token, password, and email are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    const supabase = createClient(cookies());

    // Fetch the reset token record (using public client - RLS will enforce access)
    const { data: resetToken, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (tokenError || !resetToken) {
      return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 });
    }

    // Check if token has expired
    if (new Date(resetToken.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Reset link has expired' }, { status: 400 });
    }

    // Check if token has already been used
    if (resetToken.used_at) {
      return NextResponse.json({ error: 'This reset link has already been used' }, { status: 400 });
    }

    // Verify email matches
    if (resetToken.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: 'Email does not match reset token' }, { status: 400 });
    }

    // Create admin client with service role key to update auth password
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || ''
    );

    if (!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Update password in Supabase auth using admin client
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      resetToken.user_id,
      { password }
    );

    if (updateError) {
      console.error('Failed to update password:', updateError);
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
    }

    // Mark token as used
    const { error: markError } = await supabase
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', resetToken.id);

    if (markError) {
      console.error('Failed to mark token as used:', markError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Password has been successfully updated. Please sign in with your new password.',
      userId: resetToken.user_id,
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
