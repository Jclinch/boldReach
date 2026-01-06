// app/api/admin/locations/[id]/route.ts
// SuperAdmin Locations API - DELETE /api/admin/locations/[id]

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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient(cookies());
    const { id } = await params;

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

    const { data: requester, error: requesterError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (requesterError || requester?.role !== 'super_admin') {
      return NextResponse.json({ error: 'SuperAdmin access required' }, { status: 403 });
    }

    // Soft-delete: mark inactive so existing users/shipments referencing it are not broken.
    const { error: updateError } = await supabaseAdmin
      .from('locations')
      .update({ is_active: false })
      .eq('id', id);

    if (updateError) {
      console.error('Error deleting location:', updateError);
      return NextResponse.json({ error: 'Failed to remove location' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Location removed' });
  } catch (error) {
    console.error('Admin locations DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
