'use client';

import React, { useState, useRef } from 'react';
import { UserProfile, AppData } from '@/types';
import {
  Settings,
  User,
  Moon,
  Sun,
  Download,
  Upload,
  RefreshCw,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface SettingsViewProps {
  profile: UserProfile;
  onUpdateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  onExportJson: () => void;
  onExportCsv: () => void;
  onImportJson: (file: File) => Promise<void>;
  onResetDemoData: () => Promise<void>;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onUpdateProfile,
  onExportJson,
  onExportCsv,
  onImportJson,
  onResetDemoData,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [name, setName] = useState(profile.name);
  const [title, setTitle] = useState(profile.title);
  const [dailyGoal, setDailyGoal] = useState(profile.dailyGoal || 5);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Sync state whenever profile updates (e.g. upon login or user change)
  React.useEffect(() => {
    setName(profile.name || '');
    setTitle(profile.title || '');
    setDailyGoal(profile.dailyGoal || 5);
  }, [profile.name, profile.title, profile.dailyGoal]);

  const importFileRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await onUpdateProfile({
        name,
        title,
        dailyGoal: Number(dailyGoal),
      });
      setStatusMessage('Profil berhasil diperbarui!');
    } catch (err) {
      setStatusMessage('Gagal memperbarui profil.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        await onImportJson(file);
        alert('Data backup berhasil diimpor!');
      } catch (err: any) {
        alert(err.message || 'Gagal mengimpor file backup.');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700/60 shadow-sm flex items-center gap-3">
        <div className="p-3 bg-orange-100 dark:bg-orange-950/40 text-[#FF5A1F] dark:text-[#ff7438] rounded-2xl">
          <Settings size={24} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Pengaturan & Cadangan Data (Backup)
          </h2>
          <p className="text-xs text-gray-400">
            Atur profil personal, preferensi tampilan, serta ekspor & impor seluruh database Anda.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 text-orange-900 dark:text-orange-300 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 1. Profil Pengguna */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700/60 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
          <User size={18} className="text-[#FF5A1F]" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Profil Personal</h3>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Nama Pengguna
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Gelar / Peran
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Profesional / Mahasiswa / Freelancer"
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] font-medium"
              />
            </div>

            {profile.email && (
              <div className="sm:col-span-2">
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Email Akun Terdaftar
                </label>
                <input
                  type="email"
                  disabled
                  value={profile.email}
                  className="w-full p-2.5 bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 font-medium cursor-not-allowed"
                />
              </div>
            )}
          </div>

          <div>
            <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
              Target Jumlah Tugas Harian
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              className="w-40 p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] font-medium"
            />
            <span className="text-[11px] text-gray-400 ml-2">tugas per hari (untuk gauge produktivitas)</span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-[#FF5A1F] hover:bg-[#e54c14] text-white rounded-xl font-bold shadow-md shadow-orange-500/20 transition"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Profil'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Tampilan & Mode Gelap */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700/60 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            {isDarkMode ? <Moon size={18} className="text-purple-400" /> : <Sun size={18} className="text-amber-500" />}
            Mode Gelap & Terang
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Sesuaikan kenyamanan mata dengan beralih tema antarmuka
          </p>
        </div>

        <button
          onClick={onToggleDarkMode}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold transition flex items-center gap-2"
        >
          {isDarkMode ? (
            <>
              <Sun size={15} /> Mode Terang
            </>
          ) : (
            <>
              <Moon size={15} /> Mode Gelap
            </>
          )}
        </button>
      </div>

      {/* 3. Ekspor & Impor Cadangan (Backup) */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700/60 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-700">
          <HardDrive size={18} className="text-blue-500" />
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Cadangan Data & Ekspor (JSON & CSV)
            </h3>
            <p className="text-xs text-gray-400">
              Amankan seluruh riwayat tugas, foto dokumentasi, dan catatan refleksi ke perangkat lokal.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export JSON */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 mb-1">
                Ekspor Database Penuh (JSON)
              </h4>
              <p className="text-[11px] text-gray-400 mb-3">
                Menyimpan seluruh data (tugas, checklist, link foto, kebiasaan, jurnal) untuk backup lengkap.
              </p>
            </div>
            <button
              onClick={onExportJson}
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-[#FF5A1F] hover:bg-[#e54c14] text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Download size={14} /> Ekspor File Backup JSON
            </button>
          </div>

          {/* Export CSV */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 mb-1">
                Ekspor Tugas ke CSV (Excel)
              </h4>
              <p className="text-[11px] text-gray-400 mb-3">
                Format tabel spreadsheet untuk diolah di Microsoft Excel atau Google Spreadsheet.
              </p>
            </div>
            <button
              onClick={onExportCsv}
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <FileSpreadsheet size={14} /> Unduh CSV Spreadsheet
            </button>
          </div>
        </div>

        {/* Import JSON */}
        <div className="pt-2">
          <input
            ref={importFileRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300">
                Pulihkan dari File Backup (Impor JSON)
              </h4>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-400">
                Pilih file JSON backup yang sebelumnya telah Anda unduh untuk mengembalikan data.
              </p>
            </div>

            <button
              onClick={() => importFileRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex-shrink-0"
            >
              <Upload size={14} /> Pilih File JSON
            </button>
          </div>
        </div>

        {/* Reset Demo Data Button */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Reset ke Data Sampel Demo
            </h4>
            <p className="text-[11px] text-gray-400">
              Mengembalikan tugas awal, kebiasaan, dan jurnal contoh Indonesia jika Anda ingin mencoba ulang fitur.
            </p>
          </div>

          <button
            onClick={() => {
              if (confirm('Muat ulang data contoh awal? Data custom saat ini akan digantikan dengan data demo.')) {
                onResetDemoData();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition"
          >
            <RefreshCw size={13} /> Reset Demo
          </button>
        </div>
      </div>
    </div>
  );
};
