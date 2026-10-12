'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut,
  Menu,
  X,
  GraduationCap,
  Shield,
  UserCheck,
  ChevronRight,
  Bell,
} from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarLayoutProps {
  user: any;
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  activeSession?: string;
  children: React.ReactNode;
}

export default function SidebarLayout({
  user,
  tabs,
  activeTab,
  onTabChange,
  activeSession,
  children,
}: SidebarLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const RoleIcon =
    user?.role === 'ADMIN'
      ? Shield
      : user?.role === 'FACULTY'
      ? UserCheck
      : GraduationCap;

  const roleBadgeColor =
    user?.role === 'ADMIN'
      ? 'bg-purple-50 text-purple-700 border-purple-200'
      : user?.role === 'FACULTY'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-blue-50 text-blue-700 border-blue-200';

  const accentColor =
    user?.role === 'ADMIN'
      ? 'bg-purple-600 hover:bg-purple-700'
      : user?.role === 'FACULTY'
      ? 'bg-emerald-600 hover:bg-emerald-700'
      : 'bg-blue-600 hover:bg-blue-700';

  const activeTabColor =
    user?.role === 'ADMIN'
      ? 'bg-purple-600 text-white shadow-sm'
      : user?.role === 'FACULTY'
      ? 'bg-emerald-600 text-white shadow-sm'
      : 'bg-blue-600 text-white shadow-sm';

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40 flex flex-col shadow-sm transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:flex`}
      >
        {/* Logo / Branding */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Docs Logo" className="w-12 h-12 object-contain mix-blend-multiply border border-black rounded-md p-0.5 bg-white shadow-sm" />
            <div>
              <div className="text-sm font-bold text-gray-900 leading-none tracking-tight">DOCS V1</div>
              <div className="text-[10px] font-medium text-gray-500 mt-1 leading-none">Lab AI Platform</div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Identity Card */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
              <RoleIcon className="w-4 h-4 text-gray-500" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">{user?.name}</div>
              <div className="text-[11px] text-gray-400 truncate">{user?.email}</div>
            </div>
          </div>
          <div className="mt-3">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wider ${roleBadgeColor}`}>
              <RoleIcon className="w-3 h-3" /> {user?.role}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer text-left ${
                  isActive
                    ? `${activeTabColor}`
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{tab.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto flex-shrink-0 opacity-70" />}
              </button>
            );
          })}
        </nav>

        {/* Academic Session Badge */}
        {activeSession && (
          <div className="px-4 py-3 border-t border-gray-100">
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[11px] text-gray-500">
              <span className="font-semibold text-gray-700">Session:</span> {activeSession}
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="px-4 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top bar (mobile hamburger + breadcrumb) */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-sm text-gray-400 hidden sm:block">
              <span className="font-semibold text-gray-700">
                {tabs.find((t) => t.id === activeTab)?.label || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer">
              <Bell className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
              <RoleIcon className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
