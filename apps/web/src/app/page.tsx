'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { APP_NAME, APP_TAGLINE } from '@nexora/shared';
import { Button, Badge, useToast } from '@nexora/ui';
import {
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Cpu,
  Smartphone,
  Globe,
  Sliders,
  Lock,
  ChevronDown,
  Send,
  Star,
} from 'lucide-react';

export default function HomePage() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const services = [
    {
      id: 'srv-1',
      title: 'Autonomous AI Agent Engine',
      category: 'AI & Automation',
      desc: 'Multi-agent cognitive orchestrations with long-term memory, external tools execution, and human approval gates.',
      price: '৳15,000 / $120',
      rating: '4.9',
      reviews: 38,
      turnaround: '3 Days',
    },
    {
      id: 'srv-2',
      title: 'Monorepo Fullstack Architecture',
      category: 'Web & Mobile',
      desc: 'High-performance Next.js 14 + React Native Expo monorepo with shared design tokens and strictly typed contracts.',
      price: '৳35,000 / $290',
      rating: '5.0',
      reviews: 62,
      turnaround: '7 Days',
    },
    {
      id: 'srv-3',
      title: 'PostgreSQL RLS Security Audit',
      desc: 'Exhaustive zero-trust audit, Row Level Security policies implementation, and penetration testing verification.',
      price: '৳20,000 / $160',
      rating: '4.8',
      reviews: 24,
      turnaround: '2 Days',
    },
    {
      id: 'srv-4',
      title: 'Cloud DevOps & CI/CD Automation',
      desc: 'Automated GitHub Actions pipelines, Dockerized deployments, and zero-downtime releases to Vercel and EAS.',
      price: '৳18,000 / $145',
      rating: '4.9',
      reviews: 19,
      turnaround: '3 Days',
    },
    {
      id: 'srv-5',
      title: 'Enterprise 8-Tier RBAC Governance',
      desc: 'Fine-grained permissions matrix, remote feature flag hashing, audit logging, and automated compliance triggers.',
      price: '৳25,000 / $200',
      rating: '4.9',
      reviews: 41,
      turnaround: '4 Days',
    },
    {
      id: 'srv-6',
      title: 'Generative UI & Telemetry Suite',
      desc: 'Live interactive dashboards with dynamic charts, websocket listeners, and operational command centers.',
      price: '৳22,000 / $180',
      rating: '4.7',
      reviews: 15,
      turnaround: '4 Days',
    },
  ];

  const filteredServices = services.filter(
    (s) => selectedCategory === 'All' || s.category === selectedCategory
  );

  const faqs = [
    {
      q: 'How does NEXORA unify Web, Mobile, and Admin in one codebase?',
      a: 'NEXORA is engineered on a Turborepo + pnpm monorepo architecture. Shared packages (@nexora/types, @nexora/ui, @nexora/api, @nexora/business-logic, @nexora/validation, @nexora/shared) ensure that all data contracts, validation schemas, and design tokens remain 100% synchronized across Next.js Web, Expo Mobile, and Admin Command Center.',
    },
    {
      q: 'Is PostgreSQL Row Level Security (RLS) enabled across all tables?',
      a: 'Yes. Every public and private table in our 7 SQL migration schemas enforces strict PostgreSQL RLS policies. Anonymous users can only query public catalogs, while authenticated sessions are restricted to their own organization and profile data.',
    },
    {
      q: 'What roles are supported in the 8-tier RBAC matrix?',
      a: 'The matrix includes Super Admin, Platform Admin, Operations Manager, Compliance Auditor, Organization Owner, Organization Admin, Staff Member, and Standard User, each paired with deterministic permissions.',
    },
    {
      q: 'Can the mobile app run on both iOS and Android?',
      a: 'Yes. apps/mobile is built with React Native and Expo SDK 52, supporting iOS, Android, and web previews out of the box with native vector icons and responsive layouts.',
    },
    {
      q: 'How do feature flags and remote configuration work?',
      a: 'The central app_settings and feature_flags tables provide real-time feature overrides. The client evaluates percentage rollouts deterministically via DJB2 hashing in @nexora/business-logic without requiring app re-deployment.',
    },
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      toast({
        type: 'error',
        title: 'Missing Details',
        message: 'Please complete all required fields in the consultation form.',
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setContactName('');
      setContactEmail('');
      setContactCompany('');
      setContactMessage('');
      toast({
        type: 'success',
        title: 'Consultation Inquiry Received',
        message: 'Our enterprise solutions architect will respond within 4 hours.',
      });
    }, 700);
  };

  return (
    <main className="min-h-screen bg-[#0B0F19] text-white selection:bg-indigo-500 selection:text-white overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/30 to-violet-500/20 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-cyan-500/15 blur-[100px] pointer-events-none rounded-full" />

        {/* Status Pill */}
        <div className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs md:text-sm font-semibold mb-8 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{APP_NAME} Digital Ecosystem v1.0 • {APP_TAGLINE}</span>
        </div>

        {/* Hero Headline */}
        <h1 className="relative text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight max-w-5xl leading-[1.08] mb-6">
          One Ecosystem.{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent">
            Unlimited Possibilities.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="relative text-lg sm:text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed mb-10">
          The next-generation digital ecosystem unifying customer web portals, cross-platform mobile apps, and super admin command centers over a synchronized, zero-trust PostgreSQL core.
        </p>

        {/* Action Buttons */}
        <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link href="/register">
            <Button size="lg" variant="primary" className="w-full sm:w-auto shadow-xl shadow-indigo-600/30">
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="#services">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 hover:bg-white/5">
              Explore Services
            </Button>
          </Link>
          <Link
            href={`${(process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001').replace(/\/+$/, '')}/login`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Shield className="w-4 h-4 mr-2" />
              Super Admin Center
            </Button>
          </Link>
        </div>

        {/* Ecosystem Live Metrics Ribbon */}
        <div className="relative mt-20 w-full grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-2xl bg-[#0F172A]/90 border border-white/10 backdrop-blur-md">
          <div className="text-center p-3">
            <div className="text-3xl md:text-4xl font-black text-white">30+</div>
            <div className="text-xs md:text-sm text-indigo-300 font-medium mt-1">Central Modules</div>
          </div>
          <div className="text-center p-3">
            <div className="text-3xl md:text-4xl font-black text-white">8 Tiers</div>
            <div className="text-xs md:text-sm text-cyan-300 font-medium mt-1">Granular RBAC</div>
          </div>
          <div className="text-center p-3">
            <div className="text-3xl md:text-4xl font-black text-white">99.9%</div>
            <div className="text-xs md:text-sm text-emerald-300 font-medium mt-1">Database Uptime</div>
          </div>
          <div className="text-center p-3">
            <div className="text-3xl md:text-4xl font-black text-white">256-Bit</div>
            <div className="text-xs md:text-sm text-violet-300 font-medium mt-1">End-to-End Security</div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section id="features" className="py-24 bg-[#080C14] border-t border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
              Enterprise Engineering
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
              Architected for Enterprise Scale
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Engineered with zero shortcuts. Every module, RLS policy, and remote control system is built to sustain mission-critical operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-[#0F172A] border border-white/10 hover:border-indigo-500/50 transition-all hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Autonomous AI Agent Engine</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Self-improving AI worker teams with long-term memory, external tool dispatching, human approval gates, and multi-agent task execution.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-[#0F172A] border border-white/10 hover:border-cyan-500/50 transition-all hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Dynamic Remote Config</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Real-time feature flag hashing, client version enforcement, maintenance locks, and remote UI overrides without app store re-submissions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-[#0F172A] border border-white/10 hover:border-violet-500/50 transition-all hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">8-Tier RBAC & Audit Trails</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Strict granular permission matrix with immutable append-only audit logs, login event telemetry, and zero-trust backend authorization.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-2xl bg-[#0F172A] border border-white/10 hover:border-emerald-500/50 transition-all hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">PostgreSQL RLS Hardening</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Row Level Security policies enforce multi-tenant cryptographic isolation directly inside PostgreSQL. Data cannot leak across organizations.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-2xl bg-[#0F172A] border border-white/10 hover:border-amber-500/50 transition-all hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Cross-Platform Monorepo</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                React Native Expo mobile app, customer Next.js 14 web portal, and Super Admin command center sharing 100% synchronized TypeScript logic.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-2xl bg-[#0F172A] border border-white/10 hover:border-rose-500/50 transition-all hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">30-Module Command Center</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Super Admin operations suite covering identity management, financial ledgers, automated workflows, telemetry, and remote dispatch.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES SHOWCASE SECTION */}
      <section id="services" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-3">
              Services Directory
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Ecosystem Specialized Services
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl">
              Turnkey engineering solutions and managed digital capabilities available instantly.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {['All', 'AI & Automation', 'Web & Mobile', 'Security & RLS'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((srv) => (
            <div
              key={srv.id}
              className="p-6 rounded-2xl bg-[#0F172A] border border-white/10 hover:border-indigo-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="info">{srv.category}</Badge>
                  <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{srv.rating}</span>
                    <span className="text-slate-500">({srv.reviews})</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{srv.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">{srv.desc}</p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Pricing</div>
                  <div className="text-sm font-bold text-indigo-400">{srv.price}</div>
                </div>
                <Link href="#contact">
                  <Button size="sm" variant="outline">
                    Book Service
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SYSTEM ARCHITECTURE SHOWCASE */}
      <section id="architecture" className="py-24 bg-[#080C14] border-t border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-xs font-bold uppercase tracking-wider mb-4">
              System Blueprint
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
              Synchronized Monorepo Topology
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Three dynamic client applications consuming 6 shared packages over a live Supabase PostgreSQL backend.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Layer 1: Client Applications */}
            <div className="p-8 rounded-2xl bg-[#0F172A] border border-indigo-500/30 space-y-4">
              <div className="flex items-center gap-3 text-indigo-400">
                <Globe className="w-6 h-6" />
                <h3 className="text-xl font-bold text-white">Client Applications</h3>
              </div>
              <p className="text-xs text-slate-400">
                Tailored user experiences optimized for each platform's native strengths.
              </p>
              <ul className="space-y-3 pt-2 text-sm text-slate-300">
                <li className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="font-semibold text-white block">apps/web</span>
                  <span className="text-xs text-slate-400">Next.js 14 App Router customer portal</span>
                </li>
                <li className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="font-semibold text-white block">apps/mobile</span>
                  <span className="text-xs text-slate-400">React Native Expo cross-platform app</span>
                </li>
                <li className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="font-semibold text-white block">apps/admin</span>
                  <span className="text-xs text-slate-400">30-Module Super Admin command center</span>
                </li>
              </ul>
            </div>

            {/* Layer 2: Shared Monorepo Packages */}
            <div className="p-8 rounded-2xl bg-[#0F172A] border border-violet-500/30 space-y-4">
              <div className="flex items-center gap-3 text-violet-400">
                <Layers className="w-6 h-6" />
                <h3 className="text-xl font-bold text-white">Shared Package Core</h3>
              </div>
              <p className="text-xs text-slate-400">
                Single source of truth for types, tokens, business rules, and validation.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-slate-300 font-mono">@nexora/types</div>
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-slate-300 font-mono">@nexora/ui</div>
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-slate-300 font-mono">@nexora/ui-tokens</div>
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-slate-300 font-mono">@nexora/api</div>
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-slate-300 font-mono">@nexora/business-logic</div>
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-slate-300 font-mono">@nexora/validation</div>
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-slate-300 font-mono col-span-2">@nexora/shared (Localizations)</div>
              </div>
            </div>

            {/* Layer 3: Supabase Cloud Core */}
            <div className="p-8 rounded-2xl bg-[#0F172A] border border-cyan-500/30 space-y-4">
              <div className="flex items-center gap-3 text-cyan-400">
                <Shield className="w-6 h-6" />
                <h3 className="text-xl font-bold text-white">Supabase Cloud Core</h3>
              </div>
              <p className="text-xs text-slate-400">
                Zero-trust backend infrastructure with real-time replication and encryption.
              </p>
              <ul className="space-y-3 pt-2 text-sm text-slate-300">
                <li className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="font-semibold text-white block">PostgreSQL Database</span>
                  <span className="text-xs text-slate-400">7 SQL migration schemas & RLS policies</span>
                </li>
                <li className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="font-semibold text-white block">GoTrue Authentication</span>
                  <span className="text-xs text-slate-400">Session JWTs & Auto-provisioning triggers</span>
                </li>
                <li className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="font-semibold text-white block">Audit & Remote Config</span>
                  <span className="text-xs text-slate-400">Immutable audit logs and feature flags</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITY TESTIMONIALS */}
      <section id="community" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
            Ecosystem Community
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Engineered by Leaders, Trusted by Builders
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Hear from teams building their multi-platform digital infrastructure on NEXORA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-[#0F172A] border border-white/10 flex flex-col justify-between">
            <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">
              "The ability to edit a TypeScript validation schema in @nexora/validation and see it immediately take effect across both Next.js App Router and React Native Expo is game-changing."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                R
              </div>
              <div>
                <div className="font-bold text-white text-sm">Rashid Al-Mamun</div>
                <div className="text-xs text-slate-400">Lead Enterprise Architect</div>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-[#0F172A] border border-white/10 flex flex-col justify-between">
            <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">
              "The 8-tier RBAC and Supabase Row Level Security migration script was seamless. We went from prototype to enterprise-grade compliance in under 48 hours."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center font-bold text-white text-sm">
                F
              </div>
              <div>
                <div className="font-bold text-white text-sm">Fatima Zahra</div>
                <div className="text-xs text-slate-400">Head of Security & AI</div>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-[#0F172A] border border-white/10 flex flex-col justify-between">
            <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">
              "The 30 administrative modules in the Command Center gave our operational team total visibility into active sessions, audit trails, and remote feature toggles."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center font-bold text-white text-sm">
                T
              </div>
              <div>
                <div className="font-bold text-white text-sm">Tanvir Hossain</div>
                <div className="text-xs text-slate-400">VP of Technology</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 bg-[#080C14] border-t border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
              Clarifications
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 text-base">
              Everything you need to know about the NEXORA monorepo ecosystem.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#0F172A] border border-white/10 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-base sm:text-lg text-white"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-indigo-400 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ENTERPRISE CONSULTATION / CONTACT */}
      <section id="contact" className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0F172A] border border-indigo-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-600/20 blur-[90px] rounded-full pointer-events-none" />

          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
              Request Enterprise Consultation
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Connect directly with our solutions architects to deploy custom AI agents, monorepo systems, or private cloud backends.
            </p>
          </div>

          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Hossain"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Work Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. tanvir@enterprise.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Organization / Company
              </label>
              <input
                type="text"
                placeholder="e.g. Nexora Dynamics Ltd."
                value={contactCompany}
                onChange={(e) => setContactCompany(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Project Requirements & Scope *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describe your ecosystem requirements, target launch timeline, or specific modules needed..."
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              variant="primary"
              isLoading={isSubmitting}
              className="w-full shadow-lg shadow-indigo-600/30"
            >
              Submit Consultation Inquiry
              <Send className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
