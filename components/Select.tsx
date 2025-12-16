// src/components/Select.tsx
// Select/Dropdown component based on design specs

import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
}

export function Select({
  label,
  error,
  helperText,
  required = false,
  id,
  disabled = false,
  options = [],
  className = '',
  ...props
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-medium text-[#1E293B] mb-1.5">
          {label}
          {required && <span className="text-[#EF4444] ml-0.5">*</span>}
        </label>
      )}
      <select
        id={id}
        disabled={disabled}
        className={`
          w-full px-3 py-2.5 text-sm rounded-md border transition-colors duration-150
          bg-white text-[#1E293B]
          border-[#E2E8F0]
          focus:border-[#2563EB] focus:outline-none focus:ring-3 focus:ring-opacity-10 focus:ring-[#2563EB]
          appearance-none cursor-pointer
          ${error ? 'border-[#EF4444] bg-red-50' : ''}
          ${disabled ? 'bg-[#F8FAFC] text-[#CBD5E1] cursor-not-allowed' : ''}
          ${className}
        `}
        {...props}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <div className="text-xs text-[#EF4444] mt-1">{error}</div>}
      {helperText && !error && <div className="text-xs text-[#94A3B8] mt-1">{helperText}</div>}
    </div>
  );
}
