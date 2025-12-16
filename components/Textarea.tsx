// src/components/Textarea.tsx
// Textarea component based on design specs

import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export function Textarea({
  label,
  error,
  helperText,
  required = false,
  id,
  disabled = false,
  className = '',
  ...props
}: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-medium text-[#1E293B] mb-1.5">
          {label}
          {required && <span className="text-[#EF4444] ml-0.5">*</span>}
        </label>
      )}
      <textarea
        id={id}
        disabled={disabled}
        className={`
          w-full px-3 py-2.5 text-sm rounded-md border transition-colors duration-150
          bg-white text-[#1E293B] placeholder-[#94A3B8]
          border-[#E2E8F0]
          focus:border-[#2563EB] focus:outline-none focus:ring-3 focus:ring-opacity-10 focus:ring-[#2563EB]
          resize-none
          ${error ? 'border-[#EF4444] bg-red-50' : ''}
          ${disabled ? 'bg-[#F8FAFC] text-[#CBD5E1] cursor-not-allowed' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <div className="text-xs text-[#EF4444] mt-1">{error}</div>}
      {helperText && !error && <div className="text-xs text-[#94A3B8] mt-1">{helperText}</div>}
    </div>
  );
}
