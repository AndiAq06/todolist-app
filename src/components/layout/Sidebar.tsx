'use client';

import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Calendar,
  CheckCircle2,
  BookOpen,
  Archive,
  Settings,
  Plus,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  List,
  Menu,
  X,
  FileText,
  Flame,
  BarChart2,
  LogIn,
  LogOut,
} from 'lucide-react';
import { UserProfile, Category } from '@/types';
import { CatLogo } from './CatLogo';

export type NavTab = 'dashboard' | 'tasks' | 'notes' | 'calendar' | 'habits' | 'journal' | 'stats' | 'archive' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenQuickAdd: () => void;
  profile: UserProfile;
  currentUser?: { name: string; email: string; avatarUrl?: string } | null;
  categories?: Category[];
  selectedCategory?: string;
  onSelectCategory?: (categoryName: string) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  activeTasksCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickAdd,
  profile,
  currentUser,
  categories = [],
  selectedCategory = 'all',
  onSelectCategory,
  onOpenAuth,
  onLogout,
  isDarkMode,
  onToggleDarkMode,
  isOpenMobile,
  onCloseMobile,
  activeTasksCount,
}) => {
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const displayName = currentUser?.name || 'Todolist App';

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-60 bg-[#F4F4F6] dark:bg-[#121316] border-r border-gray-200/60 dark:border-gray-800 z-50 flex flex-col justify-between p-5 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Brand / Profile Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/* Cat Logo */}
              <CatLogo size={34} />
              <h1 className="text-base font-black text-gray-900 dark:text-gray-100 tracking-tight">
                {displayName}
              </h1>
            </div>

            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>

          {/* Main Top Navigation */}
          <nav className="space-y-1">
            {/* 1. My day */}
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition ${
                currentTab === 'dashboard'
                  ? 'bg-white dark:bg-[#1c1d22] text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <List size={16} className={currentTab === 'dashboard' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500'} />
              <span>My day</span>
            </button>

            {/* 2. Tasks */}
            <button
              onClick={() => handleNavClick('tasks')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition ${
                currentTab === 'tasks'
                  ? 'bg-white dark:bg-[#1c1d22] text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 size={16} className={currentTab === 'tasks' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500'} />
                <span>Tasks</span>
              </div>
              {activeTasksCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {activeTasksCount}
                </span>
              )}
            </button>

            {/* 3. Notes */}
            <button
              onClick={() => handleNavClick('journal')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition ${
                currentTab === 'journal'
                  ? 'bg-white dark:bg-[#1c1d22] text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <FileText size={16} className={currentTab === 'journal' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500'} />
              <span>Notes</span>
            </button>
          </nav>

          {/* Projects Section with Accordion & Plus Button */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between px-3 text-xs font-bold text-gray-500 dark:text-gray-400">
              <button
                onClick={() => setIsProjectsOpen(!isProjectsOpen)}
                className="flex items-center gap-1.5 hover:text-gray-800 dark:hover:text-gray-200 transition"
              >
                {isProjectsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span>Projects</span>
              </button>

              <button
                onClick={onOpenQuickAdd}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-0.5 rounded transition"
                title="Tambah Proyek / Tugas"
              >
                <Plus size={14} />
              </button>
            </div>

            {isProjectsOpen && (
              <div className="space-y-1 pl-4">
                {/* Project 1: Design Stride */}
                <button
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory('Design Stride');
                    handleNavClick('tasks');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-[#1c1d22] transition"
                >
                  <span className="w-2 h-2 rounded-full bg-[#A855F7]" />
                  <span>Design Stride</span>
                </button>

                {/* Project 2: Plan Vacation */}
                <button
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory('Plan Vacation');
                    handleNavClick('tasks');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-[#1c1d22] transition"
                >
                  <span className="w-2 h-2 rounded-full bg-[#F97316]" />
                  <span>Plan Vacation</span>
                </button>
              </div>
            )}
          </div>

          {/* Secondary Links: Calendar, More, Archive */}
          <nav className="space-y-1 pt-2">
            <button
              onClick={() => handleNavClick('calendar')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition ${
                currentTab === 'calendar'
                  ? 'bg-white dark:bg-[#1c1d22] text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <Calendar size={16} className={currentTab === 'calendar' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500'} />
              <span>Calendar</span>
            </button>

            {/* More Menu (Habits, Stats) */}
            <div>
              <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <MoreHorizontal size={16} className="text-gray-500" />
                  <span>More</span>
                </div>
                <ChevronDown size={13} className={`transition-transform ${isMoreOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMoreOpen && (
                <div className="pl-6 space-y-1 pt-1">
                  <button
                    onClick={() => handleNavClick('habits')}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    <Flame size={13} className="text-[#FF5A1F]" />
                    <span>Habits Tracker</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('stats')}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    <BarChart2 size={13} className="text-blue-500" />
                    <span>Productivity Insights</span>
                  </button>
                </div>
              )}
            </div>

            {/* Archive */}
            <button
              onClick={() => handleNavClick('archive')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition ${
                currentTab === 'archive'
                  ? 'bg-white dark:bg-[#1c1d22] text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <Archive size={16} className={currentTab === 'archive' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500'} />
              <span>Archive</span>
            </button>
          </nav>
        </div>

        {/* Bottom Footer Controls: Settings Icon & Theme Toggle Pill */}
        <div className="pt-4 border-t border-gray-200/60 dark:border-gray-800 flex items-center justify-between">
          <button
            onClick={() => handleNavClick('settings')}
            className={`p-2 rounded-xl text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition ${
              currentTab === 'settings' ? 'bg-white dark:bg-[#1c1d22] text-gray-900 dark:text-gray-100' : ''
            }`}
            title="Settings"
          >
            <Settings size={18} />
          </button>

          {/* Theme Pill Toggle [ ☀️ | 🌙 ] */}
          <div className="flex items-center bg-gray-200/80 dark:bg-gray-800 p-1 rounded-full shadow-inner">
            <button
              onClick={() => {
                if (isDarkMode) onToggleDarkMode();
              }}
              className={`p-1.5 rounded-full transition ${
                !isDarkMode
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              title="Mode Terang"
            >
              <Sun size={13} />
            </button>
            <button
              onClick={() => {
                if (!isDarkMode) onToggleDarkMode();
              }}
              className={`p-1.5 rounded-full transition ${
                isDarkMode
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Mode Gelap"
            >
              <Moon size={13} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
