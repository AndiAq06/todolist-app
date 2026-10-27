import { NextRequest, NextResponse } from 'next/server';
import { getSyncedDatabase, saveAndSyncDatabase, logActivity } from '@/lib/server-storage';
import { Habit } from '@/types';


function calculateStreak(logs: Record<string, boolean>): { streak: number; bestStreak: number } {
  const dates = Object.keys(logs).sort().reverse();
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Current streak check
  let checkDate = new Date();
  // If today is logged, count starting from today. If not yet logged today, start checking from yesterday.
  if (logs[today]) {
    while (true) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (logs[dStr]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  } else if (logs[yesterday]) {
    checkDate.setDate(checkDate.getDate() - 1);
    while (true) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (logs[dStr]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Best streak across entire history
  const sortedAsc = Object.keys(logs).sort();
  for (let i = 0; i < sortedAsc.length; i++) {
    if (logs[sortedAsc[i]]) {
      tempStreak++;
      if (tempStreak > bestStreak) bestStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  }

  return {
    streak: currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak),
  };
}

export async function GET() {
  try {
    const db = await getSyncedDatabase();
    return NextResponse.json({ success: true, habits: db.habits || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memuat kebiasaan' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: 'Nama kebiasaan wajib diisi' }, { status: 400 });
    }

    const db = await getSyncedDatabase();

    const newHabit: Habit = {
      id: `habit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: body.title.trim(),
      description: body.description?.trim() || '',
      category: body.category || 'Pribadi',
      targetDaysPerWeek: Number(body.targetDaysPerWeek) || 7,
      frequency: body.frequency || 'daily',
      createdAt: new Date().toISOString(),
      logs: {},
      streak: 0,
      bestStreak: 0,
    };

    db.habits = [...(db.habits || []), newHabit];
    await saveAndSyncDatabase(db);

    logActivity('create', 'habit', `Membuat kebiasaan baru: ${newHabit.title}`);

    return NextResponse.json({ success: true, habit: newHabit });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat kebiasaan baru' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, date, completed } = await req.json();
    const db = await getSyncedDatabase();
    const habit = (db.habits || []).find(h => h.id === id);

    if (!habit) {
      return NextResponse.json({ error: 'Kebiasaan tidak ditemukan' }, { status: 404 });
    }

    if (!habit.logs) habit.logs = {};

    if (completed) {
      habit.logs[date] = true;
    } else {
      delete habit.logs[date];
    }

    const { streak, bestStreak } = calculateStreak(habit.logs);
    habit.streak = streak;
    habit.bestStreak = Math.max(habit.bestStreak || 0, bestStreak);

    await saveAndSyncDatabase(db);

    if (completed) {
      logActivity('habit_done', 'habit', `Menyelesaikan kebiasaan: ${habit.title} (${habit.streak} hari streak! 🔥)`);
    }

    return NextResponse.json({ success: true, habit });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memperbarui kebiasaan' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID kebiasaan wajib diisi' }, { status: 400 });
    }

    const db = await getSyncedDatabase();
    const habit = db.habits.find(h => h.id === id);
    db.habits = (db.habits || []).filter(h => h.id !== id);
    await saveAndSyncDatabase(db);

    if (habit) {
      logActivity('delete', 'habit', `Menghapus kebiasaan: ${habit.title}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus kebiasaan' }, { status: 500 });
  }
}
