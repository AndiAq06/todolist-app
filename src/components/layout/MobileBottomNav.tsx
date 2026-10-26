'use client';

import React from 'react';
import { List, CheckCircle2, Calendar, FileText, Settings, Plus } from 'lucide-react';
import { NavTab } from './Sidebar';

interface MobileBottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenQuickAdd: () => void;
  activeTasksCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickAdd,
  activeTasksCount,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#16171c]/95 backdrop-blur-md border-t border-gray-200/80 dark:border-gray-800 py-1.5 px-3 flex items-center justify-around lg:hidden shadow-lg safe-bottom">
      {/* 1. My Day */}
      <button
        onClick={() => onSelectTab('dashboard')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
          currentTab === 'dashboard'
            ? 'text-[#FF5A1F] font-bold'
            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
        }`}
      >
        <List size={18} strokeWidth={currentTab === 'dashboard' ? 2.5 : 2} />
        <span className="text-[10px] mt-0.5">My day</span>
      </button>

      {/* 2. Tasks */}
      <button
        onClick={() => onSelectTab('tasks')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl relative transition ${
          currentTab === 'tasks'
            ? 'text-[#FF5A1F] font-bold'
            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
        }`}
      >
        <div className="relative">
          <CheckCircle2 size={18} strokeWidth={currentTab === 'tasks' ? 2.5 : 2} />
          {activeTasksCount > 0 && (
            <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-[#FF5A1F] text-white text-[9px] rounded-full flex items-center justify-center font-bold">
              {activeTasksCount > 9 ? '9+' : activeTasksCount}
            </span>
          )}
        </div>
        <span className="text-[10px] mt-0.5">Tasks</span>
      </button>

      {/* 3. Center Floating Quick Add Action */}
      <button
        onClick={onOpenQuickAdd}
        className="w-10 h-10 -mt-3 rounded-full bg-[#FF5A1F] text-white flex items-center justify-center shadow-md shadow-[#FF5A1F]/30 active:scale-95 transition"
        title="Tambah Tugas Baru"
      >
        <Plus size={20} strokeWidth={2.5} />
      </button>

      {/* 4. Calendar */}
      <button
        onClick={() => onSelectTab('calendar')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
          currentTab === 'calendar'
            ? 'text-[#FF5A1F] font-bold'
            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
        }`}
      >
        <Calendar size={18} strokeWidth={currentTab === 'calendar' ? 2.5 : 2} />
        <span className="text-[10px] mt-0.5">Calendar</span>
      </button>

      {/* 5. Notes / Journal */}
      <button
        onClick={() => onSelectTab('journal')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
          currentTab === 'journal'
            ? 'text-[#FF5A1F] font-bold'
            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
        }`}
      >
        <FileText size={18} strokeWidth={currentTab === 'journal' ? 2.5 : 2} />
        <span className="text-[10px] mt-0.5">Notes</span>
      </button>
    </div>
  );
};
