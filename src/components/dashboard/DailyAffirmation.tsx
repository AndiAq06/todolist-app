'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Smile, Meh, Frown, Coffee, Zap } from 'lucide-react';
import { DAILY_AFFIRMATIONS } from '@/lib/constants';
import { MoodType } from '@/types';

interface DailyAffirmationProps {
  currentMood?: MoodType;
  onSelectMood?: (mood: MoodType) => void;
}

export const DailyAffirmation: React.FC<DailyAffirmationProps> = ({
  currentMood = 'good',
  onSelectMood,
}) => {
  const [selectedMood, setSelectedMood] = useState<MoodType>(currentMood);
  const [quote, setQuote] = useState(DAILY_AFFIRMATIONS[0]);

  useEffect(() => {
    const dayIndex = new Date().getDate() % DAILY_AFFIRMATIONS.length;
    setQuote(DAILY_AFFIRMATIONS[dayIndex]);
  }, []);

  const handleMood = (m: MoodType) => {
    setSelectedMood(m);
    if (onSelectMood) onSelectMood(m);
  };

  const moods: { type: MoodType; label: string; icon: React.ReactNode; color: string }[] = [
    { type: 'great', label: 'Semangat', icon: <Zap size={15} />, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' },
    { type: 'good', label: 'Senang', icon: <Smile size={15} />, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
    { type: 'neutral', label: 'Biasa', icon: <Meh size={15} />, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40' },
    { type: 'tired', label: 'Lelah', icon: <Coffee size={15} />, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40' },
    { type: 'stressed', label: 'Stres', icon: <Frown size={15} />, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700/60 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#FF5A1F] dark:text-[#ff7438] flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles size={14} /> Afirmasi Hari Ini
          </span>
          <span className="text-[11px] text-gray-400 font-medium">Refleksi Pribadi</span>
        </div>

        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 italic leading-relaxed my-2">
          &ldquo;{quote}&rdquo;
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Kondisi / Mood:
          </span>
          <div className="flex items-center gap-1.5">
            {moods.map((m) => {
              const active = selectedMood === m.type;
              return (
                <button
                  key={m.type}
                  type="button"
                  onClick={() => handleMood(m.type)}
                  title={m.label}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium transition ${
                    active
                      ? `${m.color} ring-1 ring-current font-bold`
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {m.icon}
                  <span className="hidden sm:inline text-[11px]">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
