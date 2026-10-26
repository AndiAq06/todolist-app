import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/server-storage';
import { verifyPassword, createSessionToken, AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password, cachedAccount } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan kata sandi wajib diisi.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = getDatabase();
    if (!db.users) db.users = [];

    let user = db.users.find((u: any) => u.email.toLowerCase() === cleanEmail);

    // Auto-seed Todolist App demo user if requested
    if (!user && (cleanEmail === 'demo@todolist.app' || cleanEmail === 'rodiyah@example.com')) {
      user = {
        id: 'user-demo-todolist',
        name: 'Todolist App',
        email: cleanEmail,
        passwordHash: '$2a$10$wK1m.zHkW7T3g.q6J5v9O.F6o9215kY9g4u17b8j1M7C/m9e1YwCe',
        title: 'Task & Productivity Manager',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        dailyGoal: 5,
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
      saveDatabase(db);
    }

    // Auto-seed user account for ardiansyahnasir56@gmail.com with password opklnm123
    if (!user && cleanEmail === 'ardiansyahnasir56@gmail.com') {
      user = {
        id: 'user-ardiansyah-nasir',
        name: 'Ardiansyah Nasir',
        email: 'ardiansyahnasir56@gmail.com',
        passwordHash: '$2b$10$dEB7Y0MyGETpp6XqIGRsl.v1GqAJXSPaq/oqN1zHbt74qfd2EIm9.',
        title: 'Productivity Specialist',
        avatarUrl: '',
        dailyGoal: 5,
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
      saveDatabase(db);
    }

    // SELF-HEALING: If account is missing from /tmp due to Vercel restart,
    // verify against client cachedAccount vault and restore immediately
    if (!user && cachedAccount && cachedAccount.email && cachedAccount.email.toLowerCase() === cleanEmail && cachedAccount.passwordHash) {
      const isMatch = await verifyPassword(password, cachedAccount.passwordHash);
      if (isMatch) {
        user = {
          id: cachedAccount.id || `user-${Date.now()}`,
          name: cachedAccount.name || 'Pengguna',
          email: cleanEmail,
          passwordHash: cachedAccount.passwordHash,
          title: cachedAccount.title || 'Anggota Produktif',
          avatarUrl: cachedAccount.avatarUrl || '',
          dailyGoal: cachedAccount.dailyGoal || 5,
          createdAt: cachedAccount.createdAt || new Date().toISOString(),
        };
        db.users.push(user);
        saveDatabase(db);
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Email atau kata sandi salah. Silakan periksa kembali.' },
        { status: 401 }
      );
    }

    // Check password
    let isValid = false;
    if (
      ((user.email === 'demo@todolist.app' || user.email === 'rodiyah@example.com') && password === 'password123') ||
      (user.email === 'ardiansyahnasir56@gmail.com' && password === 'opklnm123')
    ) {
      isValid = true;
    } else {
      isValid = await verifyPassword(password, user.passwordHash);
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Email atau kata sandi salah. Silakan periksa kembali.' },
        { status: 401 }
      );
    }

    const token = createSessionToken(user);

    const response = NextResponse.json({
      success: true,
      message: 'Berhasil masuk!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        title: user.title,
        avatarUrl: user.avatarUrl,
        dailyGoal: user.dailyGoal || 5,
        passwordHash: user.passwordHash, // for client vault caching
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      ...AUTH_COOKIE_OPTIONS,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat masuk.' }, { status: 500 });
  }
}
