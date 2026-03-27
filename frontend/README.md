# 🎨 Dompet Kita - Frontend

The premium React application for **Dompet Kita**, crafted with a high-end UI and smooth performance.

## 🚀 Key Features
- **Modern UI Architecture**: Built with **React 19** and **Vite 6**.
- **Performance Driven**: Highly optimized bundle with manual code splitting and compression (Brotli/Gzip).
- **Interactive Animations**: Advanced transitions using **Framer Motion**.
- **Real-Time Data**: Seamlessly synchronized with TanStack Query v5.
- **Glassmorphic Aesthetic**: Premium notifications via **Sonner** and OKLCH color palettes (Tailwind CSS 4).
- **Responsive Design**: Built for all screen sizes with accessible components (Radix UI).

## 🛠️ Tech Stack
- **Framework**: React 19 (Stable)
- **Build Tool**: Vite 6.x
- **Styling**: Tailwind CSS 4.x + Shadcn/UI (Radix)
- **State Management**: TanStack Query (Server State) + Zustand (Client State)
- **Animations**: Framer Motion 12.x
- **Icons**: Lucide React
- **Charts**: Chart.js (Wealth History & Distribution)
- **Monitoring**: Sentry (Frontend Error Tracking)

## 📁 Folder Structure
- `src/components/auth`: Secure login & profile management.
- `src/components/features`: Core business logic (Transactions, Assets, Loans, Goals).
- `src/components/layout`: Shared shells and navigation.
- `src/components/ui`: Atomic Radix-based UI building blocks.
- `src/hooks`: Custom React hooks for global functionality.
- `src/lib`: Core utility functions (Supabase client, API client, currency formatters).

## 💻 Local Development
1. Clone the repository.
2. Navigate to `frontend/`.
3. Copy `.env.local` based on your backend environment.
4. Run `npm install`.
5. Run `npm run dev`.
6. Open `http://localhost:5173`.

## 📦 Build & Deployment
The project is configured for **Vercel** with automatic SPA routing and preview deployments.
- Run `npm run build` to generate a production-ready bundle.
- Visualize bundle size via `stats.html`.

---
*Developed by Alvin & Antigravity - Premium, Secure, & Modern*
