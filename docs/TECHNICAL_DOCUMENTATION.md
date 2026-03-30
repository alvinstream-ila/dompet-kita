# 💎 Dompet Kita Technical Documentation

Welcome to the comprehensive technical documentation for **Dompet Kita**, a secure, AI-powered financial manager designed for Alvin & Ila.

---

## 🏗️ 1. System Architecture & Philosophy

Project ini menggunakan pendekatan **"Core-First CLI"**. Semua logika bisnis penting (Keuangan, Aset, Audit) wajib berada di dalam **Laravel Artisan CLI**.

- **MCP Server**: Berperan sebagai jembatan (bridge) murni antara AI Agent dan CLI.
- **User Interface**: Frontend React berinteraksi dengan API, sementara pengembang (Developer) berinteraksi via terminal.

---

## 🏦 2. Backend Documentation (Laravel 12.x)

### 🛠️ Technical Stack

| Component     | Technology                    |
| :------------ | :---------------------------- |
| **Language**  | PHP 8.4 (JIT Enabled)         |
| **Framework** | Laravel 12.x                  |
| **Database**  | PostgreSQL (Supabase)         |
| **Auth**      | Laravel Sanctum (Token-based) |
| **Storage**   | Storj (S3 Compatible)         |

### ⚡ Professional Developer Suite

Project ini dilengkapi dengan alat bantu otomatis untuk menjaga kualitas kode (Code Quality):

- **Laravel Pint**: Formatting kode otomatis sesuai standar PSR-12.
- **Larastan**: Analisis statis untuk mencegah bug sebelum runtime.
- **PHP Insights**: Audit kualitas, arsitektur, dan kompleksitas kode.
- **Enlightn**: Audit keamanan (Security) khusus ekosistem Laravel.
- **Rector**: Refactoring otomatis untuk menjaga kode tetap modern.
- **Laravel Pail**: Live debugging logs langsung di terminal.

### 🛡️ System Audit Command

Gunakan satu perintah untuk mengecek seluruh kesehatan sistem:

```bash
php artisan maintenance:verify
```

Perintah ini akan menjalankan: Check Style -> Static Analysis -> Security Audit -> Cloud Sync -> Database Optimize.

---

## 🔐 3. Data Security & Privacy (The Fortress)

Dompet Kita menggunakan standar keamanan setara aplikasi perbankan (Defense-in-depth):

### 🛡️ 7 Pilar Keamanan

1. **Row Level Security (RLS)**: Proteksi di level database (Supabase) yang menjamin data hanya bisa diakses oleh pemilik aslinya.
2. **Field-Level Encryption**: Data sensitif (`social_id`, `partner_name`, `description`) dienkripsi sebelum masuk ke database menggunakan Laravel Encrypted Casts.
3. **Private Storage Visibility**: Semua file (struk) di Storj bersifat **Private** secara default.
4. **Temporal Signed URLs**: Akses ke file privat hanya diperbolehkan melalui "Kunci Sementara" (Signed URL) yang berlaku selama 15 menit.
5. **Honeypot Protection**: Menggunakan `spatie/laravel-honeypot` untuk memblokir pendaftaran bot otomatis.
6. **Strict Rate Limiting**: Batasan percobaan login (5x/menit) dan aktivitas API untuk mencegah serangan Brute Force.
7. **Login History & Device Tracking**: Mencatat IP Address dan User Agent setiap kali terjadi akses login.

### 🕵️ Audit Trail (CCTV Digital)

Setiap perubahan pada data finansial (`Transaction`, `Asset`, `Loan`) dicatat oleh **Spatie Activity Log**. Admin dapat melihat riwayat perubahan data (nilai lama vs nilai baru).

---

## 🎨 4. Frontend Documentation (React 19)

### 🛠️ Technical Stack

| Component         | Technology                                  |
| :---------------- | :------------------------------------------ |
| **Framework**     | React 19 (Vite 6.x)                         |
| **Language**      | TypeScript (Strict Mode)                    |
| **Styling**       | Tailwind CSS 4.x + Framer Motion            |
| **Data Fetching** | TanStack Query v5                           |
| **Security**      | `eslint-plugin-security` (Continuous Audit) |

### 💂‍♂️ Git Hooks & Automation (Husky)

Kami menggunakan **Husky** dan **lint-staged** untuk menjamin kualitas kode di setiap `git commit`:

- Komit akan ditolak jika kode berantakan (tidak lolos Prettier).
- Komit akan ditolak jika backend audit (`maintenance:verify`) gagal.
- _Hasil_: Repository selalu dalam keadaan "Green" (Sehat).

---

## 🛠️ 5. Power-User CLI Suite (The Command Center)

Daftar perintah Artisan khusus untuk pengelolaan tingkat tinggi:

| Command                             | Description                                                               |
| :---------------------------------- | :------------------------------------------------------------------------ |
| `php artisan app:wealth-status`     | **Financial Dashboard**: Ringkasan Harta, Goals, dan Utang/Piutang.       |
| `php artisan app:security-audit`    | **Security Scanner**: Mencari login mencurigakan & skor kesehatan sistem. |
| `php artisan app:database-optimize` | **Pro Maintenance**: Membersihkan cache & log lama secara otomatis.       |
| `php artisan maintenance:verify`    | **Unified Audit**: Menjalankan seluruh rangkaian tes kesehatan sistem.    |

---

## 🌐 6. Infrastructure & Deployment

- **Frontend**: Vercel (Singapore)
- **Backend**: Railway (Singapore)
- **Database**: Supabase
- **Object Storage**: Storj (Gateway.io)
- **Monitoring**: Sentry (Error Tracking) & Google Search Console (SEO)

---

## ⚙️ 7. Development Workflow

1. **Instalasi**: `npm run setup` (Menginstall frontend & backend sekaligus).
2. **Menjalankan Dev**: `npm run start` (Frontend & Backend berjalan paralel).
3. **Audit Manual**: `php artisan maintenance:verify` (Lakukan ini sebelum melakukan Push).

---

> [!IMPORTANT]
> Dokumentasi ini diperbarui pada 30 Maret 2026. Prioritaskan penggunaan CLI untuk tugas-tugas administratif sistem guna menjaga konsistensi data dan integritas keamanan.
