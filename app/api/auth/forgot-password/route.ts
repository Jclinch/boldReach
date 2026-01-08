// app/api/auth/forgot-password/route.ts
// Deprecated: the UI calls Supabase directly for password recovery.

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  void request;
  return NextResponse.json(
    { error: 'Deprecated. Use Supabase password recovery from the client.' },
    { status: 410 }
  );
}
