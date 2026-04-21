# 🧠 POST-MORTEM MEMORY — DOMPET KITA

---

## [2026-04-21] — Asset Transactions Schema Drift

### 🚩 Problem
Encountered `SQLSTATE[42703]: Undefined column` during precision migration because I assumed `asset_transactions` had a `quantity` column based on the `assets` model intent.

### 🧠 Root Cause
The initial migration for `asset_transactions` (v1.0) only focused on `amount` and neglected the `quantity` requirement for non-fiat assets (Gram/Gold/Crypto).

### 🛡️ Prevention
- **Always Grep first**: Always run `php artisan db:table asset_transactions` or similar reflection BEFORE writing migrations that alter existing columns.
- **Defensive Migrations**: Use `Schema::hasColumn()` inside migrations to ensure self-healing and prevent crash-on-deploy.
