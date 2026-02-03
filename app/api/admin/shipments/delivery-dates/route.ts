// app/api/admin/shipments/delivery-dates/route.ts - FIXED WITH BATCHING
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

// Helper to chunk array into smaller batches
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
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
        
        console.log(`Processing ${validIds.length} valid shipment IDs`);
        
        if (validIds.length === 0) {
            return NextResponse.json({});
        }

        // 4. Get service key
        const serviceRoleKey = getServiceRoleKey();
        if (!serviceRoleKey) {
            return NextResponse.json({ 
                error: 'Server configuration error - Missing service role key'
            }, { status: 500 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey);

        // 5. CHUNK THE IDs - PostgreSQL has limits on IN() clause size
        // Typical limit is 100-1000 parameters, we'll use 100 per batch
        const CHUNK_SIZE = 100;
        const idChunks = chunkArray(validIds, CHUNK_SIZE);
        
        console.log(`Breaking ${validIds.length} IDs into ${idChunks.length} chunks of ${CHUNK_SIZE}`);
        
        // 6. Execute queries in parallel (but limited)
        const deliveryDates: Record<string, string> = {};
        
        // Process chunks sequentially to avoid overwhelming the database
        for (let i = 0; i < idChunks.length; i++) {
            const chunk = idChunks[i];
            console.log(`Processing chunk ${i + 1}/${idChunks.length} (${chunk.length} IDs)`);
            
            const { data, error } = await supabaseAdmin
                .from('shipment_events')
                .select('shipment_id, event_time')
                .eq('event_type', 'delivered')
                .in('shipment_id', chunk);
            
            if (error) {
                console.error(`Error in chunk ${i + 1}:`, error);
                // Continue with other chunks instead of failing completely
                continue;
            }
            
            // Process results from this chunk
            data?.forEach((row: any) => {
                const shipmentId = row.shipment_id;
                const eventTime = row.event_time;
                
                if (!shipmentId || !eventTime) return;
                
                const existing = deliveryDates[shipmentId];
                if (!existing || new Date(eventTime) > new Date(existing)) {
                    deliveryDates[shipmentId] = eventTime;
                }
            });
        }
        
        console.log(`✅ Found delivery dates for ${Object.keys(deliveryDates).length} shipments`);
        return NextResponse.json(deliveryDates);
        
    } catch (error: any) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { 
                error: 'Internal server error',
                message: error.message
            },
            { status: 500 }
        );
    }
}