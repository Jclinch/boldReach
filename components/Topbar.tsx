'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { LayoutDashboard, Users, BarChart3, Settings as SettingsIcon } from 'lucide-react';

type NavItem = { href: string; label: string; icon: React.ReactNode };
type TopbarMode = 'admin' | 'super_admin';

const superAdminNavItems: NavItem[] = [
  { href: '/superAdmin/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/superAdmin/users', label: 'User Management', icon: <Users className="w-4 h-4" /> },
  { href: '/superAdmin/analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  { href: '/superAdmin/settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
];

const adminNavItems: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/admin/analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
];

const Topbar = ({ mode = 'super_admin' }: { mode?: TopbarMode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string>('');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (mounted) setUserEmail(user?.email ?? '');
      } catch {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [supabase]);

  const baseDashboardHref = mode === 'admin' ? '/admin/dashboard' : '/superAdmin/dashboard';

  const navItems = useMemo(() => {
    return mode === 'admin' ? adminNavItems : superAdminNavItems;
  }, [mode]);

  const isActive = (href: string) => {
    if (href.includes('#') && pathname === baseDashboardHref) return true;
    if (pathname === href) return true;
    return pathname.startsWith(`${href}/`);
  };

  return (
    <header className="bg-white border-b border-[#E2E8F0]"> 
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#94A3B8]">{userEmail || 'Logistics Pro'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={baseDashboardHref}
            className="px-2 py-2 bg-black hover:bg-[#111827] text-white rounded-md text-xs font-medium transition-colors"
          >
            Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 mr-4 bg-black hover:bg-[#111827] text-white rounded-md text-xs font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Top tab switch navigation */}
      <nav className="px-6 pb-4">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex w-full items-center justify-center gap-2 px-3 py-2 rounded-md text-xs md:text-sm transition-colors sm:w-auto sm:justify-start
                ${isActive(item.href) ? 'bg-[#0F2940] text-white' : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#1E293B]'}
              `}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Topbar;