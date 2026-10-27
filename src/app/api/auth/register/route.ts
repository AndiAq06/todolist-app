import { NextRequest, NextResponse } from 'next/server';
import { getSyncedDatabase, saveAndSyncDatabase, logActivity } from '@/lib/server-storage';
import { hashPassword, createSessionToken, AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from '@/lib/auth';
import { UserAccount } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nama lengkap wajib diisi.' }, { status: 400 });
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Alamat email tidak valid.' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Kata sandi minimal 6 karakter.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = await getSyncedDatabase();
    if (!db.users) db.users = [];

    const existingUser = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email ini sudah terdaftar. Silakan login atau gunakan email lain.' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const newUser: UserAccount = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      title: 'Anggota Produktif',
      avatarUrl: '',
      dailyGoal: 5,
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    await saveAndSyncDatabase(db);

    logActivity('create', 'task', `Pengguna baru terdaftar: ${newUser.name} (${newUser.email})`);

    const token = createSessionToken(newUser);

    const response = NextResponse.json({
      success: true,
      message: 'Akun berhasil dibuat!',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        title: newUser.title,
        avatarUrl: newUser.avatarUrl,
        dailyGoal: newUser.dailyGoal,
        passwordHash: newUser.passwordHash,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      ...AUTH_COOKIE_OPTIONS,
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Gagal membuat akun baru. Silakan coba lagi.' }, { status: 500 });
  }
}
