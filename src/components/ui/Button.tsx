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
    primary: 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90',
    secondary: 'bg-[#F5F5F7] dark:bg-[#3A3A3C] text-[#86868B] dark:text-[#E5E5EA] hover:text-[#1D1D1F] dark:hover:text-white',
    outline: 'bg-transparent border border-[#E5E5EA] dark:border-[#3A3A3C] text-[#1D1D1F] dark:text-white hover:bg-[#F5F5F7] dark:hover:bg-[#3A3A3C]',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
