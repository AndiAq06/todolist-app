import fs from 'fs';
import path from 'path';
import { AppData, Task, Habit, DailyJournal, Category, ActivityLog, UserProfile, GoalItem, ReminderItem } from '@/types';
import { DEFAULT_CATEGORIES, DEFAULT_PROFILE, DEFAULT_MONTH_GOALS, DEFAULT_WEEK_GOALS, DEFAULT_REMINDERS } from './constants';

const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel ? path.join('/tmp', '.data') : path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const LOCAL_SEED_FILE = path.join(process.cwd(), '.data', 'db.json');

const getTodayString = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const INITIAL_DATA: AppData = {
  users: [
    {
      id: 'user-demo-1',
      name: 'Todolist App',
      email: 'demo@todolist.app',
      // bcrypt hash for "password123"
      passwordHash: '$2a$10$wK1m.zHkW7T3g.q6J5v9O.F6o9215kY9g4u17b8j1M7C/m9e1YwCe',
      title: 'Task & Productivity Manager',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      dailyGoal: 5,
      createdAt: new Date().toISOString(),
    }
  ],
  profile: DEFAULT_PROFILE,
  categories: DEFAULT_CATEGORIES,
  quickNotes: '💡 Ide Proyek:\n- Finalize 303 project presentation\n- UX Course Module 2 review\n- Design Stride design system tokens',
  monthGoals: DEFAULT_MONTH_GOALS,
  weekGoals: DEFAULT_WEEK_GOALS,
  reminders: DEFAULT_REMINDERS,
  tasks: [
    {
      id: 'task-up-1',
      title: 'Read Little women',
      description: 'Read next chapters 4 and 5',
      status: 'todo',
      priority: 'normal',
      category: 'Pribadi',
      tags: ['Reading', 'Book'],
      dueDate: getTodayString(0),
      isFocus: false,
      isArchived: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      checklists: [],
      attachments: [],
      progressLogs: [],
    },
    {
      id: 'task-up-2',
      title: 'Complete your daily challenge',
      description: 'Daily habit check and UX micro-interaction challenge',
      status: 'todo',
      priority: 'high',
      category: 'Design Stride',
      tags: ['Challenge', 'Daily'],
      dueDate: getTodayString(0),
      isFocus: true,
      isArchived: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      checklists: [],
      attachments: [],
      progressLogs: [],
    },
    {
      id: 'task-up-3',
      title: 'Finalize your 303 project',
      description: 'Export all screens and finalize user flow documentation',
      status: 'todo',
      priority: 'urgent',
      category: 'Design Stride',
      tags: ['Project', '303'],
      dueDate: getTodayString(0),
      startTime: '10:00',
      endTime: '12:00',
      isFocus: true,
      isArchived: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      checklists: [],
      attachments: [],
      progressLogs: [],
    },
    {
      id: 'task-up-4',
      title: 'Prepare for 303 presentation',
      description: 'Slide deck review and rehearsal',
      status: 'todo',
      priority: 'high',
      category: 'Design Stride',
      tags: ['Presentation'],
      dueDate: getTodayString(0),
      isFocus: false,
      isArchived: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      checklists: [],
      attachments: [],
      progressLogs: [],
    },
    {
      id: 'task-up-5',
      title: 'Call mom',
      description: 'Catch up with mom in the evening',
      status: 'todo',
      priority: 'normal',
      category: 'Pribadi',
      tags: ['Family'],
      dueDate: getTodayString(0),
      reminderTime: '18:00',
      isFocus: false,
      isArchived: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      checklists: [],
      attachments: [],
      progressLogs: [],
    },
    {
      id: 'task-up-6',
      title: 'Read 310',
      description: 'Architecture and layout study chapter 310',
      status: 'todo',
      priority: 'normal',
      category: 'Belajar',
      tags: ['Study'],
      dueDate: getTodayString(0),
      isFocus: false,
      isArchived: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      checklists: [],
      attachments: [],
      progressLogs: [],
    },
    {
      id: 'task-1',
      title: 'Desain Wireframe & UI Dashboard Mobile',
      description: 'Menyusun komponen navigasi, kartu tugas interaktif, dan galeri preview foto agar optimal di layar smartphone.',
      status: 'completed',
      priority: 'high',
      category: 'Proyek',
      tags: ['Design', 'UI/UX', 'Figma'],
      dueDate: getTodayString(0),
      startTime: '09:00',
      endTime: '11:30',
      estimatedDuration: 150,
      actualDuration: 140,
      isFocus: true,
      isArchived: false,
      isDeleted: false,
      completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
      checklists: [
        { id: 'sub-1', title: 'Riset referensi Notion & TickTick', completed: true },
        { id: 'sub-2', title: 'Buat token warna Vibrant Orange & Neutral', completed: true },
        { id: 'sub-3', title: 'Export asset ikon SVG Lucide', completed: true },
      ],
      attachments: [
        {
          id: 'att-1',
          fileName: 'ui_wireframe_preview.jpg',
          originalName: 'Figma UI Exploration v1.jpg',
          fileType: 'image',
          mimeType: 'image/jpeg',
          fileSize: 245000,
          url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
          caption: 'Hasil rancangan antarmuka clean dashboard dan grid card',
          uploadedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        },
        {
          id: 'att-2',
          fileName: 'color_palette.png',
          originalName: 'Brand Color Guide.png',
          fileType: 'image',
          mimeType: 'image/png',
          fileSize: 180000,
          url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
          caption: 'Palet warna utama vibrant orange dan neutral cards',
          uploadedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        }
      ],
      progressLogs: [
        {
          id: 'log-1',
          timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
          content: 'Selesai menyusun struktur wireframe utama di Figma dan menguji responsivitas kartu.',
        }
      ],
      reminderTime: '08:30',
    },
    {
      id: 'task-2',
      title: 'Review Kode Backend API & Validasi Upload Foto',
      description: 'Memastikan multipart parser dan optimasi kompresi foto berjalan aman tanpa memory leak.',
      status: 'in_progress',
      priority: 'urgent',
      category: 'Pekerjaan',
      tags: ['Backend', 'NodeJS', 'Security'],
      dueDate: getTodayString(0),
      startTime: '13:00',
      endTime: '15:00',
      estimatedDuration: 120,
      actualDuration: 45,
      isFocus: true,
      isArchived: false,
      isDeleted: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      checklists: [
        { id: 'sub-2-1', title: 'Cek batas maksimum upload file (10MB)', completed: true },
        { id: 'sub-2-2', title: 'Validasi tipe MIME hanya JPG, PNG, WEBP, PDF', completed: true },
        { id: 'sub-2-3', title: 'Buat handler error dengan pesan user-friendly', completed: false },
      ],
      attachments: [
        {
          id: 'att-3',
          fileName: 'code_architecture_diagram.jpg',
          originalName: 'Backend Flow Architecture.jpg',
          fileType: 'image',
          mimeType: 'image/jpeg',
          fileSize: 312000,
          url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
          caption: 'Alur proses REST API dan penyimpanan file lokal/cloud',
          uploadedAt: new Date(Date.now() - 3600000).toISOString(),
        }
      ],
      progressLogs: [
        {
          id: 'log-2',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          content: 'Implementasi helper kompresi gambar di sisi klien berhasil mengurangi ukuran rata-rata foto hingga 80%.',
        }
      ],
    },
    {
      id: 'task-3',
      title: 'Persiapan Presentasi Sprint & Dokumentasi Kegiatan',
      description: 'Rangkum pencapaian mingguan dan lampirkan screenshot progres fitur kalender dan habit tracker.',
      status: 'todo',
      priority: 'high',
      category: 'Pekerjaan',
      tags: ['Sprint', 'Dokumentasi', 'Report'],
      dueDate: getTodayString(0),
      startTime: '16:00',
      endTime: '17:30',
      estimatedDuration: 90,
      actualDuration: 0,
      isFocus: true,
      isArchived: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      checklists: [
        { id: 'sub-3-1', title: 'Kumpulkan foto dokumentasi kerja', completed: false },
        { id: 'sub-3-2', title: 'Tulis ringkasan hasil di Daily Journal', completed: false },
      ],
      attachments: [],
      progressLogs: [],
    },
    {
      id: 'task-4',
      title: 'Belajar Next.js App Router & Server Actions Deep-Dive',
      description: 'Membaca dokumentasi caching, PPR (Partial Prerendering), dan arsitektur serverless di Vercel.',
      status: 'todo',
      priority: 'normal',
      category: 'Belajar',
      tags: ['React', 'NextJS', 'Learning'],
      dueDate: getTodayString(1),
      startTime: '19:30',
      endTime: '21:00',
      estimatedDuration: 90,
      actualDuration: 0,
      isFocus: false,
      isArchived: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      checklists: [
        { id: 'sub-4-1', title: 'Baca chapter Caching & Revalidation', completed: false },
        { id: 'sub-4-2', title: 'Eksperimen Route Handlers streaming', completed: false },
      ],
      attachments: [],
      progressLogs: [],
    },
    {
      id: 'task-5',
      title: 'Jogging Sore 5KM & Peregangan Otot',
      description: 'Lari santai di taman kota untuk menjaga kebugaran tubuh setelah coding seharian.',
      status: 'todo',
      priority: 'low',
      category: 'Kesehatan',
      tags: ['Fitness', 'Cardio', 'Outdoor'],
      dueDate: getTodayString(0),
      startTime: '17:30',
      endTime: '18:30',
      estimatedDuration: 60,
      actualDuration: 0,
      isFocus: false,
      isArchived: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      checklists: [],
      attachments: [],
      progressLogs: [],
    }
  ],
  habits: [
    {
      id: 'habit-1',
      title: 'Belajar Bahasa Inggris 30 Menit',
      description: 'Mendengarkan podcast atau latihan vocabulary di Anki',
      category: 'Belajar',
      targetDaysPerWeek: 7,
      frequency: 'daily',
      createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
      logs: {
        [getTodayString(-4)]: true,
        [getTodayString(-3)]: true,
        [getTodayString(-2)]: true,
        [getTodayString(-1)]: true,
        [getTodayString(0)]: true,
      },
      streak: 5,
      bestStreak: 12,
    },
    {
      id: 'habit-2',
      title: 'Membaca Buku Non-Fiksi 15 Halaman',
      description: 'Atomic Habits & Deep Work',
      category: 'Belajar',
      targetDaysPerWeek: 6,
      frequency: 'daily',
      createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      logs: {
        [getTodayString(-3)]: true,
        [getTodayString(-2)]: true,
        [getTodayString(-1)]: true,
        [getTodayString(0)]: false,
      },
      streak: 3,
      bestStreak: 18,
    },
    {
      id: 'habit-3',
      title: 'Olahraga / Jalan Kaki 7000 Langkah',
      description: 'Aktivitas fisik ringan harian',
      category: 'Kesehatan',
      targetDaysPerWeek: 5,
      frequency: 'daily',
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      logs: {
        [getTodayString(-2)]: true,
        [getTodayString(-1)]: true,
        [getTodayString(0)]: true,
      },
      streak: 3,
      bestStreak: 9,
    },
    {
      id: 'habit-4',
      title: 'Menulis Jurnal Harian & Evaluasi',
      description: 'Refleksi pencapaian dan rasa syukur sebelum tidur',
      category: 'Pribadi',
      targetDaysPerWeek: 7,
      frequency: 'daily',
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      logs: {
        [getTodayString(-3)]: true,
        [getTodayString(-2)]: true,
        [getTodayString(-1)]: true,
        [getTodayString(0)]: false,
      },
      streak: 3,
      bestStreak: 21,
    }
  ],
  journals: [
    {
      id: 'journal-1',
      date: getTodayString(-1),
      title: 'Hari Produktif dengan Fokus Tinggi pada Desain & Integrasi',
      mood: 'great',
      activitySummary: 'Menyelesaikan modul desain wireframe dan merapikan komponen visual aplikasi todo. Sempat olahraga jogging sore.',
      whatWentWell: 'Berhasil menyelesaikan target prioritas tinggi lebih cepat dari estimasi, dan layout responsif terasa sangat nyaman di ponsel.',
      obstacles: 'Sempat kesulitan mengatur state foto lightbox, namun teratasi dengan modal viewer yang terisolasi.',
      lessonsLearned: 'Membuat checklist terperinci sebelum mulai menulis kode mengurangi revisi berulang secara signifikan.',
      improvements: 'Mulai bangun lebih awal agar ada waktu santai membaca buku di pagi hari sebelum jam kerja.',
      tomorrowPlan: 'Fokus pada backend upload endpoint dan uji coba fitur bulk action.',
      photos: [
        {
          id: 'att-j-1',
          fileName: 'desk_setup.jpg',
          originalName: 'Workspace Motivation.jpg',
          fileType: 'image',
          mimeType: 'image/jpeg',
          fileSize: 290000,
          url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
          caption: 'Suasana meja kerja yang rapi meningkatkan fokus seharian',
          uploadedAt: new Date(Date.now() - 86400000).toISOString(),
        }
      ],
      tags: ['Refleksi', 'Produktivitas', 'Coding'],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    }
  ],
  activities: [
    {
      id: 'act-1',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      action: 'complete',
      entityType: 'task',
      title: 'Menyelesaikan tugas: Desain Wireframe & UI Dashboard Mobile',
      details: 'Diselesaikan tepat waktu dengan 2 foto dokumentasi terlampir',
    },
    {
      id: 'act-2',
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      action: 'photo_upload',
      entityType: 'attachment',
      title: 'Mengunggah 2 foto bukti dokumentasi',
      details: 'Figma UI Exploration v1.jpg & Brand Color Guide.png',
    },
    {
      id: 'act-3',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      action: 'habit_done',
      entityType: 'habit',
      title: 'Menyelesaikan kebiasaan: Belajar Bahasa Inggris 30 Menit',
      details: 'Streak bertambah menjadi 5 hari berturut-turut! 🔥',
    }
  ]
};

