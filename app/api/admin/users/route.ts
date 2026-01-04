// app/api/admin/users/route.ts
// Admin Users API - GET /api/admin/users

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

function isValidEmail(email: string) {
  // Simple, safe email sanity check (Supabase will validate further)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(cookies());
    const { searchParams } = new URL(request.url);

    // Check if user is admin
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

    // Role check: try cookie client first (fast), then fallback to service role (handles strict RLS).
    let role: string | null = null;
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userError) {
      role = (userData?.role ?? null) as string | null;
    } else {
      const { data: adminUserData, error: adminUserError } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!adminUserError) {
        role = (adminUserData?.role ?? null) as string | null;
      }
    }

    if (role !== 'super_admin') {
      return NextResponse.json({ error: 'SuperAdmin access required' }, { status: 403 });
    }

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const offset = (page - 1) * limit;

    // Use service role to list all users regardless of RLS.
    let query = supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        full_name,
        role,
        location,
        created_at,
        last_sign_in_at
      `, { count: 'exact' });

    // Apply search filter
    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data: usersData, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Get shipment counts for each user
    const userIds = usersData?.map(u => u.id) || [];
    const { data: shipmentCounts, error: shipmentCountError } = await supabaseAdmin
      .from('shipments')
      .select('user_id')
      .in('user_id', userIds);

    if (shipmentCountError) {
      // Non-fatal: still return users, just without counts.
      console.error('Error fetching shipment counts:', shipmentCountError);
    }

    const shipmentCountMap = (shipmentCounts || []).reduce((acc, shipment) => {
      acc[shipment.user_id] = (acc[shipment.user_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const users = (usersData || []).map(user => ({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      location: user.location,
      createdAt: user.created_at,
      lastSignIn: user.last_sign_in_at,
      shipmentCount: shipmentCountMap[user.id] || 0,
    }));

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      users,
      totalPages,
      currentPage: page,
      totalCount: count || 0,
    });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create user (SuperAdmin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(cookies());

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

    // Role check: cookie client first, fallback to service role.
    let role: string | null = null;
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    if (!userError) {
      role = (userData?.role ?? null) as string | null;
    } else {
      const { data: adminUserData, error: adminUserError } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      if (!adminUserError) {
        role = (adminUserData?.role ?? null) as string | null;
      }
    }

    if (role !== 'super_admin') {
      return NextResponse.json({ error: 'SuperAdmin access required' }, { status: 403 });
    }

    const body = await request.json();
    const fullName = (body?.fullName ?? '').toString().trim();
    const email = (body?.email ?? '').toString().trim().toLowerCase();
    const password = (body?.password ?? '').toString();
    const location = (body?.location ?? '').toString().trim();

    if (!fullName || fullName.length < 2 || fullName.length > 120) {
      return NextResponse.json({ error: 'Valid full name is required' }, { status: 400 });
    }
    if (!email || !isValidEmail(email) || email.length > 254) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (!password || password.length < 8 || password.length > 128) {
      return NextResponse.json({ error: 'Password must be 8-128 characters' }, { status: 400 });
    }
    if (!location || location.length > 160) {
      return NextResponse.json({ error: 'Location is required' }, { status: 400 });
    }

    // Create auth user
    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (createError || !created?.user) {
      // Avoid disclosing if an email exists
      console.error('Failed to create auth user:', createError);
      const msg = (createError as unknown as { message?: string })?.message || '';
      if (/already\s*(registered|exists)/i.test(msg)) {
        return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to create user' }, { status: 400 });
    }

    // Insert into app profile table
    // Use upsert because some Supabase setups have a trigger that auto-creates a profile row
    // on auth user creation. Upsert keeps this endpoint idempotent.
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .upsert(
        [
          {
            id: created.user.id,
            email,
            full_name: fullName,
            role: 'user',
            location,
          },
        ],
        { onConflict: 'id' }
      );

    if (profileError) {
      console.error('Failed to insert profile:', profileError);
      // If the DB migration hasn't been applied yet, location column may not exist.
      if ((profileError as unknown as { code?: string })?.code === '42703') {
        return NextResponse.json(
          { error: 'Database schema not updated. Apply the location/roles migration and retry.' },
          { status: 500 }
        );
      }
      // Best-effort cleanup to avoid orphaned auth users
      try {
        await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      } catch (e) {
        console.error('Failed to cleanup auth user:', e);
      }
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: { id: created.user.id, email, fullName, location },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}