// app/dashboard/page.tsx
// Dashboard/Home Page - Redirects to /dashboard/new-shipment

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard/new-shipment');
  }, [router]);

  return null;
}
