# Changelog - Dompet Kita

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [7.2.5] - 2026-04-16 (Sovereign Deep Scan & A11y Singularity)

### Added
- **Sovereign Deep Scan v1.0**: Launched a comprehensive cross-monorepo audit suite with automated reporting.
- **Penpot Governance**: Introduced `PenpotException` and refactored Penpot actions for high-fidelity error handling.
- **2GB Analysis Boost**: Optimized PHPStan and Rector pipelines with high-memory allocation for deeper cross-file lineage analysis.

### Changed
- **A11y Fortress Hardening**: Resolved 112 accessibility warnings across the frontend, enforcing explicit button typing and semantic SVG metadata.
- **PHP 8.4 Stability Sync**: Refactored backend service logic to resolve `JsonException` conflicts in audit tools under PHP 8.4.
- **Biome v4 Harmony**: Synchronized the frontend linter with Tailwind CSS v4 directives and oklch color spaces.

### Security
- **Zero-Error Audit Achievement**: Reached **100% Zero-Error status** under **PHPStan Level 9**, confirming absolute type integrity for the financial logic engine.
- **Linter-Auditor Harmony**: Refactored return logic in core services to satisfy both IDE style checkers and strict static analysis rules.

## [7.2.0] - 2026-04-14 (Sovereign Performance Modernization)

### Added
- **Partial Prerendering (PPR)**: Implemented Next.js 16 PPR on Home and Transactions pages for instant shell delivery and seamless data streaming.
- **React Compiler**: Integrated `babel-plugin-react-compiler` for automated component memoization and rendering optimization.
- **Dashboard Skeletons**: Enhanced skeleton loading states to support PPR hydration boundaries.
- **Symfony 8 Components**: Integrated Symfony 8 foundation for peak request handling efficiency in the backend.

### Changed
- **Next.js 16 Upgrade**: Migrated the frontend from v15 to v16.2.3 for peak runtime efficiency and Turbopack stability.
- **Laravel 13 Upgrade**: Successfully performed the "Big Jump" from Laravel 12 to **v13.4.0**, leveraging PHP 8.4 optimizations.
- **Vite 8 & TypeScript 6**: Modernized the root development toolchain to the latest stable major versions.
- **Middleware to Proxy Migration**: Refactored `middleware.ts` to `proxy.ts` to align with the Next.js 16 networking convention.
- **Autoloader Optimization**: Rebuilt the backend autoloader with optimized class mapping (43K+ classes indexed) for lightning-fast application booting.

### Security
- **Hardened Backend Audit**: Achieved zero-error status under **PHPStan Level 9**, ensuring absolute type safety across the logic engine.
- **Logic Sovereignty Verification**: Conducted a comprehensive audit of **Sudo Mode**, **AI Health**, and **Transaction management** to guarantee alignment with the v7.1.18 Sovereign Singularity standards.
- **Fortress Hardening**: Verified and patched logical vulnerabilities in higher-order financial modules.

## [7.1.22] - 2026-04-13 (Node Security Singularity)

### Security
- **NPM Vulnerability Remediation**: Patched `hono`, `@hono/node-server`, and `basic-ftp` to resolve moderate and high severity security advisories.
- **Node Security Gate Pass**: Confirmed 100/100 security score after patching Node.js dependencies.

## [7.1.21] - 2026-04-13 (Security Patch Singularity)

### Security
- **CVE-2026-40194 Remediation**: Resolved a variable-time HMAC comparison vulnerability in `phpseclib/phpseclib` by updating to v3.0.51+. This ensures cryptographic integrity for SSH/SFTP operations.

## [7.1.20] - 2026-04-09 (React 19 & Architecture Modernization)

### Changed
- **React 19 / Next.js 15 Full Alignment**: Successfully migrated all form submission handlers to `React.SubmitEvent` and resolved deprecation warnings across the entire frontend.
- **Architectural Complexity Reduction**: Extracted core form sub-components (`LoanForm`, `AssetForm`) to drastically improve codebase maintainability and readability.
- **Modern JS standards Elevation**: Standardized on `replaceAll` and `Number.parseInt` for bulletproof numeric and string handling.

