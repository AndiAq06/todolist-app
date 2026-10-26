'use client';

import React, { useState } from 'react';
import { Task } from '@/types';
import { Archive, Trash2, RotateCcw, AlertTriangle, Inbox, CheckCircle2 } from 'lucide-react';

interface ArchiveTrashViewProps {
  tasks: Task[];
  onRestoreTask: (taskId: string) => Promise<void>;
  onUnarchiveTask: (taskId: string) => Promise<void>;
  onPermanentDeleteTask: (taskId: string) => Promise<void>;
  onEmptyTrash: () => Promise<void>;
}

export const ArchiveTrashView: React.FC<ArchiveTrashViewProps> = ({
  tasks,
  onRestoreTask,
  onUnarchiveTask,
  onPermanentDeleteTask,
  onEmptyTrash,
}) => {
  const [tab, setTab] = useState<'archive' | 'trash'>('archive');

  const archivedTasks = tasks.filter((t) => t.isArchived && !t.isDeleted);
  const deletedTasks = tasks.filter((t) => t.isDeleted);

  return (
    <div className="space-y-6">
      {/* Tab Switcher Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1.5 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setTab('archive')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
              tab === 'archive'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Archive size={15} />
            Arsip ({archivedTasks.length})
          </button>
          <button
            onClick={() => setTab('trash')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
              tab === 'trash'
                ? 'bg-white dark:bg-gray-800 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Trash2 size={15} />
            Tempat Sampah ({deletedTasks.length})
          </button>
        </div>

        {tab === 'trash' && deletedTasks.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Kosongkan semua tugas di tempat sampah secara permanen? Tindakan ini tidak dapat dibatalkan.')) {
                onEmptyTrash();
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition"
          >
            <Trash2 size={14} /> Kosongkan Tempat Sampah
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700/60 shadow-sm">
        {tab === 'archive' ? (
          <div className="space-y-3">
            {archivedTasks.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Archive size={36} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm font-semibold">Tidak ada tugas yang diarsipkan</p>
                <p className="text-xs">Tugas yang Anda arsipkan dari menu tugas akan tersimpan di sini dengan aman.</p>
              </div>
            ) : (
              archivedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800"
                >
                  <div>
                    <span className="text-[11px] font-semibold text-gray-400">{task.category} • {task.dueDate}</span>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{task.title}</h4>
                  </div>
                  <button
                    onClick={() => onUnarchiveTask(task.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-gray-100 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 shadow-sm transition"
                  >
                    <RotateCcw size={13} /> Pulihkan ke Daftar
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {deletedTasks.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Trash2 size={36} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm font-semibold">Tempat sampah kosong</p>
                <p className="text-xs">Tugas yang Anda hapus akan ditampung di sini sebelum dihapus permanen.</p>
              </div>
            ) : (
              deletedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 bg-rose-50/20 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900/40"
                >
                  <div>
                    <span className="text-[11px] font-semibold text-rose-500">Dihapus • {task.category}</span>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 line-through">{task.title}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onRestoreTask(task.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FF5A1F] hover:bg-[#e54c14] text-white rounded-xl text-xs font-bold shadow-sm transition"
                    >
                      <RotateCcw size={13} /> Pulihkan
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus permanen tugas "${task.title}"? File foto dan data terkait akan dihapus selamanya.`)) {
                          onPermanentDeleteTask(task.id);
                        }
                      }}
                      className="p-2 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-xl transition"
                      title="Hapus Permanen"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
