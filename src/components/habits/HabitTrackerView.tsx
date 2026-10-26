'use client';

import React, { useState } from 'react';
import { Habit } from '@/types';
import { Flame, Plus, Check, Award, TrendingUp, Trash2, Calendar, Target, Sparkles } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import confetti from 'canvas-confetti';

interface HabitTrackerViewProps {
  habits: Habit[];
  onToggleHabitDate: (habitId: string, dateStr: string, completed: boolean) => Promise<void>;
  onAddHabit: (newHabit: Partial<Habit>) => Promise<void>;
  onDeleteHabit: (habitId: string) => Promise<void>;
}

export const HabitTrackerView: React.FC<HabitTrackerViewProps> = ({
  habits,
  onToggleHabitDate,
  onAddHabit,
  onDeleteHabit,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Pribadi');
  const [targetDays, setTargetDays] = useState(7);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate last 7 days array (from 6 days ago up to today)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    return {
      date: d,
      dateStr: format(d, 'yyyy-MM-dd'),
      dayName: format(d, 'EEE', { locale: idLocale }),
      dayNumber: format(d, 'd'),
      isToday: i === 6,
    };
  });

  const handleToggle = async (habitId: string, dateStr: string, currentCompleted: boolean) => {
    if (!currentCompleted) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
    await onToggleHabitDate(habitId, dateStr, !currentCompleted);
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddHabit({
        title: title.trim(),
        description: description.trim(),
        category,
        targetDaysPerWeek: Number(targetDays) || 7,
        frequency: 'daily',
      });
      setTitle('');
      setDescription('');
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compute overall consistency
  let totalOpportunities = habits.length * 7;
  let totalCompletedLast7 = 0;
  habits.forEach((h) => {
    last7Days.forEach((d) => {
      if (h.logs && h.logs[d.dateStr]) totalCompletedLast7++;
    });
  });
  const overallConsistency = totalOpportunities > 0 ? Math.round((totalCompletedLast7 / totalOpportunities) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner & Stats */}
      <div className="bg-gradient-to-r from-[#FF5A1F] via-[#ff7438] to-[#e54c14] rounded-3xl p-6 text-white shadow-lg shadow-orange-900/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-orange-100 flex items-center gap-1.5 mb-1">
            <Flame size={16} /> Konsistensi & Habit Tracker
          </span>
          <h2 className="text-2xl font-black">Bangun Kebiasaan Positif Setiap Hari</h2>
          <p className="text-xs text-orange-100/90 max-w-lg mt-1 leading-relaxed">
            Konsistensi kecil yang dilakukan berulang kali akan menciptakan lompatan produktivitas yang luar biasa.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
          <div>
            <span className="text-[10px] text-orange-100 uppercase font-semibold block">
              Konsistensi 7 Hari
            </span>
            <span className="text-2xl font-black">{overallConsistency}%</span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-white text-[#FF5A1F] hover:bg-orange-50 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
          >
            <Plus size={16} /> Tambah Kebiasaan
          </button>
        </div>
      </div>

      {/* Habit Tracker Table / Cards */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700/60 text-xs font-bold text-gray-400">
                <th className="pb-4 pl-2 min-w-[200px]">Nama Kebiasaan</th>
                <th className="pb-4 text-center min-w-[90px]">Streak 🔥</th>
                {last7Days.map((d) => (
                  <th key={d.dateStr} className="pb-4 text-center px-1">
                    <span className="block text-[10px] uppercase font-bold text-gray-400">
                      {d.dayName}
                    </span>
                    <span
                      className={`inline-block text-xs font-black w-6 h-6 leading-6 rounded-full mt-0.5 ${
                        d.isToday ? 'bg-[#FF5A1F] text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {d.dayNumber}
                    </span>
                  </th>
                ))}
                <th className="pb-4 text-right pr-2">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
              {habits.map((habit) => {
                const logs = habit.logs || {};

                return (
                  <tr key={habit.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition">
                    {/* Habit Info */}
                    <td className="py-4 pl-2">
                      <div className="flex items-start gap-2">
                        <div>
                          <span className="text-[10px] font-semibold text-[#FF5A1F] dark:text-[#ff7438] block">
                            {habit.category}
                          </span>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            {habit.title}
                          </h4>
                          {habit.description && (
                            <p className="text-[11px] text-gray-400 max-w-xs truncate">
                              {habit.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Streak Count */}
                    <td className="py-4 text-center">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-black text-xs border border-orange-200 dark:border-orange-900">
                        <Flame size={13} /> {habit.streak || 0} hari
                      </div>
                    </td>

                    {/* 7-Day Checkboxes */}
                    {last7Days.map((d) => {
                      const isCompleted = Boolean(logs[d.dateStr]);

                      return (
                        <td key={d.dateStr} className="py-4 text-center px-1">
                          <button
                            type="button"
                            onClick={() => handleToggle(habit.id, d.dateStr, isCompleted)}
                            className={`w-9 h-9 rounded-2xl flex items-center justify-center transition mx-auto ${
                              isCompleted
                                ? 'bg-[#FF5A1F] text-white shadow-sm shadow-orange-500/30 hover:bg-[#e54c14]'
                                : 'bg-gray-100 dark:bg-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400'
                            }`}
                          >
                            {isCompleted ? <Check size={18} strokeWidth={3} /> : null}
                          </button>
                        </td>
                      );
                    })}

                    {/* Delete Action */}
                    <td className="py-4 text-right pr-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Hapus kebiasaan "${habit.title}"?`)) {
                            onDeleteHabit(habit.id);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {habits.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-400">
                    Belum ada kebiasaan yang dibuat. Klik tombol &quot;Tambah Kebiasaan&quot; untuk memulai!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Habit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-100 dark:border-gray-700">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4">
              Tambah Kebiasaan Baru
            </h3>

            <form onSubmit={handleCreateHabit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Nama Kebiasaan *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="misal: Belajar Bahasa Inggris 30 Menit..."
                  className="w-full text-xs p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5A1F]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Keterangan / Target
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="misal: Baca 15 halaman buku non-fiksi..."
                  className="w-full text-xs p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5A1F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5A1F]"
                  >
                    <option value="Belajar">Belajar</option>
                    <option value="Kesehatan">Kesehatan</option>
                    <option value="Pribadi">Pribadi</option>
                    <option value="Pekerjaan">Pekerjaan</option>
                    <option value="Proyek">Proyek</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Target Hari / Minggu
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={targetDays}
                    onChange={(e) => setTargetDays(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5A1F]"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#FF5A1F] hover:bg-[#e54c14] text-white rounded-xl font-bold shadow-md shadow-orange-500/20"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Kebiasaan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
