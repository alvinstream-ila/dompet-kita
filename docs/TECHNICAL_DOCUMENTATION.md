# 💎 Dompet Kita Technical Documentation

Welcome to the comprehensive technical documentation for **Dompet Kita**, a secure, AI-powered financial manager designed for Alvin & Ila.

---

# 🏦 Backend Documentation

Welcome to the official technical documentation for the **Dompet Kita** backend. This system is designed as a secure, AI-powered personal and couple finance manager, specifically tailored for Alvin & Ila.

---

## 🚀 1. Introduction & Overview

**Dompet Kita** is a robust API-driven backend built to manage complex financial data, including income/expense tracking, asset management, loan monitoring, and goal planning. It features a unique "Gatekeeper" AI integration that provides emotional and practical financial insights.

- **Primary Goal**: Centralize financial management with a personal touch.
- **Key Users**: Alvin (Partner 1) & Ila (Partner 2).
- **Core Principle**: Security, transparency, and AI-driven growth.

---

## 🛠️ 2. Technical Stack

| Component | Technology |
| :--- | :--- |
| **Language** | PHP 8.2+ |
| **Framework** | Laravel 11.x |
| **Database** | PostgreSQL (Hosted on Supabase) |
| **Authentication** | Laravel Sanctum (Token-based) |
| **Social Auth** | Laravel Socialite (Google Support) |
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
| Method | Path | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/register` | User signup. | No |
| `POST` | `/api/login` | User login (Throttled). | No |
| `POST` | `/api/logout` | Revoke tokens. | Yes |
| `GET` | `/api/auth/{provider}` | Start Social Login. | No |

### 💰 Finance & Wealth
| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/api/transactions` | List all transactions. |
| `POST` | `/api/transactions` | Add new record. |
| `GET` | `/api/wealth-history` | Fetch net worth trends. |
| `GET` | `/api/loans` | Track debts/loans. |

### 🧠 AI & Services
| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/api/ai/insights` | Fetch AI personal insights. |
| `POST` | `/api/ai/analyze` | Scan receipt (Maintenance). |
| `POST` | `/api/media/upload` | Upload files to storage. |

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
> Backend documentation generated on March 19, 2026. This is a living document and should be updated whenever the `routes/api.php` or `migrations` change.

---

# 🎨 Frontend Documentation

Welcome to the official technical documentation for the **Dompet Kita** frontend. This is a high-performance, immersive React application designed to provide a premium financial management experience.

---

## 🚀 1. Introduction & UI/UX Vision

The **Dompet Kita** frontend is built with a focus on "Aesthetic Precision" and "Functional Warmth." It combines modern glassmorphism, 3D elements, and smooth micro-animations to create a platform that feels alive and supportive.

- **Frontend Goal**: Turn boring financial data into a beautiful, interactive journey.
- **Key Features**: 3D Wealth visualizations, real-time budget guardrails, and mobile-first responsive design.

---

## 🛠️ 2. Technology Stack

| Component | Technology |
| :--- | :--- |
| **Framework** | React 19 (Stable) |
| **Build Tool** | Vite 8.x |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS 4.x + PostCSS |
| **Animations** | Framer Motion + Lottie |
| **3D Engine** | Three.js (@react-three/fiber & @react-three/drei) |

---

## 🏗️ 3. Application Architecture

### Entry Point & Layout
- **Root**: `src/main.tsx` initializes Sentry and React.
- **Routing**: `react-router-dom` v7 with **Lazy Loading** for all major pages to optimize performance.
- **Main Layout**: `src/components/layout/MainLayout.tsx` provides the common Sidebar and Navigation structure.

### State Management
- **AuthContext**: Manages login state, user session, and redirection.
- **SettingsContext**: Handles theme preferences, currency formatting, and partner settings.
- **Zustand**: Used for specific light-weight global states (e.g., UI toggles).

### Data Fetching
- **TanStack Query (v5)**: Centralized data fetching with 5-minute stale-time caching.
- **Axios**: Configured with interceptors for automatic JWT attachment.

---

## 📄 4. Core Pages & Features

### 🏠 Home (Dashboard)
- **Financial Summary**: Real-time income vs. expense cards.
- **AI Insights**: Romantic and practical tips from "The Gatekeeper."
- **3D Hero**: Interactive elements using `@react-three/fiber`.

### 💰 Transactions & Wealth
- **Transaction Logs**: Sortable, filterable list of all financial records.
- **Wealth Tracker**: Visual breakdown of assets (Cash, Bank, Investments).
- **Charts**: Integrated with `Chart.js` for monthly analytics.

### 🤝 Loans & Goals
- **Loans**: Track "Utang" and "Piutang" with contact names.
- **Mimpi Kita**: Goal-based progress bars with target amounts.

### 🌴 Holiday Planner
- **Budget Tracking**: Dedicated view for trip planning.
- **Itinerary Management**: Rich text itinerary editor.

---

## 🎨 5. Design System (Shadcn/ui)

The project uses a custom-themed **Shadcn/ui** design system stored in `src/components/ui`.
- **Primary Colors**: Indigo/Violet gradients for a premium feel.
- **Typography**: Inter (Modern Sans-serif).
- **Glassmorphism**: Subtle blurs (`backdrop-blur-md`) used on cards and navigation.

---

## ⚙️ 6. Development & Build

### Development
```bash
npm install
npm run dev
```

### Build for Production
```bash
npm run build
```
The build process includes **Vite Compression** and **Rollup Visualizer** to maintain a lean bundle size.

---

> [!TIP]
> Frontend documentation generated on March 19, 2026. Keep `src/components/ui` updated as the design system evolves!
