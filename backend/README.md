# 🏦 Dompet Kita - Backend API

The powerful engine behind **Dompet Kita**, built with **Laravel 12** and **PHP 8.4**.

## 🚀 Key Features

- **Transaction Engine**: Handles Income/Expense with multi-criteria filtering.
- **Wealth Tracking**: Automatically calculates net worth from assets, loans, and transaction history.
- **Goal Management**: Track savings progress for future milestones (e.g., Umrah, Holiday).
- **AI-Powered Insights**: Integrated with **Google Gemini AI** to provide financial summaries and advice.
- **Security**: Hardened with Laravel Sanctum, custom Security Headers, and Rate Limiting.
- **Infrastructure**: Designed for **Railway** (Backend) and **Supabase** (PostgreSQL).

## 🛠️ Tech Stack

- **Framework**: Laravel 12.x
- **Language**: PHP 8.4.0
- **Database**: PostgreSQL (Managed by Supabase)
- **Auth**: Laravel Sanctum (Token-Based)
- **Email**: SMTP Gmail (Production Ready)
- **Storage**: S3-Compatible (Storj)
- **Monitoring**: Sentry (Error Tracking)

## 📡 API Documentation

The API documentation is generated using **Swagger/L5-Swagger**.

- **URL**: `/api/documentation`

## ⚙️ Project Structure

- `app/Models`: Core data structures (Transaction, Asset, Loan, Goal, Holiday, User).
- `app/Http/Controllers/Api`: Clean API endpoints with request validation.
- `database/migrations`: Structured schema for all financial data.
- `routes/api.php`: Defined routes with Sanctum middleware protection.

## 💻 Local Development

1. Clone the repository.
2. Navigate to `backend/`.
3. Copy `.env.example` to `.env` and configure your credentials.
4. Run `composer install`.
5. Run `php artisan key:generate`.
6. Run `php artisan migrate`.
7. Start server with `php artisan serve`.

---

_Developed by Alvin & Antigravity - SECURE & SCALABLE_
