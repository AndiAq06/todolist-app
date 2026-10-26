'use client';

import React, { useState, useEffect } from 'react';
import { Task, TaskPriority, TaskStatus, Category, Attachment, Subtask } from '@/types';
import { PhotoUploadZone } from '../attachments/PhotoUploadZone';
import { X, Calendar, Clock, Plus, Trash2, Flame, Tag, Check } from 'lucide-react';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => Promise<void>;
  categories: Category[];
  initialTask?: Task | null;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  initialTask,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [category, setCategory] = useState('Pekerjaan');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState<number | undefined>(undefined);
  const [isFocus, setIsFocus] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [checklists, setChecklists] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setStatus(initialTask.status);
      setPriority(initialTask.priority);
      setCategory(initialTask.category);
      setDueDate(initialTask.dueDate);
      setStartTime(initialTask.startTime || '');
      setEndTime(initialTask.endTime || '');
      setEstimatedDuration(initialTask.estimatedDuration);
      setIsFocus(Boolean(initialTask.isFocus));
      setTagsInput(initialTask.tags ? initialTask.tags.join(', ') : '');
      setChecklists(initialTask.checklists || []);
      setAttachments(initialTask.attachments || []);
    } else {
      // Reset defaults
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('normal');
      setCategory(categories[0]?.name || 'Pekerjaan');
      setDueDate(new Date().toISOString().split('T')[0]);
      setStartTime('');
      setEndTime('');
      setEstimatedDuration(undefined);
      setIsFocus(false);
      setTagsInput('');
      setChecklists([]);
      setAttachments([]);
    }
    setError(null);
  }, [initialTask, isOpen, categories]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    setChecklists([
      ...checklists,
      {
        id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        title: newSubtask.trim(),
        completed: false,
      },
    ]);
    setNewSubtask('');
  };

  const handleRemoveSubtask = (id: string) => {
    setChecklists(checklists.filter((s) => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Judul tugas wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await onSave({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        category,
        dueDate,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        estimatedDuration: estimatedDuration ? Number(estimatedDuration) : undefined,
        isFocus,
        tags: parsedTags,
        checklists,
        attachments,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan tugas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
            {initialTask ? 'Edit Tugas' : 'Tambah Tugas Baru'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 block mb-1">
              Judul Tugas <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Selesaikan Laporan Mingguan & Review Foto Kegiatan..."
              className="w-full text-sm px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF5A1F] text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 block mb-1">
              Deskripsi Lengkap
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail penjelasan tugas, catatan teknis, link referensi..."
              className="w-full text-xs p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF5A1F] text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Row: Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 block mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5A1F] text-gray-800 dark:text-gray-200"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 block mb-1">
                Prioritas
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full text-xs px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5A1F] text-gray-800 dark:text-gray-200"
              >
                <option value="low">Rendah (Santai)</option>
                <option value="normal">Normal (Biasa)</option>
                <option value="high">Tinggi (Penting)</option>
                <option value="urgent">Mendesak (Segera)</option>
              </select>
            </div>
          </div>

          {/* Row: Due Date, Time, Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 block mb-1">
                Tanggal Pelaksanaan
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] text-gray-800 dark:text-gray-200"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 block mb-1">
                Waktu Mulai
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] text-gray-800 dark:text-gray-200"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 block mb-1">
                Estimasi (Menit)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                placeholder="misal: 60"
                value={estimatedDuration ?? ''}
                onChange={(e) => setEstimatedDuration(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full text-xs px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>

          {/* Tags & Focus Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 block mb-1">
                Tags (Pisahkan dengan koma)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Figma, UI, Sprint, Laporan"
                className="w-full text-xs px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] text-gray-800 dark:text-gray-200"
              />
            </div>

            <div className="pt-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFocus}
                  onChange={(e) => setIsFocus(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <Flame size={14} className="text-orange-500" />
                  Jadikan &quot;Fokus Hari Ini&quot; (Prioritas 3 Teratas)
                </span>
              </label>
            </div>
          </div>

          {/* Subtask Checklist Builder */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 block mb-2">
              Subtugas / Checklist ({checklists.length})
            </label>
            <div className="space-y-2 mb-2">
              {checklists.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 text-xs"
                >
                  <span className="truncate">{item.title}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(item.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Ketik subtugas & tekan Enter..."
                className="flex-1 text-xs px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5A1F]"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-semibold"
              >
                + Tambah
              </button>
            </div>
          </div>

          {/* Photos and Attachments Section */}
          <div className="pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 block mb-2">
              Dokumentasi Foto & Lampiran File
            </label>
            <PhotoUploadZone
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              maxFiles={8}
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#FF5A1F] hover:bg-[#e54c14] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition"
            >
              {isSubmitting ? 'Menyimpan...' : initialTask ? 'Simpan Perubahan' : 'Buat Tugas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
