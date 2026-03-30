# 💰 Dompet Kita (Professional Monorepo Edition)

Aplikasi pencatatan keuangan premium untuk **Alvin & Ila**. Proyek ini menggunakan arsitektur **API-First** modern dengan standar infrastruktur kelas dunia (DevOps & Automation).

---

## 🌐 Live URLs

- **Frontend (Production)**: [https://dompet-kita-six.vercel.app/](https://dompet-kita-six.vercel.app/)
- **Backend API (Production)**: [https://dompet-kita-production.up.railway.app/](https://dompet-kita-production.up.railway.app/)

## 🏗️ Digital Infrastructure & Cloud

Aplikasi ini berjalan di ekosistem cloud modern:

1.  **Frontend**: React 19 (Vite) di-host di **Vercel**.
2.  **Backend**: Laravel 12 (PHP 8.4) di-host di **Railway**.
3.  **Database**: Managed PostgreSQL di **Supabase** (Transaction Pooler).
4.  **Storage**: S3-Compatible via **Storj** (Distributed Object Storage).
5.  **External**: Google Gemini AI (Insights) & Penpot (Design Sync).

---

## 🔐 3. Bank-Grade Security (The Fortress)

Dompet Kita dirancang dengan lapisan pertahanan mendalam (**Defense-in-depth**):

- **🛡️ Row Level Security (RLS)**: Proteksi data langsung di level PostgreSQL (Supabase).
- **🔑 Field-Level Encryption**: Data sensitif (Google ID, Partner Name, Descriptions) dienkripsi otomatis sebelum disimpan.
- **📦 Private Cloud Storage**: File struk di Storj bersifat privat, hanya dapat diakses melalui **Temporal Signed URLs** (berlaku 15 menit).
- **🕵️ Audit Trail (CCTV)**: Setiap perubahan data (Edit/Hapus) dicatat dalam riwayat perubahan aset/transaksi.
- **🕸️ Honeypot & Throttle**: Deteksi pendaftaran bot otomatis dan perlindungan dari serangan Brute Force.
- **📱 Device Tracking**: Mencatat IP dan perangkat (User Agent) setiap kali terjadi akses masuk.

---

## 🛡️ 4. Developer Experience & Automation (Elite Suite)

Kami mengutamakan **Developer Happiness** dan **Code Health**. Project ini dilengkapi dengan sistem otomatisasi "Penjaga Pintu" (Git Hooks):

### 💂‍♂️ Git Hooks & Automation (Husky)

Setiap kali kamu melakukan `git commit`, sistem akan melakukan:

- **Frontend**: Menjalankan `Prettier` untuk merapikan kode secara otomatis.
- **Backend**: Menjalankan `php artisan maintenance:verify` untuk audit kesehatan menyeluruh.
- **Security**: Mencegah commit jika ditemukan celah keamanan atau error fatal.

### 🔍 Command Center (CLI)

Pusat kontrol utama untuk pengelolaan sistem tingkat tinggi (Artisan CLI):

- `php artisan app:wealth-status` — **Full Dashboard Snapshot** (Saldo + Aset + Goals + Loans).
- `php artisan app:security-audit` — **Security Scanner** (Cek login mencurigakan & skor sistem).
- `php artisan app:database-optimize` — **Pro Maintenance** (Sapu bersih cache & log lama).
- `php artisan app:asset-manage` — Kelola kekayaan & update nilai aset.
- `php artisan app:storage-manage` — Kelola file Cloud Storage (Storj).
- `php artisan app:penpot-manage` — Sinkronisasi aset desain dari Penpot.
- `php artisan maintenance:verify` — **The Vitality Check** (Unified Audit & Optimization).

### 📊 Quality & Performance Tools

- **PHP Insights & Enlightn**: Audit kualitas & keamanan mendalam ekosistem Laravel.
- **Larastan & Pint**: Analisis statis dan formatting otomatis tingkat tinggi.
- **Laravel Pail**: Live debugging logs di terminal yang cantik.

---

## 📜 Dokumentasi Lanjutan

- [docs/TECHNICAL_DOCUMENTATION.md](./docs/TECHNICAL_DOCUMENTATION.md) - Detail Teknis & Keamanan.
- [docs/MASTER_GUIDE_DATABASE.md](./docs/MASTER_GUIDE_DATABASE.md) - Panduan Database.
- [docs/SECURITY_OVERVIEW.md](./docs/SECURITY_OVERVIEW.md) - Strategi Keamanan.

## 🚀 Memulai Pengembangan Lokal

1.  **Clone**: `git clone <repo-url>`
2.  **Setup**: `npm run setup` (Menginstall semua dependensi, generate key, dan migrate database).
3.  **Run**: `npm run start` (Menjalankan Frontend & Backend secara bersamaan).

---

_Dibuat dengan ❤️ untuk masa depan Alvin & Ila. Sistem ini dijaga secara otomatis oleh **Husky & Antigravity AI**._
