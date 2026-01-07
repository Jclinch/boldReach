// app/api/auth/forgot-password/route.ts
// Supabase password reset (built-in): send recovery email handled by Supabase

import { createClient as createAnonClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function getSiteUrl(request: NextRequest) {
  // Prefer request origin (works in dev + most deployments) to avoid stale/mismatched env URLs.
  // Fallback to configured app URL if request origin isn't available.
  return request.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

function isDev() {
  return process.env.NODE_ENV !== 'production';
}

function safeStringify(value: unknown) {
  try {
    if (value instanceof Error) {
      return JSON.stringify({
        name: value.name,
        message: value.message,
        stack: value.stack,
      });
    }

    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';
    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createAnonClient(supabaseUrl, anonKey);
    const redirectTo = `${getSiteUrl(request)}/reset-password`;

    // Do not reveal if user exists.
    // But do surface actionable delivery/config errors (rate limit, bad redirect, missing SMTP) as non-enumerating failures.
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) {
      console.error('Supabase resetPasswordForEmail error:', error);

      const msg = (error as { message?: string }).message || '';
      const status = (error as { status?: number }).status;
      const debugDetails = isDev()
        ? {
            details: msg || safeStringify(error),
            status,
            redirectTo,
            supabaseUrlHost: (() => {
              try {
                return new URL(supabaseUrl).host;
              } catch {
                return supabaseUrl;
              }
            })(),
          }
        : {};

      if (status === 429 || /rate|too many|over_email_send_rate_limit/i.test(msg)) {
        return NextResponse.json(
          { error: 'Too many reset requests. Please wait a moment and try again.', ...debugDetails },
          { status: 429 }
        );
      }

      if (/redirect|redirectto|invalid url|site url/i.test(msg)) {
        return NextResponse.json(
          {
            error: 'Reset email is temporarily unavailable (redirect URL not allowed). Contact support.',
            ...debugDetails,
          },
          { status: 500 }
        );
      }

      if (/smtp|mail|email provider|error sending email/i.test(msg)) {
        return NextResponse.json(
          {
            error: 'Reset email is temporarily unavailable (email provider not configured).',
            ...debugDetails,
          },
          { status: 500 }
        );
      }

      // For other errors, return a generic 500 (still not revealing whether the user exists).
      return NextResponse.json(
        {
          error: 'Reset email is temporarily unavailable. Please try again later.',
          ...debugDetails,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with this email exists, a reset link has been sent.',
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
