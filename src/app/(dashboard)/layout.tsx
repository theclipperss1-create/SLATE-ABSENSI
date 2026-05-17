'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check if dark mode was enabled before
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        // Simple RBAC check
        if (pathname.startsWith('/admin') && user.role !== 'admin') {
          router.push('/siswa/dashboard');
        }
        if (pathname.startsWith('/siswa') && user.role !== 'siswa') {
          router.push('/admin/dashboard');
        }
      }
    }
  }, [user, loading, pathname, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#000000] flex items-center justify-center">
        <p className="text-sm font-medium text-[#86868B] uppercase tracking-wide">Memuat...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F5F5F7] font-sans antialiased transition-colors duration-300">
      {/* Shared Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-[#1D1D1F]/80 backdrop-blur-md border-b border-[#E5E5EA] dark:border-[#3A3A3C] z-40 flex items-center justify-between px-6 md:px-8">
        <span className="font-bold text-xl tracking-tight text-black dark:text-white">SLATE</span>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-[#86868B]">{user.name}</span>
          
          <button 
            onClick={toggleDarkMode}
            className="text-sm font-medium text-black dark:text-white hover:opacity-70 transition-opacity"
          >
            {darkMode ? 'Mode Terang' : 'Mode Gelap'}
          </button>

          <span className="text-[#E5E5EA] dark:text-[#3A3A3C]">|</span>

          <button 
            onClick={handleLogout}
            className="text-sm font-medium text-black dark:text-white hover:opacity-70 transition-opacity"
          >
            Keluar
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="pt-16">
        {children}
      </div>
    </div>
  );
}
