# 🛡️ Dompet Kita: Security Overview & Audit

Dokumen ini menggabungkan strategi keamanan sistem dan hasil audit terbaru untuk memastikan seluruh data Alvin & Ila terlindungi dengan standar tinggi.

---

## 🏗️ 1. Strategi Keamanan (Security Strategy)

Aplikasi kita menggunakan sistem keamanan berlapis untuk memastikan rahasia (*secrets*) di file `.env` tidak akan pernah terekspos.

### A. Strategi "No-File" di Production
Saat men-deploy ke **Railway**, kita **TIDAK** mengunggah file `.env`. 
*   **Cara Kerja**: Semua variabel (API Keys, DB Password) dimasukkan langsung ke Dashboard Railway.
*   **Keuntungan**: Hacker tidak bisa mencuri file kredensial meskipun berhasil menembus celah keamanan tertentu karena filenya tidak ada di disk server.

### B. Satpam Digital (Laravel Side)
Di sisi kode Laravel (`AppServiceProvider.php`), terdapat pengecekan otomatis:
*   **Anti-Debug Check**: Jika berjalan di mode `production` tapi `APP_DEBUG` menyala, aplikasi akan otomatis berhenti (*abort*). Ini mencegah bocornya path file atau key lewat pesan error.
*   **Internal Variable Masking**: Laravel otomatis menyembunyikan variabel sensitif di halaman error.

### C. Shielding the Browser (Frontend Armor)
*   **Vite Prefix Guard**: Hanya variabel berawalan `VITE_` yang bisa dibaca frontend. Rahasia backend tetap terkunci di server.
*   **No Sensitive Logs**: Audit rutin dilakukan untuk memastikan tidak ada `console.log()` data sensitif di versi production.

---

## 📊 2. Hasil Audit Keamanan (Technical Audit Status)

Berdasarkan audit terakhir per Maret 2026:

| Area | Status | Detail Tindakan |
| :--- | :--- | :--- |
| **Auth & Session** | 🟢 MITIGATED | Penggunaan CSP strict untuk melindungi token di `localStorage`. |
| **Security Headers** | ✅ FIXED | Implemetasi `X-Frame-Options`, `nosniff`, dan `Referrer-Policy`. |
| **CORS Config** | ✅ FIXED | Origin dibatasi hanya untuk domain resmi via `CORS_ALLOWED_ORIGINS`. |
| **Rate Limiting** | ✅ FIXED | Throttling ketat: Login (5/menit), Register (3/menit), AI (10/menit). |
| **SQL Injection** | ✅ GOOD | Penggunaan Eloquent & Parameter Binding di seluruh query. |
| **XSS Protection** | ✅ GOOD | React automatic escaping & CSP Header. |

---

## 📝 3. Aturan Operasional Keamanan
1.  **Local Dev**: Gunakan `.env` lokal (sudah masuk `.gitignore`).
2.  **Deployment**: Update variabel hanya melalui Dashboard Railway.
3.  **Audit Mandiri**: Antigravity akan melakukan scan rutin pada folder `src/` untuk memastikan tidak ada key yang tertulis manual di kode.

---
*Status Keamanan: **Strong & Armed** 🛡️*
