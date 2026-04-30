# 📝 CHANGELOG — DOMPET KITA

---

## [7.5.5] — 2026-04-29 (Transaction Visibility & API Standardization)

### 🚀 CI/CD & DEPLOYMENT
- **Deployment to Main**: Successfully pushed all transaction visibility fixes and metadata exposure to the `main` branch.
- **Pre-Push Hardening**: Resolved "Next build lock" issues and satisfied strict PHPStan Level 9 requirements for the `metadata` property.
- **Sovereign Security Gate**: All security audits passed with a 100/100 score.

### ⚡ DATA RELIABILITY
- **API Nesting Fix**: Standardized `TransactionController` output to preserve pagination metadata (`data`, `links`, `meta`) within the `success()` wrapper.
- **Metadata Exposure**: Expose raw transaction metadata to the frontend, enabling future deep-linking with Assets and Loans.
- **Frontend Resilience**: Hardened `useTransactions` hook to safely handle nested API structures.


## [7.5.4] — 2026-04-22 (Transaction Hook Refactoring)

### 🛠️ CODE QUALITY & REFACTORING
- **`useTransactions.ts` Hardening**: Refactored the core transaction hook to resolve linting errors and warnings.
    - **Type Safety**: Explicitly typed `queryClient` to eliminate "untyped function" errors.
    - **Cognitive Complexity**: Extracted nested logic into `updateInfiniteTransactions` and `removeInfiniteTransaction` helper functions.
    - **Logic Cleanup**: Replaced negated conditions with positive checks for improved readability and reduced branching complexity.
- **Backend Cleanup**: Removed unused parameters (`$user`, `$date`) from AI and Transaction actions to streamline the "Sovereign Multi-Tenant" architecture.

## [7.5.3] — 2026-04-22 (Next.js SWC Resiliency)

### 🚀 CI/CD & DEPLOYMENT
- **SWC Binary Hardening**: Resolved persistent Next.js warnings by explicitly declaring platform-specific SWC binaries (`@next/swc-win32-x64-msvc`, etc.) in `optionalDependencies` to prevent lockfile patching failures in monorepos.
- **Next.js Lifecycle Audit**: Upgraded Next.js to `16.2.4` and synchronized workspace dependencies to ensure native compiler compatibility across development and CI environments.

## [7.5.2] — 2026-04-22 (Instant CRUD & Sovereign Sync)

### ⚡ USER EXPERIENCE
- **Instant CRUD Engine**: Full optimistic updates for Transactions, Assets, Goals, and Loans. UI now updates at 0ms latency.
- **Sovereign Sync v7.5**: Refined Supabase Realtime synchronization with broader table coverage (Households, Asset Transactions).
- **High-Precision Tuning**: React Query optimization (staleTime reduced to 5s, refetchOnWindowFocus enabled).

## [7.5.1] — 2026-04-22 (Build Resiliency)

### 🚀 CI/CD & DEPLOYMENT
- **Tailwind v4 Oxide Hardening**: Explicitly added Linux and Windows native bindings to `optionalDependencies` to resolve Vercel build failures caused by npm's optional dependency bug (#4828).
- **Lockfile Consolidation**: Purged redundant nested lockfiles in the frontend workspace to enforce single-source-of-truth dependency resolution at the monorepo root.

---

## [7.5.0] — 2026-04-21 (Sovereign Sync & Dependency Hardening)

### 📡 REAL-TIME SYNCHRONIZATION
- **The Sovereign Sync Engine**: Integrated Supabase Realtime with a global React hook (`useRealtimeSync`) for instant UI updates across all devices.
- **Automated Publication Management**: Implemented Laravel migrations to automatically add core financial tables to the Supabase publication.
- **Intelligent Invalidation**: Automatic React Query cache invalidation triggered by database-level events.

### 🛡️ INFRASTRUCTURE & SECURITY
- **Dependency Hardening**: Applied aggressive overrides for `glob`, `rimraf`, and `inflight` to resolve security vulnerabilities and memory leaks.
- **Monorepo Cleanup**: Modernized the root and workspace dependency trees, purging deprecated utility packages.
- **Household Sovereignty**: Implemented backend support for the Household architecture, ensuring data isolation and sharing control.

