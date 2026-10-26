export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'paused' | 'cancelled';

export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  originalName: string;
  fileType: 'image' | 'document';
  mimeType: string;
  fileSize: number; // in bytes
  url: string; // URL path or base64 data
  caption?: string;
  uploadedAt: string;
}

export interface ProgressLog {
  id: string;
  timestamp: string;
  content: string;
  photos?: Attachment[];
}

export interface Task {
  id: string;
  userId?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  tags: string[];
  dueDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  estimatedDuration?: number; // in minutes
  actualDuration?: number; // in minutes
  isFocus: boolean; // "Fokus Hari Ini"
  isArchived: boolean;
  isDeleted: boolean; // Soft delete for trash
  deletedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  checklists: Subtask[];
  attachments: Attachment[];
  progressLogs: ProgressLog[];
  reminderTime?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string; // hex or tailwind color
  icon?: string;
  isCustom?: boolean;
}

export interface Habit {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  category: string;
  targetDaysPerWeek: number;
  frequency: 'daily' | 'weekdays' | 'weekends' | 'custom';
  createdAt: string;
  logs: Record<string, boolean>; // 'YYYY-MM-DD': true/false
  streak: number;
  bestStreak: number;
}

export type MoodType = 'great' | 'good' | 'neutral' | 'tired' | 'stressed';

export interface DailyJournal {
  id: string;
  userId?: string;
  date: string; // YYYY-MM-DD
  title: string;
  mood: MoodType;
  activitySummary: string;
  whatWentWell: string;
  obstacles: string;
  lessonsLearned: string;
  improvements: string;
  tomorrowPlan: string;
  photos: Attachment[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId?: string;
  timestamp: string;
  action: 'create' | 'update' | 'complete' | 'delete' | 'archive' | 'photo_upload' | 'habit_done' | 'journal_saved';
  entityType: 'task' | 'habit' | 'journal' | 'attachment';
  title: string;
  details?: string;
}

export interface UserProfile {
  name: string;
  email?: string;
  title: string;
  avatarUrl?: string;
  dailyGoal: number; // e.g. 5 tasks per day
  weekStartsOn: 0 | 1; // 0 for Sunday, 1 for Monday
  theme: 'light' | 'dark' | 'system';
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  title?: string;
  avatarUrl?: string;
  dailyGoal?: number;
  createdAt: string;
}

export interface GoalItem {
  id: string;
  title: string;
  completed: boolean;
  type: 'month' | 'week';
}

export interface ReminderItem {
  id: string;
  title: string;
  time: string;
  active: boolean;
}

export interface AppData {
  users?: UserAccount[];
  tasks: Task[];
  habits: Habit[];
  journals: DailyJournal[];
  categories: Category[];
  activities: ActivityLog[];
  profile: UserProfile;
  quickNotes: string;
  monthGoals?: GoalItem[];
  weekGoals?: GoalItem[];
  reminders?: ReminderItem[];
}
