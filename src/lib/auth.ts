import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { getDatabase, saveDatabase } from './server-storage';
import { UserAccount } from '@/types';

const AUTH_COOKIE_NAME = 'todo_session';
const SECRET = process.env.AUTH_SECRET || 'daily-todo-super-secret-key-2026-permanent-auth';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function sign(payloadStr: string): string {
  return crypto.createHmac('sha256', SECRET).update(payloadStr).digest('hex');
}

export function createSessionToken(user: {
  id: string;
  email: string;
  name: string;
  passwordHash?: string;
  title?: string;
  avatarUrl?: string;
  dailyGoal?: number;
  createdAt?: string;
}): string {
  const payload = JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    passwordHash: user.passwordHash || '',
    title: user.title || 'Anggota Produktif',
    avatarUrl: user.avatarUrl || '',
    dailyGoal: user.dailyGoal || 5,
    createdAt: user.createdAt || new Date().toISOString(),
    timestamp: Date.now(),
    exp: Date.now() + 365 * 24 * 60 * 60 * 1000, // 365 days
  });
  const encoded = Buffer.from(payload, 'utf-8').toString('base64url');
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function parseSessionToken(token: string): (UserAccount & { exp?: number }) | null {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length === 2) {
      const [encoded, signature] = parts;
      const expectedSig = sign(encoded);
      if (signature !== expectedSig) {
        return null;
      }
      const raw = Buffer.from(encoded, 'base64url').toString('utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id && parsed.email) {
        if (parsed.exp && Date.now() > parsed.exp) {
          return null;
        }
        return parsed;
      }
    } else {
      // Legacy fallback for plain base64 token
      const raw = Buffer.from(token, 'base64').toString('utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id && parsed.email) {
        return parsed;
      }
    }
    return null;
  } catch (err) {
    return null;
  }
}

export function getSessionUser(req: NextRequest): UserAccount | null {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = parseSessionToken(token);
    if (!payload) return null;

    const db = getDatabase();
    if (!db.users) db.users = [];

    let user = db.users.find(
      (u) => u.id === payload.id || u.email.toLowerCase() === payload.email.toLowerCase()
    );

    // SELF-HEALING RESTORATION:
    // If the serverless container was recycled (e.g. Vercel idle cold start),
    // restore the user into db.users immediately so all server routes recognize the user.
    if (!user) {
      user = {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        passwordHash: payload.passwordHash || '',
        title: payload.title || 'Anggota Produktif',
        avatarUrl: payload.avatarUrl || '',
        dailyGoal: payload.dailyGoal || 5,
        createdAt: payload.createdAt || new Date().toISOString(),
      };
      db.users.push(user);
      saveDatabase(db);
    }

    return user;
  } catch (err) {
    return null;
  }
}

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 365 * 24 * 60 * 60, // 365 days (1 year)
};

export { AUTH_COOKIE_NAME };
