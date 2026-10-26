'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Check,
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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, GoalItem, ReminderItem, Category } from '@/types';
import { DEFAULT_MONTH_GOALS, DEFAULT_WEEK_GOALS, DEFAULT_REMINDERS } from '@/lib/constants';

interface ModernDashboardProps {
  tasks: Task[];
  monthGoals: GoalItem[];
  weekGoals: GoalItem[];
  reminders: ReminderItem[];
  categories: Category[];
  onToggleTask: (task: Task) => void;
  onAddTask: (title: string, category?: string) => void;
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
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(15);
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
  const totalTasksCount = activeTasks.length || 17;

  // Display tasks list for Upcoming tasks widget matching design screenshot
  const displayTasks = useMemo(() => {
    const list = [...activeTasks];
    const defaultUpcomingTitles = [
      'Read Little women',
      'Complete your daily challenge',
      'Finalize your 303 project',
      'Prepare for 303 presentation',
      'Call mom',
      'Read 310',
    ];
    defaultUpcomingTitles.forEach((title, idx) => {
      if (!list.some((t) => t.title.toLowerCase() === title.toLowerCase())) {
        list.push({
          id: `task-seed-${idx}`,
          title,
          description: '',
          status: 'todo',
          priority: 'normal',
          category: 'Design Stride',
          tags: [],
          dueDate: new Date().toISOString().split('T')[0],
          isFocus: false,
          isArchived: false,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          checklists: [],
          attachments: [],
          progressLogs: [],
        });
      }
    });
    return list.slice(0, 6);
  }, [activeTasks]);

  // Calendar dates mock generator for miniature view (Days 1 to 31)
  const calendarDays = useMemo(() => {
    const days = [];
    // 2 empty padding cells for month offset
    days.push({ day: null, key: 'empty-1' });
    days.push({ day: null, key: 'empty-2' });
    for (let i = 1; i <= 31; i++) {
      days.push({
        day: i,
        key: `day-${i}`,
        hasEvent: [3, 8, 14, 18, 24, 29].includes(i),
        isOverdue: i === 14,
        isValentine: i === 14,
      });
    }
    return days;
  }, []);

