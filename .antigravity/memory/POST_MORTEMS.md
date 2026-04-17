# 🕵️ POST-MORTEM LOG — Antigravity AI (v7.2.0)

> Every bug fixed is a lesson learned. Every lesson logged is a regresi prevented.
> Use the **5-Whys** methodology for every entry.

---

## 📋 TEMPLATE

```markdown
### [PMA-XXX] — [SHORT TITLE]
**Date**: YYYY-MM-DD  
**Severity**: 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low  
**Component**: [frontend | backend | infra | database | security]  
**Status**: ✅ Resolved | 🔄 Monitoring | ⚠️ Mitigated  

#### What Happened
[Brief factual description — what broke, what was the user impact]

#### 5 Whys Root Cause Analysis
1. **Why 1**: ...
2. **Why 2**: ...
3. **Why 3**: ...
4. **Why 4**: ...
5. **Root Cause**: ...

#### Fix Applied
[What was changed, file paths, migration IDs if applicable]

#### Prevention SOP Update
[New rule/check added to prevent recurrence — be specific]

#### Regression Test
[How to detect if this regresses — command, test name, or checklist item]
```

---

## 📚 LOG ENTRIES

---

### [PMA-001] — Laravel Firewall Autoloader Conflict
**Date**: 2026-04-15  
**Severity**: 🔴 Critical  
**Component**: backend  
**Status**: ✅ Resolved  

#### What Happened
`akaunting/laravel-firewall` package failed to autoload after composer install, causing the entire Laravel application to fail to boot with class-not-found errors on `Akaunting\Firewall\FirewallServiceProvider`.

#### 5 Whys Root Cause Analysis
1. **Why**: Application threw `Class not found` on boot
2. **Why**: ServiceProvider was registered before autoloader could resolve the package
3. **Why**: `composer dump-autoload` was not re-run after manual package edits
4. **Why**: The firewall package required manual PSR-4 namespace registration that wasn't handled by standard Composer flow
5. **Root Cause**: Custom autoload patch (`bootstrap/firewall_autoload_patch.php`) was created but not correctly included in `bootstrap/app.php` before the service providers loaded

#### Fix Applied
- Created `bootstrap/firewall_autoload_patch.php` with manual PSR-4 require chain
- Ensured the patch is `require`d at the top of `bootstrap/app.php` before any service provider registration
- Verified with `php artisan route:list` and `php artisan about`

#### Prevention SOP Update
> **RULE**: Before registering any third-party ServiceProvider in Laravel, ALWAYS verify:
> 1. Package exists in `vendor/` dir
> 2. Class can be resolved: `php artisan tinker --execute="new \\Vendor\\Package\\ClassName()"`
> 3. Run `composer dump-autoload` after any vendor directory manipulation

#### Regression Test
```bash
php artisan about | grep -i firewall
php artisan route:list | grep -i firewall
```

### [PMA-002] — Silent Test Failure due to Environment Misdetection
**Date**: 2026-04-17  
**Severity**: 🟠 High  
**Component**: backend  
**Status**: ✅ Resolved  

#### What Happened
Running `php artisan test` failed with exit code 1 but provided no clear output of which tests failed (it appeared as a silent hang or crash). When forced to show errors, it revealed a `BadMethodCallException` related to console confirmation prompts during HTTP Feature tests.

#### 5 Whys Root Cause Analysis
1. **Why**: `php artisan test` exited with code 1 without printing results.
2. **Why**: The application environment was incorrectly detected as `production` during the mass test run.
3. **Why**: The main `.env` file had `APP_ENV=production` and `APP_URL=https://...`, and `AppServiceProvider` was forcing production constraints based on `https` prefix.
4. **Why**: `RefreshDatabase` trait detects `production` environment and triggers a "Do you really want to run this command?" prompt for destructive database operations.
5. **Root Cause**: Lack of a dedicated `.env.testing` file and overly aggressive environment detection logic in `AppServiceProvider` that triggered production safeguards even during CLI tests.

#### Fix Applied
- Created a dedicated `apps/backend/.env.testing` to strictly enforce `APP_ENV=testing` and safe defaults.
- Modified `AppServiceProvider::bootSecurityGuards()` to explicitly exclude the `testing` environment from forcing HTTPS and production logic.
- Updated `phpunit.xml` to disable noisy coverage reporting by default and commented out the unused coverage block.

#### Prevention SOP Update
> **RULE**: All Laravel services MUST have a `.env.testing` file in the repository to prevent environment leakage from local `.env`. 
> **RULE**: Security middleware/providers MUST explicitly check for `!app()->environment('testing')` before enforcing destructive or interactive production constraints.

#### Regression Test
```bash
php artisan test --env=testing --no-coverage
```

---

_Log maintained by Antigravity v7.3.0 | Last updated: 2026-04-17_
