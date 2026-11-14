# NEXORA — Enterprise All-in-One Digital Ecosystem

> **Tagline:** One Ecosystem. Unlimited Possibilities.

---

## 🌟 Overview

**NEXORA** is a scalable, modern, enterprise digital ecosystem built with a unified monorepo architecture. It seamlessly connects a cross-platform Mobile application (Android & iOS), a responsive public Web portal, and a comprehensive 30-module Super Admin Command Center to a single centralized Supabase PostgreSQL database.

---

## 🏗️ Architecture

```
nexora/
├── apps/
│   ├── admin/                # Next.js 14 Super Admin Command Center (Port 3001)
│   ├── mobile/               # React Native + Expo App for Android & iOS
│   └── web/                  # Next.js 14 Web Portal & Customer App (Port 3000)
│
├── packages/
│   ├── api/                  # Supabase client factory & API abstraction layer
│   ├── business-logic/       # Pure business logic, RBAC evaluator, semver & i18n
│   ├── shared/               # Platform constants, custom errors, English/Bangla dict
│   ├── types/                # Core TypeScript interfaces & Database schema types
│   ├── ui-tokens/            # Design tokens: Deep Indigo, Electric Violet, Dark Navy
│   └── validation/           # Zod validation schemas for forms, auth, and configs
│
├── supabase/
│   ├── functions/            # Secure Edge Functions
│   ├── migrations/           # Versioned PostgreSQL database schema
│   ├── config.toml           # Supabase CLI configuration
│   └── seed.sql              # Development and staging seed data
│
└── docs/                     # Full technical documentation
    ├── architecture.md       # Monorepo topology & technology stack
    ├── database.md           # Database tables, relationships & RLS rules
    ├── security.md           # Zero-trust model & security best practices
    ├── deployment.md         # Vercel & Expo EAS deployment workflows
    └── user-guide.md         # Beginner-friendly commands and guide for the solo developer
```

---

## 🚀 Quick Start Guide (Solo Developer)

### 1. Prerequisites
- **Node.js**: v20+ LTS installed
- **pnpm**: v9+ (or `pnpm.cmd` on Windows)
- **Git**: Installed and initialized

### 2. Installation
Run the following command in PowerShell from the project root:

```powershell
pnpm.cmd install
```

### 3. Running Applications in Development

To start all applications simultaneously:
```powershell
pnpm.cmd run dev
```

To run a specific application:
```powershell
# Run Web Application (http://localhost:3000)
pnpm.cmd --filter @nexora/web dev

# Run Super Admin Dashboard (http://localhost:3001)
pnpm.cmd --filter @nexora/admin dev

# Run Mobile Application (Metro Bundler)
pnpm.cmd --filter @nexora/mobile start
```

### 4. Quality Checks & Verification
```powershell
# Type check the entire codebase
pnpm.cmd run typecheck

# Build all packages and applications
pnpm.cmd run build
```

---

## 🎨 Design Tokens

- **Primary:** Deep Indigo (`#1E1B4B` / `#4F46E5`)
- **Accent:** Electric Violet (`#7C3AED`)
- **Vibrant Accent:** Cyan (`#06B6D4`)
- **Dark Mode Background:** Dark Navy Deep (`#0B0F19`)
- **Typography:** Inter

---

## 🔒 Security Standards

- **Row Level Security (RLS)** is enforced on 100% of exposed database tables.
- **Zero-trust authorization**: Role and feature gating are checked on the server and database, not merely in the UI.
- **Service Role Key Protection**: Backend secrets are strictly isolated from client-facing code.

---

## 🗺️ Roadmap & Phases

- [x] **PHASE 01 — Project Foundation** *(Completed)*
- [ ] **PHASE 02 — Supabase Setup and Database** *(Next)*
- [ ] **PHASE 03 — Design System**
- [ ] **PHASE 04 — Authentication and RBAC**
- [ ] **PHASE 05 — Mobile Application**
- [ ] **PHASE 06 — Web Application**
- [ ] **PHASE 07 — Admin Dashboard**
- [ ] **PHASE 08 — Central Control System**
- [ ] **PHASE 09 — Business and Community Modules**
- [ ] **PHASE 10 — AI and Notifications**
- [ ] **PHASE 11 — Security and Testing**
- [ ] **PHASE 12 — Deployment and Production Release**