// In-memory fallback if file system is read-only (e.g. serverless environment without persistent volume)
let memoryCache: AppData | null = null;

export function getDatabase(): AppData {
  if (memoryCache) {
    return memoryCache;
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      let seedData = INITIAL_DATA;
      if (fs.existsSync(LOCAL_SEED_FILE)) {
        try {
          const rawSeed = fs.readFileSync(LOCAL_SEED_FILE, 'utf-8');
          seedData = JSON.parse(rawSeed);
        } catch {
          seedData = INITIAL_DATA;
        }
      }
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(seedData, null, 2), 'utf-8');
      } catch (writeErr) {
        console.warn('Could not write initial DB_FILE to disk:', writeErr);
      }
      memoryCache = seedData;
      return memoryCache;
    }

    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.users || parsed.users.length === 0) {
      parsed.users = INITIAL_DATA.users;
    }
    if (!parsed.profile || !parsed.profile.name || parsed.profile.name === 'Rafi Pratama') {
      parsed.profile = DEFAULT_PROFILE;
    }
    if (!parsed.monthGoals || parsed.monthGoals.length === 0) {
      parsed.monthGoals = DEFAULT_MONTH_GOALS;
    }
    if (!parsed.weekGoals || parsed.weekGoals.length === 0) {
      parsed.weekGoals = DEFAULT_WEEK_GOALS;
    }
    if (!parsed.reminders || parsed.reminders.length === 0) {
      parsed.reminders = DEFAULT_REMINDERS;
    }
    if (!parsed.categories || parsed.categories.length === 0) {
      parsed.categories = DEFAULT_CATEGORIES;
    } else {
      // Ensure 'Design Stride' and 'Plan Vacation' are present
      const hasDesignStride = parsed.categories.some((c: Category) => c.name === 'Design Stride');
      if (!hasDesignStride) {
        parsed.categories.unshift({ id: 'design-stride', name: 'Design Stride', color: '#A855F7', icon: 'FolderKanban' });
      }
      const hasPlanVacation = parsed.categories.some((c: Category) => c.name === 'Plan Vacation');
      if (!hasPlanVacation) {
        parsed.categories.unshift({ id: 'plan-vacation', name: 'Plan Vacation', color: '#F97316', icon: 'FolderKanban' });
      }
    }
    // Ensure upcoming tasks from the design exist if missing
    if (parsed.tasks && !parsed.tasks.some((t: Task) => t.title === 'Read Little women')) {
      const upcomingSeed = INITIAL_DATA.tasks.filter(t => t.id.startsWith('task-up-'));
      parsed.tasks = [...upcomingSeed, ...parsed.tasks];
    }
    memoryCache = parsed;
    return parsed;
  } catch (err) {
    console.warn('Filesystem access failed, using memory cache:', err);
    if (!memoryCache) {
      memoryCache = INITIAL_DATA;
    }
    return memoryCache;
  }
}

export function saveDatabase(data: AppData): boolean {
  memoryCache = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.warn('Failed to save to disk, kept in memory cache:', err);
    return false;
  }
}

export function logActivity(action: ActivityLog['action'], entityType: ActivityLog['entityType'], title: string, details?: string) {
  const db = getDatabase();
  const newLog: ActivityLog = {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    action,
    entityType,
    title,
    details,
  };
  db.activities = [newLog, ...(db.activities || [])].slice(0, 50); // Keep last 50 activities
  saveDatabase(db);
}
