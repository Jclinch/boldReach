import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;


export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path');

    if (!path) {
        return NextResponse.json({ error: 'No path provided' }, { status: 400 });
    }

    if (!supabase) {
        console.error('Supabase credentials not configured');
        return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
    }

    try {
        const { data, error} = await supabase.storage
            .from('package-images')
            .download(path)
        
        if (error) {
            console.error('Supabase storage error:', error.message);
            return NextResponse.json({ error: 'Image not found' }, { status: 404 });
        }

        const buffer = await data.arrayBuffer();

        const contentType = data.type || 'image/jpeg';
        
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
                'Content-Disposition': 'inline', 
            }
        });
        
    } catch (error) {
        console.error('Proxy image error:', error);
        return NextResponse.json({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}