'use client';

import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Sun,
  Moon,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CatLogo } from '@/components/layout/CatLogo';

interface AuthPageProps {
  onAuthSuccess: (user: any) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onAuthSuccess,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      onAuthSuccess(data.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memproses login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
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

      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      onAuthSuccess(data.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal masuk akun demo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F4F6] dark:bg-[#111215] text-gray-900 dark:text-gray-100 flex flex-col justify-center items-center p-4 sm:p-6 relative transition-colors selection:bg-[#FF5A1F] selection:text-white">
      {/* Top Right Theme Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <button
          onClick={onToggleDarkMode}
          className="p-2.5 rounded-2xl bg-white dark:bg-[#1c1d22] border border-gray-200/80 dark:border-gray-800 text-gray-600 dark:text-gray-300 shadow-sm hover:scale-105 active:scale-95 transition"
          title={isDarkMode ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
        >
          {isDarkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
        </button>
      </div>

      <div className="w-full max-w-md my-auto space-y-6">
        {/* Brand & App Info Header (Matching Finora layout, Orange Cat Theme) */}
        <div className="text-center space-y-2">
          {/* Centered Cat Logo Badge */}
          <div className="flex justify-center mb-3">
            <CatLogo size={52} className="shadow-lg shadow-[#FF5A1F]/30" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase">
            TODOLIST APP
          </h1>

          <p className="text-[11px] sm:text-xs font-bold text-[#FF5A1F] tracking-widest uppercase">
            PERSONAL PRODUCTIVITY & TASK MANAGER
          </p>

          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
            Kelola Jadwal harian dan tugas Anda dengan cerdas.
          </p>
        </div>

        {/* Quick Demo Access Box (Matching Finora's Green Box, styled in harmonious Orange) */}
        <div className="bg-[#FFF5F0] dark:bg-[#221612] border border-[#FFDEC9] dark:border-[#52291B] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100">
              Coba Langsung Tanpa Daftar?
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Masuk instan dengan data demo Todolist App.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="px-3.5 py-2 bg-[#FF5A1F] hover:bg-[#e54c14] text-white rounded-xl text-xs font-bold shadow-sm shadow-[#FF5A1F]/25 flex items-center gap-1.5 transition active:scale-95 flex-shrink-0 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <ShieldCheck size={14} />
            )}
            <span>Masuk Demo</span>
          </button>
        </div>

        {/* Main Authentication Card */}
        <div className="bg-white dark:bg-[#1a1b20] border border-gray-200/80 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-5">
          {/* Form Header */}
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
              {mode === 'login' ? 'Masuk ke Akun Anda' : 'Buat Akun Baru'}
            </h2>

            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setErrorMessage(null);
              }}
              className="text-xs font-bold text-[#FF5A1F] hover:underline"
            >
              {mode === 'login' ? 'Daftar akun baru' : 'Sudah punya akun? Masuk'}
            </button>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 flex items-center gap-2.5 text-xs text-rose-600 dark:text-rose-400 animate-in fade-in">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field (Register mode only) */}
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Nama Lengkap <span className="text-[#FF5A1F]">*</span>
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-gray-50 dark:bg-[#121316] border border-gray-200 dark:border-gray-700/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] text-gray-900 dark:text-white placeholder:text-gray-400 transition"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Alamat Email <span className="text-[#FF5A1F]">*</span>
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-gray-50 dark:bg-[#121316] border border-gray-200 dark:border-gray-700/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] text-gray-900 dark:text-white placeholder:text-gray-400 transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Kata Sandi <span className="text-[#FF5A1F]">*</span>
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-3 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-9 pr-10 py-2.5 bg-gray-50 dark:bg-[#121316] border border-gray-200 dark:border-gray-700/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] text-gray-900 dark:text-white placeholder:text-gray-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field (Register mode only) */}
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Konfirmasi Kata Sandi <span className="text-[#FF5A1F]">*</span>
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-gray-50 dark:bg-[#121316] border border-gray-200 dark:border-gray-700/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] text-gray-900 dark:text-white placeholder:text-gray-400 transition"
                  />
                </div>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#FF5A1F] hover:bg-[#e54c14] text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-[#FF5A1F]/25 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Masuk' : 'Daftar Akun Baru'}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-[11px] text-gray-400 text-center">
          Todolist App Productivity Workspace • Aman & Terenkripsi
        </p>
      </div>
    </div>
  );
};
