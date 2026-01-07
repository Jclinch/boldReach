// app/api/shipments/stats/route.ts
// API Route - app/page-path: GET /api/shipments/stats

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)!
);

function getUserIdFromAuth(request: NextRequest): string | null {
  const cookieStore = request.cookies;
  const authToken = cookieStore.get('auth_token')?.value;

  if (!authToken) return null;

  try {
    const decoded = JSON.parse(Buffer.from(authToken, 'base64').toString());
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total shipments
    const { data: allShipments, error: allError } = await supabase
      .from('shipments')
      .select('id')
      .eq('user_id', userId);

    // Get in transit shipments
    const { data: inTransitShipments, error: inTransitError } = await supabase
      .from('shipments')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'in_transit');

    // Get delivered shipments
    const { data: deliveredShipments, error: deliveredError } = await supabase
      .from('shipments')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'delivered');

    return NextResponse.json({
      totalShipments: allShipments?.length || 0,
      inTransit: inTransitShipments?.length || 0,
      delivered: deliveredShipments?.length || 0,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
