import React from 'react';
import { APP_NAME } from '@nexora/shared';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-slate-300 leading-relaxed">
      <div className="border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
          <FileText className="w-3.5 h-3.5" />
          Terms of Service
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Terms of Service
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Effective Date: November 2026 • Platform Version 1.0
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">1. Acceptance of Terms</h2>
        <p className="text-sm">
          By accessing or utilizing any component of the {APP_NAME} digital ecosystem (including the web customer portal, mobile application, or administrative command center), you agree to be bound by these Terms of Service.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">2. Acceptable Use Policy</h2>
        <p className="text-sm">
          You agree not to exploit the platform for unauthorized vulnerability probing, denial-of-service simulations without prior written consent, distribution of malicious payloads, or bypassing Row Level Security boundaries.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">3. Role-Based Access and Account Security</h2>
        <p className="text-sm">
          Account holders are responsible for maintaining the confidentiality of their credentials and session keys. Super Admin and administrative clearances must not be shared or transferred.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">4. Service Availability & SLA</h2>
        <p className="text-sm">
          {APP_NAME} targets 99.9% database and API availability across standard operational windows. Scheduled maintenance will be broadcast via client boot configuration remote banners.
        </p>
      </section>
    </div>
  );
}

