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

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
