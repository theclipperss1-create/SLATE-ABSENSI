'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="text-xs font-medium text-[#86868B] uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        className={`w-full h-12 bg-[#F5F5F7] rounded-xl px-4 mt-1.5 focus:outline-none focus:ring-1 focus:ring-black text-sm transition-all ${className}`}
        {...props}
      />
    </div>
  );
}
