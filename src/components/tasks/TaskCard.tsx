'use client';

import React from 'react';
import { Task, TaskPriority, TaskStatus } from '@/types';
import { CheckCircle2, Circle, Clock, Flame, Calendar, Camera, FileText, CheckSquare, MoreVertical } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onOpenDetail: (task: Task) => void;
  onOpenPhotoLightbox?: (task: Task, photoIndex: number) => void;
  isSelected?: boolean;
  onSelect?: (taskId: string, checked: boolean) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onOpenDetail,
  onOpenPhotoLightbox,
  isSelected = false,
  onSelect,
}) => {
  const isDone = task.status === 'completed';
  const photos = task.attachments.filter((a) => a.fileType === 'image');
  const docs = task.attachments.filter((a) => a.fileType === 'document');

  const completedSubtasks = task.checklists.filter((s) => s.completed).length;
  const totalSubtasks = task.checklists.length;
  const subtaskProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDone) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
    onToggleComplete(task);
  };

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'urgent':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
            Mendesak
          </span>
        );
      case 'high':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
            Tinggi
          </span>
        );
      case 'low':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            Rendah
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            Normal
          </span>
        );
    }
  };

  return (
    <div
      onClick={() => onOpenDetail(task)}
      className={`group relative bg-white dark:bg-gray-800 rounded-2xl p-4 border transition-all cursor-pointer shadow-sm hover:shadow-md ${
        isDone
          ? 'border-gray-200/60 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-900/20'
          : 'border-gray-200/80 dark:border-gray-700 hover:border-[#FF5A1F] dark:hover:border-[#FF5A1F]'
      } ${isSelected ? 'ring-2 ring-[#FF5A1F] bg-orange-50/20' : ''}`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {onSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onSelect(task.id, e.target.checked)}
              className="rounded text-[#FF5A1F] focus:ring-[#FF5A1F] w-4 h-4"
            />
          )}

          <button
            type="button"
            onClick={handleToggle}
            className="text-gray-400 hover:text-[#FF5A1F] transition flex-shrink-0"
          >
            {isDone ? (
              <CheckCircle2 className="text-[#FF5A1F] fill-orange-50 dark:fill-orange-950" size={20} />
            ) : (
              <Circle size={20} />
            )}
          </button>

          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {task.category}
          </span>

          {task.isFocus && (
            <span className="flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-[#FF5A1F] dark:text-[#ff7438]">
              <Flame size={11} /> Fokus
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">{getPriorityBadge(task.priority)}</div>
      </div>

      {/* Task Title */}
      <h4
        className={`text-sm font-semibold mb-1 group-hover:text-[#FF5A1F] dark:group-hover:text-[#ff7438] transition leading-snug ${
          isDone ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'
        }`}
      >
        {task.title}
      </h4>

      {/* Description Snippet if exists */}
      {task.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Photo Documentation Strip (Interactive Thumbnails) */}
      {photos.length > 0 && (
        <div className="my-2.5 flex items-center gap-2 overflow-x-auto pb-1" onClick={(e) => e.stopPropagation()}>
          {photos.slice(0, 3).map((photo, pIdx) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => onOpenPhotoLightbox && onOpenPhotoLightbox(task, pIdx)}
              title={photo.caption || photo.originalName}
              className="relative w-14 h-14 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0 hover:opacity-90 hover:scale-105 transition"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={photo.originalName} className="w-full h-full object-cover" />
              {pIdx === 2 && photos.length > 3 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[11px] font-bold">
                  +{photos.length - 2}
                </div>
              )}
            </button>
          ))}
          <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1 ml-1">
            <Camera size={13} className="text-[#FF5A1F]" /> {photos.length} Foto
          </span>
        </div>
      )}

      {/* Subtask Checklist Progress Bar */}
      {totalSubtasks > 0 && (
        <div className="my-2 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
            <span className="flex items-center gap-1">
              <CheckSquare size={12} /> Checklist ({completedSubtasks}/{totalSubtasks})
            </span>
            <span>{subtaskProgress}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700/60 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                subtaskProgress === 100 ? 'bg-[#FF5A1F]' : 'bg-orange-400'
              }`}
              style={{ width: `${subtaskProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Tags Pill Row */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 my-2">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-medium">
            <Calendar size={12} className="text-[#FF5A1F]" />
            {task.dueDate}
          </span>
          {task.startTime && (
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-blue-500" />
              {task.startTime}
            </span>
          )}
        </div>

        {docs.length > 0 && (
          <span className="flex items-center gap-1 text-[11px] text-gray-400">
            <FileText size={12} /> {docs.length} Dokumen
          </span>
        )}
      </div>
    </div>
  );
};
