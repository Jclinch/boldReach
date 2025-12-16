// src/components/Checkbox.tsx
// Checkbox component based on design specs

import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Checkbox({
  id,
  label,
  className = '',
  disabled = false,
  ...props
}: CheckboxProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id={id}
        disabled={disabled}
        className={`
          w-4 h-4 rounded border-2 border-[#E2E8F0] cursor-pointer
          checked:bg-[#2563EB] checked:border-[#2563EB]
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563EB]
          ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          ${className}
        `}
        {...props}
      />
      {label && (
        <label
          htmlFor={id}
          className={`text-sm cursor-pointer ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          {label}
        </label>
      )}
    </div>
  );
}
