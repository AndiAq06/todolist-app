'use client';

import React from 'react';
import { Task } from '@/types';
import { TaskCard } from './TaskCard';
import { CheckCheck, Trash2, ListFilter, Inbox } from 'lucide-react';

interface TaskListViewProps {
  tasks: Task[];
  onToggleComplete: (task: Task) => void;
  onOpenDetail: (task: Task) => void;
  onOpenPhotoLightbox: (task: Task, photoIndex: number) => void;
  selectedIds: string[];
  onToggleSelect: (taskId: string, checked: boolean) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkComplete: () => void;
  onBulkDelete: () => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  onToggleComplete,
  onOpenDetail,
  onOpenPhotoLightbox,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onBulkComplete,
  onBulkDelete,
}) => {
  const isAllSelected = tasks.length > 0 && selectedIds.length === tasks.length;

  return (
    <div className="space-y-4">
      {/* Bulk Action Header Bar */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 rounded-2xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-orange-900 dark:text-orange-300">
              {selectedIds.length} tugas terpilih
            </span>
            <button
              onClick={onClearSelection}
              className="text-xs text-[#FF5A1F] dark:text-[#ff7438] hover:underline ml-2"
            >
              Batalkan
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onBulkComplete}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FF5A1F] hover:bg-[#e54c14] text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              <CheckCheck size={14} /> Tandai Selesai
            </button>
            <button
              onClick={onBulkDelete}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              <Trash2 size={14} /> Hapus
            </button>
          </div>
        </div>
      )}

      {/* Select All Checkbox Row */}
      {tasks.length > 0 && (
        <div className="flex items-center justify-between px-2 text-xs text-gray-500">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={() => (isAllSelected ? onClearSelection() : onSelectAll())}
              className="rounded text-[#FF5A1F] focus:ring-[#FF5A1F]"
            />
            <span className="font-medium">Pilih Semua ({tasks.length})</span>
          </label>
        </div>
      )}

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/60 p-8 shadow-sm">
          <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-full flex items-center justify-center">
            <Inbox size={32} />
          </div>
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-1">
            Tidak ada tugas yang ditemukan
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Semua tugas selesai atau filter pencarian tidak cocok. Buat tugas baru dengan form di atas!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onOpenDetail={onOpenDetail}
              onOpenPhotoLightbox={onOpenPhotoLightbox}
              isSelected={selectedIds.includes(task.id)}
              onSelect={onToggleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};
