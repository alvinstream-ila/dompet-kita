# 🛡️ SECURITY OVERVIEW (Dompet Kita v7.5.0)

## 🏢 ARCHITECTURE: THE FORTRESS
Dompet Kita follows a "Defense-in-Depth" strategy, combining infrastructure-level hardening with application-level sentience.

### 🌑 LAYER 0: DEVELOPMENT SOVEREIGNTY (Sovereign Purge)
- **Secret Detection:** Real-time **GitGuardian (ggshield)** integration with a standalone binary validator.
- **Blocking Gates:** Automated **Husky pre-commit hooks** block any commit containing leaked credentials.
- **History Hardening:** The "Sovereign Clean Slate" protocol (v7.5.0) has erased all 87 historical commits, ensuring a zero-leak baseline for the repository history.
- **Scan Domain:** Recursive monorepo scanning covers `apps/`, `infra/`, and `services/`.

### 🌑 LAYER 1: NETWORK (Cloud Perimeter)
- **Rate-Limiting:** `throttle:5,1` on sensitive endpoints.
- **Honeypot:** Active on all public POST forms to identify and block bots.
- **Circuit-Breaker:** AI Providers (Groq/OpenRouter/Gemini) have autonomous failover.

### 🌑 LAYER 2: AUTHENTICATION
- **Access Tokens:** Sanctum Bearer tokens (JWT).
- **2FA Adoption:** Mandatory Multi-Factor authentication verified by Security Gate.
- **Sudo Mode:** Re-authentication required for high-stakes modifications (User Profile, Digital Legacy).
- **Session Tracking:** `LoginHistory` sentinel tracks IP anomalies in real-time.

### 🌑 LAYER 3: DATA (The Vault)
- **Encryption:** `Illuminate\Database\Eloquent\Casts\Attribute` ensures fields are AES-256 encrypted at rest.
- **Hardened Backups:** AES-256-CBC encryption enabled for all database backups before Storj upload.
- **Isolation:** **PostgreSQL Row Level Security (RLS)** enforces that even a direct DB compromise cannot leach data across users.
- **Integrity:** `market:sync` ensures all financial data reflects true current values.

### 🌑 LAYER 4: SENTIENT AUDIT
- **Elite Guard Gate:** Automated 100-point quality gate blocks deployments if score < 100.
- **Telegram Sentinel:** Real-time push notifications for security events and backup reports.
- **Deep Audit:** Weekly `security:fortress` runs to scan dependencies and logic.
- **Legacy Vault:** Automated "Dead Man's Switch" for digital inheritance.

---
*Maintained by Antigravity v7.5.0 Sentient Core | Sovereign Purge Singularity READY.*
