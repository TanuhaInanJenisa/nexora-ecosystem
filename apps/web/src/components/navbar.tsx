'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, useRemoteConfig, Button, NotificationDropdown } from '@nexora/ui';
import { APP_NAME } from '@nexora/shared';
import {
  Sparkles,
  ArrowRight,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { user, profile, roles, isLoading, signOut } = useAuth();
  const { banners } = useRemoteConfig();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeBanner = banners.length > 0 ? banners[0] : null;

  // Do not show full navbar on auth screens to keep focused experience
  const isAuthScreen = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';

  if (isAuthScreen) {
    return (
      <header className="w-full bg-[#0B0F19]/80 backdrop-blur-md border-b border-white/5 py-4 px-6 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-white tracking-wide">{APP_NAME}</span>
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </header>
    );
  }

  const navLinks = [
    { label: 'Features', href: '/#features' },
    { label: 'Services', href: '/services' },
    { label: 'Architecture', href: '/#architecture' },
    { label: 'Community', href: '/#community' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const isStaff = roles.some((r) => ['super_admin', 'platform_admin', 'operations_manager', 'compliance_auditor'].includes(r));

  return (
    <header className="w-full bg-[#0B0F19]/80 backdrop-blur-md border-b border-white/5 fixed top-0 left-0 right-0 z-50">
      {activeBanner && (
        <aside
          aria-label="Promotional Announcement"
          className="bg-gradient-to-r from-indigo-900/90 via-violet-900/90 to-indigo-900/90 border-b border-indigo-500/20 px-4 py-1.5 text-center text-xs text-white"
        >
          <span className="font-semibold text-indigo-300 mr-2">{activeBanner.title}</span>
          {activeBanner.subtitle && <span className="text-slate-300">{activeBanner.subtitle}</span>}
          {activeBanner.target_url && (
            <a
              href={activeBanner.target_url}
              className="ml-3 inline-flex items-center text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2"
            >
              Learn More →
            </a>
          )}
        </aside>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black text-white tracking-wider">{APP_NAME}</span>
              <span className="block text-[10px] text-cyan-400 font-semibold tracking-widest uppercase">
                Digital Ecosystem
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors hover:translate-y-[-1px]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right CTA / Auth Status */}
        <div className="hidden md:flex items-center gap-4">
          {isStaff && (
            <Link
              href="http://localhost:3002"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold hover:bg-amber-500/20 transition-all"
            >
              <Shield className="w-3.5 h-3.5" />
              Command Center
            </Link>
          )}

          {!isLoading && user ? (
            <div className="flex items-center gap-3">
              <NotificationDropdown />
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-white transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">
                  {(profile?.full_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                </div>
                <span>Dashboard</span>
              </Link>
              <button
                onClick={() => signOut()}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link href="/register">
                <Button size="sm" variant="primary">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0F172A] border-b border-white/10 px-6 py-6 space-y-4">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-slate-300 hover:text-white py-1"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 text-center font-semibold text-white text-sm"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 px-4 rounded-xl bg-white/5 text-center text-slate-400 hover:text-rose-400 text-sm font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-center font-semibold text-white text-sm"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 text-center font-semibold text-white text-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
