'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import {
  Plus,
  Clock,
  Search,
  LogOut,
  Shield,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const navItems = [
  {
    href: '/dashboard/new-shipment',
    label: 'New Shipment',
    icon: Plus,
  },
  {
    href: '/dashboard/history',
    label: 'Logistic History',
    icon: Clock,
  },
  {
    href: '/dashboard/tracking',
    label: 'Live Tracking',
    icon: Search,
  },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const getUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        setUserRole(userData?.role || 'user');
      }
    };

    getUserRole();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  // Sidebar classes for mobile slide-in
  const sidebarBase = "fixed z-30 top-0 left-0 h-full w-[240px] bg-white border-r border-[#ECECEC] flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 lg:z-auto";
  const sidebarOpen = open ? "translate-x-0" : "-translate-x-full";

  return (
    <aside
      className={`${sidebarBase} ${sidebarOpen}`}
      style={{ boxShadow: open ? '0 2px 16px rgba(0,0,0,0.08)' : undefined }}
      aria-hidden={!open}
    >
      {/* Close button for mobile */}
      <button
        className="absolute top-4 right-4 z-40 lg:hidden flex items-center justify-center w-8 h-8 rounded-md bg-gray-100 hover:bg-gray-200"
        aria-label="Close sidebar"
        onClick={onClose}
        style={{ display: open ? 'flex' : 'none' }}
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      {/* Logo */}
      <div className="mt-1.5 flex justify-center">
        <Image
          src="/logo.png"
          alt="Bold Reach"
          width={90}
          height={90}
          className=" object-contain"
        />
      </div>

      <div className="mx-6 border-b border-[#ECECEC]" />

      {/* Navigation */}
      <nav className="flex-1 px-6 pt-8 space-y-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-4 py-3 text-sm font-medium transition
                ${
                  isActive
                    ? 'bg-[#F97316] text-white rounded-xl'
                    : 'text-[#8B8F97] hover:bg-[#F8F8F8] rounded-xl'
                }
              `}
            >
              <Icon
                size={18}
                className={isActive ? 'text-white' : 'text-[#8B8F97]'}
              />
              {label}
            </Link>
          );
        })}

        {/* Admin / SuperAdmin Panel Link */}
        {(userRole === 'admin' || userRole === 'super_admin') && (() => {
          const isActive = pathname.startsWith('/admin') || pathname.startsWith('/superAdmin');
          const href = userRole === 'super_admin' ? '/superAdmin/dashboard' : '/admin/dashboard';
          return (
            <Link
              href={href}
              className={`
                flex items-center gap-3 px-4 py-3 text-sm font-medium transition rounded-xl
                ${
                  isActive
                    ? 'bg-[#F97316] text-white'
                    : 'text-[#8B8F97] hover:bg-[#F8F8F8]'
                }
              `}
            >
              <Shield size={18} className={isActive ? 'text-white' : 'text-[#8B8F97]'} />
              Admin Panel
            </Link>
          );
        })()}
      </nav>

      {/* Sign Out */}
      <div className="px-6 pb-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-sm font-medium text-red-500 hover:text-red-600 transition"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
