# 🎨 Dompet Kita - Frontend (v7.2.0 Sovereign)

The premium Next.js application for **Dompet Kita**, crafted with a high-end UI, smooth performance, and AI-driven wealth intelligence. Now modernized with Next.js 16 for peak performance.

---

## 🚀 Sovereign Performance (v7.2.0)

This application is now running on the **Sovereign Performance** stack:
- **Partial Prerendering (PPR)**: Instant shell loading for major routes (Home, Transactions) with dynamic data streaming.
- **React Compiler**: Automated memoization and rendering optimization enabled at the compiler level.
- **Turbopack**: High-performance production builds and instant HMR.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16.x (App Router) + React 19 (Stable)
- **Styling**: Tailwind CSS 4.x (Native variables) + Shadcn/UI (Radix)
- **State Management**: TanStack Query (Server State) + Zustand (Client State)
- **Animations**: Framer Motion 12.x
- **Infrastructure**: Proxy-based traffic management (`proxy.ts`)

---

## 📂 Detailed Folder Structure

The project follows a **Feature-Driven Modular Architecture**:

```text
src/
├── app/                # Next.js App Router (PPR & RSC Layouts)
│   ├── (auth)/         # Auth-group routes (Login, Register)
│   ├── (protected)/    # Protected application territory
│   ├── layout.tsx      # Root Layout with High-end providers
│   └── page.tsx        # Dashboard Landing (PPR Enabled)
├── features/           # Domain-Driven Modules (THE CORE)
│   ├── auth/           # Login, registration, & user profiles
│   ├── wealth/         # Forecasting, trajectories, & distribution
│   ├── transactions/   # CRUD with PPR streaming support
│   └── ...             # Other modular features
├── actions/            # Next.js Server Actions (Service Layer)
├── components/         # Shared UI Components
├── lib/                # Core Utilities (Supabase, API Clients)
├── proxy.ts            # Next.js 16 Network Bridge & Security
└── instrumentation.ts  # Node & Edge Runtime Monitoring (Sentry)
```

---

## 💻 Local Development

1. Clone the repository at the monorepo level.
2. Navigate to `apps/frontend/`.
3. Copy `.env.local` based on your backend environment.
4. Run `npm install` (using the root lockfile).
5. Run `npm run dev`.
6. Open `http://localhost:3000`.

---

_Managed autonomously by **Antigravity AI (Sovereign Core v7.2.0)**._
