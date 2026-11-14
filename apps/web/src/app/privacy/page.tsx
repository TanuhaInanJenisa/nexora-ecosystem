import React from 'react';
import { APP_NAME } from '@nexora/shared';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-slate-300 leading-relaxed">
      <div className="border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
          <Shield className="w-3.5 h-3.5" />
          Enterprise Data Governance
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Effective Date: November 2026 • Platform Version 1.0
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">1. Zero-Trust Architecture & Data Ownership</h2>
        <p className="text-sm">
          {APP_NAME} operates on a zero-trust model. You retain 100% intellectual property and ownership over all business data, records, user profiles, and digital content stored in the ecosystem.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">2. Row Level Security & Tenant Isolation</h2>
        <p className="text-sm">
          Every organization within {APP_NAME} is cryptographically isolated via PostgreSQL Row Level Security (RLS). No organization can access, inspect, or modify another organization's records under any circumstance.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">3. Information Collected</h2>
        <ul className="list-disc list-inside text-sm space-y-2 pl-2">
          <li><strong>Authentication Data:</strong> User email, hashed credentials, cryptographic session tokens managed by GoTrue.</li>
          <li><strong>Device & Telemetry:</strong> Device identifiers, OS versions, IP addresses, and user agent strings for session audit verification.</li>
          <li><strong>Transactional Records:</strong> Service requests, organization memberships, and billing receipts.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">4. Immutable Audit Logs</h2>
        <p className="text-sm">
          For compliance and security verification, critical actions (such as role modifications, feature flag updates, and authentication events) are captured in append-only audit tables (<code className="text-xs bg-white/5 px-2 py-1 rounded text-cyan-400">audit_logs</code>). Audit logs cannot be mutated or purged by standard users.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">5. Contact Data Protection Officer</h2>
        <p className="text-sm">
          Questions regarding data retention, GDPR deletion requests, or compliance guarantees may be directed to <span className="text-indigo-400 font-mono">security@nexora.io</span>.
        </p>
      </section>
    </div>
  );
}

