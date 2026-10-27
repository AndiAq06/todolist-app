import { NextRequest, NextResponse } from 'next/server';
import { getSyncedDatabase, saveAndSyncDatabase } from '@/lib/server-storage';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const db = await getSyncedDatabase();
    const sessionUser = getSessionUser(req);

    const profile = sessionUser
      ? {
          name: sessionUser.name,
          email: sessionUser.email,
          title: sessionUser.title || 'Pengguna Produktif',
          avatarUrl: sessionUser.avatarUrl,
          dailyGoal: sessionUser.dailyGoal || 5,
          weekStartsOn: db.profile?.weekStartsOn || 1,
          theme: db.profile?.theme || 'light',
        }
      : db.profile;

    return NextResponse.json({
      success: true,
      profile,
      quickNotes: db.quickNotes || '',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil profil' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const db = await getSyncedDatabase();
    const sessionUser = getSessionUser(req);

    if (body.profile) {
      db.profile = { ...db.profile, ...body.profile };

      if (sessionUser && db.users) {
        const uIdx = db.users.findIndex((u) => u.id === sessionUser.id);
        if (uIdx >= 0) {
          db.users[uIdx] = {
            ...db.users[uIdx],
            name: body.profile.name || db.users[uIdx].name,
            title: body.profile.title !== undefined ? body.profile.title : db.users[uIdx].title,
            dailyGoal: body.profile.dailyGoal || db.users[uIdx].dailyGoal,
          };
        }
      }
    }
    if (body.quickNotes !== undefined) {
      db.quickNotes = body.quickNotes;
    }

    let returnProfile = db.profile;
    if (sessionUser && db.users) {
      const updatedUser = db.users.find((u) => u.id === sessionUser.id);
      if (updatedUser) {
        returnProfile = {
          name: updatedUser.name,
          email: updatedUser.email,
          title: updatedUser.title || 'Anggota Produktif',
          avatarUrl: updatedUser.avatarUrl,
          dailyGoal: updatedUser.dailyGoal || 5,
          weekStartsOn: db.profile?.weekStartsOn || 1,
          theme: db.profile?.theme || 'light',
        };
      }
    }

    await saveAndSyncDatabase(db);
    return NextResponse.json({ success: true, profile: returnProfile, quickNotes: db.quickNotes });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memperbarui data profil' }, { status: 500 });
  }
}

