# 💎 Dompet Kita — Technical Documentation

Dokumentasi teknis komprehensif untuk **Dompet Kita**, platform keuangan premium berbasis AI untuk Alvin & Ila.

> [!IMPORTANT]
> Diperbarui: 30 Maret 2026 — v3.0 (Elite CLI Suite + Frontend Mastery)

---

## 🏗️ 1. System Architecture & Philosophy

Proyek ini menggunakan pendekatan **"Core-First CLI"**:

```
┌─────────────────────────────────────────────────────┐
│                   AI Agent (Antigravity)             │
└───────────────────┬─────────────────────────────────┘
                    │ MCP Protocol (v3.0)
┌───────────────────▼─────────────────────────────────┐
│             MCP Server (dompet-kita-mcp)             │
│           Pure Bridge — No Business Logic            │
└──────────┬──────────────────────────┬───────────────┘
           │ CLI                      │ API
┌──────────▼──────────┐   ┌──────────▼───────────────┐
│  Laravel Artisan    │   │   React 19 Frontend       │
│  (Business Logic)   │   │   (User Interface)        │
└──────────┬──────────┘   └──────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────┐
│  PostgreSQL (Supabase) + Storj + Gemini AI          │
└─────────────────────────────────────────────────────┘
```

**Prinsip Utama:**
- Semua logika bisnis wajib ada di **Laravel Artisan CLI**
- MCP Server hanya berperan sebagai **translator** murni
- Frontend berinteraksi dengan API; Developer berinteraksi via Terminal

---

## 🏦 2. Backend — Laravel 12.x

### Tech Stack

| Komponen | Teknologi |
|:---------|:----------|
| **Language** | PHP 8.4 (JIT Enabled) |
| **Framework** | Laravel 12.x |
| **Database** | PostgreSQL (Supabase Transaction Pooler) |
| **Auth** | Laravel Sanctum (Token-based, Revocable) |
| **Storage** | Storj (S3 Compatible, Distributed) |
| **AI Integration** | Google Gemini API (via GeminiService) |
| **Security Packages** | spatie/laravel-honeypot, spatie/laravel-activitylog |

### Code Quality Suite (Otomatis)

| Tool | Fungsi |
|:-----|:-------|
| **Laravel Pint** | Auto-formatting PSR-12 |
| **Larastan (PHPStan)** | Static analysis, mencegah bug runtime |
| **PHP Insights** | Audit kualitas & kompleksitas kode |
| **Enlightn** | Security audit khusus ekosistem Laravel |
| **Rector** | Refactoring otomatis — kode selalu modern |
| **Laravel Pail** | Live debugging logs di terminal |

### Advanced CLI Commands (v3.0)

#### 🔍 System Maintenance
```bash
php artisan maintenance:verify        # Unified audit (Pint→PHPStan→Enlightn→Rector)
php artisan maintenance:repair        # AI Autopilot: auto-fix issues via Gemini
```

#### 🛡️ Security
```bash
php artisan security:gate             # Quality gate (default min-score: 90)
php artisan security:gate --min-score=95   # Custom threshold
php artisan honeypot:audit            # Visual bot-attack radar
```

#### 🛰️ DevOps Observatory
```bash
php artisan cloud:status              # Dashboard Railway + Supabase + Storj
```

#### 💰 Financial Intelligence (CFO Hub)
```bash
php artisan cfo:analyze               # AI insights transaksi bulanan (Gemini)
php artisan cfo:forecast              # Proyeksi kekayaan 12 bulan default
php artisan cfo:forecast --months=6   # Custom N bulan
```

#### 📊 Dashboard Utilities
```bash
php artisan app:wealth-status         # Snapshot aset, goals, utang
php artisan app:security-audit        # Scanner login mencurigakan
php artisan app:database-optimize     # Bersihkan cache & log lama
php artisan app:storage-manage list   # Kelola file Storj
```

---

## 🎨 3. Frontend — React 19 + Vite 6.x

### Tech Stack

| Komponen | Teknologi |
|:---------|:----------|
| **Framework** | React 19 (Concurrent Mode) |
| **Build Tool** | Vite 6.x |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS 4.x + Custom Design Tokens |
| **Animations** | Framer Motion |
| **Data Fetching** | TanStack Query v5 |
| **Security Lint** | eslint-plugin-security (Continuous Audit) |

