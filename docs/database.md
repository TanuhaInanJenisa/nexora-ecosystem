# NEXORA Database Schema & Security Guide

## 1. Relational Design Principles

The NEXORA PostgreSQL database adheres to strict enterprise standards:
1. **UUID Primary Keys**: Every public table uses `uuid_generate_v4()` or `gen_random_uuid()` to prevent enumeration attacks.
2. **Referential Integrity**: All relationships have strict foreign key constraints and cascade/set null rules.
3. **Timestamp Tracking**: `created_at` and `updated_at` (managed via triggers) are mandatory on mutable tables.
4. **Row Level Security (RLS)**: Enforced unconditionally on 100% of tables exposed to the API.

## 2. Table Groups (Targeting Phase 02)

### A. Identity & Access Control
- `profiles`: User information linked 1:1 with `auth.users(id)`.
- `roles`: System roles (`super_admin`, `system_admin`, `manager`, `moderator`, `support_agent`, `finance_admin`, `analyst`, `user`).
- `permissions`: Fine-grained permission strings (e.g. `user.update`, `feature.manage`).
- `user_roles`: Many-to-many role assignments.
- `role_permissions`: Mapping of roles to granted permissions.
- `user_devices`: Push tokens, OS versions, and platform metadata.
- `user_sessions`: Active session tracking and remote revocation.

### B. Configuration & Remote Control
- `app_settings`: Global key-value configurations.
- `feature_flags`: Percentage rollouts, platform filtering, role-gating.
- `maintenance_settings`: Platform-wide and module-specific maintenance gates.
- `app_versions`: Minimum supported versions and mandatory update flags.
- `navigation_items`: Dynamically managed mobile and web menus.

### C. Business & Commerce
- `services`: Catalog of services and offerings.
- `service_requests`: Booking and dispatch lifecycle.
- `subscription_plans`: Recurring tiers and quotas.
- `subscriptions`: Active user subscriptions.
- `payments`: Transactions with idempotency keys and gateway references.
- `coupons`: Promo codes and discount rules.

### D. Community & Moderation
- `community_posts`: Feed items with media attachments.
- `post_comments`: Nested commentary threads.
- `post_reactions`: Like and emotive reactions.
- `moderation_reports`: Abuse triage and audit trails.

### E. Audit & Security
- `audit_logs`: Immutable, append-only security logs for administrative operations.
- `security_alerts`: Threat detections and rate limit triggers.

