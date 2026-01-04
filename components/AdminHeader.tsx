import React from 'react';

type HeaderMode = 'admin' | 'super_admin';

export default function AdminHeader({ mode = 'super_admin' }: { mode?: HeaderMode }) {
  const title = mode === 'admin' ? 'Admin Panel' : 'SuperAdmin Panel';
  const welcome = mode === 'admin' ? 'Welcome, Admin' : 'Welcome, SuperAdmin';

  return (
    <header className="bg-white border-b border-[#E2E8F0] px-8 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1E293B]">{title}</h1>
        <div className="text-sm mr-4 text-[#94A3B8]">{welcome}</div>
      </div>
    </header>
  );
}