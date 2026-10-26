'use client';

import React, { useState } from 'react';
import { Task, Habit, DailyJournal } from '@/types';
import { TrendingUp, CheckCircle2, Award, Clock, Flame, BarChart2, PieChart, Calendar } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface ProductivityInsightsProps {
  tasks: Task[];
  habits: Habit[];
  journals: DailyJournal[];
}

export const ProductivityInsights: React.FC<ProductivityInsightsProps> = ({
  tasks,
  habits,
  journals,
}) => {
  const [timeRange, setTimeRange] = useState<'7days' | '30days'>('7days');

  // Compute metrics
  const activeTasks = tasks.filter((t) => !t.isDeleted && !t.isArchived);
  const totalTasks = activeTasks.length;
  const completedTasks = activeTasks.filter((t) => t.status === 'completed').length;
  const inProgressTasks = activeTasks.filter((t) => t.status === 'in_progress').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Category distribution
  const categoryCount: Record<string, number> = {};
  activeTasks.forEach((t) => {
    categoryCount[t.category] = (categoryCount[t.category] || 0) + 1;
  });

  const categoryList = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]);

  // Last 7 days chart data
  const daysCount = timeRange === '7days' ? 7 : 14;
  const chartDays = Array.from({ length: daysCount }, (_, i) => {
    const d = subDays(new Date(), daysCount - 1 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const dayTasks = activeTasks.filter((t) => t.dueDate === dateStr);
    const done = dayTasks.filter((t) => t.status === 'completed').length;
    const total = dayTasks.length;

    return {
      date: d,
      dateStr,
      label: format(d, 'd MMM', { locale: idLocale }),
      total,
      done,
    };
  });

  const maxDailyTasks = Math.max(...chartDays.map((d) => d.total), 5);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-100 dark:bg-orange-950/40 text-[#FF5A1F] dark:text-[#ff7438] rounded-2xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Statistik & Evaluasi Produktivitas
            </h2>
            <p className="text-xs text-gray-400">
              Analisis akurat berdasarkan aktivitas tugas, kebiasaan, dan jurnal harian Anda.
            </p>
          </div>
        </div>

        <div className="flex items-center bg-gray-100 dark:bg-gray-700 p-1 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => setTimeRange('7days')}
            className={`px-3 py-1.5 rounded-xl transition ${
              timeRange === '7days'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            7 Hari Terakhir
          </button>
          <button
            onClick={() => setTimeRange('30days')}
            className={`px-3 py-1.5 rounded-xl transition ${
              timeRange === '30days'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            14 Hari
          </button>
        </div>
      </div>

      {/* KPI 4-Card Matrix */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700/60 shadow-sm">
          <span className="text-xs text-gray-400 font-medium block mb-1">Total Tugas Aktif</span>
          <span className="text-3xl font-black text-gray-900 dark:text-gray-100">{totalTasks}</span>
          <span className="text-[11px] text-gray-400 block mt-1">Dalam sistem</span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700/60 shadow-sm">
          <span className="text-xs text-gray-400 font-medium block mb-1">Tugas Selesai</span>
          <span className="text-3xl font-black text-[#FF5A1F] dark:text-[#ff7438]">{completedTasks}</span>
          <span className="text-[11px] text-[#FF5A1F]/80 block mt-1">Diselesaikan dengan baik</span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700/60 shadow-sm">
          <span className="text-xs text-gray-400 font-medium block mb-1">Tingkat Penyelesaian</span>
          <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{completionRate}%</span>
          <span className="text-[11px] text-blue-600/80 block mt-1">Rasio efektivitas</span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700/60 shadow-sm">
          <span className="text-xs text-gray-400 font-medium block mb-1">Jurnal & Refleksi</span>
          <span className="text-3xl font-black text-purple-600 dark:text-purple-400">{journals.length}</span>
          <span className="text-[11px] text-purple-600/80 block mt-1">Catatan tersimpan</span>
        </div>
      </div>

      {/* Chart & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Productivity Activity Bar Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700/60 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <BarChart2 size={16} className="text-[#FF5A1F]" /> Tren Tugas Selesai vs Direncanakan
                </h4>
                <p className="text-xs text-gray-400">
                  Perbandingan beban kerja harian dan pencapaian aktual
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-[#FF5A1F]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5A1F]" /> Selesai
                </span>
                <span className="flex items-center gap-1.5 text-gray-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-gray-700" /> Direncanakan
                </span>
              </div>
            </div>

            {/* SVG / CSS Bar Chart */}
            <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-gray-100 dark:border-gray-700">
              {chartDays.map((d) => {
                const doneHeightPercent = maxDailyTasks > 0 ? (d.done / maxDailyTasks) * 100 : 0;
                const totalHeightPercent = maxDailyTasks > 0 ? (d.total / maxDailyTasks) * 100 : 0;

                return (
                  <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                    {/* Tooltip on Hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition absolute -top-8 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded-md pointer-events-none whitespace-nowrap z-10">
                      {d.done}/{d.total} Selesai ({d.label})
                    </div>

                    <div className="w-full max-w-[28px] h-36 flex items-end justify-center bg-gray-50 dark:bg-gray-900/40 rounded-xl overflow-hidden p-0.5">
                      <div className="w-full flex items-end justify-center gap-0.5 h-full">
                        {/* Bar: Total */}
                        <div
                          className="w-1/2 bg-gray-200 dark:bg-gray-700 rounded-t-md transition-all duration-500"
                          style={{ height: `${totalHeightPercent}%` }}
                        />
                        {/* Bar: Done */}
                        <div
                          className="w-1/2 bg-[#FF5A1F] rounded-t-md transition-all duration-500 shadow-sm"
                          style={{ height: `${doneHeightPercent}%` }}
                        />
                      </div>
                    </div>

                    <span className="text-[10px] text-gray-400 font-medium truncate w-full text-center">
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-[11px] text-gray-400 italic pt-3">
            Tips: Pertahankan ritme kerja dengan menyelesaikan setidaknya 3 tugas penting per hari.
          </p>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700/60 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-1">
              <PieChart size={16} className="text-blue-500" /> Distribusi Kategori
            </h4>
            <p className="text-xs text-gray-400 mb-4">Beban aktivitas berdasarkan topik</p>

            <div className="space-y-3">
              {categoryList.map(([catName, count]) => {
                const percent = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;

                return (
                  <div key={catName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-700 dark:text-gray-200">{catName}</span>
                      <span className="font-bold text-gray-500 dark:text-gray-400">
                        {count} tugas ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#FF5A1F] h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {categoryList.length === 0 && (
                <p className="text-xs text-gray-400 italic text-center py-6">Belum ada tugas tercatat.</p>
              )}
            </div>
          </div>

          {/* Habit Streaks Highlight */}
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <h5 className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 mb-2">
              <Flame size={14} className="text-orange-500" /> Kebiasaan Paling Konsisten
            </h5>
            <div className="space-y-1.5">
              {habits.slice(0, 3).map((h) => (
                <div key={h.id} className="flex items-center justify-between text-xs p-2 bg-gray-50 dark:bg-gray-900/40 rounded-xl">
                  <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{h.title}</span>
                  <span className="font-black text-orange-600 dark:text-orange-400 flex items-center gap-1">
                    <Flame size={12} /> {h.streak} hari
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
