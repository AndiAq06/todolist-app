'use client';

import React, { useState } from 'react';
import { DailyJournal, MoodType, Attachment } from '@/types';
import { PhotoUploadZone } from '../attachments/PhotoUploadZone';
import {
  BookOpen,
  Calendar,
  Sparkles,
  Zap,
  Smile,
  Meh,
  Coffee,
  Frown,
  Plus,
  Trash2,
  Camera,
  Search,
  Check,
  Loader2,
  Tag,
} from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface DailyJournalViewProps {
  journals: DailyJournal[];
  onSaveJournal: (journalData: Partial<DailyJournal>) => Promise<void>;
  onDeleteJournal: (journalId: string) => Promise<void>;
  onOpenPhotoLightbox: (photos: Attachment[], index: number) => void;
}

export const DailyJournalView: React.FC<DailyJournalViewProps> = ({
  journals,
  onSaveJournal,
  onDeleteJournal,
  onOpenPhotoLightbox,
}) => {
  const [selectedJournal, setSelectedJournal] = useState<DailyJournal | null>(journals[0] || null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [mood, setMood] = useState<MoodType>('good');
  const [activitySummary, setActivitySummary] = useState('');
  const [whatWentWell, setWhatWentWell] = useState('');
  const [obstacles, setObstacles] = useState('');
  const [lessonsLearned, setLessonsLearned] = useState('');
  const [improvements, setImprovements] = useState('');
  const [tomorrowPlan, setTomorrowPlan] = useState('');
  const [photos, setPhotos] = useState<Attachment[]>([]);
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startNewJournal = () => {
    setSelectedJournal(null);
    setDate(new Date().toISOString().split('T')[0]);
    setTitle(`Refleksi ${format(new Date(), 'EEEE, d MMMM yyyy', { locale: idLocale })}`);
    setMood('good');
    setActivitySummary('');
    setWhatWentWell('');
    setObstacles('');
    setLessonsLearned('');
    setImprovements('');
    setTomorrowPlan('');
    setPhotos([]);
    setTagsInput('Refleksi, Produktivitas');
    setIsEditing(true);
  };

  const handleSelectJournal = (j: DailyJournal) => {
    setSelectedJournal(j);
    setDate(j.date);
    setTitle(j.title);
    setMood(j.mood);
    setActivitySummary(j.activitySummary);
    setWhatWentWell(j.whatWentWell);
    setObstacles(j.obstacles);
    setLessonsLearned(j.lessonsLearned);
    setImprovements(j.improvements);
    setTomorrowPlan(j.tomorrowPlan);
    setPhotos(j.photos || []);
    setTagsInput(j.tags ? j.tags.join(', ') : '');
    setIsEditing(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await onSaveJournal({
        id: selectedJournal?.id,
        date,
        title: title.trim(),
        mood,
        activitySummary: activitySummary.trim(),
        whatWentWell: whatWentWell.trim(),
        obstacles: obstacles.trim(),
        lessonsLearned: lessonsLearned.trim(),
        improvements: improvements.trim(),
        tomorrowPlan: tomorrowPlan.trim(),
        photos,
        tags: parsedTags,
      });

      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredJournals = journals.filter((j) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      j.title.toLowerCase().includes(q) ||
      j.activitySummary.toLowerCase().includes(q) ||
      j.whatWentWell.toLowerCase().includes(q) ||
      (j.tags && j.tags.some((t) => t.toLowerCase().includes(q)))
    );
  });

  const moods: { type: MoodType; label: string; icon: React.ReactNode; color: string }[] = [
    { type: 'great', label: 'Semangat', icon: <Zap size={14} />, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' },
    { type: 'good', label: 'Senang', icon: <Smile size={14} />, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
    { type: 'neutral', label: 'Biasa', icon: <Meh size={14} />, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40' },
    { type: 'tired', label: 'Lelah', icon: <Coffee size={14} />, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40' },
    { type: 'stressed', label: 'Stres', icon: <Frown size={14} />, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-100 dark:bg-orange-950/40 text-[#FF5A1F] dark:text-[#ff7438] rounded-2xl">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Jurnal Harian & Evaluasi Refleksi
            </h2>
            <p className="text-xs text-gray-400">
              Dokumentasikan capaian, pelajaran berharga, dan foto kenangan setiap hari.
            </p>
          </div>
        </div>

        <button
          onClick={startNewJournal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF5A1F] hover:bg-[#e54c14] text-white rounded-2xl text-xs font-bold shadow-md shadow-orange-500/20 transition"
        >
          <Plus size={16} /> Tulis Jurnal Hari Ini
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Journal Entries List & Search */}
        <div className="lg:col-span-4 space-y-3">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari refleksi, kata kunci, tag..."
              className="w-full text-xs pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#FF5A1F]"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredJournals.map((j) => {
              const active = selectedJournal?.id === j.id;

              return (
                <div
                  key={j.id}
                  onClick={() => handleSelectJournal(j)}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    active
                      ? 'bg-orange-50/50 dark:bg-orange-950/30 border-[#FF5A1F] dark:border-[#FF5A1F] shadow-sm'
                      : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700/60 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-semibold text-[#FF5A1F] dark:text-[#ff7438] flex items-center gap-1">
                      <Calendar size={12} /> {j.date}
                    </span>
                    <span className="capitalize font-bold text-gray-500 dark:text-gray-400">
                      Mood: {j.mood}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-1 mb-1">
                    {j.title}
                  </h4>

                  {j.activitySummary && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {j.activitySummary}
                    </p>
                  )}

                  {j.photos && j.photos.length > 0 && (
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400 font-medium">
                      <Camera size={11} className="text-[#FF5A1F]" /> {j.photos.length} foto terlampir
                    </div>
                  )}
                </div>
              );
            })}

            {filteredJournals.length === 0 && (
              <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-2xl p-4 text-xs text-gray-400">
                Tidak ada catatan jurnal yang cocok.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Journal Detail or Form Editor */}
        <div className="lg:col-span-8">
          {isEditing ? (
            <form onSubmit={handleSave} className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700/60 shadow-sm space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  {selectedJournal ? 'Edit Refleksi Harian' : 'Tulis Jurnal Harian Baru'}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-xl text-gray-500 hover:bg-gray-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-[#FF5A1F] hover:bg-[#e54c14] text-white rounded-xl font-bold shadow-md shadow-orange-500/20"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Jurnal'}
                  </button>
                </div>
              </div>

              {/* Title & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Judul Jurnal *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="misal: Hari yang produktif dengan kemajuan sprint..."
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] text-xs"
                  />
                </div>
              </div>

              {/* Mood Selector */}
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Kondisi / Mood Hari Ini
                </label>
                <div className="flex flex-wrap gap-2">
                  {moods.map((m) => {
                    const active = mood === m.type;
                    return (
                      <button
                        key={m.type}
                        type="button"
                        onClick={() => setMood(m.type)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition ${
                          active
                            ? `${m.color} ring-2 ring-current`
                            : 'bg-gray-50 dark:bg-gray-900 text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        {m.icon}
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Structured Reflection Sections */}
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  1. Ringkasan Aktivitas Utama
                </label>
                <textarea
                  rows={2}
                  value={activitySummary}
                  onChange={(e) => setActivitySummary(e.target.value)}
                  placeholder="Apa saja hal utama yang Anda kerjakan hari ini?"
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#FF5A1F] dark:text-[#ff7438] block mb-1">
                    2. Hal yang Berhasil / Pencapaian
                  </label>
                  <textarea
                    rows={2}
                    value={whatWentWell}
                    onChange={(e) => setWhatWentWell(e.target.value)}
                    placeholder="Keberhasilan apa yang Anda syukuri?"
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-rose-700 dark:text-rose-400 block mb-1">
                    3. Kendala & Tantangan yang Dihadapi
                  </label>
                  <textarea
                    rows={2}
                    value={obstacles}
                    onChange={(e) => setObstacles(e.target.value)}
                    placeholder="Hambatan atau distraksi yang muncul..."
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-blue-700 dark:text-blue-400 block mb-1">
                    4. Pelajaran yang Diperoleh
                  </label>
                  <textarea
                    rows={2}
                    value={lessonsLearned}
                    onChange={(e) => setLessonsLearned(e.target.value)}
                    placeholder="Insight atau pembelajaran baru..."
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-amber-700 dark:text-amber-400 block mb-1">
                    5. Rencana Besok
                  </label>
                  <textarea
                    rows={2}
                    value={tomorrowPlan}
                    onChange={(e) => setTomorrowPlan(e.target.value)}
                    placeholder="Prioritas utama untuk esok hari..."
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] text-xs"
                  />
                </div>
              </div>

              {/* Photo Upload Zone */}
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Foto Kenangan / Dokumentasi Kegiatan
                </label>
                <PhotoUploadZone
                  attachments={photos}
                  onAttachmentsChange={setPhotos}
                  maxFiles={6}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Tags (Pisahkan koma)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Refleksi, Produktivitas, Coding"
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] text-xs"
                />
              </div>
            </form>
          ) : selectedJournal ? (
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700/60 shadow-sm space-y-6">
              {/* Header Info */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300">
                      {selectedJournal.date}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 capitalize border border-orange-200/50 dark:border-orange-900/40">
                      Mood: {selectedJournal.mood}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100">
                    {selectedJournal.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3.5 py-2 bg-orange-50 dark:bg-orange-950/30 text-[#FF5A1F] dark:text-[#ff7438] hover:bg-orange-100 dark:hover:bg-orange-950/60 border border-orange-200/60 dark:border-orange-900/50 rounded-xl text-xs font-bold transition"
                  >
                    Edit Refleksi
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Hapus entri jurnal ini?')) {
                        onDeleteJournal(selectedJournal.id);
                        setSelectedJournal(null);
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Sections Display */}
              {selectedJournal.activitySummary && (
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Ringkasan Kegiatan
                  </h5>
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 bg-gray-50/60 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                    {selectedJournal.activitySummary}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedJournal.whatWentWell && (
                  <div className="p-4 bg-orange-50/50 dark:bg-orange-950/20 rounded-2xl border border-orange-200/60 dark:border-orange-900/40">
                    <h5 className="text-xs font-bold text-orange-900 dark:text-orange-300 mb-1">
                      ✓ Hal yang Berhasil
                    </h5>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                      {selectedJournal.whatWentWell}
                    </p>
                  </div>
                )}

                {selectedJournal.obstacles && (
                  <div className="p-4 bg-rose-50/40 dark:bg-rose-950/20 rounded-2xl border border-rose-200/60 dark:border-rose-900/40">
                    <h5 className="text-xs font-bold text-rose-800 dark:text-rose-300 mb-1">
                      ⚠ Kendala & Tantangan
                    </h5>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                      {selectedJournal.obstacles}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedJournal.lessonsLearned && (
                  <div className="p-4 bg-blue-50/40 dark:bg-blue-950/20 rounded-2xl border border-blue-200/60 dark:border-blue-900/40">
                    <h5 className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-1">
                      💡 Pelajaran Berharga
                    </h5>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                      {selectedJournal.lessonsLearned}
                    </p>
                  </div>
                )}

                {selectedJournal.tomorrowPlan && (
                  <div className="p-4 bg-amber-50/40 dark:bg-amber-950/20 rounded-2xl border border-amber-200/60 dark:border-amber-900/40">
                    <h5 className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">
                      🎯 Rencana Esok Hari
                    </h5>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                      {selectedJournal.tomorrowPlan}
                    </p>
                  </div>
                )}
              </div>

              {/* Photos Gallery */}
              {selectedJournal.photos && selectedJournal.photos.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Dokumentasi Foto ({selectedJournal.photos.length})
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedJournal.photos.map((p, idx) => (
                      <div
                        key={p.id}
                        onClick={() => onOpenPhotoLightbox(selectedJournal.photos, idx)}
                        className="h-36 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer shadow-sm hover:opacity-90 transition relative group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.url} alt={p.originalName} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        {p.caption && (
                          <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-white text-[10px] truncate">
                            {p.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {selectedJournal.tags && selectedJournal.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {selectedJournal.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8">
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
                Pilih atau Tulis Jurnal Baru
              </p>
              <p className="text-xs text-gray-400 mb-4">
                Pilih catatan refleksi di sebelah kiri atau buat entri baru untuk hari ini.
              </p>
              <button
                onClick={startNewJournal}
                className="px-4 py-2 bg-[#FF5A1F] hover:bg-[#e54c14] text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20"
              >
                + Tulis Jurnal Hari Ini
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
