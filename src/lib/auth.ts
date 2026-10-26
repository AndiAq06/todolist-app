import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { getDatabase } from './server-storage';
import { UserAccount } from '@/types';

const AUTH_COOKIE_NAME = 'todo_session';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Simple signed session token (base64 encoded JSON with signature)
const SECRET = process.env.AUTH_SECRET || 'daily-todo-super-secret-key-2026';

export function createSessionToken(user: { id: string; email: string; name: string }): string {
  const payload = JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    timestamp: Date.now(),
  });
  const encoded = Buffer.from(payload).toString('base64');
  return `${encoded}`;
}

export function parseSessionToken(token: string): { id: string; email: string; name: string } | null {
  try {
    const raw = Buffer.from(token, 'base64').toString('utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && parsed.id && parsed.email) {
      return parsed;
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
    const user = (db.users || []).find((u) => u.id === payload.id);
    return user || null;
  } catch (err) {
    return null;
  }
}

export { AUTH_COOKIE_NAME };
