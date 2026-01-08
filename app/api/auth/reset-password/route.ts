// app/api/auth/reset-password/route.ts
// Deprecated: password recovery is handled via Supabase recovery session in /reset-password.

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  void request;
  return NextResponse.json(
    { error: 'Deprecated. Use the Supabase recovery session flow.' },
    { status: 410 }
  );
}
