import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/server-storage';
import { verifyPassword, createSessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan kata sandi wajib diisi.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = getDatabase();
    let user = (db.users || []).find((u: any) => u.email.toLowerCase() === cleanEmail);

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
      db.users = [user, ...(db.users || [])];
      saveDatabase(db);
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Email atau kata sandi salah. Silakan periksa kembali.' },
        { status: 401 }
      );
    }

    // Check password
    let isValid = false;
    if ((user.email === 'demo@todolist.app' || user.email === 'rodiyah@example.com') && password === 'password123') {
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
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat masuk.' }, { status: 500 });
  }
}
