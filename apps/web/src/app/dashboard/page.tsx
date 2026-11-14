'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@nexora/ui';
import { APP_NAME } from '@nexora/shared';
import {
  User,
  LogOut,
  Sparkles,
  CreditCard,
  MessageSquare,
  Shield,
  ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, roles, isLoading, signOut } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white p-8 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center animate-pulse">
          <Sparkles className="w-6 h-6 text-indigo-400" />
        </div>
        <p className="text-sm text-slate-400">Loading your profile...</p>
      </div>
    );
  }

  const isStaff = roles.some((r) => r !== 'user');

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-[#0F172A]/80 backdrop-blur px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-600/30">
              NX
            </div>
            <span className="font-bold text-lg text-white">{APP_NAME}</span>
          </Link>
          <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
            Customer Dashboard
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isStaff && (
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition-all shadow-sm shadow-violet-600/30"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin Center
            </a>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-8 space-y-8">
        {/* Welcome Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/30 to-slate-900 border border-indigo-500/30 backdrop-blur flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="violet" dot>
                Online
              </Badge>
              {roles.map((r) => (
                <Badge key={r} variant="default">
                  {r.toUpperCase()}
                </Badge>
              ))}
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              Welcome back, {profile?.full_name || user.email?.split('@')[0]}!
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Access your digital ecosystem services, active community discussions, and account settings all from one centralized hub.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/services">
              <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Explore Services
              </Button>
            </Link>
          </div>
        </div>

        {/* Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Account Identity</CardTitle>
              <User className="w-4 h-4 text-indigo-400" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xl font-bold text-white truncate">{profile?.full_name || 'User'}</div>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
              <div className="pt-2">
                <Badge variant={profile?.is_verified ? 'success' : 'warning'}>
                  {profile?.is_verified ? 'Verified Account' : 'Standard Member'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Active Tier</CardTitle>
              <CreditCard className="w-4 h-4 text-cyan-400" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xl font-bold text-white">Starter Plan</div>
              <p className="text-xs text-slate-400">5 monthly service requests included</p>
              <div className="pt-2">
                <Link href="/pricing" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                  Upgrade to Pro &rarr;
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Community Activity</CardTitle>
              <MessageSquare className="w-4 h-4 text-violet-400" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xl font-bold text-white">Active Discussions</div>
              <p className="text-xs text-slate-400">Connect with founders and staff</p>
              <div className="pt-2">
                <Link href="/community" className="text-xs text-violet-400 hover:text-violet-300 font-semibold">
                  Open Feed &rarr;
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
