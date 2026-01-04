// app/api/admin/dashboard/route.ts
// Admin Dashboard API - GET /api/admin/dashboard

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

export async function GET(request: NextRequest) {
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

    if (requesterRole !== 'super_admin' && requesterRole !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get dashboard statistics
    const [
      { count: totalShipments },
      { count: activeShipments },
      { count: totalUsers },
      { count: adminUsers },
    ] = await Promise.all([
      supabaseAdmin.from('shipments').select('*', { count: 'exact', head: true }),
      supabaseAdmin
        .from('shipments')
        .select('*', { count: 'exact', head: true })
        .in('status', ['confirmed', 'in_transit']),
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
    ]);

    // Get recent shipments
    const { data: recentShipments, error: shipmentsError } = await supabaseAdmin
      .from('shipments')
      .select(`
        id,
        tracking_number,
        status,
        sender_name,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (shipmentsError) {
      console.error('Error fetching recent shipments:', shipmentsError);
    }

    return NextResponse.json({
      totalShipments: totalShipments || 0,
      activeShipments: activeShipments || 0,
      totalUsers: totalUsers || 0,
      adminUsers: adminUsers || 0,
      recentShipments: recentShipments || [],
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}