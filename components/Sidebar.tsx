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

export function Sidebar() {
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

  return (
    <aside className="w-[240px] bg-white border-r border-[#ECECEC] flex flex-col ">
      {/* Logo */}
      <div className="mt-[6px] flex justify-center">
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

        {/* Admin Panel Link - Only show for admin users */}
        {userRole === 'admin' && (
          <Link
            href="/admin/dashboard"
            className={`
              flex items-center gap-3 px-4 py-3 text-sm font-medium transition rounded-xl
              ${
                pathname.startsWith('/admin')
                  ? 'bg-[#F97316] text-white'
                  : 'text-[#8B8F97] hover:bg-[#F8F8F8]'
              }
            `}
          >
            <Shield
              size={18}
              className={pathname.startsWith('/admin') ? 'text-white' : 'text-[#8B8F97]'}
            />
            Admin Panel
          </Link>
        )}
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
