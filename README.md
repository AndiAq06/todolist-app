# 🌟 Daily Todo List — Personal Productivity & Photo Documentation App

Aplikasi produktivitas pribadi modern, elegan, responsif, dan lengkap yang dibangun dengan arsitektur **Next.js Full-Stack (Node.js Backend)**. Dirancang khusus untuk pengelolaan tugas harian, pencatatan jurnal refleksi, habit tracker, kalender interaktif, serta **dokumentasi foto & lampiran bukti kegiatan**.

Aplikasi ini siap dijalankan secara lokal maupun di-deploy langsung ke **Vercel** dalam 1 klik.

---

## 📸 Fitur Utama yang Telah Diimplementasikan

### 1. 🖼️ Dokumentasi Foto & Lampiran per Tugas (Fitur Prioritas)
- **Multi-Photo Upload**: Unggah beberapa foto sekaligus per tugas dengan tampilan drag-and-drop atau tombol kamera/file.
- **Kompresi Otomatis**: Dilengkapi modul kompresi gambar berbasis HTML5 Canvas di sisi peramban (`compressImage`) untuk menghemat ruang penyimpanan server tanpa mengurangi ketajaman visual.
- **Lightbox Layar Penuh**: Klik foto thumbnail untuk membuka lightbox interaktif dengan navigasi berikutnya/sebelumnya, perbesaran (zoom in/out), unduh file asli, dan keterangan (*caption*).
- **Lampiran Dokumen**: Mendukung PDF, DOCX, XLSX, dan TXT dengan ukuran aman.
- **Jurnal Progres Tugas**: Tambahkan catatan kemajuan berulang kali dilengkapi tanggal, catatan hasil, dan foto dokumentasi bukti kegiatan.

### 2. ☀️ Dashboard Harian & Produktivitas
- **Sapaan Waktu Otomatis**: "Selamat Pagi", "Selamat Siang", "Selamat Sore", atau "Selamat Malam" sesuai jam lokal.
- **Target Produktivitas & Circular Gauge**: Menghitung persentase pencapaian target harian secara dinamis.
- **Widget "Fokus Hari Ini"**: Memilih maksimal 3 tugas paling penting untuk diselesaikan terlebih dahulu dilengkapi efek selebrasi konfeti.
- **Widget Pomodoro Timer**: Countdown interaktif (25 menit fokus, 5 menit istirahat pendek, 15 menit istirahat panjang) dengan kontrol Play/Pause, Reset, dan penambahan waktu.
- **Afirmasi Harian & Mood Tracker**: Kutipan motivasi harian dan selektor kondisi emosi (Semangat, Senang, Biasa, Lelah, Stres).
- **Catatan Cepat (Quick Notes)**: Lembar coretan instan dengan fitur *autosave* otomatis saat mengetik.

### 3. 📋 Manajemen Tugas Lengkap (CRUD + Multi-View)
- **Tiga Pilihan Tampilan**:
  - **Daftar (List View)**: Ringkas dengan indikator prioritas, badge kategori, checklist bar, dan thumbnail foto.
  - **Kanban Board**: Kolom interaktif *Belum Dimulai*, *Sedang Dikerjakan*, *Selesai*, dan *Ditunda* dengan fitur drag-and-drop.
  - **Grid Card Gallery**: Tampilan kartu visual dengan foto dokumentasi berukuran besar.
- **Natural Language Quick Add**: Ketik teks natural seperti:
  > *"Evaluasi proyek mingguan besok jam 14.00 penting"*
  Sistem secara otomatis mendeteksi judul, tanggal, waktu, prioritas, dan kategori secara *real-time*.
- **Subtugas / Checklist**: Tambah, centang, dan lacak progres persentase checklist.
- **Aksi Massal (Bulk Action)**: Pilih beberapa tugas sekaligus untuk diselesaikan atau dihapus ke tempat sampah.
- **Filter & Urutan**: Filter berdasarkan kategori, status, prioritas, serta pencarian judul/deskripsi/tag.

### 4. 📅 Kalender Interaktif
- Tampilan Bulanan, Mingguan, dan Agenda.
- Klik tanggal untuk melihat seluruh agenda pada hari tersebut atau langsung membuat tugas baru pada tanggal yang dipilih.

### 5. ⚡ Habit Tracker (Pelacak Kebiasaan)
- Lacak kebiasaan harian (misal: *Belajar Bahasa Inggris*, *Membaca Buku*, *Olahraga*, dll.).
- Checklist interaktif 7 hari terakhir.
- Perhitungan otomatis streak (hari berturut-turut 🔥) dan persentase konsistensi mingguan.

### 6. 📖 Jurnal Harian & Evaluasi Refleksi
- Template refleksi terstruktur: *Ringkasan Aktivitas*, *Hal yang Berhasil*, *Kendala/Hambatan*, *Pelajaran Berharga*, dan *Rencana Besok*.
- Lampiran foto kenangan harian dan mood tracking.
- Pencarian dan filter riwayat jurnal berdasarkan tanggal atau kata kunci.

### 7. 📊 Statistik & Tren Produktivitas
- Grafik batang SVG tren tugas selesai vs direncanakan.
- Diagram distribusi beban kerja berdasarkan kategori.
- Tingkat penyelesaian (*completion rate*) aktual tanpa data dummy palsu.

### 8. 📁 Arsip & Tempat Sampah (Recycle Bin)
- Soft-delete ke tempat sampah dengan opsi pemulihan (*restore*).
- Penghapusan permanen dengan konfirmasi keamanan.
- Tab arsip untuk menyimpan tugas lama yang telah selesai.

