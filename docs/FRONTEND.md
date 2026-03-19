# 🎨 Dompet Kita Frontend Documentation

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
> This documentation was generated on March 19, 2026. Keep `src/components/ui` updated as the design system evolves!
