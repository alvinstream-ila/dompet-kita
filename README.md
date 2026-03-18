# 💰 Dompet Kita (Production Edition)

Aplikasi pencatatan keuangan premium untuk **Alvin & Ila**. Proyek ini telah melewati fase transformasi total ke arsitektur **API-First** yang modern, aman, dan siap pakai.

---

## 🌐 Live URLs
- **Frontend (Production)**: [https://dompet-kita-woad.vercel.app/](https://dompet-kita-woad.vercel.app/)
- **Backend API (Production)**: [https://dompet-kita-official.up.railway.app/](https://dompet-kita-official.up.railway.app/)

## 🏗️ Digital Infrastructure
Aplikasi ini berjalan di ekosistem cloud modern:
1.  **Frontend**: React 19 (Vite) di-host di **Vercel** dengan SPA routing.
2.  **Backend**: Laravel 11 (PHP 8.4) di-host di **Railway** (Singapore Region).
3.  **Database**: Managed PostgreSQL di **Supabase**.
4.  **Security**: Proteksi berlapis (CORS, CSP, XSS protection, RLS).

## 🚀 Fitur Unggulan
- **Dashboard Glassmorphism**: Visualisasi data premium dengan Framer Motion.
- **Security Hardening**: Audit keamanan backend & frontend telah selesai dilakukan.
- **Smart Connectivity**: Koneksi otomatis antara Vercel dan Railway dengan konfigurasi CORS yang aman.
- **AI-Ready**: Terintegrasi dengan Google Gemini 1.5 Flash (Coming Soon).

## 📜 Dokumentasi Produksi
Semua log pengembangan dan audit keamanan tersedia di folder `docs/`:
- [docs/FINAL_WALKTHROUGH.md](./docs/FINAL_WALKTHROUGH.md) - Rekapitulasi fitur & hasil testing.
- [docs/SECURITY_AUDIT.md](./docs/SECURITY_AUDIT.md) - Laporan hardening keamanan.
- [docs/PRODUCTION_LOGS.md](./docs/PRODUCTION_LOGS.md) - Detail perjalanan pengembangan fase 1-12.

## 🛠️ Pengembangan Lokal
Jika ingin menjalankan secara lokal:
1. **Root**: `npm run install-all`
2. **Frontend**: `npm run dev` (dari root)
3. **Backend**: `php artisan serve` (dari folder `backend/`)

---
*Dibuat dengan ❤️ untuk masa depan Alvin & Ila. Project Status: **LIVE***
