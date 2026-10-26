'use client';

import React, { useState } from 'react';
import { Task } from '@/types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus, CheckCircle2, Circle } from 'lucide-react';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface CalendarViewProps {
  tasks: Task[];
  onOpenTaskDetail: (task: Task) => void;
  onAddTaskForDate: (dateStr: string) => void;
}

type CalendarMode = 'month' | 'week' | 'agenda';

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onOpenTaskDetail,
  onAddTaskForDate,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mode, setMode] = useState<CalendarMode>('month');

  // Month interval
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const daysInMonthView = eachDayOfInterval({ start: startDate, end: endDate });

  // Week interval
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const daysInWeekView = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const handlePrev = () => {
    if (mode === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (mode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (mode === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (mode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  };

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedDayTasks = tasks.filter(
    (t) => t.dueDate === selectedDateStr && !t.isDeleted && !t.isArchived
  );

  return (
    <div className="space-y-4">
      {/* Calendar Header Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 sm:p-5 border border-gray-100 dark:border-gray-700/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-100 dark:bg-orange-950/40 text-[#FF5A1F] dark:text-[#ff7438] rounded-2xl">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: idLocale })}
            </h3>
            <p className="text-xs text-gray-400">
              {tasks.filter((t) => !t.isDeleted && !t.isArchived).length} agenda terjadwal
            </p>
          </div>
        </div>

        {/* View Switcher and Navigation */}
        <div className="flex items-center gap-2">
          {/* Month / Week / Agenda Tabs */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 p-1 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => setMode('month')}
              className={`px-3 py-1.5 rounded-xl transition ${
                mode === 'month'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Bulanan
            </button>
            <button
              onClick={() => setMode('week')}
              className={`px-3 py-1.5 rounded-xl transition ${
                mode === 'week'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Mingguan
            </button>
            <button
              onClick={() => setMode('agenda')}
              className={`px-3 py-1.5 rounded-xl transition ${
                mode === 'agenda'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Agenda
            </button>
          </div>

          <button
            onClick={handleToday}
            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-semibold transition"
          >
            Hari Ini
          </button>

          <div className="flex items-center">
            <button
              onClick={handlePrev}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition text-gray-600 dark:text-gray-300"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNext}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition text-gray-600 dark:text-gray-300"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {mode === 'month' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 7x5 Month Grid */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl p-4 sm:p-5 border border-gray-100 dark:border-gray-700/60 shadow-sm">
            {/* Weekday Names */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-400 mb-2">
              <span>Sen</span>
              <span>Sel</span>
              <span>Rab</span>
              <span>Kam</span>
              <span>Jum</span>
              <span>Sab</span>
              <span className="text-rose-400">Min</span>
            </div>

            {/* Days cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {daysInMonthView.map((day) => {
                const dayStr = format(day, 'yyyy-MM-dd');
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, new Date());
                const dayTasks = tasks.filter(
                  (t) => t.dueDate === dayStr && !t.isDeleted && !t.isArchived
                );

                return (
                  <div
                    key={dayStr}
                    onClick={() => setSelectedDate(day)}
                    className={`min-h-[75px] sm:min-h-[85px] p-1.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#FF5A1F] bg-orange-50/40 dark:bg-orange-950/20'
                        : isToday
                        ? 'border-[#FF5A1F]/60 bg-orange-50/20 dark:bg-orange-950/20'
                        : isCurrentMonth
                        ? 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-gray-50/30 dark:bg-gray-900/20'
                        : 'border-transparent text-gray-300 dark:text-gray-600 opacity-40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                          isToday
                            ? 'bg-[#FF5A1F] text-white'
                            : isSelected
                            ? 'bg-orange-100 text-orange-800'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {format(day, 'd')}
                      </span>

                      {dayTasks.length > 0 && (
                        <span className="text-[10px] font-bold text-gray-400">
                          {dayTasks.length}
                        </span>
                      )}
                    </div>

                    {/* Task Mini Badges */}
                    <div className="space-y-1 mt-1 overflow-hidden">
                      {dayTasks.slice(0, 2).map((t) => (
                        <div
                          key={t.id}
                          className={`text-[10px] font-medium truncate px-1.5 py-0.5 rounded-md ${
                            t.status === 'completed'
                              ? 'line-through text-gray-400 bg-gray-100 dark:bg-gray-800'
                              : t.priority === 'urgent'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                              : 'bg-orange-100 text-[#FF5A1F] dark:bg-orange-950/60 dark:text-[#ff7438]'
                          }`}
                        >
                          {t.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <span className="text-[9px] text-gray-400 block text-right font-semibold">
                          +{dayTasks.length - 2} lagi
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Date Details Sidebar */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700/60 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700 mb-4">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 capitalize">
                    {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: idLocale })}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {selectedDayTasks.length} tugas untuk tanggal ini
                  </p>
                </div>

                <button
                  onClick={() => onAddTaskForDate(selectedDateStr)}
                  title="Tambah tugas di tanggal ini"
                  className="p-2 bg-[#FF5A1F] hover:bg-[#e54c14] text-white rounded-xl text-xs font-semibold shadow-sm transition"
                >
                  <Plus size={16} />
                </button>
              </div>

              {selectedDayTasks.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                  <p className="text-xs text-gray-400 mb-2">Tidak ada agenda pada tanggal ini.</p>
                  <button
                    onClick={() => onAddTaskForDate(selectedDateStr)}
                    className="text-xs font-bold text-[#FF5A1F] dark:text-[#ff7438] hover:underline"
                  >
                    + Buat tugas baru
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
                  {selectedDayTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onOpenTaskDetail(task)}
                      className="p-3 bg-gray-50/70 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-[#FF5A1F]/50 dark:hover:border-[#FF5A1F]/50 transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          {task.category}
                        </span>
                        {task.startTime && (
                          <span className="flex items-center gap-1 text-blue-600 font-medium">
                            <Clock size={11} /> {task.startTime}
                          </span>
                        )}
                      </div>
                      <h5
                        className={`text-xs font-bold leading-tight ${
                          task.status === 'completed'
                            ? 'line-through text-gray-400'
                            : 'text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {task.title}
                      </h5>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => onAddTaskForDate(selectedDateStr)}
              className="w-full mt-4 py-2.5 bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 text-[#FF5A1F] dark:text-[#ff7438] rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Plus size={15} /> Tambah Agenda Tanggal Ini
            </button>
          </div>
        </div>
      )}

      {/* Week & Agenda Views */}
      {(mode === 'week' || mode === 'agenda') && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700/60 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {daysInWeekView.map((day) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const isToday = isSameDay(day, new Date());
              const dayTasks = tasks.filter(
                (t) => t.dueDate === dayStr && !t.isDeleted && !t.isArchived
              );

              return (
                <div
                  key={dayStr}
                  className={`p-3 rounded-2xl border flex flex-col justify-between min-h-[220px] ${
                    isToday
                      ? 'bg-orange-50/30 dark:bg-orange-950/20 border-orange-300'
                      : 'bg-gray-50/50 dark:bg-gray-900/30 border-gray-100 dark:border-gray-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200/60 dark:border-gray-800 mb-2">
                      <div>
                        <span className="text-[11px] font-bold uppercase text-gray-400 block">
                          {format(day, 'EEE', { locale: idLocale })}
                        </span>
                        <span
                          className={`text-sm font-black ${
                            isToday ? 'text-[#FF5A1F]' : 'text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {format(day, 'd MMM')}
                        </span>
                      </div>
                      <button
                        onClick={() => onAddTaskForDate(dayStr)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-[#FF5A1F] transition"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="space-y-1.5 overflow-y-auto max-h-[160px]">
                      {dayTasks.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => onOpenTaskDetail(t)}
                          className="p-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-[11px] font-medium cursor-pointer hover:border-[#FF5A1F] transition"
                        >
                          <span
                            className={`block truncate ${
                              t.status === 'completed'
                                ? 'line-through text-gray-400'
                                : 'text-gray-800 dark:text-gray-200'
                            }`}
                          >
                            {t.title}
                          </span>
                        </div>
                      ))}

                      {dayTasks.length === 0 && (
                        <span className="text-[10px] text-gray-400 italic block text-center pt-6">
                          Tidak ada tugas
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