### Fixed
- **Production Build Integrity**: Resolved hidden prop mismatches in `AddLoanModal.tsx` discovered during production-grade builds.
- **Hook Lifecycle Verification**: Fixed missing `useEffect` dependencies in `AcceptPartnerModal.tsx` to ensure zero-warning lifecycle execution.

## [7.1.19] - 2026-04-08 (Railway Master Synchronization)

### Added
- **Railway MCP Protocol Mastery**: Successfully configured and verified the Railway MCP server with absolute path support for Windows environments.
- **Sovereign Project Link**: Established a persistent link between the local workspace and the production Railway hub (`Dompet kita`).

### Changed
- **Production Variable Audit**: Executed a comprehensive synchronization audit of all environment variables (Supabase, Railway, Storj, and Core) to ensure zero-mismatch production stability.
- **Cloud Connection Verification**: Verified and confirmed real-time connectivity for the **Gemini AI Oracle** and **Supabase Database**.

### Security
- **Production Gate Verification**: Validated the **Security Gate** status (100/100) and verified the **Brand Persona** (Sayang AI) error handling logic.

## [7.1.18] - 2026-04-07 (Sovereign Singularity & COA Protocol)

### Added
- **Council of Agents (COA) Protocol**: Officially integrated the **Prophet**, **Crafter**, **Guardian**, and **Prosecutor** roles into the core development engine.
- **Detailed Folder Tree**: Comprehensive source mapping in `README.md` for enhanced modular maintainability.
- **Sentry v10 Instrumentation**: Modernized error tracking via `instrumentation.ts` for both Node and Edge runtimes.
- **Digital Inheritance Pillar**: Formalized the **Legacy Audit Hub** as a core domain in the Master Core.
- **Railway Mastery**: Explicitly documented **Railway** as the primary backend production hub.

### Changed
- **Tech Stack Harmonization**: Updated core documentation to reflect **Next.js 15 (App Router)** and **Laravel 11 (PHP 8.4)** as the stable baseline.
- **Modernized .cursorrules**: Realigned frontend development rules with the latest **Tailwind CSS 4 (OKLCH)** and **React 19** standards.
- **Master Core Elevation**: Reflowed `DOMPET_KITA_CORE.md` from v6.3 to **v7.1.18 Sovereignty**.

### Security
- **The Fortress Hardening**: Enhanced **PII masking** and **Supabase RLS** rules documentation in the Master Core.

## [6.3.0] - 2026-04-01 (Sentient Core & Transcendence)

### Added
- **Stochastic Intelligence**: Monte Carlo engine for financial simulations (P10/P50/P90).
- **VibeGuard Sentinel**: Automated glassmorphism and modern color space validation for UI components.
- **Deep Security Scan**: Snyk integration for autonomous backend code patching.
- **Session Purifier**: Git integrated end-of-session auto cleanup workflow.
- **Cloud Orchestrator**: Unification of Railway, Supabase, and Storj backups via `cloud:sync`.
- **E2E Testing Base**: Playwright test suite for unified frontend and backend integration validation.
- **CI/CD Fixes**:
    - [Infra] Resolved `google/osv-scanner-action` integration error by transitioning to job-level reusable workflows.
    - [Infra] Implemented sequential quality gate: `sentinel-gate` now waits for `sentinel-osv` results.
- **Docker Compose**: Pre-configured setup for local PostgreSQL, Redis, and Minio dependencies.
- **Github Actions**: Automated complete CI/CD pipeline guarding production deployments.

### Changed
- Standardized `package.json` as an NPM Workspace to govern frontend and backend concurrently.

### Security
- Automated tracking and encryptions of sensitive assets within the `WealthHistory` modules.
