// app/api/shipments/route.ts
// API Route - app/page-path: GET/POST /api/shipments

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
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

// Get shipments
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    let query = supabase
      .from('shipments')
      .select('*')
      .order('created_at', { ascending: false });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(
        `tracking_number.ilike.%${search}%,pickup_location.ilike.%${search}%,delivery_location.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch shipments' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Fetch shipments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create shipment
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const { data, error } = await supabase
      .from('shipments')
      .insert([
        {
          user_id: userId,
          pickup_location: body.pickupLocation,
          pickup_address: body.pickupAddress,
          pickup_city: body.pickupCity,
          pickup_postal_code: body.pickupPostalCode,
          delivery_location: body.deliveryLocation,
          delivery_address: body.deliveryAddress,
          delivery_city: body.deliveryCity,
          delivery_postal_code: body.deliveryPostalCode,
          shipment_type: body.shipmentType,
          weight_kg: body.weightKg,
          length_cm: body.lengthCm,
          width_cm: body.widthCm,
          height_cm: body.heightCm,
          contents_description: body.contentsDescription,
          insurance_required: body.insuranceRequired,
          insurance_amount: body.insuranceAmount,
          signature_required: body.signatureRequired,
          special_handling: body.specialHandling,
          reference_number: body.referenceNumber,
          special_instructions: body.specialInstructions,
          status: 'confirmed',
          estimated_delivery_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create shipment' },
        { status: 500 }
      );
    }

    // Create initial tracking event
    await supabase.from('tracking_events').insert([
      {
        shipment_id: data.id,
        event_type: 'pickup_scheduled',
        description: 'Shipment created and ready for pickup',
        status: 'pending',
        event_timestamp: new Date().toISOString(),
      },
    ]);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Create shipment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
