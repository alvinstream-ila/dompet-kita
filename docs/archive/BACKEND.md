# 🏦 Dompet Kita Backend Documentation

Welcome to the official technical documentation for the **Dompet Kita** backend. This system is designed as a secure, AI-powered personal and couple finance manager, specifically tailored for Alvin & Ila.

---

## 🚀 1. Introduction & Overview

**Dompet Kita** is a robust API-driven backend built to manage complex financial data, including income/expense tracking, asset management, loan monitoring, and goal planning. It features a unique "Gatekeeper" AI integration that provides emotional and practical financial insights.

- **Primary Goal**: Centralize financial management with a personal touch.
- **Key Users**: Alvin (Partner 1) & Ila (Partner 2).
- **Core Principle**: Security, transparency, and AI-driven growth.

---

## 🛠️ 2. Technical Stack

| Component          | Technology                          |
| :----------------- | :---------------------------------- |
| **Language**       | PHP 8.4                             |
| **Framework**      | Laravel 11.x                        |
| **Database**       | PostgreSQL (Hosted on Supabase)     |
| **Authentication** | Laravel Sanctum (Token-based)       |
| **Social Auth**    | Laravel Socialite (Google Support)  |
| **AI Integration** | Google Gemini AI (via AIController) |

---

## 📊 3. Database Schema & Models

The database is structured to support multi-user operations and historical tracking.

### `users` Table

Stores user profiles, settings, and partner information.

- `social_id`, `social_type`: For OAuth integration.
- `partner_name`, `anniversary_date`: Personalization fields.
- `monthly_budget_limit`: User-defined guardrail.

### `transactions` Table

The core ledger of the application.

- `type`: `income` or `expense`.
- `amount`: Precision decimal (15,2).
- `receipt_url`: Link to uploaded media.

### `assets` Table

Tracks net worth components.

- `type`: `cash`, `bank`, `investment`, `property`.
- `value`: Current valuation.

### `loans` Table

Tracks debt and lending.

- `type`: `utang` (debt) or `piutang` (loaned out).
- `remaining_amount`: Tracks partial repayments.

### `goals` & `holidays` Table

- **Goals**: Target-based savings tracking.
- **Holidays**: Trip planning and budget allocation.

---

## 🌐 4. API Endpoints

All private endpoints require the `Authorization: Bearer <token>` header.

### 🔑 Authentication

| Method | Path                   | Description                  | Auth |
| :----- | :--------------------- | :--------------------------- | :--- |
| `POST` | `/api/register`        | User signup.                 | No   |
| `POST` | `/api/login`           | User login (Throttled).      | No   |
| `POST` | `/api/logout`          | Revoke tokens.               | Yes  |
| `GET`  | `/api/auth/{provider}` | Start Social Login.          | No   |
| `ANY`  | `/api/email/verify`    | Email Verification Callback. | No   |

### 💰 Finance & Wealth

| Method | Path                  | Description             |
| :----- | :-------------------- | :---------------------- |
| `GET`  | `/api/transactions`   | List all transactions.  |
| `POST` | `/api/transactions`   | Add new record.         |
| `GET`  | `/api/wealth-history` | Fetch net worth trends. |
| `GET`  | `/api/loans`          | Track debts/loans.      |

### 🧠 AI & Services

| Method | Path                | Description                 |
| :----- | :------------------ | :-------------------------- |
| `GET`  | `/api/ai/insights`  | Fetch AI personal insights. |
| `POST` | `/api/ai/analyze`   | Scan receipt (Maintenance). |
| `POST` | `/api/media/upload` | Upload files to storage.    |

---

## 🤖 5. AI "The Gatekeeper" Logic

The `AIController` acts as a financial coach with a personality.

- **Insight Engine**: Analyzes the last 30 days of `transactions`.
- **Dynamic Templates**:
  - **Deficit**: Encouraging messages about saving.
  - **Buffer**: Pride-filled messages about small savings.
  - **Surplus**: Celebration and date-night suggestions.
- **Tone**: Romantic, supportive, and "sayang-centric".

---

## ⚙️ 6. Deployment & Setup

### Installation

1. `composer install`
2. `php artisan migrate`
3. `php artisan key:generate`
4. `php artisan serve`

---

> [!NOTE]
> Documentation generated on March 22, 2026. This is a living document and should be updated whenever the `routes/api.php` or `migrations` change.
