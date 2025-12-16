// src/components/Button.tsx
// Primary button component based on design specs

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-md border-0 transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer';
  
  const variantStyles = {
    primary: 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] active:bg-[#1E40AF] disabled:bg-[#CBD5E1] disabled:opacity-50',
    secondary: 'bg-[#F8FAFC] text-[#2563EB] border border-[#E2E8F0] hover:bg-[#F1F5F9] hover:border-[#CBD5E1] active:bg-[#E2E8F0] active:border-[#94A3B8] disabled:opacity-50',
    danger: 'bg-[#EF4444] text-white hover:bg-[#DC2626] active:bg-[#B91C1C] disabled:opacity-50',
  };
  
  const sizeStyles = {
    small: 'px-4 py-2 text-xs h-8',
    medium: 'px-6 py-3 text-sm h-10',
    large: 'px-8 py-3.5 text-base h-12',
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? 'cursor-not-allowed' : ''} ${className}`;

  return (
    <button
      disabled={disabled || isLoading}
      className={combinedClassName}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}
