import React from 'react';
import Link from 'next/link';
import { APP_NAME } from '@nexora/shared';
import { Button } from '@nexora/ui';
import { Shield, Layers, Cpu, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider">
          About {APP_NAME}
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
          One Ecosystem. Unlimited Possibilities.
        </h1>
        <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
          {APP_NAME} was created to eliminate fragmented enterprise software. By uniting Web, Mobile, and Administrative control into a single synchronized monorepo over Supabase PostgreSQL, organizations build faster with zero-trust security.
        </p>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-2xl bg-[#0F172A] border border-white/10 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Unified Codebase</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Turborepo + pnpm monorepo structure guarantees that identity, validation, and design tokens remain 100% consistent across Web, Mobile, and Admin.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-[#0F172A] border border-white/10 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Zero-Trust Security</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Every transaction, query, and session is guarded by PostgreSQL Row Level Security (RLS) policies and immutable audit log streams.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-[#0F172A] border border-white/10 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Autonomous Intelligence</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Built-in AI agent task orchestration and automated remote workflows empower teams to scale without operational bottlenecks.
          </p>
        </div>
      </div>

      {/* Engineering Blueprint */}
      <div className="p-8 sm:p-12 rounded-3xl bg-[#0F172A] border border-white/10 space-y-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
            Engineering Principles
          </h2>
          <p className="text-sm text-slate-400">
            The core tenants guiding every architectural decision within NEXORA.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-base font-bold text-white">Strictly Typed Contracts</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Shared Zod schemas and TypeScript types ensure runtime payloads are validated before reaching the database.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-base font-bold text-white">Deterministic Rollouts</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Dynamic feature flags use DJB2 percentage hashing to deliver repeatable, crash-free feature deployments.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-base font-bold text-white">Cryptographic Isolation</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Tenant organizations operate within mathematical boundaries enforced by PostgreSQL engine security policies.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-base font-bold text-white">Multi-Language Native</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                First-class English and Bengali (বাংলা) localization integrated throughout shared dictionaries and UI components.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-400">Ready to build on NEXORA?</span>
          <Link href="/register">
            <Button size="md" variant="primary">
              Join the Ecosystem
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
