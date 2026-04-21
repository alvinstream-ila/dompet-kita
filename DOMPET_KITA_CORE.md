# 🛡️ DOMPET KITA — ARCHITECTURE BIBLE (v7.4.2 Hardened Release)

---

## 🏛️ System Core Philosophies

1.  **Unified Ledger**: No financial action exists outside the journal.
2.  **Shared Sovereignty**: Designed for Couples (Alvin & Ila), enforcing visibility across shared contexts.
3.  **High-Precision Fortress**: No precision loss for fiat or digital assets.
4.  **Autonomous Healing**: Automated maintenance and security gates.

---

## 🗄️ Database Architecture (Hardened v2025)

### 🏘️ The Household Pattern (Shared Sovereignty)
All financial data belongs to a **Household** (UUID). Access is enforced via **Supabase RLS** policies checking membership:
`household_id IN (SELECT household_id FROM users WHERE auth_uuid = auth.uid())`

### 💎 Precision Standards
| Context | Database Type | Precision | Rationale |
| :--- | :--- | :--- | :--- |
| **Fiat/Monetary** | `DECIMAL(19, 4)`| 4 Decimals | Avoids mid-calc rounding errors |
| **Asset Quantities**| `DECIMAL(36, 18)`| 18 Decimals | Crypto/Gold/EVM compatible |
| **Asset Value** | `DECIMAL(19, 4)` | 4 Decimals | Higher threshold for trillions |
| **Audit Trail** | `SoftDeletes` | `deleted_at` | Mandatory for all finance tables |

---

## 🔐 Security & Governance

### 🛡️ Gatekeeper Protocol
Every deployment MUST pass `php artisan security:gate --min-score=100`.
- **RLS**: Row-Level Security is MANDATORY on all tables containing `user_id` or `household_id`.
- **JWT**: Supabase JWT is the primary auth token, mapped via `auth_uuid`.

### 🔭 Cognitive Monitors
- **Watchdog Audit**: All actions logged to `activity_log`.
- **Honeypot Radar**: Real-time bot/attack visualization.

---

## 📈 Intelligence & Forecasting

### 🔮 The Prophet (Wealth Forecasting)
Project wealth trajectory for 12 months using historical trends, inflation targets, and current capital efficiency.

### 🧠 Gemini Integration
- **Daily Advice**: AI-generated financial wisdom.
- **Transaction Insights**: Pattern recognition for spending habits.

---

## 🗺️ Tech Stack (v7.4)

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 16 / React 19 (Vercel) |
| **Backend** | Laravel 13 / PHP 8.4 (Railway) |
| **Database** | Supabase (PostgreSQL) |
| **Styling** | Tailwind CSS 4.x (OKLCH) |
| **Monitoring**| Sentry (v10) |
| **Perimeter** | Cloudflare WAF |

---
_Last amended: 2026-04-21 | Antigravity AI v7.4.2_
