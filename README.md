# 💰 Dompet Kita (Elite Monorepo Edition)

Aplikasi pencatatan keuangan premium untuk **Alvin & Ila**. Proyek ini menggunakan arsitektur **API-First** modern dengan standar infrastruktur kelas dunia, CLI AI Autopilot, dan sistem keamanan berlapis setara perbankan.

---

## 🌐 Live URLs

- **Frontend (Production)**: [https://dompet-kita-six.vercel.app/](https://dompet-kita-six.vercel.app/)
- **Backend API (Production)**: [https://dompet-kita-production.up.railway.app/](https://dompet-kita-production.up.railway.app/)

---

## 🏗️ Digital Infrastructure & Cloud

| Layer | Technology |
|:------|:-----------|
| **Frontend** | React 19 + Vite 6.x → Vercel (Singapore) |
| **Backend** | Laravel 12 + PHP 8.4 → Railway (Singapore) |
| **Database** | PostgreSQL + RLS → Supabase |
| **Storage** | S3-Compatible → Storj (Distributed) |
| **AI** | Google Gemini AI (Insights & Autopilot) |
| **Monitoring** | Sentry (Error Tracking) |
| **MCP** | Custom Dompet Kita MCP v3.0 (AI Bridge) |

---

## 🔐 Bank-Grade Security (The Fortress)

Dompet Kita dirancang dengan **Defense-in-Depth** — 7 lapis pertahanan:

| # | Lapisan | Implementasi |
|:--|:--------|:-------------|
| 1 | **Row Level Security** | RLS aktif di semua tabel PostgreSQL |
| 2 | **Field Encryption** | AES-256-CBC Encrypted Casts (Google ID, Partner, Descriptions) |
| 3 | **Private Storage** | Storj Private Vault + Temporal Signed URLs (15 menit) |
| 4 | **Honeypot** | `spatie/laravel-honeypot` — memblokir bot otomatis |
| 5 | **Rate Limiting** | Throttle 5x/menit pada endpoint sensitif |
| 6 | **Audit Trail** | `spatie/laravel-activitylog` — CCTV digital setiap perubahan data |
| 7 | **Device Tracking** | Login History (IP + User Agent) setiap akses masuk |

---

## 🤖 Advanced CLI Suite (The Command Center)

Dompet Kita memiliki ekosistem **CLI mutakhir** yang bisa melakukan perbaikan mandiri dan analisis finansial.

### ⚡ Backend (Artisan)

| Command | Kategori | Deskripsi |
|:--------|:---------|:----------|
| `php artisan maintenance:verify` | 🔍 Audit | Sistem audit menyeluruh (Pint, PHPStan, Enlightn, Rector) |
| `php artisan maintenance:repair` | 🤖 AI Autopilot | Auto-fix error via Gemini AI |
| `php artisan security:gate` | 🛡️ Pre-Commit | Blokir commit jika skor keamanan < 90/100 |
| `php artisan security:gate --min-score=95` | 🛡️ Pre-Commit | Custom threshold |
| `php artisan honeypot:audit` | 🕸️ Radar | Visualisasi bot attack dari Honeypot logs |
| `php artisan cloud:status` | 🛰️ DevOps | Status real-time Railway, Supabase, Storj |
| `php artisan cfo:analyze` | 💰 CFO AI | Analisis transaksi bulanan + saran strategis Gemini |
| `php artisan cfo:forecast --months=12` | 📈 CFO AI | Proyeksi kekayaan N bulan ke depan |
| `php artisan app:wealth-status` | 📊 Dashboard | Snapshot aset, goals, dan utang |
| `php artisan app:security-audit` | 🔐 Security | Scanner login mencurigakan + skor sistem |
| `php artisan app:database-optimize` | 🧹 Maintenance | Bersihkan cache & log lama |
| `php artisan app:storage-manage list` | ☁️ Storage | Kelola file Cloud Storj |

### 🎨 Frontend (npm)

| Command | Deskripsi |
|:--------|:----------|
| `npm run design:audit` | Scan komponen untuk "Generic Color" trap |
| `npm run seo:check` | Validasi Title, Meta Description, H1 per halaman |
| `npm run secure:assets` | Pastikan semua gambar menggunakan Signed URLs |
| `npm run ci:frontend-check` | Jalankan ketiganya sekaligus (CI Pipeline) |

---

## 🔌 MCP Server (AI Bridge) v3.0

MCP Server kita bertindak sebagai **jembatan murni** antara AI Agent dan CLI Artisan.

Tools yang tersedia untuk AI:
`get_financial_status`, `budget_guard`, `loan_tracker`, `asset_manage`, `goal_check`, `holiday_plan`, `system_status`, `security_scan`, `cloud_sync_check`, `storage_assistant`, `penpot_assistant`, `maintenance_tool`, **`security_gate`**, **`honeypot_radar`**, **`cfo_forecast`**, **`maintenance_repair`**

---

## 💂 Git Hooks (Husky) — Pre-Commit Pipeline

Setiap `git commit` akan menjalankan pipeline ini secara otomatis:

```
git commit
  └─▶ 🛡️ security:gate --min-score=90  (blokir jika sistem tidak sehat)
  └─▶ ✨ lint-staged
        ├─ Frontend: Prettier (format otomatis)
        └─ Backend: maintenance:verify (audit cepat)
```

---

## 🚀 Memulai Pengembangan Lokal

```bash
# 1. Clone & Setup
git clone <repo-url>
npm run setup

# 2. Jalankan Dev Server (Frontend + Backend paralel)
npm run start

# 3. Audit sistem sebelum push
php backend/artisan maintenance:verify
npm run ci:frontend-check --prefix frontend
```

---

## 📚 Dokumentasi Lanjutan

| Dokumen | Deskripsi |
|:--------|:----------|
| [docs/cli_roadmap.md](./docs/cli_roadmap.md) | Roadmap & status CLI mutakhir |
| [docs/TECHNICAL_DOCUMENTATION.md](./docs/TECHNICAL_DOCUMENTATION.md) | Detail stack teknis |
| [docs/SECURITY_OVERVIEW.md](./docs/SECURITY_OVERVIEW.md) | Strategi keamanan berlapis |
| [docs/MASTER_GUIDE_DATABASE.md](./docs/MASTER_GUIDE_DATABASE.md) | Panduan database & migrasi |
| [docs/RULES.md](./docs/RULES.md) | Aturan pengembangan |

---

_Dibuat dengan ❤️ untuk masa depan Alvin & Ila. Dijaga otomatis oleh **Husky + Security Gate + Antigravity AI**._
