# Security Policy

The security of **Dompet Kita** and its users is our highest priority. We implement numerous defense-in-depth measures, including Row-Level Security (RLS) policies, advanced encryption, zero-trust architecture, and routine security audits.

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please notify us immediately rather than disclosing it publicly.  
You can reach out directly to the core maintainers:
- **Alvin & Ila** - Direct Contact

We will evaluate the report and implement a hotfix if deemed critical.

## 2FA (Two-Factor Authentication) Policy & Limitation of Liability

> **IMPORTANT:** 
> Users are **solely responsible** for managing and securing their Two-Factor Authentication (2FA) credentials, devices, and backup codes. 

While **Dompet Kita** provides robust Multi-Factor Authentication mechanisms (including 6-Digit OTP and Authenticator App integrations) to protect your ecosystem, the administration of these security tokens lies entirely with the user.
- We **are not responsible** for any loss of access, data, or financial management capabilities resulting from a user losing access to their 2FA device, email account, or recovery codes.
- **Dompet Kita** does not maintain a "backdoor" to bypass 2FA under any circumstances. If a user loses their 2FA capability and backup codes, the account may become permanently inaccessible to ensure ultimate data sovereignty.

## Supported Versions

Currently, only the `main` branch (Production deployment v7.x.x series) is actively supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 7.5.x   | :white_check_mark: |
| < 7.0   | :x:                |

## Standard Security Measures
- **Sudo Mode**: High-risk actions require password re-authentication.
- **Automated Scanning**: Commits are strictly verified against GitGuardian for secrets.
- **Database Architecture**: Direct Postgres manipulation is restricted by isolated Supabase RLS profiles.
