import { Category, UserProfile, GoalItem, ReminderItem } from '@/types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'design-stride', name: 'Design Stride', color: '#A855F7', icon: 'FolderKanban' },
  { id: 'plan-vacation', name: 'Plan Vacation', color: '#F97316', icon: 'FolderKanban' },
  { id: 'work', name: 'Pekerjaan', color: '#3B82F6', icon: 'Briefcase' },
  { id: 'personal', name: 'Pribadi', color: '#10B981', icon: 'User' },
  { id: 'study', name: 'Belajar', color: '#8B5CF6', icon: 'BookOpen' },
  { id: 'health', name: 'Kesehatan', color: '#EC4899', icon: 'Activity' },
  { id: 'finance', name: 'Keuangan', color: '#F59E0B', icon: 'DollarSign' },
];

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Todolist App',
  title: 'Task & Productivity Manager',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  dailyGoal: 5,
  weekStartsOn: 1, // Monday
  theme: 'light',
};

export const DEFAULT_MONTH_GOALS: GoalItem[] = [];

export const DEFAULT_WEEK_GOALS: GoalItem[] = [];

export const DEFAULT_REMINDERS: ReminderItem[] = [];

export const DAILY_AFFIRMATIONS = [
  'Why stop when today might be the day you win?',
  'Fokus pada satu langkah kecil hari ini. Kemajuan nyata dibangun dari konsistensi harian.',
  'Satu tugas yang selesai lebih bernilai daripada sepuluh rencana tanpa tindakan.',
  'Setiap usaha yang Anda curahkan hari ini adalah investasi berharga untuk masa depan.',
  'Keberhasilan bukan tentang kesempurnaan, tapi tentang kemauan untuk terus bergerak maju.',
  'Tetap tenang, atur prioritas, dan nikmati proses menyelesaikan pekerjaan terbaik Anda.',
  'Disiplin adalah jembatan antara impian dan pencapaian nyata.',
  'Beri diri Anda apresiasi atas setiap pencapaian kecil yang telah terselesaikan hari ini.'
];
