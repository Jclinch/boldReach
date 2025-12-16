// app/api/admin/users/route.ts
// Admin Users API - GET /api/admin/users

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(cookies());
    const { searchParams } = new URL(request.url);

    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const offset = (page - 1) * limit;

    let query = supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        role,
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
    const { data: shipmentCounts } = await supabase
      .from('shipments')
      .select('user_id')
      .in('user_id', userIds);

    const shipmentCountMap = (shipmentCounts || []).reduce((acc, shipment) => {
      acc[shipment.user_id] = (acc[shipment.user_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const users = (usersData || []).map(user => ({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
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