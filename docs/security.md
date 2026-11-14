# NEXORA Security & Compliance Specification

## 1. Zero-Trust Access Model
- **No Client-Side Authorization Trust**: The frontend UI reflects permissions for UX purposes only. All database and API operations are strictly verified via Postgres RLS and server-side RPC functions.
- **Service Role Key Protection**: The Supabase Service Role Key is strictly isolated to backend server environments (Next.js server actions, Edge Functions) and NEVER exposed to web clients, mobile apps, or version control.

## 2. Row Level Security (RLS) Policy Architecture
- **Public Reads**: Only explicitly public resources (e.g. published blog posts, active service catalogs, public app configuration) are readable by anonymous or regular users.
- **Owner Writes**: Users can only modify their own profile data, device tokens, and authored posts.
- **Role-Based Guards**: Administrative tables (`feature_flags`, `audit_logs`, `app_settings`, `user_roles`) are accessible only through Postgres functions that verify `has_permission(auth.uid(), 'required_permission')`.

## 3. Defense Against Common Vulnerabilities
1. **IDOR (Insecure Direct Object References)**: Prevented via UUIDs and RLS ownership predicates `auth.uid() = user_id`.
2. **SQL Injection**: Prevented by parameterized queries in Supabase client and Postgres stored procedures.
3. **CSRF & XSS**: Next.js HTTP-only cookies, strict Content Security Policy, and Zod input sanitization.
4. **Idempotency**: All payment transactions require an idempotency key to prevent double charging.
5. **Rate Limiting**: Applied to authentication endpoints, OTP delivery, and AI generation requests.

