'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { adminNavItems } from '@/constants/adminNavigation';
import {
  LogOut,
  Menu,
  X,
  Home,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleSidebarCollapse = () => setSidebarCollapsed(!sidebarCollapsed);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:relative lg:flex lg:flex-shrink-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        sidebarCollapsed ? "lg:w-16" : "lg:w-64",
        "w-64"
      )}>
        <div className={cn(
          "flex flex-col h-full transition-all duration-300",
          sidebarCollapsed ? "lg:w-16" : "w-64"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
            <Link href="/admin" className={cn(sidebarCollapsed ? "lg:hidden" : "")}>
              <h1 className="text-xl font-bold text-gray-800">
                {sidebarCollapsed ? "AM" : "Admin Mandala"}
              </h1>
            </Link>

            {/* Desktop collapse button */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:flex"
              onClick={toggleSidebarCollapse}
              title={sidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>

            {/* Mobile close button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 group",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                    sidebarCollapsed ? "lg:justify-center lg:px-2" : ""
                  )}>
                    <item.icon className={cn(
                      "h-5 w-5 flex-shrink-0",
                      sidebarCollapsed ? "lg:mr-0" : "mr-3"
                    )} />
                    <span className={cn(
                      "transition-all duration-300",
                      sidebarCollapsed ? "lg:hidden" : ""
                    )}>
                      {item.title}
                    </span>
                    {/* Tooltip for collapsed state */}
                    {sidebarCollapsed && (
                      <div className="hidden lg:group-hover:block absolute left-16 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-50">
                        {item.title}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t space-y-2 flex-shrink-0">
            <Link href="/">
              <Button variant="ghost" className={cn(
                "w-full transition-all duration-300",
                sidebarCollapsed ? "lg:justify-center lg:px-2" : "justify-start"
              )}>
                <Home className={cn(
                  "h-4 w-4",
                  sidebarCollapsed ? "lg:mr-0" : "mr-3"
                )} />
                <span className={cn(
                  "transition-all duration-300",
                  sidebarCollapsed ? "lg:hidden" : ""
                )}>
                  Về trang chủ
                </span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              className={cn(
                "w-full text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-300",
                sidebarCollapsed ? "lg:justify-center lg:px-2" : "justify-start"
              )}
              onClick={handleLogout}
            >
              <LogOut className={cn(
                "h-4 w-4",
                sidebarCollapsed ? "lg:mr-0" : "mr-3"
              )} />
              <span className={cn(
                "transition-all duration-300",
                sidebarCollapsed ? "lg:hidden" : ""
              )}>
                Đăng xuất
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b px-4 py-3 lg:px-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden mr-2"
                onClick={toggleSidebar}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-semibold text-gray-800">
                Quản trị hệ thống
              </h2>
            </div>

            <div className="flex items-center space-x-4">
              {/* User info */}
              <div className="hidden sm:flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-primary-foreground">
                    {session?.user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-700">
                    {session?.user?.name}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
