# NEXORA Developer & User Guide

## Welcome Solo Developer!

This guide is designed specifically for you. It explains how to run, develop, and maintain the NEXORA platform without feeling overwhelmed.

---

## 1. Quick Start Commands

All commands should be executed from the root folder: `c:\Users\UESR\Desktop\Web+Android Application`

| Action | Command (PowerShell) | Description |
|---|---|---|
| **Install Dependencies** | `pnpm.cmd install` | Downloads and links all workspace packages |
| **Run Everything in Dev** | `pnpm.cmd run dev` | Launches Web (port 3000), Admin (port 3001), and Mobile bundler |
| **Build Entire Platform** | `pnpm.cmd run build` | Compiles all shared packages, Next.js apps, and verifies types |
| **Type Check Monorepo** | `pnpm.cmd run typecheck`| Verifies TypeScript across all packages with zero errors |
| **Clean Build Artifacts** | `pnpm.cmd run clean` | Cleans `.turbo`, `dist`, and `.next` cache folders |

---

## 2. Running Individual Apps

- **To run only the Web App:**
  ```powershell
  pnpm.cmd --filter @nexora/web dev
  ```
  Open your browser at `http://localhost:3000`

- **To run only the Super Admin Dashboard:**
  ```powershell
  pnpm.cmd --filter @nexora/admin dev
  ```
  Open your browser at `http://localhost:3001`

- **To run the Mobile App:**
  ```powershell
  pnpm.cmd --filter @nexora/mobile start
  ```
  Scan the QR code with the Expo Go app on your Android or iPhone.

---

## 3. How Packages Connect

1. When you change a type in `packages/types`, it is immediately available to Web, Admin, and Mobile.
2. When you update brand colors in `packages/ui-tokens`, Tailwind on Web and Admin and the StyleSheet on Mobile automatically reflect those changes.
3. When you add a validation rule in `packages/validation`, both client-side forms and server-side Edge Functions use the exact same Zod schema.

