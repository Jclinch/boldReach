// app/api/admin/shipments/[id]/route.ts
// Admin Shipment Update API - PATCH /api/admin/shipments/[id]

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient(cookies());
    const { id } = await params;

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

    if (userError || userData?.role !== 'super_admin') {
      return NextResponse.json({ error: 'SuperAdmin access required' }, { status: 403 });
    }

    const { status: progressStep, location, receiverName, weightKg, packageQuantity } = await request.json();

    if (!progressStep) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Valid progress_step values from shipment_progress_step enum
    const validProgressSteps = ['pending', 'in_transit', 'out_for_delivery', 'delivered'];
    if (!validProgressSteps.includes(progressStep)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Map progress_step to the corresponding shipment_status enum value
    // shipment_status enum: 'draft', 'created', 'confirmed', 'in_transit', 'delivered', 'cancelled', 'returned'
    const progressToStatusMap: Record<string, string> = {
      'pending': 'created',
      'in_transit': 'in_transit',
      'out_for_delivery': 'in_transit', // out_for_delivery is still "in transit" from status perspective
      'delivered': 'delivered',
    };
    const shipmentStatus = progressToStatusMap[progressStep] || 'created';

    // Build update object
    const updateData: Record<string, unknown> = { 
      status: shipmentStatus, 
      progress_step: progressStep,
      updated_at: new Date().toISOString() 
    };
    
    // Include destination if location is provided
    if (location && location.trim()) {
      updateData.destination = location.trim();
    }

    // Optional: update receiver name
    if (typeof receiverName === 'string') {
      const trimmed = receiverName.trim();
      if (!trimmed) {
        return NextResponse.json({ error: 'Receiver name cannot be empty' }, { status: 400 });
      }
      if (trimmed.length > 120) {
        return NextResponse.json({ error: 'Receiver name is too long' }, { status: 400 });
      }
      updateData.receiver_name = trimmed;
    }

    // Optional: update weight (kg)
    if (weightKg !== undefined) {
      if (weightKg === null) {
        updateData.weight = null;
      } else {
        const num = Number(weightKg);
        if (!Number.isFinite(num) || num <= 0 || num > 100000) {
          return NextResponse.json({ error: 'Invalid weight' }, { status: 400 });
        }
        updateData.weight = num;
      }
    }

    // Optional: update package quantity
    if (packageQuantity !== undefined) {
      if (packageQuantity === null || packageQuantity === '') {
        return NextResponse.json({ error: 'Package quantity is required' }, { status: 400 });
      }
      const qty = Number(packageQuantity);
      if (!Number.isFinite(qty) || !Number.isInteger(qty) || qty < 1 || qty > 100000) {
        return NextResponse.json({ error: 'Invalid package quantity' }, { status: 400 });
      }
      updateData.package_quantity = qty;
    }

    // Update shipment
    const { error: updateError } = await supabase
      .from('shipments')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('Error updating shipment:', updateError);
      return NextResponse.json({ error: 'Failed to update shipment' }, { status: 500 });
    }

    // Create shipment event for status change
    const eventDescription = location && location.trim() 
      ? `Status changed to ${progressStep.replace(/_/g, ' ')} - Location: ${location.trim()}`
      : `Status changed to ${progressStep.replace(/_/g, ' ')}`;
    
    const { error: eventError } = await supabase
      .from('shipment_events')
      .insert({
        shipment_id: id,
        event_type: progressStep,
        description: eventDescription,
        location: location?.trim() || null,
        created_by: user.id,
      });

    if (eventError) {
      console.error('Error creating event:', eventError);
      // Don't fail the request if event creation fails
    }

    return NextResponse.json({ message: 'Shipment updated successfully' });
  } catch (error) {
    console.error('Admin shipment update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
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

    // SuperAdmin only
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || userData?.role !== 'super_admin') {
      return NextResponse.json({ error: 'SuperAdmin access required' }, { status: 403 });
    }

    // Best-effort cleanup of dependent rows (if no FK cascade configured)
    const { error: attachErr } = await supabaseAdmin
      .from('shipment_attachments')
      .delete()
      .eq('shipment_id', id);
    if (attachErr) console.warn('Failed to delete shipment_attachments:', attachErr);

    const { error: eventsErr } = await supabaseAdmin
      .from('shipment_events')
      .delete()
      .eq('shipment_id', id);
    if (eventsErr) console.warn('Failed to delete shipment_events:', eventsErr);

    const { error: deleteErr } = await supabaseAdmin
      .from('shipments')
      .delete()
      .eq('id', id);

    if (deleteErr) {
      console.error('Error deleting shipment:', deleteErr);
      return NextResponse.json({ error: 'Failed to delete shipment' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Shipment deleted successfully' });
  } catch (error) {
    console.error('Admin shipment delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}