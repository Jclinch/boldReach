// src/components/Badge.tsx
// Badge component based on design specs

import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'success' | 'error' | 'warning';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  const variantStyles = {
    default: 'bg-[#F0F9FF] text-[#0369A1]',
    success: 'bg-[#D1FAE5] text-[#065F46]',
    error: 'bg-[#FEE2E2] text-[#991B1B]',
    warning: 'bg-[#FEF3C7] text-[#92400E]',
  };

  return (
    <span
      className={`
        inline-block px-3 py-1 text-xs font-medium rounded-full
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
