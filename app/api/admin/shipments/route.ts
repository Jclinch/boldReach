// app/api/admin/shipments/route.ts
// Admin Shipments API - GET /api/admin/shipments

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

type ShipmentListRow = {
  id: string;
  status: string | null;
  progress_step: string | null;
  [key: string]: unknown;
};

type DeliveredEventRow = {
  shipment_id: string;
  event_time: string;
};

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

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const all = searchParams.get('all') === '1';

    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('shipments')
      .select(`
        id,
        tracking_number,
        status,
        progress_step,
        sender_name,
        receiver_contact,
        receiver_name,
        origin_location,
        destination,
        items_description,
        weight,
        package_quantity,
        shipment_date,
        created_at,
        user_id
      `, { count: 'exact' });

    // Apply filters
    if (search) {
      // Search across tracking_number, destination, and items_description
      query = query.or(
        `tracking_number.ilike.%${search}%,destination.ilike.%${search}%,items_description.ilike.%${search}%`
      );
    }

    if (status) {
      // The admin UI sends progress_step-like values (pending/in_transit/out_for_delivery/delivered).
      // The DB also has a shipment_status enum (created/confirmed/in_transit/delivered/...).
      // Support both by routing known progress steps to progress_step filtering.
      const normalized = status.toLowerCase();
      const progressSteps = ['pending', 'in_transit', 'out_for_delivery', 'delivered'];
      if (progressSteps.includes(normalized)) {
        query = query.eq('progress_step', normalized);
      } else {
        query = query.eq('status', normalized);
      }
    }

    const ordered = query.order('created_at', { ascending: false });

    const { data: shipments, error, count } = all
      ? await ordered.limit(Number.isFinite(limit) ? limit : 5000)
      : await ordered.range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching shipments:', error);
      return NextResponse.json({ error: 'Failed to fetch shipments' }, { status: 500 });
    }

    // Attach delivered_at (date/time when status was marked delivered) using shipment_events.
    // We intentionally compute this server-side so CSV exports can include it without N+1 client queries.
    const shipmentList: ShipmentListRow[] = Array.isArray(shipments) ? (shipments as ShipmentListRow[]) : [];
    const deliveredIds = shipmentList
      .filter((s) => String(s.status || '').toLowerCase() === 'delivered' || String(s.progress_step || '').toLowerCase() === 'delivered')
      .map((s) => s.id)
      .filter(Boolean);

    const deliveredAtByShipmentId: Record<string, string> = {};
    if (deliveredIds.length > 0) {
      const { data: deliveredEvents, error: deliveredEventsError } = await supabaseAdmin
        .from('shipment_events')
        .select('shipment_id,event_time')
        .in('shipment_id', deliveredIds)
        .eq('event_type', 'delivered')
        .order('event_time', { ascending: false });

      if (deliveredEventsError) {
        console.warn('Failed to fetch delivered events:', deliveredEventsError);
      } else {
        // Because we ordered DESC, the first time we see a shipment_id is its latest delivered timestamp.
        for (const ev of (deliveredEvents || []) as DeliveredEventRow[]) {
          const sid = ev.shipment_id;
          const t = ev.event_time;
          if (sid && t && !deliveredAtByShipmentId[sid]) deliveredAtByShipmentId[sid] = t;
        }
      }
    }

    const shipmentsWithDeliveredAt = shipmentList.map((s) => ({
      ...s,
      delivered_at: deliveredAtByShipmentId[s.id] || null,
    }));

    const totalPages = all ? 1 : Math.ceil((count || 0) / limit);

    return NextResponse.json({
      shipments: shipmentsWithDeliveredAt,
      totalPages,
      currentPage: page,
      totalCount: count || 0,
    });
  } catch (error) {
    console.error('Admin shipments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}