## [7.4.2] — 2026-04-21 (Sovereign Database Hardening)

### 🛡️ ARCHITECTURE REVOLUTION
- **The Household Pattern**: Migrated from simple partner-linking to a scalable **Household/Tenant architecture**, enabling robust group-based RLS.
- **Unified Identity Mapping**: Synchronized Laravel users with Supabase Auth via `auth_uuid` mapping to eliminate RLS authentication mismatches.

### 💎 DATA INTEGRITY & PRECISION
- **Financial Precision v2025**: Upgraded all balance columns to `decimal(19, 4)` for high-precision mid-calculations.
- **Crypto-Ready Schema**: Implemented `decimal(36, 18)` for asset quantities, supporting Ethereum/EVM-compatible digital tokens.
- **Soft Deletes**: Native audit trail support for all financial tables (`transactions`, `assets`, `loans`, `goals`, `holidays`).

### 🧩 NORMALIZATION
- **Normalized Categories**: Transitions from string-based categories to a dedicated, household-scoped `categories` table for centralized management and cleaner analytics.

---

## [7.4.1] — 2026-04-21 (Post-Hardening Core Audit)

### 🛡️ WEALTH HARDENING
- **Unified Wealth Dashboard**: Finalized the 3-tier financial display logic (Market Price, Modal, Investment Total).
- **Auto-Sync Reliability**: Implemented failover market data providers (Indodax, Yahoo, Frankfurter) with SSL bypass for high-resiliency market data.
- **AI Financial Wisdom**: Integrated Gemini-powered daily insights and wealth peramalan (*forecasting*).

### 💎 ASSET SYNCHRONIZATION
- **Type-Safe Assets**: Enforced strict SMALLINT casting for PostgreSQL boolean compatibility in `is_market_synced`.
- **Sync History**: Added `last_synced_at` and `change_24h` tracking for all market-linked assets.

---

## [7.4.0] — 2026-04-20 (The Unified Ledger Release)

### 🛡️ FINANCIAL FORTRESS
- **Unified Journaling (The Ledger)**: Major architectual shift moving all finance systems (Loans, Goals, Holidays) to a unified journaling mechanism.
- **Double-Entry Integrity**: All money movements are now recorded as ledger entries, eliminating balance drift across the dashboard.
- **Security V5 Hardening**: Mandatory security scan integration and RLS reinforcement on core tables.

### 📈 WEALTH INTELLIGENCE
- **The Prophet Engine**: Multi-currency, inflation-adjusted, 12-month foresight.
- **Wealth History**: Automated nightly snapshots of user net worth.

---

## [7.3.0] — 2026-04-17 (Calendar UX & Social Release)

### 📅 CALENDAR UX
- **Timeline View**: Financial movements visualized on a calendar for cashflow prediction.
- **Budget Guardian**: Monthly budget limits with interactive visual alerts.

### 👥 SOCIAL & PARTNERING
- **Dompet Kita Connect**: Initial release of partner linkage for shared household tracking.
- **Threshold Alerts**: Push notifications for large/unexpected partner spending.

---

## [7.2.0] — 2026-04-12 (Security & Performance Release)

### 🛡️ SECURITY HARDENING
- **Two-Factor Authentication**: Native 2FA support for Supabase Auth.
- **Login History & Activity Log**: Comprehensive tracking of all user actions.
- **PII Masking**: Integrated privacy guards for sensitive data.

### ⚡ PERFORMANCE
- **Postgres Optimization**: Indexed core finance tables for O(log n) dashboard loads.
- **Real-Time Hydration**: Bypassed stale caches for immediate data reflection.

---

## [7.1.0] — 2026-04-01 (Foundation Release)

### ✨ THE SINGULARITY
- **Initial Release**: The birth of Dompet Kita — Unified Financial Intelligence.
- **Supabase Integration**: Direct PG access with Row-Level Security.
- **Vercel/Railway Deployment**: Cloud-native infra setup.
