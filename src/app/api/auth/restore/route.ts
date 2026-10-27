import { NextRequest, NextResponse } from 'next/server';
import { getSyncedDatabase, saveAndSyncDatabase } from '@/lib/server-storage';
import { createSessionToken, AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS, getSessionUser } from '@/lib/auth';
import { UserAccount } from '@/types';

export async function POST(req: NextRequest) {
  try {
    // If user already has an active valid session, just return current user
    const existingUser = getSessionUser(req);
    if (existingUser) {
      return NextResponse.json({
        success: true,
        user: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          title: existingUser.title,
          avatarUrl: existingUser.avatarUrl,
          dailyGoal: existingUser.dailyGoal || 5,
        },
      });
    }

    const body = await req.json();
    const { cachedAccount } = body;

    if (!cachedAccount || !cachedAccount.email || !cachedAccount.id) {
      return NextResponse.json({ success: false, error: 'No cached account provided' }, { status: 400 });
    }

    const cleanEmail = cachedAccount.email.trim().toLowerCase();
    const db = await getSyncedDatabase();
    if (!db.users) db.users = [];

    let user = db.users.find((u) => u.email.toLowerCase() === cleanEmail || u.id === cachedAccount.id);

    if (!user) {
      user = {
        id: cachedAccount.id,
        name: cachedAccount.name || 'Pengguna',
        email: cleanEmail,
        passwordHash: cachedAccount.passwordHash || '',
        title: cachedAccount.title || 'Anggota Produktif',
        avatarUrl: cachedAccount.avatarUrl || '',
        dailyGoal: cachedAccount.dailyGoal || 5,
        createdAt: cachedAccount.createdAt || new Date().toISOString(),
      };
      db.users.push(user);
      await saveAndSyncDatabase(db);
    }

    const token = createSessionToken(user);

    const response = NextResponse.json({
      success: true,
      message: 'Sesi akun berhasil dipulihkan secara otomatis.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        title: user.title,
        avatarUrl: user.avatarUrl,
        dailyGoal: user.dailyGoal || 5,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      ...AUTH_COOKIE_OPTIONS,
    });

    return response;
  } catch (error) {
    console.error('Session restore error:', error);
    return NextResponse.json({ success: false, error: 'Restore failed' }, { status: 500 });
  }
}
