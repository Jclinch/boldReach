// src/components/Card.tsx
// Card container component based on design specs

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-lg border border-[#E2E8F0] p-6
        shadow-[0_1px_3px_rgba(0,0,0,0.1)]
        hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]
        transition-shadow duration-200
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
