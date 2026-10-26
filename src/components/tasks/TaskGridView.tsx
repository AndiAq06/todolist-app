'use client';

import React from 'react';
import { Task } from '@/types';
import { CheckCircle2, Circle, Calendar, Clock, Camera, FileText, CheckSquare } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TaskGridViewProps {
  tasks: Task[];
  onToggleComplete: (task: Task) => void;
  onOpenDetail: (task: Task) => void;
  onOpenPhotoLightbox: (task: Task, photoIndex: number) => void;
}

export const TaskGridView: React.FC<TaskGridViewProps> = ({
  tasks,
  onToggleComplete,
  onOpenDetail,
  onOpenPhotoLightbox,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => {
        const isDone = task.status === 'completed';
        const photos = task.attachments.filter((a) => a.fileType === 'image');
        const heroPhoto = photos[0];
        const completedSubs = task.checklists.filter((s) => s.completed).length;

        return (
          <div
            key={task.id}
            onClick={() => onOpenDetail(task)}
            className="group bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-200/80 dark:border-gray-700 hover:border-[#FF5A1F] dark:hover:border-[#FF5A1F] transition shadow-sm hover:shadow-lg flex flex-col justify-between cursor-pointer"
          >
            <div>
              {/* Optional Hero Photo Banner */}
              {heroPhoto ? (
                <div
                  className="relative h-40 w-full bg-gray-100 dark:bg-gray-900 overflow-hidden"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenPhotoLightbox(task, 0);
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroPhoto.url}
                    alt={heroPhoto.originalName}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Camera size={12} /> {photos.length} Foto
                  </div>
                  {heroPhoto.caption && (
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-6">
                      <p className="text-xs text-white truncate font-medium">{heroPhoto.caption}</p>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Card Body */}
              <div className="p-5">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {task.category}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/40 text-[#FF5A1F] dark:text-[#ff7438] uppercase">
                    {task.priority}
                  </span>
                </div>

                <h4
                  className={`text-base font-bold mb-1.5 group-hover:text-[#FF5A1F] dark:group-hover:text-[#ff7438] transition leading-snug ${
                    isDone ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {task.title}
                </h4>

                {task.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-3">
                    {task.description}
                  </p>
                )}

                {/* Checklist badge */}
                {task.checklists.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium my-2">
                    <CheckSquare size={14} className="text-[#FF5A1F]" />
                    <span>
                      {completedSubs} / {task.checklists.length} subtugas selesai
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Card Footer */}
            <div className="p-4 px-5 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-[#FF5A1F]" />
                {task.dueDate}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isDone) {
                    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
                  }
                  onToggleComplete(task);
                }}
                className={`p-1.5 rounded-xl transition ${
                  isDone
                    ? 'text-[#FF5A1F] bg-orange-50 dark:bg-orange-950/50'
                    : 'text-gray-400 hover:text-[#FF5A1F] hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {isDone ? <CheckCircle2 size={18} /> : <Circle size={18} />}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
