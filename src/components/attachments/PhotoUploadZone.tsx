'use client';

import React, { useState, useRef } from 'react';
import { Attachment } from '@/types';
import { compressImage, formatFileSize, ALLOWED_IMAGE_TYPES, ALLOWED_DOC_TYPES, MAX_FILE_SIZE } from '@/lib/image-utils';
import { UploadCloud, Image as ImageIcon, FileText, X, CheckCircle2, Loader2, Camera } from 'lucide-react';

interface PhotoUploadZoneProps {
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
  maxFiles?: number;
}

export const PhotoUploadZone: React.FC<PhotoUploadZoneProps> = ({
  attachments,
  onAttachmentsChange,
  maxFiles = 10,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFiles = async (files: FileList | File[]) => {
    setErrorMessage(null);
    if (!files || files.length === 0) return;

    if (attachments.length + files.length > maxFiles) {
      setErrorMessage(`Maksimal ${maxFiles} lampiran per tugas.`);
      return;
    }

    setIsUploading(true);
    setUploadProgressText('Mengompres dan memvalidasi file...');

    try {
      const formData = new FormData();
      const newAttachments: Attachment[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (file.size > MAX_FILE_SIZE) {
          setErrorMessage(`File ${file.name} melebihi batas 15MB.`);
          continue;
        }

        const isImage = file.type.startsWith('image/');
        const isAllowedDoc = ALLOWED_DOC_TYPES.includes(file.type);

        if (!isImage && !isAllowedDoc) {
          setErrorMessage(`Tipe file ${file.name} tidak didukung (gunakan JPG, PNG, WEBP, PDF, DOCX, XLSX).`);
          continue;
        }

        if (isImage) {
          setUploadProgressText(`Mengompres gambar ${file.name}...`);
          try {
            const compressed = await compressImage(file, 1600, 1600, 0.82);
            formData.append('files', compressed.file);
          } catch (compErr) {
            console.warn('Fallback to original file on compression failure:', compErr);
            formData.append('files', file);
          }
        } else {
          formData.append('files', file);
        }
      }

      setUploadProgressText('Menyimpan file ke server...');

      // Call API upload endpoint
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengunggah file.');
      }

      if (data.attachments && Array.isArray(data.attachments)) {
        onAttachmentsChange([...attachments, ...data.attachments]);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Terjadi kesalahan saat mengunggah file.');
    } finally {
      setIsUploading(false);
      setUploadProgressText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const removeAttachment = (id: string) => {
    onAttachmentsChange(attachments.filter((a) => a.id !== id));
  };

  const updateCaption = (id: string, newCaption: string) => {
    onAttachmentsChange(
      attachments.map((a) => (a.id === id ? { ...a, caption: newCaption } : a))
    );
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
          isDragging
            ? 'border-[#FF5A1F] bg-orange-50/50 dark:bg-orange-950/20'
            : 'border-gray-200 dark:border-gray-800 hover:border-[#FF5A1F] bg-white/60 dark:bg-gray-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="p-3 bg-orange-100 dark:bg-orange-900/40 text-[#FF5A1F] dark:text-[#ff7438] rounded-full">
            {isUploading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <UploadCloud size={24} />
            )}
          </div>

          <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {isUploading ? (
              <span className="text-[#FF5A1F] dark:text-[#ff7438] font-semibold">
                {uploadProgressText}
              </span>
            ) : (
              <span>Tarik dan lepaskan foto/dokumen di sini, atau klik tombol di bawah</span>
            )}
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Mendukung JPG, PNG, WEBP, PDF, DOCX (Maksimal 15MB, kompresi otomatis)
          </p>

          {!isUploading && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF5A1F] hover:bg-[#e54c14] text-white rounded-xl text-xs font-semibold shadow-sm transition"
              >
                <ImageIcon size={14} />
                Pilih Foto & File
              </button>

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-semibold transition"
              >
                <Camera size={14} />
                Ambil dari Kamera
              </button>
            </div>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="p-1 hover:bg-red-100 rounded">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Uploaded Attachments Grid & Captions */}
      {attachments.length > 0 && (
        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Lampiran Terpasang ({attachments.length})
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-start gap-3 p-2.5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm relative group"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 flex-shrink-0 flex items-center justify-center border border-gray-100 dark:border-gray-800">
                  {att.fileType === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={att.url}
                      alt={att.originalName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileText className="text-gray-400" size={24} />
                  )}
                </div>

                {/* Details & Caption Input */}
                <div className="flex-1 min-w-0 pr-6">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                    {att.originalName}
                  </p>
                  <p className="text-[10px] text-gray-400 mb-1.5">
                    {formatFileSize(att.fileSize)}
                  </p>

                  <input
                    type="text"
                    value={att.caption || ''}
                    onChange={(e) => updateCaption(att.id, e.target.value)}
                    placeholder="Tambah keterangan foto..."
                    className="w-full text-xs px-2 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF5A1F]"
                  />
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  title="Hapus Lampiran"
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition"
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
