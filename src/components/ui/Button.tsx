'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseStyles = 'h-12 flex items-center justify-center font-bold text-sm rounded-xl transition-all w-full';
  
  const variants = {
    primary: 'bg-black text-white hover:opacity-90',
    secondary: 'bg-[#F5F5F7] text-[#86868B] hover:text-[#1D1D1F]',
    outline: 'bg-transparent border border-[#E5E5EA] text-[#1D1D1F] hover:bg-[#F5F5F7]',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
