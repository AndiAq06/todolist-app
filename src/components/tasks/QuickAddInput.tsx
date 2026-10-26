'use client';

import React, { useState, useMemo } from 'react';
import { parseNaturalTaskInput } from '@/lib/nlp-parser';
import { Plus, Sparkles, Calendar, Clock, AlertTriangle, ArrowRight, Check } from 'lucide-react';
import { TaskPriority } from '@/types';

interface QuickAddInputProps {
  onAddTask: (taskData: {
    title: string;
    dueDate: string;
    startTime?: string;
    priority: TaskPriority;
    category?: string;
  }) => Promise<void>;
}

export const QuickAddInput: React.FC<QuickAddInputProps> = ({ onAddTask }) => {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const parsed = useMemo(() => {
    if (!text.trim()) return null;
    return parseNaturalTaskInput(text);
  }, [text]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsed || !parsed.title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddTask({
        title: parsed.title,
        dueDate: parsed.dueDate,
        startTime: parsed.startTime,
        priority: parsed.priority,
        category: parsed.category || 'Pekerjaan',
      });
      setText('');
      setIsFocused(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'urgent':
        return <span className="bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold px-2 py-0.5 rounded-md">Urgent</span>;
      case 'high':
        return <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-semibold px-2 py-0.5 rounded-md">Tinggi</span>;
      case 'low':
        return <span className="bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold px-2 py-0.5 rounded-md">Rendah</span>;
      default:
        return <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold px-2 py-0.5 rounded-md">Normal</span>;
    }
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className={`relative bg-white dark:bg-gray-800 rounded-2xl border transition-all shadow-sm ${
          isFocused
            ? 'border-[#FF5A1F] ring-2 ring-[#FF5A1F]/10 shadow-md'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
      >
        <div className="flex items-center px-4 py-3 gap-3">
          <div className="text-[#FF5A1F] dark:text-[#ff7438] flex-shrink-0">
            <Sparkles size={20} />
          </div>

          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Ketik cepat: 'Belajar bahasa Inggris besok jam 19.00 prioritas tinggi'..."
            className="w-full text-sm bg-transparent focus:outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400"
          />

          <button
            type="submit"
            disabled={!text.trim() || isSubmitting}
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF5A1F] hover:bg-[#e54c14] disabled:opacity-40 disabled:hover:bg-[#FF5A1F] text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            {isSubmitting ? (
              'Menyimpan...'
            ) : (
              <>
                <Plus size={16} />
                <span>Tambah Cepat</span>
              </>
            )}
          </button>
        </div>

        {/* Live Natural Language Preview Pill Bar */}
        {parsed && text.trim().length > 3 && (
          <div className="px-4 py-2.5 bg-gray-50/80 dark:bg-gray-900/60 border-t border-gray-100 dark:border-gray-700/60 rounded-b-2xl flex flex-wrap items-center gap-2 text-xs animate-in fade-in">
            <span className="text-gray-400 font-medium">Terdeteksi:</span>

            <span className="font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700">
              Judul: &ldquo;{parsed.title}&rdquo;
            </span>

            <span className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
              <Calendar size={13} className="text-[#FF5A1F]" />
              {parsed.dueDate}
            </span>

            {parsed.startTime && (
              <span className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                <Clock size={13} className="text-blue-500" />
                {parsed.startTime}
              </span>
            )}

            {parsed.category && (
              <span className="bg-orange-50 dark:bg-orange-950/40 text-[#FF5A1F] dark:text-[#ff7438] font-medium px-2 py-0.5 rounded-md">
                Kategori: {parsed.category}
              </span>
            )}

            <div className="flex items-center gap-1">
              <span className="text-gray-400">Prioritas:</span>
              {getPriorityBadge(parsed.priority)}
            </div>

            <span className="ml-auto text-[11px] text-gray-400 italic">
              Tekan Enter ↵ untuk simpan
            </span>
          </div>
        )}
      </form>
    </div>
  );
};
