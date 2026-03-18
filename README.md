# 💰 Dompet Kita (Evolution Edition)

Aplikasi pencatatan keuangan premium untuk **Alvin & Ila**. Dibangun dengan estetika modern, glassmorphism, dan arsitektur **API-First** yang kokoh.

---

## 🏗️ Arsitektur Baru
Aplikasi ini sekarang menggunakan sistem **Dual-Stack**:
1.  **Frontend (React)**: Antarmuka pengguna yang cantik dan responsif di-host di Vercel.
2.  **Backend (Laravel)**: Mesin logika bisnis dan API terpusat di Railway (Region Singapore - asia-southeast1).
3.  **Database (Supabase)**: Jantung penyimpanan data PostgreSQL dengan RLS aktif.
4.  **Storage (Storj)**: Gudang penyimpanan file (struk/foto) desentralisasi.

## 🚀 Fitur Unggulan
- **Dashboard Interaktif**: Gauge chart kesehatan keuangan yang adaptif.
- **Pencatatan Transaksi**: Integrasi langsung ke Laravel API dengan validasi ketat.
- **Laporan Otomatis**: Ringkasan bulanan yang di-generate oleh mesin backend.
- **Security-First**: Proteksi data berlapis menggunakan Laravel Sanctum dan Supabase RLS.
- **AI-Powered**: Integrasi Google Gemini untuk analisis pengeluaran (Coming Soon).

## 🛠️ Tech Stack
-   **Frontend**: React 19, Vite, TypeScript, Tailwind CSS v4, Framer Motion.
-   **Backend**: Laravel 11 (PHP 8.4), Sanctum, Pest Testing.
-   **Database**: Supabase (PostgreSQL).
-   **Storage**: Storj Cloud (S3-Compatible) Object Storage.
-   **Infrastructure**: Railway (Backend), Vercel (Frontend).

## 📦 Menjalankan Project

Semua perintah sekarang bisa dijalankan langsung dari folder utama (root):

*   **Instalasi**: `npm run install-all` (Frontend & Backend)
*   **Jalankan Frontend**: `npm run dev`
*   **Jalankan Backend**: `npm run backend`
*   **Update Database**: `npm run migrate`

Untuk detail struktur folder, silakan cek [docs/FOLDER_STRUCTURE.md](./docs/FOLDER_STRUCTURE.md).

## 📜 Dokumentasi Penting
-   [docs/RULES.md](./docs/RULES.md) - Aturan emas pembangunan.
-   [docs/SECURITY_SYSTEM.md](./docs/SECURITY_SYSTEM.md) - Detail sistem keamanan.
-   [docs/FOLDER_STRUCTURE.md](./docs/FOLDER_STRUCTURE.md) - Peta folder project.

---
*Dibuat dengan ❤️ untuk masa depan Alvin & Ila.*
