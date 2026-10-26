'use client';

const ACCOUNTS_VAULT_KEY = 'todolist_accounts_vault';
const LAST_ACCOUNT_KEY = 'todolist_last_account';
const DATA_BACKUP_KEY_PREFIX = 'todolist_data_backup_';

export interface VaultAccount {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  title?: string;
  avatarUrl?: string;
  dailyGoal?: number;
  createdAt?: string;
  savedAt?: number;
}

export function saveVaultAccount(account: Partial<VaultAccount> & { email: string; name: string }) {
  if (typeof window === 'undefined') return;
  try {
    const cleanEmail = account.email.trim().toLowerCase();
    const raw = localStorage.getItem(ACCOUNTS_VAULT_KEY);
    const vault: Record<string, VaultAccount> = raw ? JSON.parse(raw) : {};

    const existing = vault[cleanEmail] || {};
    const updated: VaultAccount = {
      ...existing,
      ...account,
      email: cleanEmail,
      savedAt: Date.now(),
    };

    vault[cleanEmail] = updated;
    localStorage.setItem(ACCOUNTS_VAULT_KEY, JSON.stringify(vault));
    localStorage.setItem(LAST_ACCOUNT_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save vault account to localStorage:', err);
  }
}

export function getVaultAccount(email: string): VaultAccount | null {
  if (typeof window === 'undefined') return null;
  try {
    const cleanEmail = email.trim().toLowerCase();
    const raw = localStorage.getItem(ACCOUNTS_VAULT_KEY);
    if (!raw) return null;
    const vault: Record<string, VaultAccount> = JSON.parse(raw);
    return vault[cleanEmail] || null;
  } catch {
    return null;
  }
}

export function getLastVaultAccount(): VaultAccount | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LAST_ACCOUNT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearLastVaultAccount() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LAST_ACCOUNT_KEY);
  } catch {}
}

export function saveLocalDataBackup(userKey: string, data: any) {
  if (typeof window === 'undefined' || !userKey) return;
  try {
    const storageKey = `${DATA_BACKUP_KEY_PREFIX}${userKey.toLowerCase()}`;
    const payload = {
      timestamp: Date.now(),
      data: {
        tasks: data.tasks || [],
        habits: data.habits || [],
        journals: data.journals || [],
        monthGoals: data.monthGoals || [],
        weekGoals: data.weekGoals || [],
        reminders: data.reminders || [],
        quickNotes: data.quickNotes || '',
      },
    };
    localStorage.setItem(storageKey, JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to save local data backup:', err);
  }
}

export function getLocalDataBackup(userKey: string): any | null {
  if (typeof window === 'undefined' || !userKey) return null;
  try {
    const storageKey = `${DATA_BACKUP_KEY_PREFIX}${userKey.toLowerCase()}`;
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.data || null;
  } catch {
    return null;
  }
}
