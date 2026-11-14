# NEXORA Deployment & DevOps Guide

## 1. Environment Topology

NEXORA operates across three distinct environments:
- **Development**: Local environment with Turborepo, local/staging Supabase instance, Expo Go or iOS/Android simulators.
- **Staging**: Vercel preview deployments and Expo preview internal testing tracks.
- **Production**: Vercel production edge deployment for Web and Admin, Expo EAS production builds (AAB for Google Play, IPA for Apple App Store), and managed Supabase Production Tier.

## 2. Web & Admin Deployment (Vercel)
- Both `apps/web` and `apps/admin` deploy seamlessly to Vercel.
- Turborepo remote caching accelerates CI/CD pipeline runs.
- Root Directory settings:
  - Web: `apps/web`
  - Admin: `apps/admin`

## 3. Mobile Deployment (Expo EAS)
- `eas.json` manages `development`, `preview`, and `production` profiles.
- Run `eas build --platform android --profile production` to produce Google Play store AAB packages.
- Run `eas build --platform ios --profile production` to produce Apple App Store submission bundles.

## 4. Supabase Migrations
- Migrations are versioned in `supabase/migrations/`.
- Deployed using GitHub Actions or Supabase CLI: `supabase db push`.
- Never run destructive commands (`DROP TABLE`, `TRUNCATE`) against production without full automated snapshots.

