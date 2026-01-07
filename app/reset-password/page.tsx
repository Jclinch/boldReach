// app/reset-password/page.tsx
// Reset Password page using custom password reset flow

'use client';

import React, { useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

function ResetPasswordContent() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hashParams, setHashParams] = useState<URLSearchParams | null>(null);

  useEffect(() => {
    // Supabase can return recovery params in the URL hash fragment.
    const hash = window.location.hash?.startsWith('#') ? window.location.hash.slice(1) : '';
    setHashParams(new URLSearchParams(hash));
  }, []);

  const getParam = useMemo(() => {
    return (key: string) => searchParams.get(key) ?? hashParams?.get(key) ?? null;
  }, [hashParams, searchParams]);

  const code = getParam('code');
  const type = getParam('type');
  const tokenHash = getParam('token_hash');
  const accessToken = getParam('access_token');
  const refreshToken = getParam('refresh_token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Supabase recovery flow (preferred): code exchange (PKCE)
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (!cancelled) {
            setSessionReady(true);
            setTokenValid(true);
          }
          return;
        }

        // Supabase email links may use token_hash
        if (tokenHash && (type === 'recovery' || type === null)) {
          const { error } = await supabase.auth.verifyOtp({ type: 'recovery', token_hash: tokenHash });
          if (error) throw error;
          if (!cancelled) {
            setSessionReady(true);
            setTokenValid(true);
          }
          return;
        }

        // Legacy implicit flow: access_token + refresh_token
        if (type === 'recovery' && accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          if (!cancelled) {
            setSessionReady(true);
            setTokenValid(true);
          }
          return;
        }

        if (!cancelled) {
          setTokenValid(false);
          setSessionReady(false);
        }
        toast.error('Invalid or expired reset link. Please request a new one.');
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Failed to verify reset link';
        if (!cancelled) {
          setTokenValid(false);
          setSessionReady(false);
        }
        toast.error(message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accessToken, code, refreshToken, supabase, tokenHash, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!tokenValid || !sessionReady) {
        toast.error('Invalid reset link.');
        setIsSubmitting(false);
        return;
      }
      if (!password || password.length < 8) {
        toast.error('Password must be at least 8 characters long.');
        setIsSubmitting(false);
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match.');
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(error.message || 'Failed to update password');
        setIsSubmitting(false);
        return;
      }

      toast.success('Password updated. Please sign in.');
      await supabase.auth.signOut().catch(() => undefined);
      router.push('/signin');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'An unexpected error occurred';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-6 rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-[#1E293B] mb-2">Reset Password</h1>
        <p className="text-sm text-[#475569] mb-6">
          {tokenValid
            ? 'Enter a new password for your account.'
            : 'This reset link is invalid or has expired. Please request a new one.'}
        </p>

        {!tokenValid ? (
          <p className="text-center text-sm text-orange-500">
            <a href="/forgot-password" className="underline hover:text-orange-600">
              Request a new reset link
            </a>
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-2">New Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-transparent"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-2">Confirm Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-transparent"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full font-semibold py-3.5 rounded-md transition-all duration-200 shadow-sm text-[15px] ${
              !isSubmitting ? 'bg-[#F97316] text-white hover:bg-orange-700' : 'bg-[#FFD9BC] text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><p>Loading...</p></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
