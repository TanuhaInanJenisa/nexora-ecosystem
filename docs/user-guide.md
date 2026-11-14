# NEXORA — Developer Operations & Comprehensive User Manual

> **Platform Tagline:** One Ecosystem. Unlimited Possibilities.  
> **Audience:** Solo Developer, System Administrators, Support Staff, and Platform Operators

---

## Table of Contents
1. [Developer Operations & Quick Start](#1-developer-operations--quick-start)
2. [Monorepo Architecture & Codebase Map](#2-monorepo-architecture--codebase-map)
3. [Customer Web Portal Manual (`apps/web`)](#3-customer-web-portal-manual-appsweb)
4. [Universal Mobile App Manual (`apps/mobile`)](#4-universal-mobile-app-manual-appsmobile)
5. [Super Admin Command Center Manual (`apps/admin`)](#5-super-admin-command-center-manual-appsadmin)
6. [30 Administrative Modules Reference](#6-30-administrative-modules-reference)
7. [Troubleshooting & Common Operations FAQ](#7-troubleshooting--common-operations-faq)

---

## 1. Developer Operations & Quick Start

All operations run from the monorepo root directory:  
`c:\Users\UESR\Desktop\Web+Android Application`

### 1.1 Essential Terminal Commands

| Action | PowerShell Command | Explanation |
|---|---|---|
| **Install Monorepo Dependencies** | `pnpm.cmd install` | Resolves and hard-links all package dependencies via pnpm v9 |
| **Run All Apps in Development** | `pnpm.cmd run dev` | Spins up Web (3000), Admin (3001), and Metro bundler concurrently |
| **Execute Automated Test Suite** | `pnpm.cmd test` | Runs 43 unit tests across business-logic, validation, and api packages |
| **Run Static Type Check** | `pnpm.cmd run typecheck` | Validates strict TypeScript compilation across all 10 packages & apps |
| **Build Entire Monorepo** | `pnpm.cmd run build` | Builds production artifacts for Web, Admin, and shared packages |
| **Clean Build Artifacts** | `pnpm.cmd run clean` | Purges `.turbo`, `dist`, and `.next` caches |

### 1.2 Running Individual Applications

- **Customer Web Portal only:**
  ```powershell
  pnpm.cmd --filter @nexora/web dev
  ```
  Access via browser: `http://localhost:3000`

- **Super Admin Command Center only:**
  ```powershell
  pnpm.cmd --filter @nexora/admin dev
  ```
  Access via browser: `http://localhost:3001`

- **Universal Mobile App (Metro bundler):**
  ```powershell
  pnpm.cmd --filter @nexora/mobile start
  ```
  Press `a` for Android Emulator, `i` for iOS Simulator, or scan the QR code using Expo Go.

---

## 2. Monorepo Architecture & Codebase Map

```
├── apps/
│   ├── admin/          # Super Admin Command Center (Next.js 14 App Router)
│   ├── mobile/         # Universal Mobile App (React Native + Expo SDK 52)
│   └── web/            # Customer Web Portal (Next.js 14 App Router)
├── packages/
│   ├── api/            # Supabase API client, business/community/ai/realtime modules
│   ├── business-logic/ # 8-tier RBAC permissions, DJB2 feature flags, semver comparison
│   ├── shared/         # Universal utilities, date/currency formatters, string helpers
│   ├── types/          # Central TypeScript interfaces, entities, and database types
│   ├── ui/             # Reusable UI components, AI Assistant widget, Notification dropdown
│   ├── ui-tokens/      # Design system tokens (Deep Indigo #1E1B4B, Electric Violet #7C3AED)
│   └── validation/     # Zod runtime validation schemas for Auth, Services, Config
├── docs/               # Architecture, Deployment, Security, and User manuals
└── supabase/           # PostgreSQL migrations, RLS policies, and seed data
```

---

## 3. Customer Web Portal Manual (`apps/web`)

### 3.1 Public Portal & Hero Experience
- **Interactive Hero:** Displays dynamic tagline, animated CTA buttons ("Explore Ecosystem", "Book Service"), and statistics counters.
- **Service Catalog Showcase (`/services`):** Categorized view of enterprise services with pricing tiers, turnaround SLAs, and an interactive **Commission Service Modal** that inserts live records into Supabase `service_requests`.
- **Community Discussion Hub (`/community`):** Rich interactive forum feed where users create discussion topics, upvote posts in real time, and contribute comments.
- **Customer Dashboard (`/dashboard`):** Personalized command center showing recent activity, notification summaries, and a live **"My Service Requests"** tracking table.

### 3.2 Global Ecosystem Features
- **AI Assistant Widget:** Floating trigger at bottom-right ("Ask NEXORA AI") expanding an intelligent dialog supporting queries on Monorepo structure, RBAC clearances, services catalog, and bilingual Bangla responses.
- **Notification Center:** Bell icon in top navigation with live unread counter badge, filter tabs (`All`, `Unread`), and one-click "Mark all as read".
- **Dynamic Remote Gates:** Automatically displays full-screen `MaintenanceGate` or `VersionGate` when toggled from the Admin console.

---

## 4. Universal Mobile App Manual (`apps/mobile`)

### 4.1 Architecture & Navigation
Built on React Native and Expo SDK 52 with smooth tab-based navigation:
- **Explore Tab:** Highlights ecosystem announcements, quick action cards, and featured services.
- **Services Tab:** Browse available solutions with instant booking dialog connected directly to Supabase.
- **Community Tab:** Social feed with instant post submission, live like counters, and comment viewing.
- **Notifications Tab:** Real-time push notification feed with read/unread status filters.
- **Profile Tab:** User settings, active role badge display, language switch, and session sign-out.

### 4.2 Offline Resilience & Gates
- **Offline Fallback:** Bootstrapped with `DEFAULT_BOOT_CONFIG` to function smoothly even when offline.
- **Maintenance Screen:** Hard modal with bilingual Bengali/English notice when platform maintenance is triggered.
- **Force Update Dialog:** Blocks outdated app builds with a direct redirect to Google Play Store / Apple App Store.

---

## 5. Super Admin Command Center Manual (`apps/admin`)

The Super Admin Command Center is an enterprise-grade administrative portal engineered for single-pane-of-glass platform management.

### 5.1 Accessing the Admin Console
1. Navigate to `http://localhost:3001` (or your production admin domain).
2. Log in with an account having `super_admin` or `system_admin` clearance.
3. The dashboard automatically validates credentials and mounts the 6 operational suites.

---

## 6. 30 Administrative Modules Reference

The command center features 30 distinct management modules organized across 6 core operational suites:

### Suite 1: Command Overview & KPIs
1. **Executive Metrics Overview:** Real-time counters for Total Users, Active Subscriptions, Monthly Revenue, and System Health.
2. **Active Traffic Monitor:** Real-time throughput graph displaying active WebSocket connections and API query velocity.
3. **Incident Ledger & Alerts:** Real-time alert feed showing database latencies, failed jobs, or infrastructure warnings.
4. **Quick Command Bar:** One-click shortcuts for clearing caches, downloading audit dumps, or triggering broadcast alerts.
5. **System Health Inspector:** Live status indicators for PostgreSQL database, Supabase Auth, Storage, and Realtime engines.

### Suite 2: Users & RBAC Management
6. **User Directory:** Paginated table of all registered users with avatar, email, join date, and current status.
7. **Role Assignment Engine:** Dropdown interface to upgrade or downgrade user roles across the 8-tier RBAC hierarchy.
8. **Permission Matrix Inspector:** Visual matrix showing permissions associated with each role.
9. **Account Suspension Valve:** Instant toggle to suspend compromised accounts or ban malicious actors.
10. **Session Revocation Tool:** One-click button to invalidate all active JWT tokens for a specific user ID.

### Suite 3: Remote Config & Feature Flags
11. **Global Maintenance Gate Controller:** Emergency toggle that immediately locks web and mobile clients into maintenance mode.
12. **Bilingual Maintenance Notice Editor:** Real-time editor for English and Bengali maintenance banners and countdown timers.
13. **DJB2 Feature Flag Dashboard:** List of active flags with rollout percentages, target platforms, and target roles.
14. **Percentage Rollout Slider:** Granular slider (0% to 100%) to ramp up features smoothly.
15. **App Version Policy Manager:** Sets latest version, minimum supported version, and force update flag for Web, Android, and iOS.

### Suite 4: Content & CMS Management
16. **Articles & Blog Editor:** Create and edit announcements and ecosystem documentation.
17. **Category Taxonomy Manager:** Manage tags, slugs, and organizational groupings.
18. **Platform Banner Engine:** Schedule global dismissible notification banners across Web and Mobile.
19. **Media Library Manager:** Inspect uploaded files, optimize image storage, and prune unreferenced assets.
20. **Editorial Moderation Queue:** Review pending community posts and user-submitted attachments.

### Suite 5: Commerce & Services Ledger
21. **Service Requests Board:** Master kanban/table of all customer commission requests.
22. **Status Advance Pipeline:** Move requests across `PENDING REVIEW` ➔ `IN PROGRESS` ➔ `COMPLETED` ➔ `CANCELLED`.
23. **Service Catalog Editor:** Add new service items, edit descriptions, adjust pricing and turnaround SLAs.
24. **Quote & Invoicing Generator:** Issue custom quotes and generate client invoices.
25. **Financial Revenue Ledger:** Track gross volume, refunds, and net revenue across payment gateways.

### Suite 6: Security, Compliance & Audit Trail
26. **Immutable Audit Trail:** Chronological ledger recording all administrative updates with actor ID, IP, and timestamp.
27. **Threat & Intrusion Monitor:** Track failed authentication attempts, brute-force indicators, and IP rate limits.
28. **Active Admin Sessions:** View currently logged-in administrator sessions and geo-locations.
29. **Zero-Trust RLS Policy Inspector:** Overview of PostgreSQL table policies and active security rules.
30. **Compliance & Snapshot Export:** One-click automated export of compliance logs in JSON/CSV formats.

---

## 7. Troubleshooting & Common Operations FAQ

### Q1: What should I do if a Next.js build shows an `EPERM` error on Windows?
**Solution:** On Windows, file-indexing tools or sandbox locks occasionally hold a temporary handle on `.next/trace`. Simply run `pnpm.cmd run clean` to wipe the cache, then retry the build command.

### Q2: How do I test the full automated test suite?
**Solution:** Run `pnpm.cmd test` from the root workspace. Turborepo compiles dependencies and executes all 43 tests across the monorepo in parallel under 15 seconds.

### Q3: How do I grant super_admin rights to a new user?
**Solution:** Open the Supabase SQL Editor and execute:
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('<USER_UUID>', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;
```
Or use the **User Directory** module in the Super Admin Command Center (`apps/admin`).

### Q4: How do I trigger an emergency platform shutdown?
**Solution:** In `apps/admin`, navigate to **Remote Config > Global Maintenance**, toggle to **Enabled**, and enter the estimated recovery time. Web and Mobile apps immediately display the full-screen maintenance shield via WebSocket push.