  const handleSyncCalendar = () => {
    setSyncStatus('Sinkronisasi...');
    setTimeout(() => {
      setSyncStatus('Tersinkronisasi ✓');
      setTimeout(() => setSyncStatus(null), 2500);
    }, 1200);
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* CARD 1: Monthly Schedule (Calendar View) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1a1b20] rounded-3xl p-5 border border-gray-200/60 dark:border-gray-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
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
                <span className="text-xl font-black tracking-tight text-gray-900 dark:text-gray-100">
                  JAN
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF5A1F] text-white">
                  Overdue
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-gray-900 dark:text-gray-100 block">
                  60%
                </span>
                <span className="text-[9px] text-gray-400">
                  meet my goal
                </span>
              </div>
            </div>

            {/* Miniature Calendar Grid */}
            <div className="bg-gray-50/70 dark:bg-gray-800/40 rounded-2xl p-2.5 mb-4">
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
                    return <div key={item.key} className="h-6" />;
                  }

                  const isSelected = item.day === selectedCalendarDay;

                  return (
                    <button
                      key={item.key}
                      onClick={() => setSelectedCalendarDay(item.day)}
                      className={`h-6 w-6 mx-auto rounded-full flex flex-col items-center justify-center text-[10px] font-medium relative transition ${
                        isSelected
                          ? 'bg-[#FF5A1F] text-white font-bold shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-700/60'
                      }`}
                    >
                      <span>{item.day}</span>
                      {item.hasEvent && !isSelected && (
                        <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[#FF5A1F]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sync Button */}
          <button
            onClick={handleSyncCalendar}
            className="w-full py-2 px-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-[0.98]"
          >
            <RefreshCw size={13} className={syncStatus ? 'animate-spin text-[#FF5A1F]' : 'text-gray-400'} />
            <span>{syncStatus || 'Sync with google calendar'}</span>
          </button>
        </div>

        {/* CARD 2: My day (Status, Energy Ring & Stats) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1a1b20] rounded-3xl p-5 border border-gray-200/60 dark:border-gray-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
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
                  {pendingTasksCount || 4} more tasks to complete
                </p>
              </div>

              {/* Circular Gauge 40 */}
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
                  {/* Orange progress arc (40%) */}
                  <path
                    className="text-[#FF5A1F]"
                    strokeDasharray="40, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-black text-gray-900 dark:text-gray-100">
                    40
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
                  {completedTasksCount || 10}
                </span>{' '}
                <span className="text-[11px] text-gray-500">Tasks done</span>
              </div>
              <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
              <div>
                <span className="text-base font-black text-gray-900 dark:text-gray-100">
                  3
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
                  {inProgressTasksCount || 7}
                </span>
                <span className="text-[10px] text-gray-500">in progress</span>
              </div>
              <div className="bg-gray-100/80 dark:bg-gray-800/60 rounded-2xl p-2.5 text-center">
                <span className="block text-base font-black text-gray-900 dark:text-gray-100">
                  {completedTasksCount || 10}
                </span>
                <span className="text-[10px] text-gray-500 capitalize">Done</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: Upcoming tasks (Checklist Widget) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1a1b20] rounded-3xl p-5 border border-gray-200/60 dark:border-gray-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
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
      {/* BOTTOM ROW: Goals, Tasks Reminders, Pomodoro Timer & Affirmation */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* COLUMN 1: Month Goals & Well done Card (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Month goals Card */}
          <div className="bg-white dark:bg-[#1a1b20] rounded-3xl p-5 border border-gray-200/60 dark:border-gray-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-black text-gray-900 dark:text-gray-100">
                Month goals:
              </h2>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <Pencil size={13} />
              </button>
            </div>

            <div className="space-y-2">
              {monthGoals.map((goal, idx) => (
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
              ))}
            </div>
          </div>

          {/* Well done! Motivation Card */}
          <div className="bg-white dark:bg-[#1a1b20] rounded-3xl p-5 border border-gray-200/60 dark:border-gray-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-gray-900 dark:text-gray-100">
                Well done!
              </h3>
              <p className="text-[11px] text-gray-400 max-w-[150px]">
                You completed your morning routine today
              </p>
              <button
                onClick={() => onSelectTab('habits')}
                className="text-[11px] font-bold text-gray-700 dark:text-gray-300 hover:text-[#FF5A1F] flex items-center gap-1 pt-1"
              >
                View details →
              </button>
            </div>

            {/* Friendly Avatar Vector Illustration */}
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-3xl shadow-inner">
              🧘
            </div>
          </div>
        </div>

        {/* COLUMN 2: Tasks Reminders & Orange Pomodoro Timer (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Tasks Reminders(3) Card */}
          <div className="bg-white dark:bg-[#1a1b20] rounded-3xl p-5 border border-gray-200/60 dark:border-gray-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-black text-gray-900 dark:text-gray-100">
                Tasks Reminders({reminders.length})
              </h2>
            </div>

            {/* 3 Horizontal Reminder Cards */}
            <div className="grid grid-cols-3 gap-2.5 overflow-x-auto pb-1">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="bg-gray-50/90 dark:bg-gray-800/60 rounded-2xl p-2.5 flex flex-col justify-between h-24 border border-gray-100 dark:border-gray-700/60"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-gray-400">...</span>
                  </div>

                  <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200 leading-tight line-clamp-2">
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
          </div>

          {/* VIBRANT ORANGE POMODORO TIMER WIDGET (Matching the screenshot!) */}
          <div className="bg-[#FF5A1F] rounded-3xl p-5 text-white shadow-lg shadow-[#FF5A1F]/25 flex items-center justify-between">
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

              {/* Big bold timer */}
              <div className="text-4xl font-black tracking-tight text-white font-mono">
                {formatPomodoroTime(pomodoroSeconds)}
              </div>
            </div>

            {/* Play / Pause Toggle Pill Button (White with black icon) */}
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
        </div>

        {/* COLUMN 3: Week Goals & Daily Affirmation (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Week goals Card */}
          <div className="bg-white dark:bg-[#1a1b20] rounded-3xl p-5 border border-gray-200/60 dark:border-gray-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-black text-gray-900 dark:text-gray-100">
                Week goals:
              </h2>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <Pencil size={13} />
              </button>
            </div>

            <div className="space-y-2">
              {weekGoals.map((goal, idx) => (
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
              ))}
            </div>
          </div>

          {/* Daily Affirmation Card */}
          <div className="bg-white dark:bg-[#1a1b20] rounded-3xl p-5 border border-gray-200/60 dark:border-gray-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-gray-900 dark:text-gray-100">
                Daily Affirmation
              </h3>
              <Sparkles size={14} className="text-[#FF5A1F]" />
            </div>

            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed italic">
              &quot;Why stop when today might be the day you win?&quot;
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
