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

---

## 💎 Technical Documentation

### 🏦 Backend Architecture
**Dompet Kita** adalah sistem API-driven yang tangguh untuk mengelola data keuangan kompleks (Income/Expense, Asset, Loans, Planning).

| Component | Technology |
| :--- | :--- |
| **Language** | PHP 8.2+ |
| **Framework** | Laravel 11.x |
| **Database** | PostgreSQL (Supabase) |
| **Auth** | Laravel Sanctum & Socialite (Google) |
| **AI** | Google Gemini AI (via AIController) |

**Key Intelligence**:
- **Gatekeeper Logic**: Mesin wawasan yang berinteraksi berdasarkan saldo 30 hari terakhir.
- **Database Model**: Skema terstruktur untuk `users`, `transactions`, `assets`, `loans`, `goals`, dan `holidays`.
- **API Security**: Semua endpoint publik dilindungi oleh Laravel Sanctum (Bearer Token).

[Lihat Detail Backend Documentation](./docs/BACKEND.md)

---

### 🎨 Frontend Architecture
Frontend berfokus pada "Aesthetic Precision" dengan performa tinggi.

| Component | Technology |
| :--- | :--- |
| **Framework** | React 19 (Stable) |
| **Build Tool** | Vite 8.x |
| **Animations** | Framer Motion + Lottie |
| **3D Engine** | Three.js (@react-three/fiber) |
| **Styling** | Tailwind CSS 4.x + Shadcn/ui |

**Feature Spotlight**:
- **Glassmorphism Design System**: Menggunakan `backdrop-blur` dan gradien Indigo/Violet.
- **3D Wealth Tracker**: Visualisasi aset yang interaktif.
- **Real-time Query**: Menggunakan `TanStack Query (v5)` untuk sinkronisasi data yang efisien.

[Lihat Detail Frontend Documentation](./docs/FRONTEND.md)

---

## 📜 Dokumentasi Pendukung
Semua log pengembangan dan audit keamanan tersedia di folder `docs/`:
- [docs/TECHNICAL_DOCUMENTATION.md](./docs/TECHNICAL_DOCUMENTATION.md) - Gabungan dokumen teknis lengkap.
- [docs/FINAL_WALKTHROUGH.md](./docs/FINAL_WALKTHROUGH.md) - Rekapitulasi fitur & hasil testing.
- [docs/SECURITY_AUDIT.md](./docs/SECURITY_AUDIT.md) - Laporan hardening keamanan.
- [docs/PRODUCTION_LOGS.md](./docs/PRODUCTION_LOGS.md) - Detail perjalanan fase 1-12.

## 🛠️ Pengembangan Lokal
1. **Root**: `npm run install-all`
2. **Frontend**: `npm run dev` (dari root)
3. **Backend**: `php artisan serve` (dari folder `backend/`)

---
*Dibuat dengan ❤️ untuk masa depan Alvin & Ila. Project Status: **LIVE***
