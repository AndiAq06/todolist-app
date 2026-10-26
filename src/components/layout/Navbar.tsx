'use client';

import React from 'react';
import { Menu, Search, Plus, Bell, LogIn, LogOut, Sun, Moon } from 'lucide-react';
import { NavTab } from './Sidebar';
import { CatLogo } from './CatLogo';

interface NavbarProps {
  onOpenMobileMenu: () => void;
  onOpenQuickAdd: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  overdueCount: number;
  currentUser?: { name: string; email: string; avatarUrl?: string } | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  currentTab: NavTab;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobileMenu,
  onOpenQuickAdd,
  searchQuery,
  onSearchChange,
  overdueCount,
  currentUser,
  onOpenAuth,
  onLogout,
  currentTab,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const tabTitles: Record<NavTab, string> = {
    dashboard: 'My day',
    tasks: 'Tasks',
    notes: 'Notes',
    calendar: 'Calendar',
    habits: 'Habit Tracker',
    journal: 'Daily Journal & Notes',
    stats: 'Productivity Insights',
    archive: 'Archive & Trash',
    settings: 'Settings',
  };

  return (
    <header className="sticky top-0 z-30 bg-[#F4F4F6]/90 dark:bg-[#121316]/90 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between gap-4 border-b border-gray-200/50 dark:border-gray-800/60">
      {/* Left: Mobile hamburger & Active view title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-800 rounded-xl transition"
          aria-label="Buka menu navigasi"
        >
          <Menu size={20} />
        </button>

        {/* Mobile brand badge if on small screen */}
        <div className="flex items-center gap-2">
          <CatLogo size={28} className="lg:hidden" />
          <div>
            <h1 className="text-sm sm:text-base font-black text-gray-900 dark:text-gray-100">
              {tabTitles[currentTab] || 'My day'}
            </h1>
            <p className="text-[10px] text-gray-400 hidden sm:block">
              {currentUser?.name ? `Akun: ${currentUser.name}` : 'Todolist App'}
            </p>
          </div>
        </div>
      </div>

      {/* Right: Search, Notifications & Quick Actions */}
      <div className="flex items-center gap-2.5">
        {/* Global Search Input (desktop/tablet) */}
        <div className="relative hidden md:block w-44 lg:w-56">
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks, notes..."
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-white dark:bg-[#1a1b20] border border-gray-200/80 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] text-gray-800 dark:text-gray-200 shadow-sm"
          />
        </div>

        {/* Mobile theme toggle */}
        {onToggleDarkMode && (
          <button
            onClick={onToggleDarkMode}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 bg-white dark:bg-[#1a1b20] rounded-xl border border-gray-200/60 dark:border-gray-800 shadow-sm transition"
            title="Beralih tema"
          >
            {isDarkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
          </button>
        )}

        {/* Overdue Notification Bell */}
        <div className="relative">
          <button
            title={overdueCount > 0 ? `${overdueCount} tugas overdue` : 'Semua tugas tepat waktu'}
            className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 bg-white dark:bg-[#1a1b20] rounded-xl border border-gray-200/60 dark:border-gray-800 shadow-sm transition"
          >
            <Bell size={16} />
          </button>
          {overdueCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF5A1F] rounded-full animate-pulse" />
          )}
        </div>

        {/* User Auth or Profile Button */}
        {currentUser ? (
          <div className="flex items-center gap-2 pl-1">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-orange-100 border border-[#FF5A1F]/30 flex items-center justify-center text-xs font-bold text-[#FF5A1F]">
              {currentUser.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                currentUser.name.charAt(0)
              )}
            </div>

            <button
              onClick={onLogout}
              title="Keluar"
              className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#1a1b20] hover:bg-gray-100 border border-gray-200/70 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition shadow-sm"
          >
            <LogIn size={13} />
            <span>Login</span>
          </button>
        )}

        {/* Quick Add Button */}
        <button
          onClick={onOpenQuickAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FF5A1F] hover:bg-[#e54c14] text-white rounded-xl text-xs font-bold shadow-sm shadow-[#FF5A1F]/20 transition active:scale-95"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span className="hidden sm:inline">Add Task</span>
        </button>
      </div>
    </header>
  );
};
