'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Daftar Siswa', path: '/admin/siswa' },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-white dark:bg-[#1D1D1F] border-r border-[#E5E5EA] dark:border-[#3A3A3C] fixed top-16 bottom-0 left-0 z-30 hidden md:block">
        <div className="p-6">
          <p className="text-xs font-medium text-[#86868B] uppercase tracking-wide mb-4">Menu Admin</p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center px-4 h-10 text-sm font-medium rounded-xl transition-colors ${
                    isActive
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#3A3A3C]'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Bottom Nav (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 h-14 bg-white dark:bg-[#1D1D1F] border-t border-[#E5E5EA] dark:border-[#3A3A3C] z-30 flex justify-around items-center md:hidden">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full text-xs font-medium transition-colors ${
                isActive
                  ? 'text-black dark:text-white'
                  : 'text-[#86868B]'
              }`}
            >
              <span className={isActive ? 'font-bold' : ''}>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Content */}
      <div className="flex-1 md:pl-64 pt-6 pb-20 md:pb-6">
        {children}
      </div>
    </div>
  );
}
