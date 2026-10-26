'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, User, Eye, EyeOff, Sparkles, LogIn, UserPlus, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === 'register') {
      if (!name.trim()) {
        setErrorMessage('Nama lengkap wajib diisi.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Kata sandi minimal 6 karakter.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Konfirmasi kata sandi tidak cocok.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const body = mode === 'register' ? { name, email, password } : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat otentikasi.');
      }

      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      onAuthSuccess(data.user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memproses autentikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@todolist.app');
    setPassword('password123');
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo@todolist.app', password: 'password123' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      onAuthSuccess(data.user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal masuk akun demo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-gray-100 dark:border-gray-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-950/40 text-[#FF5A1F] dark:text-[#ff7438] rounded-xl">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                {mode === 'login' ? 'Masuk ke Akun Anda' : 'Buat Akun Baru'}
              </h3>
              <p className="text-xs text-gray-400">
                {mode === 'login'
                  ? 'Akses tugas, jurnal & foto dokumentasi Anda'
                  : 'Mulai kelola produktivitas harian dengan aman'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher: Masuk vs Daftar */}
        <div className="flex border-b border-gray-100 dark:border-gray-700 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-center border-b-2 transition flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'border-[#FF5A1F] text-[#FF5A1F] dark:text-[#ff7438] bg-orange-50/20'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <LogIn size={15} /> Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-center border-b-2 transition flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'border-[#FF5A1F] text-[#FF5A1F] dark:text-[#ff7438] bg-orange-50/20'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <UserPlus size={15} /> Buat Akun Baru
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 rounded-xl">
              {errorMessage}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Nama Lengkap *
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Anda..."
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] font-medium"
                />
              </div>
            </div>
          )}

          <div>
            <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
              Alamat Email *
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-3 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] font-medium"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
              Kata Sandi *
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-3 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter..."
                className="w-full pl-9 pr-10 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Ulangi Kata Sandi *
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-3 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang kata sandi..."
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] font-medium"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[#FF5A1F] hover:bg-[#e54c14] disabled:opacity-50 text-white rounded-xl font-bold shadow-md shadow-orange-500/20 transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                'Memproses...'
              ) : mode === 'login' ? (
                <>
                  <LogIn size={15} /> Masuk Sekarang
                </>
              ) : (
                <>
                  <UserPlus size={15} /> Daftar Akun
                </>
              )}
            </button>
          </div>

          {/* Quick Demo Login Option */}
          <div className="pt-2 text-center border-t border-gray-100 dark:border-gray-700/60">
            <p className="text-[11px] text-gray-400 mb-2">Ingin mencoba langsung tanpa mengetik?</p>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full py-2 px-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200 rounded-xl font-semibold transition text-xs flex items-center justify-center gap-1.5"
            >
              <Sparkles size={13} className="text-amber-500" /> Masuk Cepat dengan Akun Demo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
