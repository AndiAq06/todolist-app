'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  MoreHorizontal,
  Pencil,
  Play,
  Pause,
  Plus,
  RotateCcw,
  Sparkles,
  Bell,
  RefreshCw,
  Smile,
  ArrowUpRight,
  CheckCircle2,
  Download,
  ExternalLink,
  CalendarDays,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { format, isSameDay, addMonths, subMonths } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Task, GoalItem, ReminderItem, Category } from '@/types';
import { DEFAULT_MONTH_GOALS, DEFAULT_WEEK_GOALS, DEFAULT_REMINDERS } from '@/lib/constants';

interface ModernDashboardProps {
  tasks: Task[];
  monthGoals: GoalItem[];
  weekGoals: GoalItem[];
  reminders: ReminderItem[];
  categories: Category[];
  onToggleTask: (task: Task) => void;
  onAddTask: (title: string, category?: string, dueDate?: string) => void;
  onToggleGoal: (id: string, type: 'month' | 'week') => void;
  onToggleReminder: (id: string) => void;
  onOpenTaskDetail: (task: Task) => void;
  onSelectTab: (tab: any) => void;
}

export const ModernDashboard: React.FC<ModernDashboardProps> = ({
  tasks,
  monthGoals: initialMonthGoals,
  weekGoals: initialWeekGoals,
  reminders: initialReminders,
  categories,
  onToggleTask,
  onAddTask,
  onToggleGoal,
  onToggleReminder,
  onOpenTaskDetail,
  onSelectTab,
}) => {
  // Day period filter: Morning, Afternoon, Evening
  const [dayPeriod, setDayPeriod] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  
  // Real dynamic calendar state (defaults to current real month & date)
  const [calendarMonthDate, setCalendarMonthDate] = useState<Date>(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(new Date().getDate());
  const [calendarNewTaskTitle, setCalendarNewTaskTitle] = useState('');
  const [isAddingCalendarTask, setIsAddingCalendarTask] = useState(false);
  const [showCalendarSyncModal, setShowCalendarSyncModal] = useState(false);

  const [newUpcomingTitle, setNewUpcomingTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Local goals & reminders state with robust fallbacks
  const [monthGoals, setMonthGoals] = useState<GoalItem[]>(
    initialMonthGoals && initialMonthGoals.length > 0 ? initialMonthGoals : DEFAULT_MONTH_GOALS
  );
  const [weekGoals, setWeekGoals] = useState<GoalItem[]>(
    initialWeekGoals && initialWeekGoals.length > 0 ? initialWeekGoals : DEFAULT_WEEK_GOALS
  );
  const [reminders, setReminders] = useState<ReminderItem[]>(
    initialReminders && initialReminders.length > 0 ? initialReminders : DEFAULT_REMINDERS
  );

  useEffect(() => {
    if (initialMonthGoals && initialMonthGoals.length > 0) {
      setMonthGoals(initialMonthGoals);
    }
  }, [initialMonthGoals]);

  useEffect(() => {
    if (initialWeekGoals && initialWeekGoals.length > 0) {
      setWeekGoals(initialWeekGoals);
    }
  }, [initialWeekGoals]);

  useEffect(() => {
    if (initialReminders && initialReminders.length > 0) {
      setReminders(initialReminders);
    }
  }, [initialReminders]);

  // Pomodoro Timer State (defaults to 10:45 as shown in the screenshot)
  const [pomodoroSeconds, setPomodoroSeconds] = useState(10 * 60 + 45); // 10:45
  const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPomodoroRunning && pomodoroSeconds > 0) {
      timer = setInterval(() => {
        setPomodoroSeconds((prev) => prev - 1);
      }, 1000);
    } else if (pomodoroSeconds === 0 && isPomodoroRunning) {
      setIsPomodoroRunning(false);
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
    }
    return () => clearInterval(timer);
  }, [isPomodoroRunning, pomodoroSeconds]);

  const formatPomodoroTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleToggleGoalClick = (id: string, type: 'month' | 'week') => {
    if (type === 'month') {
      setMonthGoals((prev) =>
        prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
      );
    } else {
      setWeekGoals((prev) =>
        prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
      );
    }
    onToggleGoal(id, type);
  };

  const handleToggleReminderClick = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
    onToggleReminder(id);
  };

  // Metrics calculated dynamically
  const activeTasks = tasks.filter((t) => !t.isDeleted && !t.isArchived);
  const completedTasksCount = activeTasks.filter((t) => t.status === 'completed').length;
  const inProgressTasksCount = activeTasks.filter((t) => t.status === 'in_progress').length;
  const pendingTasksCount = activeTasks.filter((t) => t.status === 'todo').length;
  const totalTasksCount = activeTasks.length;
  const pausedProjectsCount = tasks.filter((t) => t.isArchived).length;
  const energyProgress = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Display tasks list for Upcoming tasks widget
  const displayTasks = useMemo(() => {
    return activeTasks.slice(0, 6);
  }, [activeTasks]);

  // ==========================================
  // REAL DYNAMIC CALENDAR STATE & COMPUTATIONS
  // ==========================================
  const now = new Date();
  const calYear = calendarMonthDate.getFullYear();
  const calMonth = calendarMonthDate.getMonth();
  const isViewingCurrentMonth = now.getFullYear() === calYear && now.getMonth() === calMonth;
  const currentMonthPrefix = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`;
  const todayDateStr = format(now, 'yyyy-MM-dd');

  // Month names
  const monthAbbr = format(calendarMonthDate, 'MMM').toUpperCase();
  const monthFullName = format(calendarMonthDate, 'MMMM yyyy', { locale: idLocale });

  // Tasks in currently viewed month
  const monthTasks = useMemo(() => {
    return tasks.filter(
      (t) => !t.isDeleted && !t.isArchived && t.dueDate && t.dueDate.startsWith(currentMonthPrefix)
    );
  }, [tasks, currentMonthPrefix]);

  const monthCompletedTasks = useMemo(() => {
    return monthTasks.filter((t) => t.status === 'completed');
  }, [monthTasks]);

  const monthOverdueTasks = useMemo(() => {
    return monthTasks.filter((t) => t.status !== 'completed' && t.dueDate < todayDateStr);
  }, [monthTasks, todayDateStr]);

  const monthProgressPercent = useMemo(() => {
    if (monthTasks.length === 0) return 100;
    return Math.round((monthCompletedTasks.length / monthTasks.length) * 100);
  }, [monthTasks, monthCompletedTasks]);

  // Calendar dates generator for current real month (SUN to SAT)
  const calendarDays = useMemo(() => {
    const days: Array<{
      day: number | null;
      key: string;
      dateStr?: string;
      isToday?: boolean;
      hasTasks?: boolean;
      taskCount?: number;
      hasOverdue?: boolean;
      isAllCompleted?: boolean;
    }> = [];

    // Sunday = 0, Monday = 1 ... Saturday = 6
    const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();
    const totalDaysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

    // 1. Leading empty padding cells for month offset
    for (let p = 0; p < firstDayOfWeek; p++) {
      days.push({ day: null, key: `empty-${p}` });
    }

    // 2. Exact days of this month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = `${currentMonthPrefix}-${String(d).padStart(2, '0')}`;
      const isToday = isViewingCurrentMonth && now.getDate() === d;
      const dayTasks = tasks.filter(
        (t) => !t.isDeleted && !t.isArchived && t.dueDate === dateStr
      );
      const hasOverdue = dayTasks.some((t) => t.status !== 'completed' && dateStr < todayDateStr);
      const isAllCompleted = dayTasks.length > 0 && dayTasks.every((t) => t.status === 'completed');

      days.push({
        day: d,
        key: `day-${d}`,
        dateStr,
        isToday,
        hasTasks: dayTasks.length > 0,
        taskCount: dayTasks.length,
        hasOverdue,
        isAllCompleted,
      });
    }

    return days;
  }, [calYear, calMonth, isViewingCurrentMonth, currentMonthPrefix, todayDateStr, tasks]);

  // Selected date tasks
  const selectedDateStr = `${currentMonthPrefix}-${String(selectedCalendarDay).padStart(2, '0')}`;
  const selectedDayTasks = useMemo(() => {
    return tasks.filter(
      (t) => !t.isDeleted && !t.isArchived && t.dueDate === selectedDateStr
    );
  }, [tasks, selectedDateStr]);

  const handlePrevMonth = () => {
    setCalendarMonthDate((prev) => subMonths(prev, 1));
    setSelectedCalendarDay(1);
  };

  const handleNextMonth = () => {
    setCalendarMonthDate((prev) => addMonths(prev, 1));
    setSelectedCalendarDay(1);
  };

  const handleResetToToday = () => {
    const today = new Date();
    setCalendarMonthDate(today);
    setSelectedCalendarDay(today.getDate());
  };

  const handleAddCalendarTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calendarNewTaskTitle.trim()) return;
    onAddTask(calendarNewTaskTitle.trim(), 'Design Stride', selectedDateStr);
    setCalendarNewTaskTitle('');
    setIsAddingCalendarTask(false);
  };

  // Export .ICS file for Google Calendar / Apple / Outlook
  const handleExportICS = () => {
    const activeTasksWithDates = tasks.filter((t) => !t.isDeleted && !t.isArchived && t.dueDate);
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Todolist App//Productivity//ID',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    activeTasksWithDates.forEach((t) => {
      const dt = t.dueDate.replace(/-/g, '');
      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`UID:task-${t.id}@todolist.app`);
      icsContent.push(`SUMMARY:${t.title}`);
      icsContent.push(`DESCRIPTION:${(t.description || '').replace(/\n/g, ' ')}`);
      icsContent.push(`DTSTART;VALUE=DATE:${dt}`);
      icsContent.push(`DTEND;VALUE=DATE:${dt}`);
      icsContent.push(`STATUS:${t.status === 'completed' ? 'COMPLETED' : 'CONFIRMED'}`);
      icsContent.push('END:VEVENT');
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `todolist-agenda-${format(new Date(), 'yyyyMMdd')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setSyncStatus('File .ICS Terunduh ✓');
    setTimeout(() => setSyncStatus(null), 3000);
    setShowCalendarSyncModal(false);
  };

  // Open Google Calendar Web pre-filled
  const handleOpenGoogleCalendar = () => {
    const dateFormatted = selectedDateStr.replace(/-/g, '');
    const firstTask = selectedDayTasks[0];
    const title = firstTask ? firstTask.title : 'Agenda Todolist App';
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title
    )}&dates=${dateFormatted}/${dateFormatted}&details=${encodeURIComponent('Dibuat dari Todolist App')}`;
    window.open(gcalUrl, '_blank');
    setShowCalendarSyncModal(false);
  };

  const handleAddUpcomingTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpcomingTitle.trim()) return;
    onAddTask(newUpcomingTitle.trim(), 'Design Stride');
    setNewUpcomingTitle('');
    setIsAddingTask(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* ============================================================== */}
      {/* TOP ROW: 3 Columns Grid (Monthly Schedule | My day | Upcoming) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        
        {/* CARD 1: Monthly Schedule (Calendar View) */}
        <div className="bg-white dark:bg-[#1a1b20] rounded-3xl p-5 border border-gray-200/60 dark:border-gray-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between h-full">
          <div>
            {/* Header */}
            <div className="text-center mb-3">
              <h2 className="text-sm font-black text-gray-900 dark:text-gray-100">
                Monthly Schedule
              </h2>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Complete first task of month Schedule is just ahead
              </p>
            </div>

            {/* Month & Target Progress Bar */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevMonth}
                    title="Bulan sebelumnya"
                    className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xl font-black tracking-tight text-gray-900 dark:text-gray-100">
                    {monthAbbr}
                  </span>
                  <button
                    onClick={handleNextMonth}
                    title="Bulan berikutnya"
                    className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Overdue / Month Status Badge */}
                {monthOverdueTasks.length > 0 ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF5A1F] text-white">
                    {monthOverdueTasks.length} Overdue
                  </span>
                ) : isViewingCurrentMonth ? (
                  <button
                    onClick={handleResetToToday}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-[#FF5A1F] dark:bg-orange-950/50 dark:text-orange-300 hover:bg-orange-200 transition"
                  >
                    Hari Ini
                  </button>
                ) : (
                  <button
                    onClick={handleResetToToday}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-[#FF5A1F] hover:text-white transition"
                    title="Kembali ke bulan ini"
                  >
                    {calYear}
                  </button>
                )}
              </div>

              <div className="text-right">
                <span className="text-xs font-black text-gray-900 dark:text-gray-100 block">
                  {monthProgressPercent}%
                </span>
                <span className="text-[9px] text-gray-400">
                  meet my goal
                </span>
              </div>
            </div>

            {/* Dynamic Calendar Grid */}
            <div className="bg-gray-50/70 dark:bg-gray-800/40 rounded-2xl p-2.5 mb-3">
              <div className="grid grid-cols-7 text-center mb-2 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                <span>SUN</span>
                <span>MON</span>
                <span>TUE</span>
                <span>WED</span>
                <span>THUR</span>
                <span>FRI</span>
                <span>SAT</span>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {calendarDays.map((item) => {
                  if (!item.day) {
                    return <div key={item.key} className="h-6 w-6 mx-auto" />;
                  }

                  const isSelected = item.day === selectedCalendarDay;
                  const isToday = Boolean(item.isToday);

                  return (
                    <button
                      key={item.key}
                      onClick={() => setSelectedCalendarDay(item.day!)}
                      title={`${item.day} ${monthFullName}${item.taskCount ? ` (${item.taskCount} tugas)` : ''}`}
                      className={`h-6 w-6 mx-auto rounded-full flex flex-col items-center justify-center text-[10px] relative transition active:scale-95 ${
                        isSelected
                          ? 'bg-[#FF5A1F] text-white font-bold shadow-md shadow-[#FF5A1F]/30'
                          : isToday
                          ? 'ring-1.5 ring-[#FF5A1F] text-[#FF5A1F] font-black bg-orange-50/50 dark:bg-orange-950/20'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 font-medium'
                      }`}
                    >
                      <span>{item.day}</span>
                      {item.hasTasks && !isSelected && (
                        <span
                          className={`absolute bottom-0.5 w-1 h-1 rounded-full ${
                            item.hasOverdue
                              ? 'bg-rose-500'
                              : item.isAllCompleted
                              ? 'bg-emerald-500'
                              : 'bg-[#FF5A1F]'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Date Agenda Mini-Box */}
            <div className="bg-gray-50/80 dark:bg-gray-800/50 rounded-2xl p-2.5 mb-3 border border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200">
                    📅 {selectedCalendarDay} {monthAbbr} {calYear}
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    {selectedDayTasks.length} agenda
                  </span>
                </div>
                <button
                  onClick={() => onSelectTab('calendar')}
                  title="Buka tampilan kalender penuh"
                  className="text-[10px] font-bold text-[#FF5A1F] hover:underline flex items-center gap-0.5"
                >
                  <span>Kalender Penuh</span>
                  <ArrowUpRight size={11} />
                </button>
              </div>

              {/* Task list for selected date */}
              {selectedDayTasks.length === 0 ? (
                <div className="py-1.5 text-center">
                  <p className="text-[10px] text-gray-400">Tidak ada agenda pada tanggal ini.</p>
                  {!isAddingCalendarTask ? (
                    <button
                      onClick={() => setIsAddingCalendarTask(true)}
                      className="mt-1 text-[10px] font-bold text-[#FF5A1F] hover:underline"
                    >
                      + Tambah Tugas di Tanggal Ini
                    </button>
                  ) : (
                    <form onSubmit={handleAddCalendarTask} className="mt-1.5 flex gap-1">
                      <input
                        type="text"
                        autoFocus
                        value={calendarNewTaskTitle}
                        onChange={(e) => setCalendarNewTaskTitle(e.target.value)}
                        placeholder="Nama tugas baru..."
                        className="flex-1 text-[10px] px-2 py-1 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF5A1F]"
                      />
                      <button
                        type="submit"
                        className="px-2.5 py-1 bg-[#FF5A1F] hover:bg-[#e54c14] text-white text-[10px] font-bold rounded-lg transition"
                      >
                        Simpan
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingCalendarTask(false)}
                        className="px-2 py-1 text-gray-400 hover:text-gray-600 text-[10px]"
                      >
                        ✕
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <div className="space-y-1 max-h-[85px] overflow-y-auto pr-0.5">
                  {selectedDayTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between gap-1.5 p-1 rounded-lg hover:bg-white dark:hover:bg-gray-700/60 transition group text-left"
                    >
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => onToggleTask(task)}
                          className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center flex-shrink-0 transition ${
                            task.status === 'completed'
                              ? 'bg-[#FF5A1F] border-[#FF5A1F] text-white'
                              : 'border-gray-300 dark:border-gray-600 hover:border-[#FF5A1F]'
                          }`}
                        >
                          {task.status === 'completed' && <Check size={10} strokeWidth={3} />}
                        </button>
                        <span
                          onClick={() => onOpenTaskDetail(task)}
                          className={`text-[10px] font-semibold truncate cursor-pointer hover:text-[#FF5A1F] ${
                            task.status === 'completed'
                              ? 'line-through text-gray-400'
                              : 'text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                      <span className="text-[9px] font-medium text-gray-400 flex-shrink-0">
                        {task.startTime || task.category}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sync Button */}
          <button
            onClick={() => setShowCalendarSyncModal(true)}
            className="w-full py-2 px-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-[0.98]"
          >
            <RefreshCw size={13} className={syncStatus ? 'animate-spin text-[#FF5A1F]' : 'text-gray-400'} />
            <span>{syncStatus || 'Sync with google calendar'}</span>
          </button>
        </div>

        {/* MODAL GOOGLE CALENDAR SYNC */}
        {showCalendarSyncModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white dark:bg-[#1a1b20] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-[#FF5A1F]">
                    <CalendarDays size={18} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    Google Calendar Sync
                  </h3>
                </div>
                <button
                  onClick={() => setShowCalendarSyncModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Pilih opsi sinkronisasi agenda dan tugas Todolist App ke kalender Anda:
              </p>

              <div className="space-y-2.5">
                <button
                  onClick={handleExportICS}
                  className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-[#FF5A1F] dark:hover:border-[#FF5A1F] bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between transition group text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Download size={16} className="text-[#FF5A1F]" />
                    <div>
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                        Unduh File Kalender (.ICS)
                      </span>
                      <span className="text-[10px] text-gray-400">
                        Bisa diimpor langsung ke Google Calendar & Apple Calendar
                      </span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleOpenGoogleCalendar}
                  className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-[#FF5A1F] dark:hover:border-[#FF5A1F] bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between transition group text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <ExternalLink size={16} className="text-[#FF5A1F]" />
                    <div>
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                        Buka Google Calendar Web
                      </span>
                      <span className="text-[10px] text-gray-400">
                        Buka event di kalender Google di browser
                      </span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowCalendarSyncModal(false);
                    onSelectTab('calendar');
                  }}
                  className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-[#FF5A1F] dark:hover:border-[#FF5A1F] bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between transition group text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <CalendarDays size={16} className="text-[#FF5A1F]" />
                    <div>
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                        Lihat Tampilan Kalender Penuh
                      </span>
                      <span className="text-[10px] text-gray-400">
                        Tampilan kalender bulanan, mingguan & agenda lengkap
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CARD 2: My day (Status, Energy Ring & Stats) */}
        <div className="bg-white dark:bg-[#1a1b20] rounded-3xl p-5 border border-gray-200/60 dark:border-gray-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between h-full">
          <div>
            {/* Header Title */}
            <h2 className="text-base font-black text-gray-900 dark:text-gray-100 text-center mb-3">
              My day
            </h2>

            {/* Time Segmented Pills */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {(['morning', 'afternoon', 'evening'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setDayPeriod(period)}
                  className={`text-[11px] font-semibold px-3 py-1 rounded-full capitalize transition ${
                    dayPeriod === period
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-bold'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>

            {/* Mood & Energy Circle Widget */}
            <div className="flex items-center justify-between px-2 mb-5">
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                  My mood: <span className="font-semibold text-gray-600 dark:text-gray-300">Regular</span>
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {pendingTasksCount > 0 ? `${pendingTasksCount} tasks to complete` : 'Semua tugas selesai'}
                </p>
              </div>

              {/* Circular Gauge */}
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background ring */}
                  <path
                    className="text-gray-100 dark:text-gray-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Orange progress arc */}
                  <path
                    className="text-[#FF5A1F]"
                    strokeDasharray={`${energyProgress}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-black text-gray-900 dark:text-gray-100">
                    {energyProgress}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Information Stat Boxes */}
          <div>
            <div className="flex items-center gap-3 text-[11px] font-medium text-gray-400 mb-2 px-1">
              <span>Overall Information</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-gray-800 dark:text-gray-200 mb-3 px-1">
              <div>
                <span className="text-base font-black text-gray-900 dark:text-gray-100">
                  {completedTasksCount}
                </span>{' '}
                <span className="text-[11px] text-gray-500">Tasks done</span>
              </div>
              <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
              <div>
                <span className="text-base font-black text-gray-900 dark:text-gray-100">
                  {pausedProjectsCount}
                </span>{' '}
                <span className="text-[11px] text-gray-500">Paused projects</span>
              </div>
            </div>

            {/* 3 Metric Mini-Cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-100/80 dark:bg-gray-800/60 rounded-2xl p-2.5 text-center">
                <span className="block text-base font-black text-gray-900 dark:text-gray-100">
                  {totalTasksCount}
                </span>
                <span className="text-[10px] text-gray-500 capitalize">tasks</span>
              </div>
              <div className="bg-gray-100/80 dark:bg-gray-800/60 rounded-2xl p-2.5 text-center">
                <span className="block text-base font-black text-gray-900 dark:text-gray-100">
                  {inProgressTasksCount}
                </span>
                <span className="text-[10px] text-gray-500">in progress</span>
              </div>
              <div className="bg-gray-100/80 dark:bg-gray-800/60 rounded-2xl p-2.5 text-center">
                <span className="block text-base font-black text-gray-900 dark:text-gray-100">
                  {completedTasksCount}
                </span>
                <span className="text-[10px] text-gray-500 capitalize">Done</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: Upcoming tasks (Checklist Widget) */}
        <div className="bg-white dark:bg-[#1a1b20] rounded-3xl p-5 border border-gray-200/60 dark:border-gray-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-black text-gray-900 dark:text-gray-100">
                Upcoming tasks
              </h2>
              <button
                onClick={() => setIsAddingTask(!isAddingTask)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded-lg transition"
                title="Tambah tugas"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Add Task input form if open */}
            {isAddingTask && (
              <form onSubmit={handleAddUpcomingTask} className="mb-3 flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  value={newUpcomingTitle}
                  onChange={(e) => setNewUpcomingTitle(e.target.value)}
                  placeholder="Ketik tugas baru & Enter..."
                  className="flex-1 text-xs px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#FF5A1F]"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1.5 bg-[#FF5A1F] text-white rounded-xl text-xs font-bold"
                >
                  Simpan
                </button>
              </form>
            )}

            {/* Task Checklist Items */}
            <div className="space-y-2.5">
              {displayTasks.map((task) => {
                const isCompleted = task.status === 'completed';

                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 group cursor-pointer"
                    onClick={() => onToggleTask(task)}
                  >
                    <button
                      type="button"
                      className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-[#FF5A1F] border-[#FF5A1F] text-white'
                          : 'border-gray-300 dark:border-gray-600 bg-transparent group-hover:border-gray-400'
                      }`}
                    >
                      {isCompleted && <Check size={11} strokeWidth={3} />}
                    </button>

                    <span
                      className={`text-xs font-medium transition flex-1 truncate ${
                        isCompleted
                          ? 'line-through text-gray-400 dark:text-gray-500'
                          : 'text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white'
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>
                );
              })}

              {activeTasks.length === 0 && (
                <p className="text-xs text-gray-400 py-4 text-center">
                  Belum ada tugas upcoming.
                </p>
              )}
            </div>
          </div>

          <div className="pt-3 mt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
            <span>{activeTasks.length} tugas terjadwal</span>
            <button
              onClick={() => onSelectTab('tasks')}
              className="text-[#FF5A1F] font-bold hover:underline flex items-center gap-0.5"
            >
              Semua Tugas <ChevronRight size={12} />
            </button>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* ROW 2: Goals & Reminders (3 Columns, Perfect Straight Horizontal Line) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        
        {/* CARD 4: Month goals */}
        <div className="bg-white dark:bg-[#1a1b20] rounded-3xl p-5 border border-gray-200/60 dark:border-gray-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-black text-gray-900 dark:text-gray-100">
                Month goals:
              </h2>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <Pencil size={13} />
              </button>
            </div>

            <div className="space-y-2">
              {monthGoals.length === 0 ? (
                <div className="py-7 text-center">
                  <p className="text-xs text-gray-400">Belum ada target bulanan.</p>
                </div>
              ) : (
                monthGoals.map((goal, idx) => (
                  <div
                    key={goal.id}
                    onClick={() => handleToggleGoalClick(goal.id, 'month')}
                    className={`flex items-center gap-3 cursor-pointer group ${
                      idx >= 2 && !goal.completed ? 'opacity-40 hover:opacity-80 transition-opacity' : ''
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition ${
                        goal.completed
                          ? 'bg-gray-400 border-gray-400 text-white'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {goal.completed && <Check size={10} strokeWidth={3} />}
                    </div>
                    <span
                      className={`text-xs font-medium truncate ${
                        goal.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {goal.title}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* CARD 5: Tasks Reminders(3) */}
        <div className="bg-white dark:bg-[#1a1b20] rounded-3xl p-5 border border-gray-200/60 dark:border-gray-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-black text-gray-900 dark:text-gray-100">
                Tasks Reminders({reminders.length})
              </h2>
            </div>

            {/* 3 Horizontal Reminder Cards or Empty State */}
            {reminders.length === 0 ? (
              <div className="py-7 text-center">
                <p className="text-xs text-gray-400">Belum ada pengingat tugas.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2.5">
                {reminders.slice(0, 3).map((reminder) => (
                  <div
                    key={reminder.id}
                    className="bg-gray-50/90 dark:bg-gray-800/60 rounded-2xl p-2.5 flex flex-col justify-between h-28 border border-gray-100 dark:border-gray-700/60 transition hover:border-gray-300 dark:hover:border-gray-600"
                  >
                    <span className="text-[9px] text-gray-400">...</span>
                    <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200 leading-tight line-clamp-2 my-auto">
                      {reminder.title}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-gray-400 font-medium">
                        {reminder.time}
                      </span>
                      <button
                        onClick={() => handleToggleReminderClick(reminder.id)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition ${
                          reminder.active
                            ? 'bg-[#FF5A1F] text-white shadow-sm'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                        title={reminder.active ? 'Pengingat Aktif' : 'Klik untuk mengaktifkan'}
                      >
                        <Bell size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CARD 6: Week goals */}
        <div className="bg-white dark:bg-[#1a1b20] rounded-3xl p-5 border border-gray-200/60 dark:border-gray-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-black text-gray-900 dark:text-gray-100">
                Week goals:
              </h2>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <Pencil size={13} />
              </button>
            </div>

            <div className="space-y-2">
              {weekGoals.length === 0 ? (
                <div className="py-7 text-center">
                  <p className="text-xs text-gray-400">Belum ada target mingguan.</p>
                </div>
              ) : (
                weekGoals.map((goal, idx) => (
                  <div
                    key={goal.id}
                    onClick={() => handleToggleGoalClick(goal.id, 'week')}
                    className={`flex items-center gap-3 cursor-pointer group ${
                      idx >= 1 && !goal.completed ? 'opacity-40 hover:opacity-80 transition-opacity' : ''
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition ${
                        goal.completed
                          ? 'bg-gray-400 border-gray-400 text-white'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {goal.completed && <Check size={10} strokeWidth={3} />}
                    </div>
                    <span
                      className={`text-xs font-medium truncate ${
                        goal.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {goal.title}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* ROW 3: Motivation, Pomodoro Timer & Affirmation (Perfect Straight Line) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        
        {/* CARD 7: Well done! Motivation Card */}
        <div className="bg-white dark:bg-[#1a1b20] rounded-3xl p-5 border border-gray-200/60 dark:border-gray-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-between h-full min-h-[105px]">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-gray-900 dark:text-gray-100">
              {completedTasksCount > 0 ? 'Kerja bagus!' : 'Semangat!'}
            </h3>
            <p className="text-[11px] text-gray-400 max-w-[170px]">
              {completedTasksCount > 0 ? `${completedTasksCount} tugas selesai hari ini` : 'Mulai hari Anda dengan menambah tugas'}
            </p>
            <button
              onClick={() => onSelectTab('tasks')}
              className="text-[11px] font-bold text-gray-700 dark:text-gray-300 hover:text-[#FF5A1F] flex items-center gap-1 pt-1"
            >
              Lihat tugas →
            </button>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-3xl shadow-inner flex-shrink-0">
            🧘
          </div>
        </div>

        {/* CARD 8: Vibrant Orange Pomodoro Timer Widget */}
        <div className="bg-[#FF5A1F] rounded-3xl p-5 text-white shadow-lg shadow-[#FF5A1F]/25 flex items-center justify-between h-full min-h-[105px]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-white/90">
                Pomodoro timer
              </span>
              <button
                onClick={() => setPomodoroSeconds((prev) => prev + 5 * 60)}
                className="text-[10px] font-bold bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded-full transition"
              >
                + Add
              </button>
            </div>

            <div className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
              {formatPomodoroTime(pomodoroSeconds)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPomodoroRunning(!isPomodoroRunning)}
              className="w-12 h-12 rounded-2xl bg-white text-gray-900 hover:scale-105 active:scale-95 flex items-center justify-center shadow-md transition"
              title={isPomodoroRunning ? 'Jeda Timer' : 'Mulai Timer'}
            >
              {isPomodoroRunning ? (
                <Pause size={18} fill="currentColor" />
              ) : (
                <Play size={18} fill="currentColor" className="ml-0.5" />
              )}
            </button>

            <button
              onClick={() => {
                setIsPomodoroRunning(false);
                setPomodoroSeconds(10 * 60 + 45);
              }}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              title="Reset Timer"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        {/* CARD 9: Daily Affirmation */}
        <div className="bg-white dark:bg-[#1a1b20] rounded-3xl p-5 border border-gray-200/60 dark:border-gray-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between h-full min-h-[105px]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-gray-900 dark:text-gray-100">
              Daily Affirmation
            </h3>
            <Sparkles size={14} className="text-[#FF5A1F]" />
          </div>

          <p className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed italic my-auto py-1">
            &quot;Why stop when today might be the day you win?&quot;
          </p>

          <span className="text-[10px] text-gray-400 font-semibold">
            Tetap fokus dan konsisten ✨
          </span>
        </div>

      </div>
    </div>
  );
};
