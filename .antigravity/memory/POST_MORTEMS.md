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

---

## [2026-04-22] — Tailwind v4 Oxide Native Binding Failure

### 🚩 Problem
Next.js build on Vercel failed with `Error: Cannot find module '@tailwindcss/oxide-linux-x64-gnu'`.

### 🧠 Root Cause
Tailwind CSS v4 uses native binaries (Oxide). When `npm install` is run on Windows, the lockfile generated may not contain the necessary metadata or bindings for the Linux platform used by Vercel, especially in monorepos where nested lockfiles or workspace resolution bugs (npm #4828) can occur.

### 🛡️ Prevention
- **Explicit Optional Bindings**: Add the required platform-specific binaries (`@tailwindcss/oxide-linux-x64-gnu`, etc.) to `optionalDependencies` in the workspace's `package.json`.
- **Single Lockfile Policy**: Regularly audit the monorepo for redundant `package-lock.json` files in workspace subdirectories and remove them to ensure the root lockfile remains the single source of truth.

---

## [2026-04-22] — Transaction Hook Cognitive Overload

### 🚩 Problem
`useTransactions.ts` reached a "cognitive complexity" and "nesting depth" threshold that triggered critical lint warnings and made optimistic update logic difficult to verify.

### 🧠 Root Cause
Incremental feature additions (Optimistic Updates, Financial Summary Sync, Infinite Scroll) were layered into the same `onMutate` and `queryFn` callbacks, leading to deeply nested ternary operators and anonymous function chains.

### 🛡️ Prevention
- **Helper Extraction**: Proactively move cache-traversal and transformation logic (e.g., `updateInfiniteTransactions`) into named, top-level helper functions.
- **Explicit Typing**: Always type the `QueryClient` and `InfiniteData` structures to prevent "untyped function call" errors in complex mutations.
- **Positive Logic**: Favor positive conditions (`if (exists)`) over negated ones (`if (!undefined)`) to reduce mental parsing overhead during logic audits.

