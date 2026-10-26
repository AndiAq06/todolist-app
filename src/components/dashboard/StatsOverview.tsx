'use client';

import React from 'react';
import { Task } from '@/types';
import { CheckCircle2, Clock, AlertCircle, ListTodo, TrendingUp } from 'lucide-react';

interface StatsOverviewProps {
  tasks: Task[];
  dailyGoal?: number;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  tasks,
  dailyGoal = 5,
}) => {
  const [todayStr, setTodayStr] = React.useState('');

  React.useEffect(() => {
    setTodayStr(new Date().toISOString().split('T')[0]);
  }, []);

  // Active tasks (not in trash, not archived)
  const activeTasks = tasks.filter((t) => !t.isDeleted && !t.isArchived);

  // Today's tasks
  const todayTasks = activeTasks.filter((t) => t.dueDate === todayStr);
  const todayCompleted = todayTasks.filter((t) => t.status === 'completed').length;
  const todayInProgress = todayTasks.filter((t) => t.status === 'in_progress').length;

  // Overdue tasks: dueDate < today and not completed
  const overdueTasks = activeTasks.filter(
    (t) => t.dueDate < todayStr && t.status !== 'completed'
  );

  const totalToday = todayTasks.length;
  const completionRate = totalToday > 0 ? Math.round((todayCompleted / totalToday) * 100) : 0;

  // Goal percentage
  const goalPercentage = Math.min(Math.round((todayCompleted / dailyGoal) * 100), 100);

  // SVG Circular Gauge calculation
  const strokeDashoffset = 220 - (220 * goalPercentage) / 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Big Circular Progress Card (Inspired by User's Mockup) */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700/60 shadow-sm flex items-center justify-between md:col-span-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-orange-100 dark:bg-orange-950/40 text-[#FF5A1F] dark:text-[#ff7438] rounded-lg">
              <TrendingUp size={16} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Target Produktivitas
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
              {todayCompleted}
            </span>
            <span className="text-sm font-medium text-gray-400">
              / {dailyGoal} tugas tercapai
            </span>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            {completionRate}% dari seluruh agenda hari ini selesai.
          </p>

          {/* Linear bar fallback */}
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden mt-3 max-w-xs">
            <div
              className="bg-[#FF5A1F] h-full rounded-full transition-all duration-500"
              style={{ width: `${goalPercentage}%` }}
            />
          </div>
        </div>

        {/* Circular Progress Gauge */}
        <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="34"
              className="text-gray-100 dark:text-gray-700 stroke-current"
              strokeWidth="7"
              fill="transparent"
            />
            <circle
              cx="40"
              cy="40"
              r="34"
              className="text-[#FF5A1F] stroke-current transition-all duration-700 ease-out"
              strokeWidth="7"
              strokeDasharray="220"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute text-center">
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {goalPercentage}%
            </span>
            <span className="block text-[9px] uppercase tracking-wider font-semibold text-gray-400">
              Target
            </span>
          </div>
        </div>
      </div>

      {/* Metric 1: In Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700/60 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">
            Sedang Berjalan
          </span>
          <span className="text-2xl font-black text-gray-900 dark:text-gray-100">
            {todayInProgress}
          </span>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium block mt-1">
            Dalam pengerjaan aktif
          </span>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-2xl">
          <Clock size={22} />
        </div>
      </div>

      {/* Metric 2: Overdue / Terlambat */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700/60 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">
            Terlambat
          </span>
          <span className="text-2xl font-black text-gray-900 dark:text-gray-100">
            {overdueTasks.length}
          </span>
          <span className={`text-[11px] font-medium block mt-1 ${
            overdueTasks.length > 0 ? 'text-rose-500' : 'text-gray-400'
          }`}>
            {overdueTasks.length > 0 ? 'Perlu tindakan segera' : 'Semua tepat waktu'}
          </span>
        </div>
        <div className={`p-3 rounded-2xl ${
          overdueTasks.length > 0
            ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-500'
            : 'bg-gray-50 dark:bg-gray-900 text-gray-400'
        }`}>
          <AlertCircle size={22} />
        </div>
      </div>
    </div>
  );
};
