// app/api/auth/reset-password/route.ts
// Deprecated: password recovery is handled via Supabase recovery session.

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  void request;
  return NextResponse.json(
    { error: 'Use Supabase password recovery flow' },
    { status: 410 }
  );
}
