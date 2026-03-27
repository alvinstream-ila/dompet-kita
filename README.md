# 💰 Dompet Kita (Production Edition)

Aplikasi pencatatan keuangan premium untuk **Alvin & Ila**. Proyek ini telah melewati fase transformasi total ke arsitektur **API-First** yang modern, aman, dan siap pakai.

---

## 🌐 Live URLs
- **Frontend (Production)**: [https://dompet-kita-six.vercel.app/](https://dompet-kita-six.vercel.app/)
- **Backend API (Production)**: [https://dompet-kita-production.up.railway.app/](https://dompet-kita-production.up.railway.app/)

## 🏗️ Digital Infrastructure
Aplikasi ini berjalan di ekosistem cloud modern:
1.  **Frontend**: React 19 (Vite) di-host di **Vercel** dengan SPA routing.
2.  **Backend**: Laravel 12 (PHP 8.4) di-host di **Railway** (Singapore Region).
3.  **Database**: Managed PostgreSQL di **Supabase** (Port 6543 Connection Pooler).
4.  **Storage**: S3-Compatible Storage via **Storj** (Distributed Cloud Storage).
5.  **Mail**: SMTP Transactional via **Gmail Official**.
6.  **Security**: Audit 0 Vulnerabilities, Sentry Error Tracking, & Proteksi Berlapis.

---

## 💎 Technical Documentation

### 🏦 Backend Architecture
**Dompet Kita** adalah sistem API-driven yang tangguh untuk mengelola data keuangan kompleks (Income/Expense, Asset, Loans, Planning).

| Component | Technology |
| :--- | :--- |
| **Language** | PHP 8.4 |
| **Framework** | Laravel 12.x |
| **Database** | PostgreSQL (Supabase) |
| **Auth** | Laravel Sanctum & Socialite (Google/Facebook) |
| **AI** | Google Gemini AI (Insight Generator) |
| **Mail** | SMTP Gmail (Secure SSL 465) |
| **Storage** | Storj (S3 Protocol) |

**Key Intelligence**:
- **Gatekeeper Logic**: Mesin wawasan yang berinteraksi berdasarkan saldo 30 hari terakhir.
- **Database Model**: Skema terstruktur untuk `users`, `transactions`, `assets`, `loans`, `goals`, dan `holidays`.
- **API Security**: Semua endpoint publik dilindungi oleh Laravel Sanctum (Bearer Token).

[Lihat Master Guide Database](./docs/MASTER_GUIDE_DATABASE.md)

---

### 🎨 Frontend Architecture
Frontend berfokus pada "Aesthetic Precision" dengan performa tinggi.

| Component | Technology |
| :--- | :--- |
| **Framework** | React 19 (Stable) |
| **Build Tool** | Vite 6.x |
| **State/Data** | TanStack Query v5 + Zustand |
| **Notifications** | Sonner (In-App Premium Glassmorphism) |
| **Animations** | Framer Motion (PopLayout & Layout Transitions) |
| **Styling** | Tailwind CSS 4.x (OKLCH Colors) |
| **Monitoring** | Sentry (Production Error Tracking) |

**Feature Spotlight**:
- **Dynamic Wealth Tracker**: Progress bar "Freedom" yang terhubung otomatis ke tabungan mimpi kita. ✨
- **Optimistic UI**: Penambahan data instan tanpa menunggu loading server (Assets & Goals).
- **In-App Notification**: Notifikasi premium di dalam aplikasi tanpa interupsi browser.
- **Aesthetic Error Boundary**: Halaman error yang cantik dan fungsional jika terjadi kendala teknis.

[Lihat Detail Technical Documentation](./docs/TECHNICAL_DOCUMENTATION.md)

---

## 📜 Dokumentasi Pendukung
Semua log pengembangan dan audit keamanan tersedia di folder `docs/`:
- [docs/TECHNICAL_DOCUMENTATION.md](./docs/TECHNICAL_DOCUMENTATION.md) - Dokumentasi teknis lengkap (Frontend & Backend).
- [docs/MASTER_GUIDE_DATABASE.md](./docs/MASTER_GUIDE_DATABASE.md) - Panduan tunggal database (Awam & Teknis).
- [docs/SECURITY_OVERVIEW.md](./docs/SECURITY_OVERVIEW.md) - Strategi & Laporan audit keamanan terbaru.
- [docs/PRODUCTION_LOGS.md](./docs/PRODUCTION_LOGS.md) - Detail perjalanan fase 1-13.
- [docs/FINAL_WALKTHROUGH.md](./docs/FINAL_WALKTHROUGH.md) - Rekapitulasi fitur & hasil testing.

## 🛠️ Pengembangan Lokal
1. **Root**: `npm run install-all`
2. **Frontend**: `npm run dev` (dari root)
3. **Backend**: `php artisan serve` (dari folder `backend/`)

---
*Dibuat dengan ❤️ untuk masa depan Alvin & Ila. Project Status: **LIVE & SECURED***