### 9. ⚙️ Pengaturan, Ekspor & Impor Cadangan (Backup)
- Mode Terang (Light Mode) dan Mode Gelap (Dark Mode).
- **Ekspor JSON Penuh**: Mengunduh seluruh database (tugas, checklist, link foto, kebiasaan, jurnal) dalam 1 file.
- **Ekspor CSV**: Format spreadsheet siap buka di Microsoft Excel atau Google Sheets.
- **Impor Backup**: Pulihkan data kapan saja dari file backup JSON yang divalidasi.
- **Reset Demo**: Opsi memuat ulang data contoh berbahasa Indonesia.

---

## 🛠️ Arsitektur & Teknologi

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS.
- **Ikon**: Lucide React.
- **Animasi & Interaksi**: Canvas Confetti, Date-fns.
- **Backend API**: Node.js Route Handlers (`/api/tasks`, `/api/habits`, `/api/journals`, `/api/upload`, `/api/backup`, `/api/profile`).
- **Penyimpanan Data**: Database JSON lokal (`.data/db.json`) dengan operasi *atomic read/write* dan fallback memori yang kompatibel dengan arsitektur serverless Vercel.
- **Penyimpanan Foto**: Server-side storage di folder `public/uploads` dengan metadata lengkap (nama file, MIME type, ukuran, caption, tanggal upload).

---

## 🚀 Panduan Menjalankan Secara Lokal

### Prasyarat
- Node.js versi 18 ke atas (Direkomendasikan Node.js v20+)
- npm / pnpm / yarn

### Langkah Instalasi
1. Buka terminal pada folder proyek:
   ```bash
   cd "d:/TODOLIST APP"
   ```

2. Instal dependensi:
   ```bash
   npm install
   ```

3. Jalankan server pengembangan (dev server):
   ```bash
   npm run dev
   ```

4. Buka peramban di [http://localhost:3000](http://localhost:3000).

5. Untuk membuat build produksi:
   ```bash
   npm run build
   npm start
   ```

---

## ☁️ Panduan Deployment ke Vercel

Karena aplikasi ini dibangun secara murni menggunakan **Next.js Full-Stack (Node.js)**, aplikasi ini 100% kompatibel dengan Vercel:

### Opsi 1: Menggunakan Vercel CLI
```bash
npm install -g vercel
vercel
```

### Opsi 2: Menggunakan GitHub / Git Repository
1. Inisialisasi dan push repository ke GitHub:
   ```bash
   git add .
   git commit -m "feat: complete daily todo list productivity app"
   git push origin main
   ```
2. Buka [https://vercel.com](https://vercel.com), klik **"Add New Project"** dan impor repository GitHub Anda.
3. Vercel akan secara otomatis mendeteksi framework **Next.js** dan file `vercel.json`.
4. Klik **"Deploy"**. Dalam ~1 menit aplikasi Anda sudah aktif di internet!

---

## 📁 Struktur Folder Proyek

```
TODOLIST APP/
├── .data/                     # Database lokal JSON (db.json)
├── public/
│   ├── uploads/               # Direktori penyimpanan file & foto
│   └── manifest.json          # Konfigurasi PWA Mobile
├── src/
│   ├── app/
│   │   ├── api/               # Endpoint REST API (Node.js)
│   │   │   ├── backup/        # Export & Import JSON
│   │   │   ├── categories/    # Kategori CRUD
│   │   │   ├── habits/        # Habit Tracker API & Streaks
│   │   │   ├── journals/      # Jurnal Harian API
│   │   │   ├── profile/       # Profil & Quick Notes API
│   │   │   ├── tasks/         # Tugas CRUD, Bulk, & Progress Log
│   │   │   └── upload/        # Multipart Upload Foto & Dokumen
│   │   ├── globals.css        # Token desain Tailwind, Emerald & Navy
│   │   ├── layout.tsx         # Root Layout, Metadata, & Viewport
│   │   └── page.tsx           # Halaman Utama (Dashboard & Tab Switcher)
│   ├── components/
│   │   ├── archive/           # View Arsip & Tempat Sampah
│   │   ├── attachments/       # PhotoLightbox & PhotoUploadZone
│   │   ├── calendar/          # Kalender Bulanan/Mingguan/Agenda
│   │   ├── dashboard/         # FocusWidget, PomodoroWidget, Affirmation, QuickNotes
│   │   ├── habits/            # HabitTrackerView
│   │   ├── journal/           # DailyJournalView
│   │   ├── layout/            # Sidebar (Desktop/Mobile) & Navbar
│   │   ├── settings/          # SettingsView (Backup, Profil, Mode Gelap)
│   │   ├── stats/             # ProductivityInsights
│   │   └── tasks/             # TaskListView, TaskKanbanView, TaskGridView, Modals
│   ├── lib/
│   │   ├── constants.ts       # Default Kategori, Profil, & Afirmasi
│   │   ├── image-utils.ts     # Kompresi Canvas & Validasi Foto
│   │   ├── nlp-parser.ts      # Parser Bahasa Indonesia untuk Quick Add
│   │   └── server-storage.ts  # Mesin Database Server JSON
│   └── types/
│       └── index.ts           # Definisi Tipe TypeScript
├── vercel.json                # Konfigurasi Deployment Vercel
├── .env.example               # Contoh Konfigurasi Environment
└── package.json               # Dependensi & Script Proyek
```

---

## 🔒 Keamanan & Penyimpanan File
- Validasi tipe MIME dan batas ukuran file (maks 15MB) di sisi klien maupun server.
- Sanitasi nama file untuk mencegah directory traversal.
- Tidak menyimpan string Base64 langsung ke database, melainkan menyimpan metadata file dan URI penyimpanan.
- Mendukung integrasi opsional ke cloud object storage seperti AWS S3, Cloudflare R2, atau Supabase Storage melalui environment variables.
