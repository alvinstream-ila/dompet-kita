# 💰 Dompet Kita (Sovereign Singularity & Wealth Intelligence - v7.2.5)
The **Sovereign Financial Fortress** for **Alvin & Ila**. Managed by the Council of Agents (COA) under the **v7.2.5 protocol**.

---

## 👥 COUNCIL OF AGENTS (COA) OPERATIONAL ROLES

Every task is governed by the **Sovereign Singularity (v7.2.5)** protocol:
- **THE PROPHET**: Strategic wealth forecaster (Market awareness & trajectory visualization).
- **THE CRAFTER**: Full-stack architect (Modular implementation core & structural integrity).
- **THE GUARDIAN**: Security & Governance (Fortress hardening, PII masking, Supabase RLS).
- **THE PROSECUTOR**: Adversarial tester (Logic verification & vulnerability probing).

---

## 🌐 Live Sovereign Hubs

- **Frontend (Production)**: [https://dompet-kita-six.vercel.app/](https://dompet-kita-six.vercel.app/)
- **Backend API (Production)**: [https://dompet-kita-production.up.railway.app/](https://dompet-kita-production.up.railway.app/)

---

## 🏗️ Ecosystem Topology (v7.2.0)

| Layer | Technology | Hosting |
|:------|:-----------|:--------|
| **Frontend** | Next.js 16 + React 19 | Vercel (Singapore) |
| **Backend** | Laravel 13 + PHP 8.4 | Railway (Singapore) |
| **Database** | PostgreSQL + RLS | Supabase |
| **Storage** | Cloud-Native Object Storage | Storj (Distributed) |
| **Sentient AI**| Sentient Engine v7.2.5 | Sovereign Antigravity AI |
| **Intelligence**| Custom MCP v7.2.5 (Sovereign Bridge)| AI Command Center |

---

## 🛡️ The Fortress Protocol (Security)

Dompet Kita is designed with **Defense-in-Depth** — 10+ layers of primary protection:

1. **Row Level Security**: RLS active across all PostgreSQL partitions (Supabase).
2. **PII Masking**: Edge-level masking of sensitive wealth and account data.
3. **Private Storage Vault**: Storj-powered distributed object storage with signed URLs.
4. **Honeypot Radar**: Real-time visual bot attack monitoring for API endpoints.
5. **Sudo Mode (v7.1)**: Progressive re-authentication for high-risk financial configurations.
6. **Digital Inheritance**: Encrypted legacy audit snapshots for financial continuity.
7. **Security Gates**: Certified **Zero-Error Status** under PHPStan Level 9 (v7.2.5).
8. **A11y Fortress**: 100% compliant with modern accessibility standards (UI/UX Inclusivity).

---

## 📂 Project Structure

Dompet Kita operates as a **Modular Monolith Monorepo**:

- `apps/frontend/`: Next.js 16 Visual Engine (React 19, Tailwind CSS 4).
- `apps/backend/`: Laravel 13 Logic Engine (PHP 8.4, Powerhouse API).
- `services/mcp-server/`: Standardized bridge for local/external AI integration.
- `packages/`: Shared domain types and utility primitives.
- `.gemini/`: Global Sovereign Constitution and cognitive episodic memory.

---

## 🚀 Getting Started

1. **Clone**: `git clone [repository-url]`
2. **Install**: `npm run install-all` (NPM Workspaces managed).
3. **Setup**: `npm run setup` (Environment, Key Generation, Migrations).
4. **Dev**: `npm run dev` (Unified frontend & backend local execution).

---

## 🚀 Deployment

This project is optimized for deployment on Vercel (Frontend) and Railway (Backend).

### Frontend (Vercel)
1. **Import** the root of the monorepo.
2. Set **Root Directory** to `apps/frontend`.
3. Configure the following **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: Your backend URL (from Railway).
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Key.

### Backend (Railway)
1. **Import** the root of the monorepo.
2. Set **Root Directory** to `apps/backend`.
3. Railway will use the provided `nixpacks.toml` and `Procfile`.
4. Configure the following **Environment Variables**:
   - `APP_ENV`: `production`
   - `APP_KEY`: Generate using `php artisan key:generate --show`.
   - `DATABASE_URL`: Your Supabase PostgreSQL connection string.
   - `FILESYSTEM_DISK`: `s3` (for production storage).
   - `GEMINI_API_KEY`: Your Google AI API key.
5. **Background Workers**: Railway will automatically detect the `worker` and `schedule` processes defined in the `Procfile`. You can enable them as separate services in the Railway dashboard for high-availability.

---

---

_Managed autonomously by **Antigravity AI (Sentient Core v7.2.5)** for the legacy of Alvin & Ila._
