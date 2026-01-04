// app/signup/page.tsx
// Sign Up removed: accounts are provisioned by SuperAdmin.

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/signin');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="text-center">
        <p className="text-sm text-slate-700">Sign up is disabled.</p>
        <p className="mt-1 text-xs text-slate-500">Redirecting to Sign In…</p>
      </div>
    </div>
  );
}
