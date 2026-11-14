'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Badge } from '@nexora/ui';
import { Search, Star, ArrowRight, Check } from 'lucide-react';

const SERVICES = [
  {
    id: 'srv-1',
    title: 'Autonomous AI Agent Workflow Engine',
    category: 'AI & Automation',
    desc: 'Custom multi-agent cognitive architecture with long-term memory, external tools integration, and human approval gates.',
    priceBDT: '৳15,000',
    priceUSD: '$120',
    turnaround: '3 Days',
    rating: '4.9',
    reviews: 38,
    features: ['Multi-agent orchestration', 'Vector memory', 'Custom tools hooks', 'Human-in-the-loop review'],
  },
  {
    id: 'srv-2',
    title: 'Monorepo Fullstack Architecture',
    category: 'Web & Mobile',
    desc: 'Production Next.js 14 + React Native Expo monorepo with Turborepo, shared packages, and typed contracts.',
    priceBDT: '৳35,000',
    priceUSD: '$290',
    turnaround: '7 Days',
    rating: '5.0',
    reviews: 62,
    features: ['Turborepo caching', 'Expo SDK 52 mobile', 'Next.js App Router', 'Shared design tokens'],
  },
  {
    id: 'srv-3',
    title: 'Database RLS & Security Audit',
    category: 'Security & RLS',
    desc: 'Exhaustive PostgreSQL audit, Row Level Security policies implementation, and penetration testing verification.',
    priceBDT: '৳20,000',
    priceUSD: '$160',
    turnaround: '2 Days',
    rating: '4.8',
    reviews: 24,
    features: ['Zero-trust RLS policies', 'Audit trail triggers', 'Vulnerability report', 'SQL hardening'],
  },
  {
    id: 'srv-4',
    title: 'Cloud DevOps & CI/CD Pipeline',
    category: 'Cloud & DevOps',
    desc: 'Automated GitHub Actions, Docker containers, multi-environment deployments to Vercel, EAS, and Supabase.',
    priceBDT: '৳18,000',
    priceUSD: '$145',
    turnaround: '3 Days',
    rating: '4.9',
    reviews: 19,
    features: ['Automated PR testing', 'EAS Android/iOS build', 'Vercel preview branches', 'Secrets encryption'],
  },
  {
    id: 'srv-5',
    title: 'Enterprise RBAC & Permission Matrix',
    category: 'Business Logic',
    desc: 'Dynamic 8-tier role-based access control, remote feature overrides, and audit event dispatchers.',
    priceBDT: '৳25,000',
    priceUSD: '$200',
    turnaround: '4 Days',
    rating: '4.9',
    reviews: 41,
    features: ['8-tier hierarchy', 'Deterministic DJB2 hashing', 'Super Admin control panel', 'Activity logging'],
  },
  {
    id: 'srv-6',
    title: 'Generative UI & Analytics Dashboard',
    category: 'AI & Automation',
    desc: 'Interactive telemetry dashboards, metrics charts, and live real-time status monitors for business ops.',
    priceBDT: '৳22,000',
    priceUSD: '$180',
    turnaround: '4 Days',
    rating: '4.7',
    reviews: 15,
    features: ['Websocket telemetry', 'Custom data tables', 'Exportable reports', 'Dynamic widgets'],
  },
];

const CATEGORIES = ['All', 'AI & Automation', 'Web & Mobile', 'Security & RLS', 'Cloud & DevOps', 'Business Logic'];

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = SERVICES.filter((s) => {
    const matchCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchQuery =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          Services Directory
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
          Specialized Digital Services
        </h1>
        <p className="text-slate-400 text-base sm:text-lg">
          Turnkey engineering modules and managed ecosystem workflows backed by guaranteed service-level agreements.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0F172A] border border-white/10">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((srv) => (
          <div
            key={srv.id}
            className="p-8 rounded-2xl bg-[#0F172A] border border-white/10 flex flex-col justify-between hover:border-indigo-500/40 transition-all hover:-translate-y-1"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <Badge variant="info">{srv.category}</Badge>
                <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{srv.rating}</span>
                  <span className="text-slate-500">({srv.reviews})</span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{srv.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">{srv.desc}</p>

              <div className="space-y-2 mb-6 pt-4 border-t border-white/5">
                {srv.features.map((feat) => (
                  <div key={feat} className="flex items-center gap-2 text-xs text-slate-300">
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Fixed Rate</div>
                <div className="text-base font-black text-indigo-400">{srv.priceBDT} <span className="text-xs text-slate-500">({srv.priceUSD})</span></div>
              </div>

              <Link href="/contact">
                <Button size="sm" variant="primary">
                  Book Now
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
