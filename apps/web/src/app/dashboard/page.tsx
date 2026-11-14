'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@nexora/ui';
import { APP_NAME } from '@nexora/shared';
import type { EnrichedServiceRequest } from '@nexora/types';
import {
  getBrowserClient,
  fetchUserServiceRequests,
  subscribeToServiceRequests,
} from '@nexora/api';
import {
  User,
  LogOut,
  Sparkles,
  CreditCard,
  MessageSquare,
  Shield,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, roles, isLoading, signOut } = useAuth();
  const [requests, setRequests] = useState<EnrichedServiceRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);

  const client = getBrowserClient();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const loadRequests = useCallback(async () => {
    if (!user) return;
    try {
      const fetched = await fetchUserServiceRequests(client, user.id);
      setRequests(fetched);
    } catch (err) {
      console.warn('Could not load user service requests:', err);
    } finally {
      setIsLoadingRequests(false);
    }
  }, [client, user]);

  useEffect(() => {
    if (!user) return;

    loadRequests();

    const unsubscribe = subscribeToServiceRequests(client, () => {
      loadRequests();
    });

    return () => {
      unsubscribe();
    };
  }, [user, loadRequests, client]);

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
              <div className="text-xl font-bold text-white">Enterprise Tier</div>
              <p className="text-xs text-slate-400">Priority SLA & Unlimited Modules</p>
              <div className="pt-2">
                <Link href="/services" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                  Browse Catalog &rarr;
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Community Hub</CardTitle>
              <MessageSquare className="w-4 h-4 text-violet-400" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xl font-bold text-white">Live Feed</div>
              <p className="text-xs text-slate-400">Share updates and discuss architectures</p>
              <div className="pt-2">
                <Link href="/community" className="text-xs text-violet-400 hover:text-violet-300 font-semibold">
                  Open Feed &rarr;
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Service Requests Ledger */}
        <div className="p-8 rounded-3xl bg-[#0F172A] border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                My Service Requests
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Live status and progression tracking for your commissioned ecosystem services.
              </p>
            </div>

            <Link href="/services">
              <Button size="sm" variant="outline" className="text-xs">
                Request New Service +
              </Button>
            </Link>
          </div>

          {isLoadingRequests ? (
            <div className="py-8 text-center text-xs text-slate-500 animate-pulse">
              Loading your commissioned requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white/5 border border-white/5 text-center space-y-3">
              <Clock className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm text-slate-300 font-semibold">No Active Requests Yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Commission enterprise cloud architecture, autonomous AI agents, or security audits to get started.
              </p>
              <Link href="/services">
                <Button size="sm" variant="primary">
                  Explore Services Directory
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {requests.map((req) => (
                <div key={req.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {req.service?.title || `Service #${req.service_id}`}
                      </span>
                      <Badge
                        variant={
                          req.status === 'completed'
                            ? 'success'
                            : req.status === 'in_progress'
                            ? 'info'
                            : req.status === 'cancelled'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {req.status.toUpperCase()}
                      </Badge>
                    </div>
                    {req.notes && (
                      <p className="text-xs text-slate-400 max-w-md line-clamp-1">{req.notes}</p>
                    )}
                    <span className="text-[11px] text-slate-500 block">
                      Submitted: {new Date(req.created_at).toLocaleDateString()} • Quote: ${req.total_amount} {req.currency}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    {req.status === 'completed' ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> Complete
                      </span>
                    ) : req.status === 'in_progress' ? (
                      <span className="flex items-center gap-1 text-indigo-400 font-semibold">
                        <Clock className="w-4 h-4 animate-spin" /> In Progress
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-400 font-semibold">
                        <AlertCircle className="w-4 h-4" /> Pending Review
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
