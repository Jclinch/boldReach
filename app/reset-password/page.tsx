// app/reset-password/page.tsx
// Reset Password page using custom password reset flow

'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenValid, setTokenValid] = useState(!!token);

  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link. Please request a new one.');
      setTokenValid(false);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!token) {
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

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to update password');
        setIsSubmitting(false);
        return;
      }

      toast.success('Password updated. Please sign in.');
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
