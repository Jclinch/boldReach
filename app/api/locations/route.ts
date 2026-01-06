// app/api/locations/route.ts
// Locations (read-only) - GET /api/locations

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

function getServiceRoleKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
    ''
  );
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

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      serviceRoleKey
    );

    const { data, error } = await supabaseAdmin
      .from('locations')
      .select('id,name')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching locations:', error);
      return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
    }

    return NextResponse.json({ locations: data || [] });
  } catch (error) {
    console.error('Locations GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
