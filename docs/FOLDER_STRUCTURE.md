# 🗺️ Peta Folder Dompet Kita (v3.0)

Struktur folder proyek **Dompet Kita** — Monorepo Elite Edition.

```text
Dompet Kita/
│
├── 📱 frontend/                    # React 19 + Vite 6 (Vercel)
│   ├── src/
│   │   ├── pages/                  # Halaman utama aplikasi
│   │   │   ├── Home.tsx            # Dashboard utama
│   │   │   ├── Transactions.tsx    # Manajemen transaksi
│   │   │   ├── Wealth.tsx          # Kekayaan & aset
│   │   │   ├── Loans.tsx           # Pinjaman & utang
│   │   │   ├── MimpiKita.tsx       # Goals & impian bersama
│   │   │   ├── Holiday.tsx         # Rencana liburan
│   │   │   ├── Reports.tsx         # Laporan keuangan
│   │   │   ├── ReceiptScanner.tsx  # AI Scan struk (Gemini)
│   │   │   └── Login.tsx           # Autentikasi
│   │   ├── components/
│   │   │   ├── ui/                 # Komponen dasar (shadcn/ui)
│   │   │   ├── features/           # Komponen fitur bisnis
│   │   │   ├── charts/             # Visualisasi data
│   │   │   ├── auth/               # Komponen autentikasi
│   │   │   └── layout/             # Layout & navigasi
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── context/                # Global state (React Context)
│   │   ├── types/                  # TypeScript type definitions
│   │   ├── lib/                    # Utilities & helpers
│   │   ├── index.css               # Design system tokens
│   │   └── main.tsx                # Entry point
│   │
│   ├── scripts/                    # Frontend CLI Audit Suite ⭐ NEW
│   │   ├── design-audit.js         # AI Design Auditor (generic color detector)
│   │   ├── seo-check.js            # SEO Vitality checker
│   │   └── secure-assets.js        # Signed URL compliance auditor
│   │
│   ├── public/                     # Aset statis (SVGs, icons, images)
│   ├── index.html                  # SEO-complete entry HTML ⭐ UPGRADED
│   └── package.json                # Scripts + dependencies
│
├── ⚙️ backend/                     # Laravel 12 + PHP 8.4 (Railway)
│   ├── app/
│   │   ├── Console/Commands/       # 🤖 Elite CLI Suite ⭐ NEW
│   │   │   ├── MaintenanceVerify.php    # Unified system audit
│   │   │   ├── MaintenanceRepair.php    # AI Autopilot (Gemini)
│   │   │   ├── SecurityGate.php         # Pre-commit quality gate
│   │   │   ├── HoneypotAudit.php        # Bot attack radar
│   │   │   ├── CloudStatus.php          # Infrastructure dashboard
│   │   │   ├── CfoAnalyze.php           # CFO AI advisor
│   │   │   └── CfoForecast.php          # Wealth projection engine
│   │   ├── Http/Controllers/       # API Controllers
│   │   ├── Models/                 # Eloquent Models (dengan HasUserScope)
│   │   ├── Services/               # Business logic services
│   │   │   └── GeminiService.php   # AI integration
│   │   └── Traits/                 # Shared traits (HasUserScope, Protectable)
│   │
│   ├── database/
│   │   └── migrations/             # Database migrations
│   │       ├── ..._create_*_table.php
│   │       └── 2026_03_30_000000_enable_rls_on_all_tables.php  # RLS
│   │
│   ├── routes/api.php              # API routes
│   └── .env                        # Environment variables (JANGAN DI-COMMIT!)
│
├── 🔌 mcp-server/                  # MCP Server v3.0 (AI Bridge)
│   ├── src/index.ts                # 16 registered tools
│   └── dist/                       # Compiled JS (auto-generated)
│
├── 🐶 .husky/                      # Git Hooks
│   └── pre-commit                  # security:gate → lint-staged pipeline
│
├── 📚 docs/                        # Dokumentasi lengkap
│   ├── README.md                   # Buku panduan utama
│   ├── cli_roadmap.md              # Roadmap & status CLI suite ⭐ NEW
│   ├── TECHNICAL_DOCUMENTATION.md # Detail teknis v3.0
│   ├── SECURITY_OVERVIEW.md        # Blueprint keamanan 7 pilar
│   ├── MASTER_GUIDE_DATABASE.md    # Panduan database & migrasi
│   ├── RULES.md                    # Aturan pengembangan
│   └── FOLDER_STRUCTURE.md         # File ini!
│
├── 📦 package.json                 # Root scripts (setup, start, update-all)
└── 📘 README.md                    # Overview proyek
```

---

## 🎮 Root Commands (dari folder utama)

| Command | Fungsi |
|:--------|:-------|
| `npm run start` | Jalankan Frontend + Backend paralel |
| `npm run setup` | Install semua dependensi + setup awal |
| `npm run dev` | Frontend dev server saja |
| `npm run backend` | Backend dev server saja |

## ⚡ Backend CLI (dari root folder)

```bash
php backend/artisan maintenance:verify
php backend/artisan security:gate
php backend/artisan cfo:forecast --months=12
php backend/artisan honeypot:audit
php backend/artisan cloud:status
```

## 🎨 Frontend Audit CLI

```bash
npm run ci:frontend-check --prefix frontend   # Audit lengkap (design + seo + assets)
npm run design:audit --prefix frontend        # Design audit saja
npm run seo:check --prefix frontend           # SEO check saja
npm run secure:assets --prefix frontend       # Secure assets saja
```

---

_Diperbarui: 30 Maret 2026 — v3.0 Elite CLI Suite_
