# 🛡️ Dompet Kita: Production Security Guard

Project kita menggunakan sistem keamanan berlapis untuk memastikan rahasia (secrets) di file `.env` tidak akan pernah terekspos, baik secara tidak sengaja maupun lewat serangan siber.

## 🏗️ 1. Strategi "No-File" di Production
Saat kita men-deploy ke **Railway**, kita **TIDAK AKAN** mengunggah file `.env`. 
*   **Cara Kerja**: Semua variabel (API Keys, DB Password) akan dimasukkan langsung ke Dashboard Railway.
*   **Keuntungan**: Karena filenya tidak ada di disk server, maka hacker tidak bisa mencurinya meskipun berhasil menembus celah keamanan tertentu.

## 🛡️ 2. Production Health Check (Laravel Side)
Di sisi kode Laravel, aku telah menambahkan "Satpam Digital" di `AppServiceProvider.php` yang akan melakukan pengecekan setiap kali aplikasi dijalankan:

*   **Anti-Debug Check**: Jika aplikasi berjalan di mode `production` tapi `APP_DEBUG` dalam keadaan `true` (nyala), aplikasi akan otomatis berhenti (*abort*). Ini mencegah error detail (yang berisi path file/key) tampil ke user.
*   **Internal Variable Masking**: Laravel secara otomatis melakukan *masking* terhadap variabel sensitif di halaman error (jika terpaksa muncul).

## 🔒 3. Web Server Shield (Railway/Nginx)
Aplikasi kita menggunakan struktur folder `/public` Laravel.
*   Path publik kita adalah `https://api.dompet-kita.com/`. 
*   Folder rahasia dan file `.env` (jika ada) berada satu tingkat di ATAS folder public.
*   **Artinya**: Secara fisik, browser TIDAK PUNYA AKSES untuk "naik" ke folder folder di atas `/public`. Akses ke `https://api.dompet-kita.com/.env` akan menghasilkan error 404 atau 403 secara otomatis oleh server.

## 🛡️ 4. Frontend Armor (Shielding the Browser)
Bagian Frontend (React) juga aku jaga ketat agar tidak ada kebocoran data:

*   **Vite Prefix Guard**: Hanya variabel yang diawali dengan `VITE_` (seperti `VITE_API_URL`) yang akan dibungkus ke dalam kode frontend. Password database Sayang yang di backend (tanpa prefix VITE) 100% tidak akan pernah bisa terbaca oleh script frontend.
*   **Service Key Insulation**: Saat migrasi ke Laravel selesai, Frontend TIDAK LAGI memegang kunci Supabase. Frontend hanya memegang "Token Sementara" yang bisa hangus. Kunci "Master" Supabase hanya ada di dalam brankas Laravel.
*   **Leak Scanner**: Aku akan melakukan audit rutin pada folder `src/` untuk memastikan tidak ada rahasia (seperti API Key) yang tertulis secara tidak sengaja di dalam kode tampilan.
*   **No Sensitive Logs**: Aku pastikan tidak ada data sensitif yang di-print lewat `console.log()` di versi production.

## 📝 5. Aturan Pengoperasian
1.  **Local Development**: Pakai `.env` lokal (sudah masuk `.gitignore`).
2.  **Deployment**: Copy-paste isi `.env` ke Dashboard Railway -> Environment Variables.
3.  **Audit**: Aku (Antigravity) akan melakukan audit otomatis setiap kali ada perubahan kode untuk memastikan tidak ada key yang "bocor" lewat log.

---
*Status Keamanan: **Strong & Armed** 🛡️*
