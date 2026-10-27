'use client';

import React, { useState, useEffect } from 'react';
import { Task } from '@/types';
import { TaskCard } from './TaskCard';
import { CheckCheck, Trash2, Inbox, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [pageSize, setPageSize] = useState<number | 'all'>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Auto-reset page to 1 if task filter changes or tasks length changes
  useEffect(() => {
    setCurrentPage(1);
  }, [tasks.length]);

  const totalTasks = tasks.length;
  const isAll = pageSize === 'all';
  const effectivePageSize = isAll ? totalTasks : pageSize;
  const totalPages = isAll ? 1 : Math.max(1, Math.ceil(totalTasks / effectivePageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = isAll ? 0 : (validCurrentPage - 1) * effectivePageSize;
  const endIndex = isAll ? totalTasks : Math.min(startIndex + effectivePageSize, totalTasks);
  const paginatedTasks = isAll ? tasks : tasks.slice(startIndex, endIndex);

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
              type="button"
              onClick={onBulkComplete}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FF5A1F] hover:bg-[#e54c14] text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
            >
              <CheckCheck size={14} /> Tandai Selesai
            </button>
            <button
              type="button"
              onClick={onBulkDelete}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Trash2 size={14} /> Hapus
            </button>
          </div>
        </div>
      )}

      {/* Select All Checkbox & Range Info Bar */}
      {tasks.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-2 text-xs text-gray-500">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={() => (isAllSelected ? onClearSelection() : onSelectAll())}
              className="rounded text-[#FF5A1F] focus:ring-[#FF5A1F]"
            />
            <span className="font-medium">Pilih Semua ({tasks.length})</span>
          </label>

          <div className="flex items-center gap-3">
            <span className="text-gray-400">
              {isAll
                ? `Menampilkan semua (${totalTasks}) tugas`
                : `Menampilkan ${startIndex + 1}-${endIndex} dari ${totalTasks} tugas`}
            </span>

            {totalTasks > 5 && (
              <button
                type="button"
                onClick={() => {
                  if (isAll) {
                    setPageSize(5);
                    setCurrentPage(1);
                  } else {
                    setPageSize('all');
                  }
                }}
                className="text-xs font-bold text-[#FF5A1F] hover:underline px-2.5 py-1 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/60 dark:border-orange-800/60 transition active:scale-95 cursor-pointer"
              >
                {isAll ? 'Bagi per Halaman' : `Lihat Semua (${totalTasks})`}
              </button>
            )}
          </div>
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
          {paginatedTasks.map((task) => (
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

      {/* Pagination Controls Bar */}
      {totalTasks > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
          {/* Per Page Selector */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Per halaman:</span>
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              {[5, 10, 20].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    pageSize === size
                      ? 'bg-white dark:bg-gray-700 text-[#FF5A1F] shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {size}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPageSize('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  pageSize === 'all'
                    ? 'bg-white dark:bg-gray-700 text-[#FF5A1F] shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Semua
              </button>
            </div>
          </div>

          {/* Page Buttons (When not in 'all' mode) */}
          {!isAll && totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={validCurrentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  if (
                    totalPages > 7 &&
                    pageNum !== 1 &&
                    pageNum !== totalPages &&
                    Math.abs(pageNum - validCurrentPage) > 1
                  ) {
                    if (pageNum === 2 || pageNum === totalPages - 1) {
                      return (
                        <span key={pageNum} className="px-1 text-gray-400 text-xs">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  const isActive = pageNum === validCurrentPage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition ${
                        isActive
                          ? 'bg-[#FF5A1F] text-white shadow-sm'
                          : 'border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={validCurrentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="Halaman Berikutnya"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

