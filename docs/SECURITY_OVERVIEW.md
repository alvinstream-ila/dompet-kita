# 🔐 Dompet Kita: Security Architecture Overview (Blueprint)

Project **Dompet Kita** menerapkan strategi **"Defense in Depth"** (Pertahanan Berlapis). Keamanan tidak hanya diletakkan pada satu titik, melainkan menyebar dari kodingan (Frontend/Backend) hingga ke level Infrastruktur (Database/Storage).

---

## 🏗️ 1. Database Level: Row Level Security (RLS)

Kami tidak hanya mengandalkan filter `WHERE user_id = ?` di kodingan. Kami menerapkan **RLS** langsung di PostgreSQL (Supabase).

- **Mekanisme**: Setiap tabel utama (`transactions`, `assets`, `loans`, `goals`, `holidays`) memiliki kebijakan (Policy) PostgreSQL.
- **Keunggulan**: Sekalipun ada bug di kodingan Laravel yang lupa memfilter user, database akan menolak memberikan data jika `auth.uid()` tidak sesuai dengan pemilik baris data tersebut.

---

## 🔒 2. Data Level: Field-Level Encryption

Data yang bersifat sangat privat tidak disimpan dalam bentuk teks biasa (Plaintext).

- **Data yang Dienkripsi**:
  - `users.social_id`: ID unik dari Google Login.
  - `users.partner_name`: Informasi pasangan.
  - `transactions.description`: Detail pengeluaran yang mungkin bersifat rahasia.
- **Mekanisme**: Menggunakan algoritma **AES-256-CBC Encrypted Casts** bawaan Laravel. Kunci enkripsi (`APP_KEY`) disimpan aman di variabel lingkungan (Environment Variables) Railway.

---

## 📦 3. Storage Level: Private Vault & Signed URLs

Semua file struk belanja (`Receipts`) dikelola dengan standar akses ketat:

- **Visibility: Private**: File tidak bisa diakses via URL publik (`403 Forbidden`).
- **Temporary Access**: Aplikasi akan membuatkan **Signed URL** (Token unik) setiap kali user ingin melihat file. Token ini hanya berlaku selama **15 menit**.
- **Distributed Storage**: Menggunakan **Storj** yang terdesentralisasi, menjamin redundansi data tinggi dan ketersediaan global.

---

## 🚦 4. Traffic & Access Control

- **Rate Limiting (Throttling)**: API membatasi jumlah request per menit untuk mencegah serangan Brute Force dan DoS.
- **Honeypot Protection**: Menggunakan "Field Siluman" pada form registrasi dan ganti password. Bot otomatis akan mengisi field ini, yang memicu penolakan otomatis dari server.
- **Sanctum Authentication**: Menggunakan token API yang aman dan dapat ditarik kembali (Revocable) kapan saja.

---

## 🕵️ 5. Monitoring & Accountability

- **Full Audit Trail**: Setiap aksi `Create`, `Update`, dan `Delete` dicatat dengan detail (Siapa, Kapan, Data Sebelum, Data Sesudah).
- **Exception Tracking**: Menggunakan **Sentry** untuk menangkap error keamanan di produksi secara real-time.
- **Security Audit CLI**: Perintah `php artisan app:security-audit` memungkinkan pemindaian kesehatan sistem secara mandiri.

---

> [!CAUTION]
> Jangan pernah membagikan `.env` file atau `APP_KEY` kepada siapa pun. Kehilangan kunci enkripsi berarti kehilangan seluruh data finansial yang telah terenkripsi selamanya.
