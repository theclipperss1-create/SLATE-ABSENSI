'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  show: boolean;
  onClose: () => void;
  success?: boolean;
  title: string;
  message: string;
}

export function Modal({ show, onClose, success = false, title, message }: ModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-md"
          />
          
          {/* Modal Content (Liquid Glass Style) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative bg-white/75 dark:bg-[#1D1D1F]/75 backdrop-blur-xl border border-white/20 dark:border-[#3A3A3C]/50 rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] dark:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)]"
          >
            <div className="mb-4 flex justify-center">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                success ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-[#E5E5EA] dark:bg-[#3A3A3C] text-[#86868B]'
              }`}>
                {success ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
            </div>
            
            <h3 className="font-black text-xl text-black dark:text-white mb-2 tracking-tight">
              {title}
            </h3>
            <p className="text-[#1D1D1F] dark:text-[#E5E5EA] text-sm leading-relaxed mb-6">
              {message}
            </p>
            
            <button
              onClick={onClose}
              className="w-full h-11 bg-black dark:bg-white text-white dark:text-black font-bold text-sm rounded-xl hover:opacity-90 active:scale-98 transition-all"
            >
              Selesai
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
