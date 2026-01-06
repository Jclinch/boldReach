// app/api/admin/users/[id]/route.ts
// Admin User Update API - PATCH /api/admin/users/[id]

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

function getServiceRoleKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
    ''
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient(cookies());
    const { id } = await params;

    // Check if user is super admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceRoleKey = getServiceRoleKey();
    if (!serviceRoleKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      serviceRoleKey
    );

    // Role check: cookie client first, fallback to service role (handles strict RLS).
    let requesterRole: string | null = null;
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    if (!userError) {
      requesterRole = (userData?.role ?? null) as string | null;
    } else {
      const { data: adminUserData, error: adminUserError } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      if (!adminUserError) {
        requesterRole = (adminUserData?.role ?? null) as string | null;
      }
    }

    if (requesterRole !== 'super_admin') {
      return NextResponse.json({ error: 'SuperAdmin access required' }, { status: 403 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      role?: unknown;
      location?: unknown;
    };

    const role = typeof body.role === 'string' ? body.role : undefined;
    const location = typeof body.location === 'string' ? body.location : undefined;

    if (!role && location === undefined) {
      return NextResponse.json({ error: 'No update fields provided' }, { status: 400 });
    }

    if (role && !['user', 'admin', 'super_admin'].includes(role)) {
      return NextResponse.json({ error: 'Valid role is required' }, { status: 400 });
    }

    if (location !== undefined) {
      const trimmed = location.trim();
      if (!trimmed) {
        return NextResponse.json({ error: 'Valid location is required' }, { status: 400 });
      }
      if (trimmed.length > 255) {
        return NextResponse.json({ error: 'Location is too long' }, { status: 400 });
      }

    // Validate location against DB-managed list
    const { data: locRow, error: locError } = await supabaseAdmin
      .from('locations')
      .select('id')
      .eq('name', trimmed)
      .eq('is_active', true)
      .maybeSingle();
    if (locError) {
      console.error('Failed to validate location:', locError);
      return NextResponse.json(
        { error: 'Database schema not updated. Apply the locations migration and retry.' },
        { status: 500 }
      );
    }
    if (!locRow) {
      return NextResponse.json({ error: 'Invalid location. Add it in SuperAdmin Settings first.' }, { status: 400 });
    }
    }

    // Never allow changing a SuperAdmin account via this endpoint.
    const { data: target, error: targetError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', id)
      .single();
    if (targetError) {
      console.error('Error fetching target user:', targetError);
      return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
    }
    if ((target?.role || '').toString() === 'super_admin') {
      return NextResponse.json({ error: 'Cannot modify SuperAdmin account' }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {};
    if (role) updatePayload.role = role;
    if (location !== undefined) updatePayload.location = location.trim();

    // Use service role to bypass RLS safely (protected by SuperAdmin session check above).
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update(updatePayload)
      .eq('id', id);

    if (updateError) {
      console.error('Error updating user role:', updateError);
      return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
    }

    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Admin user update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}