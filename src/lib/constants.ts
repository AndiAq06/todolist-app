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

export const DEFAULT_MONTH_GOALS: GoalItem[] = [
  { id: 'mg-1', title: 'Read 2 books', completed: true, type: 'month' },
  { id: 'mg-2', title: 'Complete UX course', completed: true, type: 'month' },
  { id: 'mg-3', title: 'Eat twice daily', completed: false, type: 'month' },
  { id: 'mg-4', title: 'Prepare for exams', completed: false, type: 'month' },
  { id: 'mg-5', title: 'Make 12,000', completed: false, type: 'month' },
];

export const DEFAULT_WEEK_GOALS: GoalItem[] = [
  { id: 'wg-1', title: 'Finish little women', completed: false, type: 'week' },
  { id: 'wg-2', title: 'Complete week 2 of UX course', completed: false, type: 'week' },
  { id: 'wg-3', title: 'Eat twice daily', completed: false, type: 'week' },
  { id: 'wg-4', title: 'Prepare for exams', completed: false, type: 'week' },
];

export const DEFAULT_REMINDERS: ReminderItem[] = [
  { id: 'rem-1', title: 'Complete 303 project', time: '12pm', active: true },
  { id: 'rem-2', title: 'Work on UX Challenge', time: '2pm', active: false },
  { id: 'rem-3', title: 'Call mom', time: '6pm', active: false },
];

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
