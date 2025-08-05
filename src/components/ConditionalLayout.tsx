'use client';

import { usePathname } from 'next/navigation';
import React from 'react';

interface ConditionalLayoutProps {
  children: React.ReactNode;
  header: React.ReactNode; // Nhận Header từ props
  footer: React.ReactNode; // Nhận Footer từ props
}

export function ConditionalLayout({ children, header, footer }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  const isAdminRoute = pathname?.startsWith('/admin');
  
  if (isAdminRoute) {
    return (
      <main className="min-h-screen bg-gray-50">
        {children}
      </main>
    );
  }

  return (
    <>
      {header}
      <main className="min-h-screen">
        {children}
      </main>
      {footer}
    </>
  );
}
