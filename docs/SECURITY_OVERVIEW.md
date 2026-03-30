# 🔐 Dompet Kita — Security Architecture Overview

Proyek **Dompet Kita** menerapkan strategi **"Defense in Depth"** — keamanan berlapis dari kode hingga infrastruktur.

> [!CAUTION]
> Jangan pernah membagikan `.env` atau `APP_KEY`. Kehilangan kunci enkripsi = kehilangan seluruh data finansial yang terenkripsi selamanya.

---

## 🗼 Arsitektur Keamanan Berlapis (7 Pilar)

```
┌─────────────────────────────────────────────────────────┐
│  Layer 7: MONITORING — Sentry + Activity Log (CCTV)     │
├─────────────────────────────────────────────────────────┤
│  Layer 6: DEVICE TRACKING — Login History (IP + UA)     │
├─────────────────────────────────────────────────────────┤
│  Layer 5: TRAFFIC CONTROL — Rate Limit + Honeypot       │
├─────────────────────────────────────────────────────────┤
│  Layer 4: SIGNED STORAGE — Private Vault + 15min Token  │
├─────────────────────────────────────────────────────────┤
│  Layer 3: AUTH — Sanctum Token (Revocable)              │
├─────────────────────────────────────────────────────────┤
│  Layer 2: ENCRYPTION — AES-256-CBC (Field-Level)        │
├─────────────────────────────────────────────────────────┤
│  Layer 1: DATABASE — Row Level Security (PostgreSQL)     │
└─────────────────────────────────────────────────────────┘
```

---

## 🏛️ 1. Database Level: Row Level Security (RLS)

Perlindungan langsung di level PostgreSQL — tidak bisa di-bypass dari kode.

- **Tabel yang dilindungi**: `users`, `transactions`, `assets`, `loans`, `goals`, `holidays`, `wealth_histories`
- **Mekanisme**: Policy PostgreSQL memastikan setiap query hanya mengembalikan baris milik user yang sedang aktif
- **Keunggulan**: Sekalipun ada bug Laravel yang lupa filter `user_id`, database akan menolak memberikan data orang lain
- **Migrasi**: `2026_03_30_000000_enable_rls_on_all_tables.php`

---

## 🔒 2. Data Level: Field-Level Encryption

Data paling sensitif dienkripsi sebelum masuk ke database.

| Field | Model | Alasan |
|:------|:------|:-------|
| `social_id` | User | ID Google Login |
| `partner_name` | User | Informasi pasangan |
| `description` | Transaction | Detail pengeluaran pribadi |

- **Algoritma**: AES-256-CBC via Laravel Encrypted Casts
- **Kunci**: `APP_KEY` disimpan di Railway Environment Variables
- **Transparansi**: Enkripsi/dekripsi terjadi otomatis, kode tidak perlu intervensi manual

---

## 📦 3. Storage Level: Private Vault & Signed URLs

Semua file struk belanja dikelola dengan akses bertingkat:

```
User Request → Backend → Generate Signed URL (15 menit) → Storj Private Bucket
```

- **Visibility**: `private` — URL publik langsung → **403 Forbidden**
- **Temporary Token**: Berlaku 15 menit, setelah itu kadaluarsa otomatis
- **Infra**: Storj (terdesentralisasi) — data replikasi tinggi, tidak ada single point of failure
- **CLI Audit**: `npm run secure:assets` memvalidasi tidak ada hardcoded public URL di frontend

---

## 🚦 4. Traffic & Access Control

### Honeypot (Bot Protection)
- **Package**: `spatie/laravel-honeypot`
- **Mekanisme**: Field tersembunyi di form registrasi & reset password
- **Cara Kerja**: Bot otomatis mengisi semua field → honeypot terisi → request ditolak server
- **CLI Monitor**: `php artisan honeypot:audit` — visualisasi radar serangan bot

### Rate Limiting
- Login endpoint: **5 percobaan/menit** (Throttle)
- API sensitif: Custom throttle middleware
- Tujuan: Mencegah Brute Force & DoS attack

---

## 📱 5. Auth & Session

- **Package**: Laravel Sanctum
- **Token Style**: API Token (bukan cookie — aman untuk mobile/SPA)
- **Revocable**: Token bisa dicabut kapan saja (`php artisan sanctum:prune-expired`)
- **Login History**: Setiap login berhasil dicatat IP Address + User Agent device

---

## 🕵️ 6. Audit Trail (CCTV Digital)

Setiap aksi pada data finansial dicatat lengkap oleh `spatie/laravel-activitylog`:

| Event | Yang Dicatat |
|:------|:------------|
| `CREATE` | Model baru + Siapa yang membuat + Timestamp |
| `UPDATE` | Field yang berubah (sebelum vs sesudah) |
| `DELETE` | Data yang dihapus (soft record) |

**Model yang dimonitor**: `Transaction`, `Asset`, `Loan`, `Goal`

**CLI Monitor**: Honeypot intercepts juga dicatat di activity log dengan tag `honeypot_intercept`.

---

## 🛡️ 7. Developer Security Gate (Pre-Commit)

Setiap `git commit` harus melewati security checkpoint:

```bash
php artisan security:gate --min-score=90
```

- Skor < 90 → Commit **otomatis ditolak** (exit 1)
- Skor ≥ 90 → Commit diizinkan lanjut
- Terintegrasi ke Husky pre-commit hook

---

## 🔑 Environment Variables (Wajib Dijaga)

```env
APP_KEY=           # Master encryption key — RAHASIA MUTLAK
SUPABASE_URL=      # Database connection
SUPABASE_KEY=      # Supabase service key
STORJ_ACCESS_KEY=  # Cloud storage access
STORJ_SECRET_KEY=  # Cloud storage secret
GEMINI_API_KEY=    # AI integration key
```

> [!WARNING]
> `.env` wajib ada di `.gitignore`. Periksa dengan `git status` sebelum commit. Gunakan `php artisan security:gate` untuk memastikan tidak ada secret yang bocor.

---

## 🔭 Monitoring & Incident Response

| Tool | Fungsi |
|:-----|:-------|
| **Sentry** | Real-time error tracking di produksi |
| **Activity Log** | Audit trail lengkap semua perubahan data |
| **Honeypot Radar** | `php artisan honeypot:audit` — peta serangan bot |
| **Security Gate** | Pre-commit validation — skor sistem |
| **Cloud Status** | `php artisan cloud:status` — health monitoring |
