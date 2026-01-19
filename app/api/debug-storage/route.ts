// app/api/debug-storage/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Test 1: Check if bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    // Test 2: Try to list files with service role
    const { data: files, error: filesError } = await supabase.storage
      .from('package-images')
      .list('', { limit: 5 });
    
    // Test 3: Try a direct download of a known file
    const testPath = 'e7971478-5b2e-4a6f-bd9a-db44686b04a4/1768846036152_WhatsApp_Image_2026-01-19_at_18.56.37.jpeg';
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('package-images')
      .download(testPath);
    
    return NextResponse.json({
      bucketExists: !!buckets?.find(b => b.name === 'package-images'),
      bucketsError: bucketsError?.message,
      filesError: filesError?.message,
      filesCount: files?.length || 0,
      downloadError: downloadError?.message,
      downloadSuccess: !!fileData,
      fileSize: fileData?.size || 0
    });
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}