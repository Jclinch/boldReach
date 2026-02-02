import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
    try {

        const supabase = createServerClient(cookies());
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized - Please log in' },
                { status: 401 }
            );
        }

        
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (userError) {
            console.error('Error fetching user role:', userError);
            return NextResponse.json(
                { error: 'Failed to verify permissions' },
                { status: 500 }
            );
        }

        // Only allow admins or super_admins
        const allowedRoles = ['admin', 'super_admin'];
        if (!userData?.role || !allowedRoles.includes(userData.role)) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }
        const { shipmentIds } = await request.json();

        if (!shipmentIds || !Array.isArray(shipmentIds)) {
            return NextResponse.json(
                { error: 'shipmentIds array is required' },
                { status: 400 }
            );
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        const { data, error } = await supabaseAdmin
            .from('shipment_events')
            .select('shipment_id, event_time')
            .eq('event_type', 'delivered')
            .in('shipment_id', shipmentIds);
        
        if (error) {
            console.error('Database error:', error);
            console.log("SERVICE KEY EXISTS:", !!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY);
            return NextResponse.json(
                { error: 'Failed to fetch delivery dates' },
                
                { status: 500 }
            );
        }

        // Process to get latest delivery date per shipment
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
        console.log("SERVICE KEY EXISTS:", !!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY);

        return NextResponse.json(deliveryDates);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}