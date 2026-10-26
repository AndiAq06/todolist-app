'use client';

import React from 'react';
import { Task } from '@/types';
import { CheckCircle2, Circle, Flame, ArrowRight, Camera } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FocusWidgetProps {
  tasks: Task[];
  onToggleComplete: (task: Task) => void;
  onOpenDetail: (task: Task) => void;
}

export const FocusWidget: React.FC<FocusWidgetProps> = ({
  tasks,
  onToggleComplete,
  onOpenDetail,
}) => {
  const focusTasks = tasks.filter((t) => t.isFocus && !t.isDeleted && !t.isArchived).slice(0, 3);

  const handleToggle = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.status !== 'completed') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
    onToggleComplete(task);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700/60 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 rounded-xl">
            <Flame size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Fokus Hari Ini
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Maksimal 3 tugas terpenting untuk diselesaikan
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
          {focusTasks.filter((t) => t.status === 'completed').length}/{focusTasks.length} Selesai
        </span>
      </div>

      {focusTasks.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
          <p className="text-xs text-gray-400 mb-1">Belum ada tugas yang ditandai sebagai Fokus Hari Ini.</p>
          <p className="text-[11px] text-gray-400">Buka detail tugas dan aktifkan &quot;Fokus Hari Ini&quot; untuk prioritas utama Anda.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {focusTasks.map((task) => {
            const isDone = task.status === 'completed';
            const photosCount = task.attachments.filter((a) => a.fileType === 'image').length;

            return (
              <div
                key={task.id}
                onClick={() => onOpenDetail(task)}
                className={`group flex items-center justify-between p-3 rounded-2xl border transition cursor-pointer ${
                  isDone
                    ? 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-200/60 dark:border-orange-900/40'
                    : 'bg-gray-50/70 dark:bg-gray-900/40 border-gray-100 dark:border-gray-800 hover:border-orange-300 dark:hover:border-orange-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => handleToggle(task, e)}
                    className="text-gray-400 hover:text-[#FF5A1F] transition flex-shrink-0"
                  >
                    {isDone ? (
                      <CheckCircle2 className="text-[#FF5A1F] fill-orange-100 dark:fill-orange-950" size={20} />
                    ) : (
                      <Circle size={20} />
                    )}
                  </button>

                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold truncate ${
                        isDone
                          ? 'line-through text-gray-400 dark:text-gray-500'
                          : 'text-gray-800 dark:text-gray-200 group-hover:text-[#FF5A1F] dark:group-hover:text-[#ff7438] transition'
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
                      <span className="font-medium text-gray-500 dark:text-gray-400">
                        {task.category}
                      </span>
                      {task.startTime && <span>• {task.startTime}</span>}
                      {photosCount > 0 && (
                        <span className="flex items-center gap-1 text-[#FF5A1F] dark:text-[#ff7438] font-medium">
                          <Camera size={11} /> {photosCount} foto
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <ArrowRight
                  size={16}
                  className="text-gray-300 dark:text-gray-600 group-hover:text-[#FF5A1F] group-hover:translate-x-0.5 transition flex-shrink-0 ml-2"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
