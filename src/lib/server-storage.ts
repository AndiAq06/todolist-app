import fs from 'fs';
import path from 'path';
import { AppData, ActivityLog, Category } from '@/types';
import { DEFAULT_CATEGORIES, DEFAULT_PROFILE } from './constants';

const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel ? path.join('/tmp', '.data') : path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const LOCAL_SEED_FILE = path.join(process.cwd(), '.data', 'db.json');

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
  quickNotes: '',
  monthGoals: [],
  weekGoals: [],
  reminders: [],
  tasks: [],
  habits: [],
  journals: [],
  activities: []
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
    if (!Array.isArray(parsed.monthGoals)) {
      parsed.monthGoals = [];
    }
    if (!Array.isArray(parsed.weekGoals)) {
      parsed.weekGoals = [];
    }
    if (!Array.isArray(parsed.reminders)) {
      parsed.reminders = [];
    }
    if (!Array.isArray(parsed.tasks)) {
      parsed.tasks = [];
    }
    if (!Array.isArray(parsed.habits)) {
      parsed.habits = [];
    }
    if (!Array.isArray(parsed.journals)) {
      parsed.journals = [];
    }
    if (!Array.isArray(parsed.activities)) {
      parsed.activities = [];
    }
    if (!parsed.categories || parsed.categories.length === 0) {
      parsed.categories = DEFAULT_CATEGORIES;
    } else {
      const hasDesignStride = parsed.categories.some((c: Category) => c.name === 'Design Stride');
      if (!hasDesignStride) {
        parsed.categories.unshift({ id: 'design-stride', name: 'Design Stride', color: '#A855F7', icon: 'FolderKanban' });
      }
      const hasPlanVacation = parsed.categories.some((c: Category) => c.name === 'Plan Vacation');
      if (!hasPlanVacation) {
        parsed.categories.unshift({ id: 'plan-vacation', name: 'Plan Vacation', color: '#F97316', icon: 'FolderKanban' });
      }
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

const CLOUD_BLOB_URL = 'https://7n4wq1ngsjcb0xnu.public.blob.vercel-storage.com/db.json';

export async function syncToCloudBlob(data: AppData): Promise<boolean> {
  try {
    const { put } = await import('@vercel/blob');
    await put('db.json', JSON.stringify(data, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return true;
  } catch (err) {
    console.warn('Vercel Blob sync write error:', err);
    return false;
  }
}

export async function syncFromCloudBlobIfColdStart(): Promise<AppData> {
  if (memoryCache && (memoryCache.tasks?.length || 0) > 0) {
    return memoryCache;
  }

  try {
    const res = await fetch(CLOUD_BLOB_URL, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (res.ok) {
      const cloudData = await res.json();
      if (cloudData && Array.isArray(cloudData.users)) {
        memoryCache = cloudData;
        try {
          if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
          fs.writeFileSync(DB_FILE, JSON.stringify(cloudData, null, 2), 'utf-8');
        } catch {}
        return cloudData as AppData;
      }
    }
  } catch (err) {
    console.warn('Could not sync db from Cloud Blob:', err);
  }

  return getDatabase();
}

export function saveDatabase(data: AppData): boolean {
  memoryCache = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to save to disk, kept in memory cache:', err);
  }

  // Fire background cloud blob sync
  syncToCloudBlob(data).catch((e) => console.warn('Background cloud blob sync error:', e));
  return true;
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
