'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo } from 'react';
import { Task, Habit, DailyJournal, Category, UserProfile, ActivityLog, Attachment, TaskStatus, TaskPriority, GoalItem, ReminderItem } from '@/types';
import { DEFAULT_CATEGORIES, DEFAULT_PROFILE, DEFAULT_MONTH_GOALS, DEFAULT_WEEK_GOALS, DEFAULT_REMINDERS } from '@/lib/constants';
import { Sidebar, NavTab } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { ModernDashboard } from '@/components/dashboard/ModernDashboard';
import { QuickAddInput } from '@/components/tasks/QuickAddInput';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { FocusWidget } from '@/components/dashboard/FocusWidget';
import { PomodoroWidget } from '@/components/dashboard/PomodoroWidget';
import { DailyAffirmation } from '@/components/dashboard/DailyAffirmation';
import { QuickNotesWidget } from '@/components/dashboard/QuickNotesWidget';
import { TaskListView } from '@/components/tasks/TaskListView';
import { TaskKanbanView } from '@/components/tasks/TaskKanbanView';
import { TaskGridView } from '@/components/tasks/TaskGridView';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';
import { TaskFormModal } from '@/components/tasks/TaskFormModal';
import { PhotoLightbox } from '@/components/attachments/PhotoLightbox';
import { CalendarView } from '@/components/calendar/CalendarView';
import { HabitTrackerView } from '@/components/habits/HabitTrackerView';
import { DailyJournalView } from '@/components/journal/DailyJournalView';
import { ProductivityInsights } from '@/components/stats/ProductivityInsights';
import { ArchiveTrashView } from '@/components/archive/ArchiveTrashView';
import { SettingsView } from '@/components/settings/SettingsView';
import { AuthModal } from '@/components/auth/AuthModal';
import { AuthPage } from '@/components/auth/AuthPage';
import {
  ListFilter,
  Grid,
  Columns3,
  List,
  Sparkles,
  ArrowUpDown,
  Calendar,
  Clock,
  Camera,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Home() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // App Data State (Instant default render without cold-start blocking)
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [journals, setJournals] = useState<DailyJournal[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [monthGoals, setMonthGoals] = useState<GoalItem[]>(DEFAULT_MONTH_GOALS);
  const [weekGoals, setWeekGoals] = useState<GoalItem[]>(DEFAULT_WEEK_GOALS);
  const [reminders, setReminders] = useState<ReminderItem[]>(DEFAULT_REMINDERS);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [quickNotes, setQuickNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [todayStr, setTodayStr] = useState('');

  useEffect(() => {
    setTodayStr(new Date().toISOString().split('T')[0]);
  }, []);

  // Filters & Views
  const [taskViewMode, setTaskViewMode] = useState<'list' | 'kanban' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt' | 'title'>('dueDate');

  // Bulk Selection
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  // Modals State
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);

  // Lightbox State
  const [lightboxPhotos, setLightboxPhotos] = useState<Attachment[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Auth State
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Instant Unified Bootstrap Load (Eliminates 6x sequential waterfall delay)
  const fetchAllData = async () => {
    try {
      const res = await fetch('/api/bootstrap');
      const data = await res.json();
      if (data.success) {
        if (data.user) setCurrentUser(data.user);
        if (data.tasks) setTasks(data.tasks);
        if (data.habits) setHabits(data.habits);
        if (data.journals) setJournals(data.journals);
        if (data.profile) setProfile(data.profile);
        if (data.categories) setCategories(data.categories);
        if (data.quickNotes) setQuickNotes(data.quickNotes);
        if (data.monthGoals) setMonthGoals(data.monthGoals);
        if (data.weekGoals) setWeekGoals(data.weekGoals);
        if (data.reminders) setReminders(data.reminders);
        if (data.activities) setActivities(data.activities);
      }
    } catch (err) {
      console.warn('Bootstrap load failed:', err);
    }
  };

  const handleToggleGoal = async (id: string, type: 'month' | 'week') => {
    if (type === 'month') {
      setMonthGoals((prev) =>
        prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
      );
    } else {
      setWeekGoals((prev) =>
        prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
      );
    }
    try {
      await fetch('/api/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggleGoal', payload: { id, type } }),
      });
    } catch (err) {
      console.warn('Toggle goal error:', err);
    }
  };

  const handleToggleReminder = async (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
    try {
      await fetch('/api/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggleReminder', payload: { id } }),
      });
    } catch (err) {
      console.warn('Toggle reminder error:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      await fetchAllData();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleAuthSuccess = async (user: any) => {
    setCurrentUser(user);
    await fetchAllData();
  };

  useEffect(() => {
    fetchAllData();
    const savedTheme = localStorage.getItem('todo_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, []);

  // Sync dark mode class and storage whenever isDarkMode state changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('todo_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('todo_theme', 'light');
    }
  }, [isDarkMode]);

  // Dark Mode Toggle
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Active Profile synced with logged-in user
  const activeProfile: UserProfile = useMemo(() => {
    if (currentUser) {
      return {
        name: currentUser.name,
        email: currentUser.email,
        title: currentUser.title || 'Pengguna Produktif',
        avatarUrl: currentUser.avatarUrl,
        dailyGoal: currentUser.dailyGoal || profile.dailyGoal || 5,
        weekStartsOn: profile.weekStartsOn || 1,
        theme: profile.theme || 'light',
      };
    }
    return profile;
  }, [currentUser, profile]);

  // 1. Task Operations
  const handleToggleTaskComplete = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    const updated = { ...task, status: newStatus as TaskStatus };

    // Optimistic UI update
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    if (selectedTaskForDetail?.id === task.id) {
      setSelectedTaskForDetail(updated);
    }

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.task) {
        setTasks((prev) => prev.map((t) => (t.id === task.id ? data.task : t)));
      }
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (editingTask) {
      // Update
      const res = await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      const data = await res.json();
      if (data.task) {
        setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? data.task : t)));
        if (selectedTaskForDetail?.id === editingTask.id) {
          setSelectedTaskForDetail(data.task);
        }
      }
    } else {
      // Create
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      const data = await res.json();
      if (data.task) {
        setTasks((prev) => [data.task, ...prev]);
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
      }
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    setSelectedTaskForDetail(updatedTask);

    await fetch(`/api/tasks/${updatedTask.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTask),
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTaskForDetail?.id === taskId) setSelectedTaskForDetail(null);

    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
  };

  const handlePermanentDelete = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    await fetch(`/api/tasks/${taskId}?permanent=true`, { method: 'DELETE' });
  };

  const handleRestoreTask = async (taskId: string) => {
    await fetch('/api/tasks/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'restore', taskIds: [taskId] }),
    });
    await fetchAllData();
  };

  const handleUnarchiveTask = async (taskId: string) => {
    await handleUpdateTask({
      ...(tasks.find((t) => t.id === taskId) as Task),
      isArchived: false,
    });
  };

  // Simple Add Task handler for dashboard
  const handleSimpleAddTask = async (title: string, category?: string) => {
    await handleSaveTask({
      title,
      dueDate: todayStr || new Date().toISOString().split('T')[0],
      priority: 'normal',
      category: category || 'Design Stride',
      status: 'todo',
      isFocus: false,
      checklists: [],
      attachments: [],
    });
  };

  // Quick Add handler
  const handleQuickAdd = async (parsedData: {
    title: string;
    dueDate: string;
    startTime?: string;
    priority: TaskPriority;
    category?: string;
  }) => {
    await handleSaveTask({
      title: parsedData.title,
      dueDate: parsedData.dueDate,
      startTime: parsedData.startTime,
      priority: parsedData.priority,
      category: parsedData.category || 'Pekerjaan',
      status: 'todo',
      isFocus: false,
      checklists: [],
      attachments: [],
    });
  };

  // Bulk Actions
  const handleBulkComplete = async () => {
    if (selectedTaskIds.length === 0) return;
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    await fetch('/api/tasks/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'complete', taskIds: selectedTaskIds }),
    });
    setSelectedTaskIds([]);
    await fetchAllData();
  };

  const handleBulkDelete = async () => {
    if (selectedTaskIds.length === 0) return;
    if (confirm(`Pindahkan ${selectedTaskIds.length} tugas ke tempat sampah?`)) {
      await fetch('/api/tasks/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', taskIds: selectedTaskIds }),
      });
      setSelectedTaskIds([]);
      await fetchAllData();
    }
  };

  // Habits Operations
  const handleToggleHabit = async (habitId: string, dateStr: string, completed: boolean) => {
    // Optimistic
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const newLogs = { ...(h.logs || {}) };
        if (completed) newLogs[dateStr] = true;
        else delete newLogs[dateStr];
        return { ...h, logs: newLogs };
      })
    );

    const res = await fetch('/api/habits', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: habitId, date: dateStr, completed }),
    });
    const data = await res.json();
    if (data.habit) {
      setHabits((prev) => prev.map((h) => (h.id === habitId ? data.habit : h)));
    }
  };

  const handleAddHabit = async (newHabit: Partial<Habit>) => {
    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newHabit),
    });
    const data = await res.json();
    if (data.habit) {
      setHabits((prev) => [...prev, data.habit]);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    await fetch(`/api/habits?id=${habitId}`, { method: 'DELETE' });
  };

  // Journal Operations
  const handleSaveJournal = async (journalData: Partial<DailyJournal>) => {
    const res = await fetch('/api/journals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(journalData),
    });
    const data = await res.json();
    if (data.journal) {
      setJournals((prev) => {
        const idx = prev.findIndex((j) => j.id === data.journal.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = data.journal;
          return next;
        }
        return [data.journal, ...prev];
      });
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    }
  };

  const handleDeleteJournal = async (journalId: string) => {
    setJournals((prev) => prev.filter((j) => j.id !== journalId));
    await fetch(`/api/journals?id=${journalId}`, { method: 'DELETE' });
  };

  // Lightbox Triggers
  const openTaskPhotoLightbox = (task: Task, photoIndex: number) => {
    const images = task.attachments.filter((a) => a.fileType === 'image');
    if (images.length > 0) {
      setLightboxPhotos(images);
      setLightboxIndex(photoIndex);
      setIsLightboxOpen(true);
    }
  };

  const openPhotosDirectLightbox = (photos: Attachment[], index: number) => {
    const images = photos.filter((a) => a.fileType === 'image');
    if (images.length > 0) {
      setLightboxPhotos(images);
      setLightboxIndex(index);
      setIsLightboxOpen(true);
    }
  };

  // Backup & CSV Export
  const handleExportJson = () => {
    window.location.href = '/api/backup';
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Judul', 'Status', 'Prioritas', 'Kategori', 'Tanggal', 'Waktu', 'Durasi (Menit)', 'Jumlah Foto'];
    const rows = tasks.map((t) => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      t.status,
      t.priority,
      t.category,
      t.dueDate,
      t.startTime || '',
      t.estimatedDuration || '',
      t.attachments.filter((a) => a.fileType === 'image').length,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tasks_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJson = async (file: File) => {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const res = await fetch('/api/backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Format tidak valid');
    }
    await fetchAllData();
  };

  const handleResetDemoData = async () => {
    await fetch('/api/backup', { method: 'POST', body: JSON.stringify({ reset: true }) });
    window.location.reload();
  };

  // Filtered Tasks for Tasks Tab
  const filteredTasks = useMemo(() => {
    let result = tasks.filter((t) => !t.isDeleted && !t.isArchived);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q))) ||
          t.category.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter((t) => t.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'priority') {
        const order: Record<string, number> = { urgent: 4, high: 3, normal: 2, low: 1 };
        return (order[b.priority] || 0) - (order[a.priority] || 0);
      }
      if (sortBy === 'createdAt') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      const da = a.dueDate + (a.startTime || '00:00');
      const db = b.dueDate + (b.startTime || '00:00');
      return da.localeCompare(db);
    });

    return result;
  }, [tasks, searchQuery, categoryFilter, statusFilter, priorityFilter, sortBy]);

  const overdueCount = useMemo(() => {
    if (!todayStr) return 0;
    return tasks.filter((t) => !t.isDeleted && !t.isArchived && t.dueDate < todayStr && t.status !== 'completed').length;
  }, [tasks, todayStr]);

  // If user is not logged in, render Finora-style orange AuthPage as the initial landing page
  if (!currentUser) {
    return (
      <AuthPage
        onAuthSuccess={handleAuthSuccess}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />
    );
  }

  return (
    <div className={`${isDarkMode ? 'dark' : ''} min-h-screen bg-[#F3F3F5] dark:bg-[#111215] text-gray-900 dark:text-gray-100 flex flex-col antialiased`}>
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenQuickAdd={() => {
          setEditingTask(null);
          setIsTaskFormOpen(true);
        }}
        profile={activeProfile}
        currentUser={currentUser}
        categories={categories}
        selectedCategory={categoryFilter}
        onSelectCategory={(cat) => {
          setCategoryFilter(cat);
          setCurrentTab('tasks');
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        activeTasksCount={tasks.filter((t) => !t.isDeleted && !t.isArchived && t.status !== 'completed').length}
      />

      {/* Main Content Area */}
      <div className="lg:pl-60 flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenQuickAdd={() => {
            setEditingTask(null);
            setIsTaskFormOpen(true);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          overdueCount={overdueCount}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          currentTab={currentTab}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
        />

        {/* Page Content Container */}
        <main className="p-3.5 sm:p-6 lg:p-7 flex-1 max-w-[1360px] w-full mx-auto space-y-6 pb-24 lg:pb-8">
          {/* TAB 1: DASHBOARD (MY DAY) - MATCHING SCREENSHOT */}
          {currentTab === 'dashboard' && (
            <ModernDashboard
              tasks={tasks}
              monthGoals={monthGoals}
              weekGoals={weekGoals}
              reminders={reminders}
              categories={categories}
              onToggleTask={handleToggleTaskComplete}
              onAddTask={handleSimpleAddTask}
              onToggleGoal={handleToggleGoal}
              onToggleReminder={handleToggleReminder}
              onOpenTaskDetail={setSelectedTaskForDetail}
              onSelectTab={setCurrentTab}
            />
          )}

          {/* TAB 2: TASKS (MANAJEMEN TUGAS) */}
          {currentTab === 'tasks' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Filter & View Switcher Bar */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700/60 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                {/* Category Pills Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                  <button
                    onClick={() => setCategoryFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                      categoryFilter === 'all'
                        ? 'bg-[#FF5A1F] text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    Semua ({tasks.filter((t) => !t.isDeleted && !t.isArchived).length})
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCategoryFilter(c.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                        categoryFilter === c.name
                          ? 'bg-[#FF5A1F] text-white shadow-sm'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>

                {/* View Switcher: List, Kanban, Grid */}
                <div className="flex items-center justify-between sm:justify-end gap-2">
                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-xs px-2.5 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-semibold border-none focus:ring-1 focus:ring-[#FF5A1F]"
                  >
                    <option value="dueDate">Urut: Tanggal</option>
                    <option value="priority">Urut: Prioritas</option>
                    <option value="createdAt">Urut: Terbaru</option>
                    <option value="title">Urut: Abjad</option>
                  </select>

                  <div className="flex items-center bg-gray-100 dark:bg-gray-700 p-1 rounded-2xl text-xs">
                    <button
                      onClick={() => setTaskViewMode('list')}
                      title="Tampilan Daftar (List)"
                      className={`p-1.5 rounded-xl transition ${
                        taskViewMode === 'list'
                          ? 'bg-white dark:bg-gray-800 text-[#FF5A1F] shadow-sm'
                          : 'text-gray-400 hover:text-gray-700'
                      }`}
                    >
                      <List size={16} />
                    </button>
                    <button
                      onClick={() => setTaskViewMode('kanban')}
                      title="Tampilan Kanban Board"
                      className={`p-1.5 rounded-xl transition ${
                        taskViewMode === 'kanban'
                          ? 'bg-white dark:bg-gray-800 text-[#FF5A1F] shadow-sm'
                          : 'text-gray-400 hover:text-gray-700'
                      }`}
                    >
                      <Columns3 size={16} />
                    </button>
                    <button
                      onClick={() => setTaskViewMode('grid')}
                      title="Tampilan Kartu Galeri (Grid)"
                      className={`p-1.5 rounded-xl transition ${
                        taskViewMode === 'grid'
                          ? 'bg-white dark:bg-gray-800 text-[#FF5A1F] shadow-sm'
                          : 'text-gray-400 hover:text-gray-700'
                      }`}
                    >
                      <Grid size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* View Render */}
              {taskViewMode === 'list' && (
                <TaskListView
                  tasks={filteredTasks}
                  onToggleComplete={handleToggleTaskComplete}
                  onOpenDetail={setSelectedTaskForDetail}
                  onOpenPhotoLightbox={openTaskPhotoLightbox}
                  selectedIds={selectedTaskIds}
                  onToggleSelect={(id, checked) => {
                    setSelectedTaskIds((prev) =>
                      checked ? [...prev, id] : prev.filter((i) => i !== id)
                    );
                  }}
                  onSelectAll={() => setSelectedTaskIds(filteredTasks.map((t) => t.id))}
                  onClearSelection={() => setSelectedTaskIds([])}
                  onBulkComplete={handleBulkComplete}
                  onBulkDelete={handleBulkDelete}
                />
              )}

              {taskViewMode === 'kanban' && (
                <TaskKanbanView
                  tasks={filteredTasks}
                  onToggleComplete={handleToggleTaskComplete}
                  onOpenDetail={setSelectedTaskForDetail}
                  onOpenPhotoLightbox={openTaskPhotoLightbox}
                  onUpdateStatus={async (taskId, newStatus) => {
                    const task = tasks.find((t) => t.id === taskId);
                    if (task) {
                      await handleUpdateTask({ ...task, status: newStatus });
                    }
                  }}
                  onAddNewToStatus={(status) => {
                    setEditingTask(null);
                    setIsTaskFormOpen(true);
                  }}
                />
              )}

              {taskViewMode === 'grid' && (
                <TaskGridView
                  tasks={filteredTasks}
                  onToggleComplete={handleToggleTaskComplete}
                  onOpenDetail={setSelectedTaskForDetail}
                  onOpenPhotoLightbox={openTaskPhotoLightbox}
                />
              )}
            </div>
          )}

          {/* TAB 3: CALENDAR (KALENDER) */}
          {currentTab === 'calendar' && (
            <div className="animate-in fade-in">
              <CalendarView
                tasks={tasks}
                onOpenTaskDetail={setSelectedTaskForDetail}
                onAddTaskForDate={(dateStr) => {
                  setEditingTask(null);
                  setIsTaskFormOpen(true);
                }}
              />
            </div>
          )}

          {/* TAB 4: HABITS (HABIT TRACKER) */}
          {currentTab === 'habits' && (
            <div className="animate-in fade-in">
              <HabitTrackerView
                habits={habits}
                onToggleHabitDate={handleToggleHabit}
                onAddHabit={handleAddHabit}
                onDeleteHabit={handleDeleteHabit}
              />
            </div>
          )}

          {/* TAB 5: JOURNAL (JURNAL HARIAN) */}
          {currentTab === 'journal' && (
            <div className="animate-in fade-in">
              <DailyJournalView
                journals={journals}
                onSaveJournal={handleSaveJournal}
                onDeleteJournal={handleDeleteJournal}
                onOpenPhotoLightbox={openPhotosDirectLightbox}
              />
            </div>
          )}

          {/* TAB 6: STATS (STATISTIK & INSIGHTS) */}
          {currentTab === 'stats' && (
            <div className="animate-in fade-in">
              <ProductivityInsights
                tasks={tasks}
                habits={habits}
                journals={journals}
              />
            </div>
          )}

          {/* TAB 7: ARCHIVE & TRASH */}
          {currentTab === 'archive' && (
            <div className="animate-in fade-in">
              <ArchiveTrashView
                tasks={tasks}
                onRestoreTask={handleRestoreTask}
                onUnarchiveTask={handleUnarchiveTask}
                onPermanentDeleteTask={handlePermanentDelete}
                onEmptyTrash={async () => {
                  const deletedIds = tasks.filter((t) => t.isDeleted).map((t) => t.id);
                  for (const id of deletedIds) {
                    await handlePermanentDelete(id);
                  }
                }}
              />
            </div>
          )}

          {/* TAB 8: SETTINGS & BACKUP */}
          {currentTab === 'settings' && (
            <div className="animate-in fade-in">
              <SettingsView
                profile={activeProfile}
                onUpdateProfile={async (p) => {
                  const res = await fetch('/api/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ profile: p }),
                  });
                  const data = await res.json();
                  if (data.profile) setProfile(data.profile);
                  if (currentUser) {
                    setCurrentUser((prev: any) => ({
                      ...prev,
                      name: p.name || prev.name,
                      title: p.title !== undefined ? p.title : prev.title,
                      dailyGoal: p.dailyGoal || prev.dailyGoal,
                    }));
                  }
                }}
                onExportJson={handleExportJson}
                onExportCsv={handleExportCsv}
                onImportJson={handleImportJson}
                onResetDemoData={handleResetDemoData}
                isDarkMode={isDarkMode}
                onToggleDarkMode={toggleDarkMode}
              />
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: TASK DETAIL MODAL */}
      <TaskDetailModal
        task={selectedTaskForDetail}
        isOpen={Boolean(selectedTaskForDetail)}
        onClose={() => setSelectedTaskForDetail(null)}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        onOpenEditModal={(task) => {
          setSelectedTaskForDetail(null);
          setEditingTask(task);
          setIsTaskFormOpen(true);
        }}
        onOpenPhotoLightbox={openTaskPhotoLightbox}
      />

      {/* MODAL 2: TASK CREATE / EDIT FORM MODAL */}
      <TaskFormModal
        isOpen={isTaskFormOpen}
        onClose={() => {
          setIsTaskFormOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        categories={categories}
        initialTask={editingTask}
      />

      {/* MODAL 3: FULLSCREEN PHOTO LIGHTBOX */}
      <PhotoLightbox
        photos={lightboxPhotos}
        initialIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onDeletePhoto={async (photoId) => {
          setLightboxPhotos((prev) => prev.filter((p) => p.id !== photoId));
          // Also remove from task if open
          if (selectedTaskForDetail) {
            const updated = {
              ...selectedTaskForDetail,
              attachments: selectedTaskForDetail.attachments.filter((a) => a.id !== photoId),
            };
            await handleUpdateTask(updated);
          }
        }}
      />

      {/* MODAL 4: LOGIN & REGISTER AUTH MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* MOBILE BOTTOM NAVIGATION BAR FOR SMARTPHONES */}
      <MobileBottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenQuickAdd={() => {
          setEditingTask(null);
          setIsTaskFormOpen(true);
        }}
        activeTasksCount={tasks.filter((t) => !t.isDeleted && !t.isArchived && t.status !== 'completed').length}
      />
    </div>
  );
}
