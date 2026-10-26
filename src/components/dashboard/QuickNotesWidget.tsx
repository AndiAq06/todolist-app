'use client';

import React, { useState, useEffect, useRef } from 'react';
import { StickyNote, Check, Loader2 } from 'lucide-react';

interface QuickNotesWidgetProps {
  initialNotes?: string;
  onSaveNotes?: (notes: string) => Promise<void>;
}

export const QuickNotesWidget: React.FC<QuickNotesWidgetProps> = ({
  initialNotes = '',
  onSaveNotes,
}) => {
  const [notes, setNotes] = useState(initialNotes);
  const [isSaving, setIsSaving] = useState(false);
  const [savedStatus, setSavedStatus] = useState<string>('Tersimpan');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    setSavedStatus('Mengetik...');

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      setIsSaving(true);
      setSavedStatus('Menyimpan...');
      try {
        if (onSaveNotes) {
          await onSaveNotes(val);
        } else {
          // Fallback to API directly
          await fetch('/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quickNotes: val }),
          });
        }
        setSavedStatus('Tersimpan');
      } catch (err) {
        setSavedStatus('Gagal menyimpan');
      } finally {
        setIsSaving(false);
      }
    }, 800);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700/60 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
            <StickyNote size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Catatan Singkat (Quick Notes)
            </h3>
            <p className="text-xs text-gray-400">Autosave otomatis saat mengetik</p>
          </div>
        </div>

        <span className="text-[11px] flex items-center gap-1 font-medium text-gray-400">
          {isSaving ? (
            <>
              <Loader2 size={11} className="animate-spin text-[#FF5A1F]" /> Menyimpan...
            </>
          ) : (
            <>
              <Check size={11} className="text-[#FF5A1F]" /> {savedStatus}
            </>
          )}
        </span>
      </div>

      <textarea
        value={notes}
        onChange={handleChange}
        placeholder="Tulis ide cepat, nomor penting, atau rencana mendadak di sini..."
        className="w-full flex-1 min-h-[110px] p-3 text-xs leading-relaxed bg-amber-50/30 dark:bg-gray-900/40 rounded-2xl border border-amber-100/70 dark:border-gray-700/50 focus:outline-none focus:ring-1 focus:ring-amber-400 text-gray-700 dark:text-gray-300 resize-none"
      />
    </div>
  );
};
