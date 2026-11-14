import { APP_NAME, APP_TAGLINE } from '@nexora/shared';
import { Sparkles, Layers, ShieldCheck, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-900 via-[#1E1B4B] to-[#0B0F19] text-white">
      <div className="max-w-4xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-sm font-medium">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Next-Generation Digital Ecosystem</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-cyan-300 bg-clip-text text-transparent">
          {APP_NAME}
        </h1>

        <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto font-light">
          {APP_TAGLINE}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <Layers className="w-8 h-8 text-indigo-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Unified Monorepo</h3>
            <p className="text-sm text-slate-400">
              Web, Mobile, and Super Admin powered by synchronized TypeScript logic and Supabase.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <ShieldCheck className="w-8 h-8 text-cyan-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Enterprise RBAC</h3>
            <p className="text-sm text-slate-400">
              Granular permissions, strict Row-Level Security, and zero-trust backend authorization.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <Sparkles className="w-8 h-8 text-violet-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Dynamic Control</h3>
            <p className="text-sm text-slate-400">
              Centralized feature flags, remote configurations, and dynamic mobile app orchestration.
            </p>
          </div>
        </div>

        <div className="pt-8 flex justify-center gap-4">
          <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer">
            Phase 01 Initialized
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </main>
  );
}

