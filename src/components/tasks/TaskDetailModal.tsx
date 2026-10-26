'use client';

import React, { useState } from 'react';
import { Task, Subtask, Attachment, ProgressLog, TaskStatus } from '@/types';
import { PhotoUploadZone } from '../attachments/PhotoUploadZone';
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Flame,
  Plus,
  Trash2,
  Edit3,
  Camera,
  FileText,
  Archive,
  Copy,
  Send,
  Sparkles,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (updatedTask: Task) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onOpenEditModal: (task: Task) => void;
  onOpenPhotoLightbox: (task: Task, photoIndex: number) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdateTask,
  onDeleteTask,
  onOpenEditModal,
  onOpenPhotoLightbox,
}) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newProgressNote, setNewProgressNote] = useState('');
  const [progressPhotos, setProgressPhotos] = useState<Attachment[]>([]);
  const [isSubmittingProgress, setIsSubmittingProgress] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'photos' | 'progress'>('details');

  if (!isOpen || !task) return null;

  const isDone = task.status === 'completed';
  const photos = task.attachments.filter((a) => a.fileType === 'image');
  const docs = task.attachments.filter((a) => a.fileType === 'document');

  const completedSubtasks = task.checklists.filter((s) => s.completed).length;
  const totalSubtasks = task.checklists.length;
  const checklistPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Toggle subtask status
  const toggleSubtask = async (subtaskId: string) => {
    const updatedChecklists = task.checklists.map((s) =>
      s.id === subtaskId ? { ...s, completed: !s.completed, completedAt: !s.completed ? new Date().toISOString() : undefined } : s
    );
    await onUpdateTask({ ...task, checklists: updatedChecklists });
  };

  // Add new subtask
  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const newSub: Subtask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };

    await onUpdateTask({ ...task, checklists: [...task.checklists, newSub] });
    setNewSubtaskTitle('');
  };

  // Delete subtask
  const handleDeleteSubtask = async (subtaskId: string) => {
    const updatedChecklists = task.checklists.filter((s) => s.id !== subtaskId);
    await onUpdateTask({ ...task, checklists: updatedChecklists });
  };

  // Quick Status change
  const handleStatusChange = async (status: TaskStatus) => {
    if (status === 'completed') {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    }
    await onUpdateTask({ ...task, status });
  };

  // Toggle Focus
  const toggleFocus = async () => {
    await onUpdateTask({ ...task, isFocus: !task.isFocus });
  };

  // Archive Task
  const toggleArchive = async () => {
    await onUpdateTask({ ...task, isArchived: !task.isArchived });
    onClose();
  };

  // Add Progress Journal Log
  const handleAddProgressLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgressNote.trim() || isSubmittingProgress) return;

    setIsSubmittingProgress(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newProgressNote,
          photos: progressPhotos,
        }),
      });

      const data = await res.json();
      if (res.ok && data.task) {
        await onUpdateTask(data.task);
        setNewProgressNote('');
        setProgressPhotos([]);
      }
    } catch (err) {
      console.error('Failed to add progress log:', err);
    } finally {
      setIsSubmittingProgress(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700/80 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400">
              {task.category}
            </span>
            <button
              onClick={toggleFocus}
              className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full transition ${
                task.isFocus
                  ? 'bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 ring-1 ring-orange-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-orange-500'
              }`}
            >
              <Flame size={13} />
              {task.isFocus ? 'Fokus Aktif' : 'Set Fokus'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenEditModal(task)}
              title="Edit Tugas"
              className="p-2 text-gray-500 hover:text-[#FF5A1F] hover:bg-orange-50 dark:hover:bg-orange-950/50 rounded-xl transition"
            >
              <Edit3 size={17} />
            </button>
            <button
              onClick={toggleArchive}
              title={task.isArchived ? 'Batal Arsip' : 'Arsipkan Tugas'}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-xl transition"
            >
              <Archive size={17} />
            </button>
            <button
              onClick={() => {
                if (confirm('Pindahkan tugas ini ke tempat sampah?')) {
                  onDeleteTask(task.id);
                  onClose();
                }
              }}
              title="Hapus ke Tempat Sampah"
              className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition"
            >
              <Trash2 size={17} />
            </button>
            <button
              onClick={onClose}
              title="Tutup (Esc)"
              className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700 rounded-xl transition ml-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-gray-100 dark:border-gray-700 px-6 gap-6 bg-white dark:bg-gray-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'details'
                ? 'border-[#FF5A1F] text-[#FF5A1F] dark:text-[#ff7438]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Ringkasan & Checklist
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'photos'
                ? 'border-[#FF5A1F] text-[#FF5A1F] dark:text-[#ff7438]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Camera size={14} /> Dokumentasi Foto ({photos.length})
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'progress'
                ? 'border-[#FF5A1F] text-[#FF5A1F] dark:text-[#ff7438]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <MessageSquare size={14} /> Jurnal Progres ({task.progressLogs?.length || 0})
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'details' && (
            <>
              {/* Title & Status Actions */}
              <div>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h2
                    className={`text-xl sm:text-2xl font-bold leading-tight ${
                      isDone ? 'line-through text-gray-400' : 'text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {task.title}
                  </h2>
                </div>

                {/* Status Switcher Buttons */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <button
                    onClick={() => handleStatusChange('todo')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      task.status === 'todo'
                        ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900 shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    Belum Dimulai
                  </button>
                  <button
                    onClick={() => handleStatusChange('in_progress')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      task.status === 'in_progress'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100'
                    }`}
                  >
                    Sedang Dikerjakan
                  </button>
                  <button
                    onClick={() => handleStatusChange('completed')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      task.status === 'completed'
                        ? 'bg-[#FF5A1F] text-white shadow-sm'
                        : 'bg-orange-50 dark:bg-orange-950/40 text-[#FF5A1F] dark:text-[#ff7438] hover:bg-orange-100'
                    }`}
                  >
                    ✓ Selesai
                  </button>
                  <button
                    onClick={() => handleStatusChange('paused')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      task.status === 'paused'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 hover:bg-amber-100'
                    }`}
                  >
                    Ditunda
                  </button>
                </div>
              </div>

              {/* Metadata Pill Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-gray-50/70 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">Jadwal</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1 mt-0.5">
                    <Calendar size={13} className="text-[#FF5A1F]" /> {task.dueDate}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">Waktu</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1 mt-0.5">
                    <Clock size={13} className="text-blue-500" /> {task.startTime || 'Fleksibel'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">Prioritas</span>
                  <span className="font-bold text-gray-700 dark:text-gray-200 capitalize mt-0.5 block">
                    {task.priority}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">Durasi Estimasi</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-200 mt-0.5 block">
                    {task.estimatedDuration ? `${task.estimatedDuration} Menit` : '-'}
                  </span>
                </div>
              </div>

              {/* Description */}
              {task.description && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Deskripsi Tugas
                  </h4>
                  <div className="p-4 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-800 text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {task.description}
                  </div>
                </div>
              )}

              {/* Checklist & Subtasks Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Checklist Subtugas ({completedSubtasks}/{totalSubtasks})
                  </h4>
                  <span className="text-xs font-bold text-[#FF5A1F] dark:text-[#ff7438]">
                    {checklistPercent}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#FF5A1F] h-full rounded-full transition-all duration-300"
                    style={{ width: `${checklistPercent}%` }}
                  />
                </div>

                {/* Subtasks List */}
                <div className="space-y-2 pt-1">
                  {task.checklists.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800 group"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSubtask(sub.id)}
                        className="flex items-center gap-3 text-left flex-1 min-w-0"
                      >
                        {sub.completed ? (
                          <CheckCircle2 size={18} className="text-[#FF5A1F] fill-orange-100 flex-shrink-0" />
                        ) : (
                          <Circle size={18} className="text-gray-400 flex-shrink-0" />
                        )}
                        <span
                          className={`text-xs font-medium truncate ${
                            sub.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {sub.title}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSubtask(sub.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}

                  {/* Add Subtask Input */}
                  <form onSubmit={handleAddSubtask} className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      placeholder="Tambah item checklist..."
                      className="flex-1 text-xs px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5A1F]"
                    />
                    <button
                      type="submit"
                      disabled={!newSubtaskTitle.trim()}
                      className="px-3 py-2 bg-[#FF5A1F] hover:bg-[#e54c14] disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition"
                    >
                      Tambah
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: PHOTOS & ATTACHMENTS */}
          {activeTab === 'photos' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">
                  Galeri Foto Bukti Kegiatan
                </h4>
                <p className="text-xs text-gray-500 mb-4">
                  Klik foto mana saja untuk membuka tampilan lightbox layar penuh dengan zoom dan detail.
                </p>

                {photos.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                    <Camera size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-xs text-gray-500">Belum ada foto dokumentasi untuk tugas ini.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {photos.map((photo, idx) => (
                      <div
                        key={photo.id}
                        onClick={() => onOpenPhotoLightbox(task, idx)}
                        className="group relative h-36 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer hover:shadow-md transition"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.url}
                          alt={photo.caption || photo.originalName}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition p-2.5 flex flex-col justify-end">
                          <p className="text-xs text-white font-medium truncate">
                            {photo.caption || photo.originalName}
                          </p>
                          <span className="text-[10px] text-gray-300">
                            {new Date(photo.uploadedAt).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upload New Photos directly to Task */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                  Unggah Foto Tambahan ke Tugas Ini
                </h4>
                <PhotoUploadZone
                  attachments={task.attachments}
                  onAttachmentsChange={(newAttachments) => {
                    onUpdateTask({ ...task, attachments: newAttachments });
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 3: PROGRESS JOURNAL */}
          {activeTab === 'progress' && (
            <div className="space-y-6">
              {/* Add Progress Update Form */}
              <form onSubmit={handleAddProgressLog} className="p-4 bg-gray-50/70 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3">
                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#FF5A1F]" />
                  Tambah Catatan Progres & Bukti
                </h4>

                <textarea
                  value={newProgressNote}
                  onChange={(e) => setNewProgressNote(e.target.value)}
                  placeholder="Ceritakan progres terbaru, kendala, atau hasil yang dicapai..."
                  className="w-full text-xs p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] resize-none h-20"
                />

                <PhotoUploadZone
                  attachments={progressPhotos}
                  onAttachmentsChange={setProgressPhotos}
                  maxFiles={3}
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newProgressNote.trim() || isSubmittingProgress}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF5A1F] hover:bg-[#e54c14] disabled:opacity-40 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                  >
                    <Send size={13} />
                    {isSubmittingProgress ? 'Menyimpan...' : 'Simpan Log Progres'}
                  </button>
                </div>
              </form>

              {/* Existing Progress Logs Timeline */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Riwayat Perkembangan ({task.progressLogs?.length || 0})
                </h4>

                {(!task.progressLogs || task.progressLogs.length === 0) ? (
                  <p className="text-xs text-gray-400 italic">Belum ada catatan progres yang disimpan.</p>
                ) : (
                  <div className="relative border-l-2 border-[#FF5A1F]/30 ml-3 pl-4 space-y-4">
                    {task.progressLogs.map((log) => (
                      <div key={log.id} className="relative">
                        <div className="absolute -left-[23px] top-1 w-3 h-3 bg-[#FF5A1F] rounded-full border-2 border-white dark:border-gray-800" />
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm">
                          <span className="text-[10px] text-gray-400 block mb-1">
                            {new Date(log.timestamp).toLocaleString('id-ID', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed mb-2 whitespace-pre-wrap">
                            {log.content}
                          </p>

                          {log.photos && log.photos.length > 0 && (
                            <div className="flex items-center gap-2 pt-1 overflow-x-auto">
                              {log.photos.map((p, pIndex) => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => onOpenPhotoLightbox(task, pIndex)}
                                  className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={p.url} alt={p.originalName} className="w-full h-full object-cover" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
          <span>Dibuat: {new Date(task.createdAt).toLocaleDateString('id-ID')}</span>
          <span>Diperbarui: {new Date(task.updatedAt).toLocaleDateString('id-ID')}</span>
        </div>
      </div>
    </div>
  );
};