### Design System

CSS Variables (Design Tokens) tersimpan di `src/index.css`:

```css
--color-pink-primary: #ff78a4;   /* Brand accent */
--color-blue-royal: #4a6cf7;    /* Royal blue CTA */
--color-green-stat: #2ecc71;    /* Income indicator */
--color-red-stat: #e74c3c;      /* Expense indicator */
--glass-blur: 32px;             /* Glassmorphism depth */
--font-display: 'Plus Jakarta Sans'; /* Headings */
--font-body: 'Inter';           /* Body text */
```

> [!NOTE]
> **Aturan Design**: Gunakan SELALU CSS variables di atas. Dilarang menggunakan generic Tailwind colors (seperti `blue-500`, `red-500`) agar brand consistency terjaga.

### Frontend CLI Audit Suite

```bash
npm run design:audit        # Scan komponen untuk generic colors
npm run seo:check           # Validasi SEO metadata setiap halaman
npm run secure:assets       # Pastikan gambar menggunakan Signed URLs
npm run ci:frontend-check   # Jalankan ketiganya sekaligus
```

### SEO Checklist (Per Halaman)

- ✅ `<title>` unik dan deskriptif
- ✅ `<meta name="description">` yang memikat
- ✅ Satu `<h1>` per halaman
- ✅ Semantic HTML5 (`<header>`, `<main>`, `<section>`)
- ✅ Open Graph + Twitter Card di `index.html`
- ✅ `lang="id"` (konten Bahasa Indonesia)

---

## 🔌 4. MCP Server (AI Bridge) — v3.0

### Philosophy

MCP Server adalah **jembatan murni** (Pure Bridge). Tidak ada business logic di sini. Semua logika dialihkan ke Artisan CLI.

### Registered Tools (16 Tools)

| Tool | Artisan Command |
|:-----|:----------------|
| `get_financial_status` | `app:wealth-status` |
| `budget_guard` | Budget monitoring |
| `loan_tracker` | Loan management |
| `asset_manage` | Asset operations |
| `goal_check` | Goal tracking |
| `holiday_plan` | Holiday planning |
| `system_status` | `app:security-audit` |
| `security_scan` | `app:security-audit` |
| `cloud_sync_check` | `cloud:status` |
| `storage_assistant` | `app:storage-manage` |
| `penpot_assistant` | `app:penpot-manage` |
| `maintenance_tool` | `maintenance:verify` |
| `security_gate` ⭐ | `security:gate` |
| `honeypot_radar` ⭐ | `honeypot:audit` |
| `cfo_forecast` ⭐ | `cfo:forecast` |
| `maintenance_repair` ⭐ | `maintenance:repair` |

⭐ = Ditambahkan di v3.0

---

## 💂 5. Git Hooks (Husky) — Pre-Commit Pipeline

```
git commit
  │
  ├─▶ [1] 🛡️  php artisan security:gate --min-score=90
  │           Status EXIT 1? → Commit DITOLAK
  │           Status EXIT 0? → Lanjut ke langkah 2
  │
  └─▶ [2] ✨  npx lint-staged
              ├─ *.tsx / *.ts → Prettier (auto-format)
              └─ *.php → php artisan maintenance:verify (quick audit)
```

---

## 🌐 6. Infrastructure & Deployment

| Service | Platform | Region |
|:--------|:---------|:-------|
| Frontend | Vercel | Singapore |
| Backend API | Railway | Singapore |
| Database | Supabase | Singapore |
| Object Storage | Storj | Distributed Global |
| Error Monitoring | Sentry | Cloud |

---

## ⚙️ 7. Development Workflow

```bash
# Setup (Pertama kali)
npm run setup

# Jalankan Dev
npm run start           # Frontend + Backend paralel

# Sebelum git push — wajib lolos semua ini:
php backend/artisan maintenance:verify
npm run ci:frontend-check --prefix frontend
```

---

> [!TIP]
> Jalankan `php artisan list` untuk melihat semua perintah CLI yang tersedia dalam namespace: `app:`, `maintenance:`, `cfo:`, `cloud:`, `security:`, `honeypot:`.
