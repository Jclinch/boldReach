// app/api/shipments/draft/route.ts
// API Route - app/page-path: POST /api/shipments/draft

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // This would typically save to a session or local storage
    // For now, we'll just acknowledge the request
    const body = await request.json();

    // Could implement session-based storage or temporary database
    return NextResponse.json(
      { message: 'Draft saved to browser storage' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Save draft error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
