'use client';

import React from 'react';
import { Task, TaskStatus } from '@/types';
import { TaskCard } from './TaskCard';
import { Circle, Clock, CheckCircle2, PauseCircle, Plus } from 'lucide-react';

interface TaskKanbanViewProps {
  tasks: Task[];
  onToggleComplete: (task: Task) => void;
  onOpenDetail: (task: Task) => void;
  onOpenPhotoLightbox: (task: Task, photoIndex: number) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onAddNewToStatus?: (status: TaskStatus) => void;
}

const COLUMNS: { status: TaskStatus; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
  {
    status: 'todo',
    label: 'Belum Dimulai',
    icon: <Circle size={15} />,
    color: 'text-gray-700 dark:text-gray-300',
    bg: 'bg-gray-100/80 dark:bg-gray-800/80',
  },
  {
    status: 'in_progress',
    label: 'Sedang Dikerjakan',
    icon: <Clock size={15} />,
    color: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-50/80 dark:bg-blue-950/40',
  },
  {
    status: 'completed',
    label: 'Selesai',
    icon: <CheckCircle2 size={15} />,
    color: 'text-orange-700 dark:text-orange-400',
    bg: 'bg-orange-50/80 dark:bg-orange-950/40',
  },
  {
    status: 'paused',
    label: 'Ditunda',
    icon: <PauseCircle size={15} />,
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-50/80 dark:bg-amber-950/40',
  },
];

export const TaskKanbanView: React.FC<TaskKanbanViewProps> = ({
  tasks,
  onToggleComplete,
  onOpenDetail,
  onOpenPhotoLightbox,
  onUpdateStatus,
  onAddNewToStatus,
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: TaskStatus, e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onUpdateStatus(taskId, status);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-6 overflow-x-auto">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.status);

        return (
          <div
            key={col.status}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(col.status, e)}
            className="flex flex-col bg-gray-50/60 dark:bg-gray-900/40 rounded-3xl p-3 border border-gray-100 dark:border-gray-800 min-h-[500px]"
          >
            {/* Column Header */}
            <div className={`p-3 rounded-2xl flex items-center justify-between mb-3 ${col.bg}`}>
              <div className="flex items-center gap-2">
                <span className={col.color}>{col.icon}</span>
                <h4 className={`text-xs font-bold ${col.color}`}>{col.label}</h4>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/70 dark:bg-gray-900/60 text-gray-700 dark:text-gray-300">
                {columnTasks.length}
              </span>
            </div>

            {/* Task Cards Column */}
            <div className="flex-1 max-h-[580px] overflow-y-auto pr-1 space-y-3">
              {columnTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', task.id)}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <TaskCard
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onOpenDetail={onOpenDetail}
                    onOpenPhotoLightbox={onOpenPhotoLightbox}
                  />
                </div>
              ))}

              {columnTasks.length === 0 && (
                <div className="h-32 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl flex items-center justify-center text-xs text-gray-400">
                  Tarik tugas ke kolom ini
                </div>
              )}
            </div>

            {/* Add Button */}
            {onAddNewToStatus && (
              <button
                type="button"
                onClick={() => onAddNewToStatus(col.status)}
                className="mt-3 py-2 px-3 border border-dashed border-gray-200 dark:border-gray-700 hover:border-[#FF5A1F] rounded-xl text-xs font-semibold text-gray-500 hover:text-[#FF5A1F] dark:hover:text-[#ff7438] flex items-center justify-center gap-1.5 transition"
              >
                <Plus size={14} /> Tambah Tugas
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
