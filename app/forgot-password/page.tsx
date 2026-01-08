// app/forgot-password/page.tsx
// Forgot Password page using custom password reset flow

'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!email.trim()) {
        toast.error('Please enter your email address.');
        return;
      }

      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });

      if (error) {
        const msg = error.message || '';
        const status = (error as unknown as { status?: number }).status;

        if (status === 429 || /rate|too many/i.test(msg)) {
          toast.error('Too many reset requests. Please wait a moment and try again.');
          return;
        }

        if (status === 504) {
          toast.error(
            'Reset email timed out. Check Supabase Auth SMTP settings (or disable custom SMTP) and try again.'
          );
          return;
        }

        if (/redirect|redirectto|invalid url|site url/i.test(msg)) {
          toast.error(
            'Reset email cannot be sent because the redirect URL is not allowed in Supabase. Add this site URL in Supabase Auth settings.'
          );
          return;
        }

        toast.error(msg || 'Failed to send reset email');
        return;
      }

      // Do not reveal whether a user exists.
      toast.success('If an account with this email exists, a reset link has been sent.');
      setEmail('');
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
        <h1 className="text-2xl font-bold text-[#1E293B] mb-2">Forgot Password</h1>
        <p className="text-sm text-[#475569] mb-6">
          Enter your account email to receive a password reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-2">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-transparent"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full font-semibold py-3.5 rounded-md transition-all duration-200 shadow-sm text-[15px] ${
              !isSubmitting ? 'bg-[#F97316] text-white hover:bg-orange-700' : 'bg-[#FFD9BC] text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#475569]">
          Remembered your password?{' '}
          <Link href="/signin" className="text-orange-500 font-semibold hover:text-orange-600">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
