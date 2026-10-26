'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Plus, Bell, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

type PomodoroMode = 'pomodoro' | 'short_break' | 'long_break';

const MODE_DURATIONS: Record<PomodoroMode, number> = {
  pomodoro: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};

export const PomodoroWidget: React.FC = () => {
  const [mode, setMode] = useState<PomodoroMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(MODE_DURATIONS['pomodoro']);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
      });
      if (mode === 'pomodoro') {
        setSessionsCompleted((prev) => prev + 1);
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode]);

  const switchMode = (newMode: PomodoroMode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(MODE_DURATIONS[newMode]);
  };

  const toggleRun = () => {
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(MODE_DURATIONS[mode]);
  };

  const addTime = (seconds: number) => {
    setTimeLeft((prev) => prev + seconds);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl p-5 text-white shadow-lg shadow-orange-500/20 relative overflow-hidden flex flex-col justify-between">
      {/* Decorative Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-orange-100 flex items-center gap-1">
            <Sparkles size={12} /> Pomodoro Timer
          </span>
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => switchMode('pomodoro')}
              className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold transition ${
                mode === 'pomodoro' ? 'bg-white text-orange-600' : 'bg-black/20 text-orange-100 hover:bg-black/30'
              }`}
            >
              Fokus (25m)
            </button>
            <button
              onClick={() => switchMode('short_break')}
              className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold transition ${
                mode === 'short_break' ? 'bg-white text-orange-600' : 'bg-black/20 text-orange-100 hover:bg-black/30'
              }`}
            >
              Rehat (5m)
            </button>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-md font-semibold text-white">
            {sessionsCompleted} Sesi Selesai
          </span>
        </div>
      </div>

      {/* Timer & Controls Display */}
      <div className="flex items-center justify-between my-3 z-10">
        <div className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-sm font-mono">
          {formattedTime}
        </div>

        <div className="flex items-center gap-2">
          {/* Add 5 min */}
          <button
            onClick={() => addTime(300)}
            title="Tambah 5 Menit"
            className="p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-2xl transition"
          >
            <Plus size={16} />
          </button>

          {/* Reset */}
          <button
            onClick={resetTimer}
            title="Ulangi Timer"
            className="p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-2xl transition"
          >
            <RotateCcw size={16} />
          </button>

          {/* Play/Pause Button (Prominent) */}
          <button
            onClick={toggleRun}
            title={isRunning ? 'Jeda' : 'Mulai'}
            className="p-3 bg-white text-orange-600 hover:bg-orange-50 rounded-2xl shadow-md transition transform active:scale-95"
          >
            {isRunning ? <Pause size={22} className="fill-current" /> : <Play size={22} className="fill-current ml-0.5" />}
          </button>
        </div>
      </div>

      <div className="text-[11px] text-orange-100 z-10 flex items-center justify-between">
        <span>Teknik 25 menit fokus penuh, 5 menit istirahat</span>
        {isRunning && <span className="animate-pulse font-medium">● Berjalan</span>}
      </div>
    </div>
  );
};
