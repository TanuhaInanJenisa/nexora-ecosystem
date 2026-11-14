import React from 'react';
import Link from 'next/link';
import { APP_NAME, APP_TAGLINE } from '@nexora/shared';
import { Sparkles, Activity } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-[#080C14] border-t border-white/5 pt-16 pb-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/5">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-white tracking-wider">{APP_NAME}</span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              {APP_TAGLINE} Enterprise-grade all-in-one digital platform unifying Web, Mobile, and Super Admin Command Center over a zero-trust Supabase architecture.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>All Systems Operational • Supabase RLS Active</span>
            </div>
          </div>

          {/* Column 1: Ecosystem */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Ecosystem</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  Platform Features
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Services Directory
                </Link>
              </li>
              <li>
                <Link href="/#architecture" className="hover:text-white transition-colors">
                  System Architecture
                </Link>
              </li>
              <li>
                <Link href="/#community" className="hover:text-white transition-colors">
                  Ecosystem Community
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About NEXORA
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Governance & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Security & Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">
                  8-Tier RBAC Matrix
                </span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">
                  Row Level Security (RLS)
                </span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">
                  Compliance Audit Logs
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Enterprise Support
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Request Consultation
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Portal Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 {APP_NAME}. One Ecosystem. Unlimited Possibilities. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-slate-400 transition-colors">
              Security Disclosures
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
