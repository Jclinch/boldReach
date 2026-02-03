// app/api/admin/shipments/delivery-dates/route.ts - RETURN ERRORS IN RESPONSE
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from '@supabase/supabase-js';

// Use the SAME helper function
function getServiceRoleKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
    ''
  );
}

export async function POST(request: NextRequest) {
    try {
        // 1. Authentication
        const supabase = createServerClient(cookies());
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized - Please log in' },
                { status: 401 }
            );
        }

        // 2. Admin check
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (userError || !userData?.role) {
            return NextResponse.json(
                { 
                    error: 'Failed to verify permissions',
                    details: userError?.message 
                },
                { status: 500 }
            );
        }

        const allowedRoles = ['admin', 'super_admin'];
        if (!allowedRoles.includes(userData.role)) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }
        
        // 3. Parse request
        const { shipmentIds } = await request.json();

        if (!shipmentIds || !Array.isArray(shipmentIds)) {
            return NextResponse.json(
                { error: 'shipmentIds array is required' },
                { status: 400 }
            );
        }

        // Filter valid UUIDs
        const validIds = shipmentIds.filter(id => 
            id && typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
        );
        
        if (validIds.length === 0) {
            return NextResponse.json({});
        }

        // 4. Get service key
        const serviceRoleKey = getServiceRoleKey();
        if (!serviceRoleKey) {
            return NextResponse.json({ 
                error: 'Server configuration error - Missing service role key',
                envCheck: {
                    hasSUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
                    hasNEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
                    urlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0
                }
            }, { status: 500 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey);

        // 5. Execute query - THIS WILL RETURN THE ACTUAL ERROR
        const { data, error } = await supabaseAdmin
            .from('shipment_events')
            .select('shipment_id, event_time')
            .eq('event_type', 'delivered')
            .in('shipment_id', validIds);
        
        // ⚠️ CRITICAL: Return the ACTUAL database error
        if (error) {
            return NextResponse.json(
                { 
                    error: 'DATABASE ERROR',
                    details: {
                        message: error.message,
                        code: error.code,
                        details: error.details,
                        hint: error.hint
                    },
                    queryInfo: {
                        table: 'shipment_events',
                        event_type: 'delivered',
                        shipment_count: validIds.length,
                        sample_ids: validIds.slice(0, 3)
                    }
                },
                { status: 500 }
            );
        }

        // 6. Process results
        const deliveryDates: Record<string, string> = {};
        
        data?.forEach((row: any) => {
            const shipmentId = row.shipment_id;
            const eventTime = row.event_time;
            
            if (!shipmentId || !eventTime) return;
            
            const existing = deliveryDates[shipmentId];
            if (!existing || new Date(eventTime) > new Date(existing)) {
                deliveryDates[shipmentId] = eventTime;
            }
        });
        
        return NextResponse.json(deliveryDates);
        
    } catch (error: any) {
        return NextResponse.json(
            { 
                error: 'UNEXPECTED ERROR',
                message: error.message,
                stack: error.stack?.split('\n').slice(0, 3)
            },
            { status: 500 }
        );
    }
}