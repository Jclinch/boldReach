// app/api/shipments/delivery-dates/route.ts
// POST /api/shipments/delivery-dates
// Returns a map of shipmentId -> delivered event_time (ISO string), scoped to the signed-in user's location.

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

type AllowedShipmentRow = { id: string };
type DeliveredEventRow = { shipment_id: string; event_time: string };

function getServiceRoleKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
    ''
  );
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(cookies());

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('location')
      .eq('id', user.id)
      .single();

    const location = (profile?.location || '').toString().trim();
    if (profileError || !location) {
      return NextResponse.json({ error: 'User location not set' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const shipmentIds = Array.isArray(body?.shipmentIds) ? body.shipmentIds : [];
    const ids = shipmentIds
      .map((id: unknown) => (typeof id === 'string' ? id : ''))
      .filter(Boolean);

    if (ids.length === 0) {
      return NextResponse.json({ deliveredAtById: {} });
    }

    const serviceRoleKey = getServiceRoleKey();
    if (!serviceRoleKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      serviceRoleKey,
    );

    // Enforce location scoping server-side (prevents asking for arbitrary shipment IDs).
    const { data: allowedShipments, error: allowedError } = await supabaseAdmin
      .from('shipments')
      .select('id')
      .in('id', ids)
      .or(`origin_location.eq.${location},destination.eq.${location}`);

    if (allowedError) {
      console.error('Failed to validate shipment IDs:', allowedError);
      return NextResponse.json({ error: 'Failed to validate shipments' }, { status: 500 });
    }

    const allowedIds = (allowedShipments || [])
      .map((s) => (s as AllowedShipmentRow).id)
      .filter(Boolean);
    if (allowedIds.length === 0) {
      return NextResponse.json({ deliveredAtById: {} });
    }

    const { data: deliveredEvents, error: deliveredEventsError } = await supabaseAdmin
      .from('shipment_events')
      .select('shipment_id,event_time')
      .in('shipment_id', allowedIds)
      .eq('event_type', 'delivered')
      .order('event_time', { ascending: false });

    if (deliveredEventsError) {
      console.error('Failed to fetch delivered events:', deliveredEventsError);
      return NextResponse.json({ error: 'Failed to fetch delivery dates' }, { status: 500 });
    }

    const deliveredAtById: Record<string, string> = {};
    for (const ev of (deliveredEvents || []) as DeliveredEventRow[]) {
      const sid = ev.shipment_id;
      const t = ev.event_time;
      if (sid && t && !deliveredAtById[sid]) deliveredAtById[sid] = t;
    }

    return NextResponse.json({ deliveredAtById });
  } catch (error) {
    console.error('Delivery dates error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
