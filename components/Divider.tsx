// src/components/Divider.tsx
// Divider component based on design specs

import React from 'react';

interface DividerProps {
  className?: string;
}

export function Divider({ className = '' }: DividerProps) {
  return <div className={`h-px bg-[#E2E8F0] my-4 ${className}`} />;
}
