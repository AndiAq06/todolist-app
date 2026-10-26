'use client';

import React, { useState, useEffect } from 'react';
import { Attachment } from '@/types';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Trash2, Calendar, FileText } from 'lucide-react';
import { formatFileSize } from '@/lib/image-utils';

interface PhotoLightboxProps {
  photos: Attachment[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  onDeletePhoto?: (photoId: string) => void;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  photos,
  initialIndex = 0,
  isOpen,
  onClose,
  onDeletePhoto,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoomLevel(1);
  }, [initialIndex, isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, photos.length]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex] || photos[0];

  const handleNext = () => {
    setZoomLevel(1);
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrev = () => {
    setZoomLevel(1);
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.3, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.3, 0.5));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md transition-opacity animate-in fade-in">
      {/* Top Header Toolbar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between text-white bg-gradient-to-b from-black/80 to-transparent z-10">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
            {currentIndex + 1} / {photos.length}
          </span>
          <span className="text-sm text-gray-300 truncate max-w-xs md:max-w-md">
            {currentPhoto.originalName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <button
            onClick={handleZoomOut}
            title="Perkecil"
            className="p-2 rounded-full hover:bg-white/20 transition text-gray-200"
          >
            <ZoomOut size={18} />
          </button>
          <button
            onClick={handleZoomIn}
            title="Perbesar"
            className="p-2 rounded-full hover:bg-white/20 transition text-gray-200"
          >
            <ZoomIn size={18} />
          </button>

          {/* Download Original */}
          <a
            href={currentPhoto.url}
            download={currentPhoto.originalName}
            target="_blank"
            rel="noreferrer"
            title="Unduh Foto"
            className="p-2 rounded-full hover:bg-white/20 transition text-gray-200"
          >
            <Download size={18} />
          </a>

          {/* Delete Photo */}
          {onDeletePhoto && (
            <button
              onClick={() => {
                if (confirm('Hapus foto ini dari tugas?')) {
                  onDeletePhoto(currentPhoto.id);
                  if (photos.length <= 1) {
                    onClose();
                  } else {
                    handleNext();
                  }
                }
              }}
              title="Hapus Foto"
              className="p-2 rounded-full hover:bg-red-500/30 text-red-400 hover:text-red-300 transition"
            >
              <Trash2 size={18} />
            </button>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            title="Tutup (Esc)"
            className="p-2 rounded-full bg-white/10 hover:bg-white/30 text-white transition ml-2"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Navigation Arrows */}
      {photos.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition border border-white/10 z-10"
            title="Foto Sebelumnya"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition border border-white/10 z-10"
            title="Foto Selanjutnya"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Center Image Container */}
      <div className="flex flex-col items-center justify-center max-w-full max-h-[85vh] p-4 select-none overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentPhoto.url}
          alt={currentPhoto.caption || currentPhoto.originalName}
          style={{ transform: `scale(${zoomLevel})` }}
          className="max-h-[75vh] max-w-full object-contain rounded-lg transition-transform duration-200 shadow-2xl"
        />

        {/* Caption & Metadata Footer */}
        <div className="mt-4 text-center max-w-xl text-gray-200 bg-black/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
          {currentPhoto.caption ? (
            <p className="text-sm font-medium text-white mb-1">{currentPhoto.caption}</p>
          ) : (
            <p className="text-xs text-gray-400 italic mb-1">Tidak ada keterangan (caption)</p>
          )}
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(currentPhoto.uploadedAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1">
              <FileText size={12} />
              {formatFileSize(currentPhoto.fileSize)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
