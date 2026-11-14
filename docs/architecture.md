# NEXORA Ecosystem Architecture

> **Tagline:** One Ecosystem. Unlimited Possibilities.

## 1. High-Level Architecture Overview

NEXORA is engineered as an enterprise-grade monorepo containing three unified client applications and six shared TypeScript packages, backed by a single centralized Supabase PostgreSQL infrastructure.

```
                              ┌────────────────────────────────────────┐
                              │            NEXORA CLIENTS              │
                              ├──────────────┬────────────┬────────────┤
                              │ apps/mobile  │  apps/web  │ apps/admin │
                              │ (Expo/React  │ (Next.js)  │ (Next.js)  │
                              │   Native)    │            │            │
                              └──────┬───────┴─────┬──────┴─────┬──────┘
                                     │             │            │
         ┌───────────────────────────┴─────────────┴────────────┴───────────────────────────┐
         │                                SHARED PACKAGES                                   │
         ├──────────────────────────────────────────────────────────────────────────────────┤
         │  @nexora/types          • TypeScript interfaces, schema definitions, and RPC types  │
         │  @nexora/ui-tokens      • Design tokens: Deep Indigo, Electric Violet, Dark Navy    │
         │  @nexora/validation     • Zod schemas for input sanitization and verification       │
         │  @nexora/business-logic • RBAC matrix, feature flag hashing, semver updater, i18n   │
         │  @nexora/shared         • Constants, localized dictionaries (en/bn), error classes   │
         │  @nexora/api            • Supabase client factory, session manager, API wrappers    │
         └──────────────────────────────────────────┬───────────────────────────────────────┘
                                                    │
                                     ┌──────────────┴──────────────┐
                                     │      SUPABASE BACKEND       │
                                     ├─────────────────────────────┤
                                     │  • PostgreSQL with RLS      │
                                     │  • GoTrue Auth & OAuth      │
                                     │  • Realtime Engine          │
                                     │  • Private Storage Buckets  │
                                     │  • Deno Edge Functions      │
                                     └─────────────────────────────┘
```

## 2. Directory Layout

- **`apps/mobile`**: Universal mobile application (iOS and Android) powered by React Native and Expo Router.
- **`apps/web`**: Public portal, customer dashboard, community, and responsive web app powered by Next.js App Router.
- **`apps/admin`**: Super Admin and Staff command center with 30 administrative modules and dynamic platform controls.
- **`packages/*`**: Modular, zero-duplicate business logic, design tokens, and validation.
- **`supabase/`**: Declarative database migrations, Edge Functions, storage policies, and seed data.
- **`docs/`**: Comprehensive developer and architecture manuals.

## 3. Technology Stack & Compatibility Matrix

| Component | Technology | Version | Purpose |
|---|---|---|---|
| Monorepo Orchestration | Turborepo + pnpm workspaces | v2.4+ / pnpm v9+ | Fast cached parallel builds & shared packages |
| Mobile Application | React Native / Expo | Expo SDK 52 / RN 0.76 | Cross-platform iOS & Android mobile client |
| Web & Admin Frontends | Next.js App Router | Next.js 14.2+ / React 18.3 | SSR, RSC, high-performance responsive web apps |
| Styling | Tailwind CSS & UI Tokens | v3.4+ / Custom Tokens | Deep Indigo, Electric Violet & Dark Navy theme |
| Database & Realtime | Supabase (PostgreSQL 15) | PostgreSQL 15 | Centralized relational data, RLS & live sockets |
| Validation | Zod | v3.24+ | Schema inference & runtime sanitization |
| Version Control | Git / GitHub | Git 2.47+ | Monorepo branching and release management |

