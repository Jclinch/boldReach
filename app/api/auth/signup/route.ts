// app/api/auth/signup/route.ts
// API Route - app/page-path: POST /api/auth/signup

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Sign up has been disabled: accounts are provisioned by SuperAdmin.
    // Keep endpoint to avoid leaking implementation details and to prevent accidental re-enabling.
    return NextResponse.json(
      { error: 'Sign up is disabled. Please contact your administrator.' },
      { status: 403 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}