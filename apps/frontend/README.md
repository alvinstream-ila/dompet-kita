# 🎨 Dompet Kita - Frontend (v7.1.20 Sentient)

The premium Next.js application for **Dompet Kita**, crafted with a high-end UI, smooth performance, and AI-driven wealth intelligence.

---

## 👥 COUNCIL OF AGENTS (COA) OPERATIONAL ROLES

Every task is governed by the **Sovereign Singularity (v7.1.20)** protocol:
- **THE PROPHET**: Strategic wealth forecaster (Market awareness & trajectory visualization).
- **THE CRAFTER**: Full-stack architect (Modular implementation core).
- **THE GUARDIAN**: Security & Governance (The Fortress of Dompet Kita).
- **THE PROSECUTOR**: Adversarial tester (Vulnerability / Intent alignment).

---

## 🚀 Key Features

- **Wealth Intelligence (Phase 5)**: Multi-currency, inflation-adjusted, 12-month financial foresight.
- **Digital Inheritance (Phase 4)**: Secure legacy snapshots for heirs.
- **Family Hub (Phase 4)**: Partner synchronization for shared financial visibility.
- **Tax Assistant (Phase 4)**: AI-driven PPh 21 income tax estimation.
- **Visual-First UI (Phase 6)**: AI-driven visual validation for every major UI change.
- **Sudo Mode UI**: Integrated re-authentication flow for sensitive account settings.
- **Glassmorphic Aesthetic**: Premium OKLCH color palettes (Tailwind CSS 4).

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19 (Stable)
- **Styling**: Tailwind CSS 4.x (Native variables) + Shadcn/UI (Radix)
- **State Management**: TanStack Query (Server State) + Zustand (Client State)
- **Animations**: Framer Motion 12.x
- **Monitoring**: Sentry (v10) with mandatory `instrumentation.ts` integration
- **Storage**: Supabase (Database) + Storj (Object Storage)

---

## 📂 Detailed Folder Structure

The project follows a **Feature-Driven Modular Architecture**:

```text
src/
├── app/                # Next.js App Router (Routes & RSC Layouts)
│   ├── (auth)/         # Auth-group routes (Login, Register)
│   ├── (dashboard)/    # Main application dashboard
│   ├── api/            # Route Handlers
│   ├── layout.tsx      # Root Layout with High-end providers
│   └── page.tsx        # Landing Page (The Entry Point)
├── features/           # Domain-Driven Modules (THE CORE)
│   ├── auth/           # Login, registration, & user profiles
│   ├── wealth/         # Forecasting, trajectories, & distribution
│   ├── transactions/   # CRUD for income & expenses
│   ├── bills/          # Bill tracking & notifications
│   ├── goals/          # Financial planning & targets
│   ├── loans/          # Debt tracking & business lending
│   ├── assets/         # Wealth tracking & portfolio management
│   ├── reports/        # PDF generation & visualization
│   └── settings/       # Account & digital legacy configuration
├── actions/            # Next.js Server Actions (Service Layer)
├── components/         # Shared UI Components
│   └── ui/             # Radix UI atoms (Shadcn based)
├── lib/                # Core Utilities & Clients (Supabase, OCI, API)
├── hooks/              # Custom Global React Hooks
├── context/            # Global Contexts (Theme, Auth)
├── types/              # Domain-specific TypeScript Definitions
├── assets/             # Static Assets & Icons
└── instrumentation.ts  # Node & Edge Runtime Monitoring (Sentry)
```

---

## 💻 Local Development

1. Clone the repository.
2. Navigate to `apps/frontend/`.
3. Copy `.env.local` based on your backend environment.
4. Run `npm install`.
5. Run `npm run dev`.
6. Open `http://localhost:3000`.

## 📦 Build & Deployment

The project is configured for **Vercel** with automatic ISR and preview deployments.

- Run `npm run build` to generate a production-ready bundle.
- Visualize bundle size via `stats.html`.

---

_Managed autonomously by **Antigravity AI (Sentient Core v7.1.20)**._
