import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDatabase, saveDatabase, logActivity } from '@/lib/server-storage';
import { DEFAULT_PROFILE } from '@/lib/constants';

export async function GET(req: NextRequest) {
  try {
    const user = getSessionUser(req);
    const db = getDatabase();

    const activeTasks = (db.tasks || []).filter((t) => !t.isDeleted && !t.isArchived);

    return NextResponse.json({
      success: true,
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            title: user.title,
            avatarUrl: user.avatarUrl,
            dailyGoal: user.dailyGoal || 5,
          }
        : null,
      profile: db.profile || DEFAULT_PROFILE,
      tasks: activeTasks,
      allTasks: db.tasks || [],
      habits: db.habits || [],
      journals: db.journals || [],
      categories: db.categories || [],
      quickNotes: db.quickNotes || '',
      monthGoals: db.monthGoals || [],
      weekGoals: db.weekGoals || [],
      reminders: db.reminders || [],
      activities: db.activities || [],
    });
  } catch (error: any) {
    console.error('Bootstrap API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to bootstrap data' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;
    const db = getDatabase();

    if (action === 'addGoal') {
      const { title, type } = payload;
      if (!title || !title.trim()) {
        return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
      }
      const newGoal = {
        id: `${type === 'month' ? 'mg' : 'wg'}-${Date.now()}`,
        title: title.trim(),
        completed: false,
        type: type as 'month' | 'week',
      };
      if (type === 'month') {
        db.monthGoals = [...(db.monthGoals || []), newGoal];
      } else {
        db.weekGoals = [...(db.weekGoals || []), newGoal];
      }
      saveDatabase(db);
      return NextResponse.json({ success: true, newGoal, monthGoals: db.monthGoals, weekGoals: db.weekGoals });
    }

    if (action === 'deleteGoal') {
      const { id, type } = payload;
      if (type === 'month' && db.monthGoals) {
        db.monthGoals = db.monthGoals.filter((g) => g.id !== id);
      } else if (type === 'week' && db.weekGoals) {
        db.weekGoals = db.weekGoals.filter((g) => g.id !== id);
      }
      saveDatabase(db);
      return NextResponse.json({ success: true, monthGoals: db.monthGoals, weekGoals: db.weekGoals });
    }

    if (action === 'addReminder') {
      const { title, time } = payload;
      if (!title || !title.trim()) {
        return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
      }
      const newReminder = {
        id: `rem-${Date.now()}`,
        title: title.trim(),
        time: time && time.trim() ? time.trim() : '12:00',
        active: true,
      };
      db.reminders = [...(db.reminders || []), newReminder];
      saveDatabase(db);
      return NextResponse.json({ success: true, newReminder, reminders: db.reminders });
    }

    if (action === 'deleteReminder') {
      const { id } = payload;
      if (db.reminders) {
        db.reminders = db.reminders.filter((r) => r.id !== id);
      }
      saveDatabase(db);
      return NextResponse.json({ success: true, reminders: db.reminders });
    }

    if (action === 'toggleGoal') {
      const { id, type } = payload;
      if (type === 'month' && db.monthGoals) {
        db.monthGoals = db.monthGoals.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g));
      } else if (type === 'week' && db.weekGoals) {
        db.weekGoals = db.weekGoals.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g));
      }
      saveDatabase(db);
      return NextResponse.json({ success: true, monthGoals: db.monthGoals, weekGoals: db.weekGoals });
    }

    if (action === 'toggleReminder') {
      const { id } = payload;
      if (db.reminders) {
        db.reminders = db.reminders.map((r) => (r.id === id ? { ...r, active: !r.active } : r));
      }
      saveDatabase(db);
      return NextResponse.json({ success: true, reminders: db.reminders });
    }

    if (action === 'syncLocalBackup') {
      const { backupData } = payload;
      if (backupData) {
        let changed = false;
        if (Array.isArray(backupData.tasks) && backupData.tasks.length > 0 && (!db.tasks || db.tasks.length === 0)) {
          db.tasks = backupData.tasks;
          changed = true;
        }
        if (Array.isArray(backupData.habits) && backupData.habits.length > 0 && (!db.habits || db.habits.length === 0)) {
          db.habits = backupData.habits;
          changed = true;
        }
        if (Array.isArray(backupData.journals) && backupData.journals.length > 0 && (!db.journals || db.journals.length === 0)) {
          db.journals = backupData.journals;
          changed = true;
        }
        if (Array.isArray(backupData.monthGoals) && backupData.monthGoals.length > 0 && (!db.monthGoals || db.monthGoals.length === 0)) {
          db.monthGoals = backupData.monthGoals;
          changed = true;
        }
        if (Array.isArray(backupData.weekGoals) && backupData.weekGoals.length > 0 && (!db.weekGoals || db.weekGoals.length === 0)) {
          db.weekGoals = backupData.weekGoals;
          changed = true;
        }
        if (Array.isArray(backupData.reminders) && backupData.reminders.length > 0 && (!db.reminders || db.reminders.length === 0)) {
          db.reminders = backupData.reminders;
          changed = true;
        }
        if (backupData.quickNotes && !db.quickNotes) {
          db.quickNotes = backupData.quickNotes;
          changed = true;
        }
        if (changed) {
          saveDatabase(db);
        }
        return NextResponse.json({
          success: true,
          tasks: (db.tasks || []).filter((t) => !t.isDeleted && !t.isArchived),
          habits: db.habits || [],
          journals: db.journals || [],
          monthGoals: db.monthGoals || [],
          weekGoals: db.weekGoals || [],
          reminders: db.reminders || [],
          quickNotes: db.quickNotes || '',
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
