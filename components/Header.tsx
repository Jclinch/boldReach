// src/components/Header.tsx
// Page Header component - app/page-path: /dashboard/*

'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from './Button';

interface HeaderProps {
  title?: string;
  onLogout?: () => void;
}

export function Header({ title = 'Dashboard', onLogout }: HeaderProps) {
  const [displayName, setDisplayName] = useState('');
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (user && !error) {
          // Extract username from email (part before @) and capitalize first letter
          const userEmail = user.email || '';
          if (userEmail.includes('@')) {
            const username = userEmail.split('@')[0];
            // Capitalize first letter
            const formatted = username.charAt(0).toUpperCase() + username.slice(1);
            setDisplayName(formatted);
          } else {
            setDisplayName(userEmail || 'User');
          }
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };

    fetchUser();
  }, [supabase]);
  return (
    <header className="bg-white border-b border-[#E2E8F0] h-auto px-6 py-4 flex items-center justify-between">
      <div className="flex items-center ml-10 md:text-left gap-3">
        <div>
            <h1 className="text-2xl font-bold text-[#1E293B] ">{title}</h1>
          {displayName && (
            <p className="text-sm text-[#475569] mt-1">Welcome, {displayName}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        
      
      </div>
    </header>
  );
}
