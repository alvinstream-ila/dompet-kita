# 🏦 Dompet Kita - Sentient Backend Core (v7.2.1)

The high-performance engine behind **Dompet Kita**, newly modernized to **Laravel 13** and fully optimized for **PHP 8.4**.
Hardened under the **Sovereign Performance** milestone, this backend utilizes the latest framework features and Symfony 8 components for peak responsiveness.

## 🚀 Key Features

- **Transaction Engine**: Handles Income/Expense with multi-criteria filtering.
- **AI-Powered Insights**: Integrated with **Groq (Primary), Gemini (Vision), and OpenRouter** via a dynamic Multi-Provider AI Manager.
- **Cognitive Document Processing**: Automated receipt scanning and categorization via Gemini Vision.
- **Decentralized Storage**: Secure file and avatar uploads via **Storj (S3 Compatible)** object storage.
- **Resilient Database**: Connected via **Supabase Transaction Pooler (AWS-1 Singapore)** for high availability.
- **Wealth Projection (Phase 5)**: AI-driven wealth growth trajectory for 12 months.
- **Fiscal Intelligence (Phase 4)**: Automated PPh 21 tax estimation with AI advisory.
- **Legacy Snapshots (Phase 4)**: Encrypted digital legacy snapshots (Assets, Loans, Goals).
- **Elite Guard (Phase 6)**: Mandatory 100-point security gate with **2FA Enforcement** and **Log Sanity Scanning**.
- **Sudo Mode Security**: Re-authentication middleware for high-stakes account operations.
- **Telegram Sentinel**: Real-time project alerts (Logins, Backups, Sudo activity).
- **Defense-in-Depth**: Hardened with Laravel Sanctum, PostgreSQL RLS (Row Level Security), custom Security Headers, and Rate Limiting.

## 🛠️ Tech Stack & Infrastructure

- **Framework**: Laravel 13.4.0 (Modernized from v12)
- **Engine Core**: Symfony 8.x Components
- **Language**: PHP 8.4.x
- **Database**: PostgreSQL 17.6 (Managed by Supabase - `aws-1-ap-southeast-1.pooler.supabase.com:6543`)
- **Auth**: Laravel Sanctum (Cookie & Token-Based)
- **AI Engine**: Groq (Llama-3), Gemini (Vision), OpenRouter
- **Email**: SMTP Yahoo / Gmail
- **Storage**: S3-Compatible ([Storj](https://storj.io))
- **Cache & Queue**: Database Driver
- **Deployment**: Railway (Backend main deployment)

## 📡 API Documentation

The API documentation is generated using **Swagger/L5-Swagger**.

- **URL**: `/api/documentation` / `/docs`
- Contains exactly **70 RESTful Application Endpoints**.

## ⚙️ Project Structure

- `app/Console/Commands`: Contains *Council of Agents (COA)* automated health checks, security gates, and self-healing tools.
- `app/Models`: Core data structures (Transaction, Asset, Loan, Goal, Holiday, User).
- `app/Http/Controllers/Api`: Clean API endpoints with request validation (Financial & AI Controllers).
- `database/migrations`: Structured schema for all financial data (32 migrations full sync).
- `routes/api.php`: Defined routes with Sanctum middleware protection.

## 💻 Local Development & Setup

1. **Clone & Setup**:
   ```bash
   git clone <repository>
   cd apps/backend
   copy .env.example .env
   ```

2. **Environment Configuration**:
   Contact the admin for the Production `.env`. You will need:
   - Supabase Credentials
   - AI API Keys (Groq, Gemini, OpenRouter)
   - Storj S3 Credentials

3. **Install Dependencies**:
   ```powershell
   # Windows optimization to prevent stalling and ensure clean Laravel 13 upgrade
   $env:COMPOSER_MEMORY_LIMIT = "-1"
   composer install --no-interaction --prefer-dist --no-scripts
   composer dump-autoload -o
   ```

4. **Initialize System**:
   ```bash
   php artisan key:generate
   php artisan storage:link
   php artisan migrate
   php artisan optimize:clear
   ```

5. **Run the Sentinel**:
   ```bash
   php artisan serve
   ```
   *Dashboard System Status can be checked via `php artisan system:status`*

---

_Developed by Alvin & Antigravity COA - READY FOR SINGULARITY_
