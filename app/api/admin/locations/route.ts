// app/api/admin/locations/route.ts
// SuperAdmin Locations API - GET/POST /api/admin/locations

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

async function getRequesterRole(userId: string) {
  const serviceRoleKey = getServiceRoleKey();
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    serviceRoleKey
  );

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  return { role: (data?.role ?? null) as string | null, error };
}

export async function GET() {
  try {
    const supabase = createClient(cookies());

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceRoleKey = getServiceRoleKey();
    if (!serviceRoleKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { role } = await getRequesterRole(user.id);
    if (role !== 'super_admin') {
      return NextResponse.json({ error: 'SuperAdmin access required' }, { status: 403 });
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      serviceRoleKey
    );

    const { data, error } = await supabaseAdmin
      .from('locations')
      .select('id,name,is_active,created_at')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching locations:', error);
      return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
    }

    return NextResponse.json({ locations: data || [] });
  } catch (error) {
    console.error('Admin locations GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(cookies());

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceRoleKey = getServiceRoleKey();
    if (!serviceRoleKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { role } = await getRequesterRole(user.id);
    if (role !== 'super_admin') {
      return NextResponse.json({ error: 'SuperAdmin access required' }, { status: 403 });
    }

    const body = (await request.json().catch(() => ({}))) as { name?: unknown };
    const name = typeof body.name === 'string' ? body.name.trim() : '';

    if (!name) {
      return NextResponse.json({ error: 'Location name is required' }, { status: 400 });
    }
    if (name.length > 200) {
      return NextResponse.json({ error: 'Location name is too long' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      serviceRoleKey
    );

    // Upsert by unique name; also re-activate if it was previously disabled.
    const { data, error } = await supabaseAdmin
      .from('locations')
      .upsert({ name, is_active: true }, { onConflict: 'name' })
      .select('id,name,is_active,created_at')
      .single();

    if (error) {
      console.error('Error upserting location:', error);
      return NextResponse.json({ error: 'Failed to add location' }, { status: 500 });
    }

    return NextResponse.json({ location: data });
  } catch (error) {
    console.error('Admin locations POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
