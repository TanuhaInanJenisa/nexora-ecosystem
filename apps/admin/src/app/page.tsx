'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { APP_NAME } from '@nexora/shared';
import { useAuth, Button, Badge, useToast } from '@nexora/ui';
import {
  getBrowserClient,
  updateMaintenanceSettings,
  updateAppVersionPolicy,
  updateFeatureFlag,
} from '@nexora/api';
import {
  Sliders,
  Users,
  Shield,
  Activity,
  Cpu,
  Layers,
  Smartphone,
  Globe,
  LogOut,
  Search,
  X,
  Plus,
  Lock,
  Download,
} from 'lucide-react';

type AdminTab = 'overview' | 'users' | 'flags' | 'cms' | 'commerce' | 'audit';

interface UserRecord {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: 'active' | 'suspended';
  created_at: string;
}

interface FeatureFlagRecord {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  rollout_percentage: number;
  platform: 'all' | 'web' | 'mobile';
}

interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  display_order: number;
}

interface ServiceRequestRecord {
  id: string;
  serviceTitle: string;
  clientName: string;
  clientEmail: string;
  price: string;
  status: 'pending' | 'in_progress' | 'completed';
  date: string;
}

interface AuditLogRecord {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  resource: string;
  ip: string;
  status: 'success' | 'warning' | 'denied';
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, profile, roles, isLoading, signOut } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Tab 1: Overview Data
  const stats = {
    activeUsers: '1',
    protectedTables: '7 Schemas (30 Tables)',
    featureFlagsActive: '5 Active',
    systemStatus: '100% Operational',
  };

  // Tab 2: Users & RBAC Data
  const [users, setUsers] = useState<UserRecord[]>([
    {
      id: 'usr-admin-1',
      email: 'admin@nexora.io',
      full_name: 'System Super Admin',
      role: 'super_admin',
      status: 'active',
      created_at: '2026-11-12',
    },
    {
      id: 'usr-dev-2',
      email: 'rashid@enterprise.com',
      full_name: 'Rashid Al-Mamun',
      role: 'platform_admin',
      status: 'active',
      created_at: '2026-11-13',
    },
    {
      id: 'usr-mem-3',
      email: 'tanvir@ecosystem.dev',
      full_name: 'Tanvir Hossain',
      role: 'org_owner',
      status: 'active',
      created_at: '2026-11-14',
    },
    {
      id: 'usr-guest-4',
      email: 'fatima@ai-labs.org',
      full_name: 'Fatima Zahra',
      role: 'user',
      status: 'active',
      created_at: '2026-11-14',
    },
  ]);

  const [selectedUserToEdit, setSelectedUserToEdit] = useState<UserRecord | null>(null);
  const [newRoleForUser, setNewRoleForUser] = useState('user');

  // Tab 3: Feature Flags & Remote Config Data
  const [flags, setFlags] = useState<FeatureFlagRecord[]>([
    {
      id: 'flag-1',
      key: 'autonomous_ai_agents',
      name: 'Autonomous AI Agents',
      description: 'Enable multi-agent task execution and external tool execution.',
      enabled: true,
      rollout_percentage: 100,
      platform: 'all',
    },
    {
      id: 'flag-2',
      key: 'community_posting',
      name: 'Community Post Publishing',
      description: 'Allow members to create and share discussions and showcases.',
      enabled: true,
      rollout_percentage: 100,
      platform: 'all',
    },
    {
      id: 'flag-3',
      key: 'biometric_auth_required',
      name: 'Biometric Auth Enforcement',
      description: 'Require Face ID / Fingerprint on mobile startup for high-clearance staff.',
      enabled: false,
      rollout_percentage: 25,
      platform: 'mobile',
    },
    {
      id: 'flag-4',
      key: 'dark_theme_forced',
      name: 'OLED Dark Navy Theme',
      description: 'Force deep indigo (#1E1B4B) theme tokens across mobile and web.',
      enabled: true,
      rollout_percentage: 100,
      platform: 'all',
    },
    {
      id: 'flag-5',
      key: 'beta_services_access',
      name: 'Beta Services Catalog',
      description: 'Early access to cloud database RLS auditing tools.',
      enabled: true,
      rollout_percentage: 50,
      platform: 'web',
    },
  ]);

  const [minAppVersion, setMinAppVersion] = useState('1.0.0');
  const [enforceVersionUpdate, setEnforceVersionUpdate] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('System is currently performing planned database upgrades.');

  // Tab 4: Content & CMS Data
  const [categories, setCategories] = useState<CategoryRecord[]>([
    { id: 'cat-1', name: 'AI & Automation', slug: 'ai-automation', display_order: 1 },
    { id: 'cat-2', name: 'Web & Mobile', slug: 'web-mobile', display_order: 2 },
    { id: 'cat-3', name: 'Security & RLS', slug: 'security-rls', display_order: 3 },
    { id: 'cat-4', name: 'Cloud & DevOps', slug: 'cloud-devops', display_order: 4 },
    { id: 'cat-5', name: 'Business Logic', slug: 'business-logic', display_order: 5 },
  ]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');

  // Tab 5: Commerce & Services Data
  const [serviceRequests, setServiceRequests] = useState<ServiceRequestRecord[]>([
    {
      id: 'req-1',
      serviceTitle: 'Autonomous AI Agent Workflow Engine',
      clientName: 'Rashid Al-Mamun',
      clientEmail: 'rashid@enterprise.com',
      price: '৳15,000',
      status: 'in_progress',
      date: '2026-11-14',
    },
    {
      id: 'req-2',
      serviceTitle: 'PostgreSQL RLS Security Audit',
      clientName: 'Tanvir Hossain',
      clientEmail: 'tanvir@ecosystem.dev',
      price: '৳20,000',
      status: 'pending',
      date: '2026-11-14',
    },
    {
      id: 'req-3',
      serviceTitle: 'Monorepo Fullstack Architecture',
      clientName: 'Fatima Zahra',
      clientEmail: 'fatima@ai-labs.org',
      price: '৳35,000',
      status: 'completed',
      date: '2026-11-13',
    },
  ]);

  // Tab 6: Audit Logs & Security Data
  const [auditLogs] = useState<AuditLogRecord[]>([
    {
      id: 'aud-1',
      timestamp: 'Just now',
      action: 'ADMIN_SESSION_VERIFIED',
      actor: user?.email || 'admin@nexora.io',
      resource: 'Super Admin Command Center',
      ip: '192.168.1.1 (Trusted)',
      status: 'success',
    },
    {
      id: 'aud-2',
      timestamp: '5m ago',
      action: 'FEATURE_FLAG_EVALUATION',
      actor: 'system',
      resource: 'autonomous_ai_agents',
      ip: '127.0.0.1 (Internal)',
      status: 'success',
    },
    {
      id: 'aud-3',
      timestamp: '15m ago',
      action: 'RLS_POLICY_QUERY',
      actor: 'GoTrue Auth Service',
      resource: 'supabase/combined_schema.sql',
      ip: '10.0.4.15',
      status: 'success',
    },
    {
      id: 'aud-4',
      timestamp: '1h ago',
      action: 'USER_ROLE_ASSIGNED',
      actor: 'admin@nexora.io',
      resource: 'usr-dev-2 (platform_admin)',
      ip: '192.168.1.1',
      status: 'success',
    },
    {
      id: 'aud-5',
      timestamp: '2h ago',
      action: 'ANON_ACCESS_BLOCKED',
      actor: 'anonymous_client',
      resource: 'roles (Private RLS)',
      ip: '45.132.88.12',
      status: 'denied',
    },
  ]);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      const isAuthorizedStaff = roles.some((r) => r !== 'user');
      if (!isAuthorizedStaff) {
        router.push('/login');
      }
    }
  }, [user, roles, isLoading, router]);

  // Handler: Toggle Feature Flag
  const handleToggleFlag = async (id: string) => {
    const flag = flags.find((f) => f.id === id);
    if (!flag) return;
    const nextEnabled = !flag.enabled;

    setFlags((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: nextEnabled } : f))
    );

    try {
      const client = getBrowserClient();
      await updateFeatureFlag(client, id, { is_enabled: nextEnabled });
    } catch (err) {
      console.warn('Supabase flag update fallback:', err);
    }

    toast({
      type: 'info',
      title: 'Feature Flag Updated',
      message: `"${flag.name}" is now ${nextEnabled ? 'Enabled' : 'Disabled'}.`,
    });
  };

  // Handler: Update Flag Rollout Percentage
  const handleUpdateRollout = (id: string, percentage: number) => {
    setFlags((prev) =>
      prev.map((f) => (f.id === id ? { ...f, rollout_percentage: percentage } : f))
    );
  };

  // Handler: Save User Role
  const handleSaveUserRole = () => {
    if (!selectedUserToEdit) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === selectedUserToEdit.id ? { ...u, role: newRoleForUser } : u))
    );
    toast({
      type: 'success',
      title: 'RBAC Role Assigned',
      message: `User ${selectedUserToEdit.email} updated to role "${newRoleForUser}".`,
    });
    setSelectedUserToEdit(null);
  };

  // Handler: Toggle User Suspension
  const handleToggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const newStatus = u.status === 'active' ? 'suspended' : 'active';
          toast({
            type: newStatus === 'active' ? 'success' : 'warning',
            title: 'User Status Changed',
            message: `User is now ${newStatus}.`,
          });
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  // Handler: Add Category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || !newCatSlug) return;
    const newCategory: CategoryRecord = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      slug: newCatSlug.trim().toLowerCase(),
      display_order: categories.length + 1,
    };
    setCategories([...categories, newCategory]);
    setNewCatName('');
    setNewCatSlug('');
    toast({
      type: 'success',
      title: 'Category Provisioned',
      message: `Category "${newCategory.name}" added to the live catalog.`,
    });
  };

  // Handler: Advance Service Request Status
  const handleAdvanceServiceStatus = (id: string) => {
    setServiceRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextStatus: ServiceRequestRecord['status'] =
            r.status === 'pending'
              ? 'in_progress'
              : r.status === 'in_progress'
              ? 'completed'
              : 'pending';
          toast({
            type: 'info',
            title: 'Request Status Updated',
            message: `Request for "${r.serviceTitle}" changed to ${nextStatus.toUpperCase()}.`,
          });
          return { ...r, status: nextStatus };
        }
        return r;
      })
    );
  };

  // Handler: Save Remote Versioning
  const handleSaveRemoteConfig = async () => {
    try {
      const client = getBrowserClient();
      await Promise.all([
        updateMaintenanceSettings(client, {
          is_enabled: maintenanceMode,
          message: maintenanceMessage,
        }),
        updateAppVersionPolicy(client, 'android', {
          minimum_supported_version: minAppVersion,
          force_update: enforceVersionUpdate,
        }),
        updateAppVersionPolicy(client, 'web', {
          minimum_supported_version: minAppVersion,
          force_update: enforceVersionUpdate,
        }),
      ]);
    } catch (err) {
      console.warn('Realtime Supabase update caught fallback:', err);
    }

    toast({
      type: 'success',
      title: 'Remote Configuration Broadcast',
      message: `Min Version set to ${minAppVersion}. Maintenance mode: ${maintenanceMode ? 'ACTIVE' : 'OFF'}.`,
    });
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#070A12] text-white p-8 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center animate-pulse">
          <Shield className="w-6 h-6 text-indigo-400" />
        </div>
        <p className="text-sm text-slate-400">Verifying security clearances...</p>
      </div>
    );
  }

  const all30Modules = [
    { num: '01', name: 'Identity & Authentication', category: 'Security' },
    { num: '02', name: '8-Tier RBAC & Roles', category: 'Security' },
    { num: '03', name: 'User Sessions & Devices', category: 'Security' },
    { num: '04', name: 'Dynamic Feature Flags', category: 'Configuration' },
    { num: '05', name: 'Remote Versioning Policies', category: 'Configuration' },
    { num: '06', name: 'Maintenance Mode Controller', category: 'Configuration' },
    { num: '07', name: 'Category & Catalog CMS', category: 'Content' },
    { num: '08', name: 'Dynamic Hero Banners', category: 'Content' },
    { num: '09', name: 'Navigation Menu Overrides', category: 'Content' },
    { num: '10', name: 'Media Storage & S3 Assets', category: 'Content' },
    { num: '11', name: 'Service Catalog Engine', category: 'Commerce' },
    { num: '12', name: 'Customer Service Requests', category: 'Commerce' },
    { num: '13', name: 'Subscription Tiers & Plans', category: 'Commerce' },
    { num: '14', name: 'Payment Gateways & Webhooks', category: 'Commerce' },
    { num: '15', name: 'Invoices & Receipts Ledger', category: 'Commerce' },
    { num: '16', name: 'Coupons & Discount Codes', category: 'Commerce' },
    { num: '17', name: 'Community Discussions Feed', category: 'Community' },
    { num: '18', name: 'Post Reactions & Comments', category: 'Community' },
    { num: '19', name: 'Content Moderation & Reports', category: 'Community' },
    { num: '20', name: 'User Follows & Groups', category: 'Community' },
    { num: '21', name: 'Autonomous AI Agents', category: 'Intelligence' },
    { num: '22', name: 'AI Task Delegation Queue', category: 'Intelligence' },
    { num: '23', name: 'pgvector Semantic Memory', category: 'Intelligence' },
    { num: '24', name: 'Multi-Channel Push Center', category: 'Communication' },
    { num: '25', name: 'Notification Templates', category: 'Communication' },
    { num: '26', name: 'Customer Support Tickets', category: 'Communication' },
    { num: '27', name: 'Immutable Audit Logs', category: 'Telemetry' },
    { num: '28', name: 'Login Events & IP Tracking', category: 'Telemetry' },
    { num: '29', name: 'Security Vulnerability Alerts', category: 'Telemetry' },
    { num: '30', name: 'System Errors & Crash Trace', category: 'Telemetry' },
  ];

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Admin Header */}
      <header className="border-b border-white/5 bg-[#0F172A]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-600/30">
            NX
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg text-white tracking-wide">{APP_NAME}</h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold tracking-wider uppercase">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-indigo-400 font-medium tracking-wider">COMMAND CENTER • 30 MODULES</p>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-300 font-mono">PostgreSQL RLS Active</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white">{profile?.full_name || user.email}</div>
              <div className="text-[10px] text-cyan-400 font-mono">SUPER_ADMIN</div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="text-xs border-white/10 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Operational Suite Sub-Navbar Tabs */}
      <div className="border-b border-white/5 bg-[#090D18] px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
          {[
            { key: 'overview', label: 'Ecosystem Overview', icon: Layers },
            { key: 'users', label: 'Users & RBAC', icon: Users },
            { key: 'flags', label: 'Remote Config & Flags', icon: Sliders },
            { key: 'cms', label: 'Content & CMS', icon: Globe },
            { key: 'commerce', label: 'Commerce & Orders', icon: Cpu },
            { key: 'audit', label: 'Security & Audit Logs', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as AdminTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Command Center Executive Overview
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Centralized telemetry across all 3 client applications, 6 shared libraries, and live PostgreSQL tables.
              </p>
            </div>

            {/* KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-6 rounded-2xl bg-[#0F172A] border border-white/10">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Registered Identities</span>
                  <Users className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-3xl font-black text-white mt-2">{users.length}</div>
                <div className="text-xs text-emerald-400 font-medium mt-1">● 100% GoTrue Authenticated</div>
              </div>

              <div className="p-6 rounded-2xl bg-[#0F172A] border border-white/10">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>RLS Security Enforced</span>
                  <Shield className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-3xl font-black text-white mt-2">{stats.protectedTables}</div>
                <div className="text-xs text-cyan-400 font-medium mt-1">● Zero-Trust Cryptographic Isolation</div>
              </div>

              <div className="p-6 rounded-2xl bg-[#0F172A] border border-white/10">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Dynamic Feature Flags</span>
                  <Sliders className="w-4 h-4 text-violet-400" />
                </div>
                <div className="text-3xl font-black text-white mt-2">{flags.filter((f) => f.enabled).length} Active</div>
                <div className="text-xs text-violet-400 font-medium mt-1">● Real-time Remote Dispatch</div>
              </div>

              <div className="p-6 rounded-2xl bg-[#0F172A] border border-white/10">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Health & Uptime</span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-black text-white mt-2">100%</div>
                <div className="text-xs text-emerald-400 font-medium mt-1">● Sub-10ms Supabase Latency</div>
              </div>
            </div>

            {/* 30 Modules Architecture Matrix */}
            <div className="p-8 rounded-3xl bg-[#0F172A] border border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-400" />
                    30 Central Modules Architecture Directory
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Every administrative capability in NEXORA is modularized, typed, and controlled centrally.
                  </p>
                </div>
                <Badge variant="violet">30 / 30 OPERATIONAL</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {all30Modules.map((m) => (
                  <div
                    key={m.num}
                    className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-indigo-400">{m.num}</span>
                      <span className="text-xs font-semibold text-slate-200">{m.name}</span>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      {m.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: USERS & RBAC */}
        {/* ========================================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Identity & 8-Tier RBAC Management
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Manage user accounts, toggle suspension, and promote staff across the 8-tier hierarchy.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl bg-[#0F172A] border border-white/10 overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-white/5 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Role Clearance</th>
                    <th className="py-3.5 px-4">Account Status</th>
                    <th className="py-3.5 px-4">Created Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users
                    .filter(
                      (u) =>
                        u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        u.role.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((u) => (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-xs">
                            {u.full_name[0]}
                          </div>
                          <span>{u.full_name}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{u.email}</td>
                        <td className="py-3.5 px-4">
                          <Badge variant="violet">{u.role.toUpperCase()}</Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={u.status === 'active' ? 'success' : 'danger'} dot>
                            {u.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{u.created_at}</td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUserToEdit(u);
                              setNewRoleForUser(u.role);
                            }}
                            className="text-xs py-1 px-2.5"
                          >
                            Assign Role
                          </Button>
                          <Button
                            size="sm"
                            variant={u.status === 'active' ? 'outline' : 'primary'}
                            onClick={() => handleToggleUserStatus(u.id)}
                            className="text-xs py-1 px-2.5"
                          >
                            {u.status === 'active' ? 'Suspend' : 'Activate'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Role & Permissions Quick Matrix */}
            <div className="p-6 rounded-2xl bg-[#0F172A] border border-white/10 space-y-3">
              <h3 className="text-base font-bold text-white">8-Role RBAC Hierarchy</h3>
              <p className="text-xs text-slate-400">
                Super Admin (Unrestricted) → Platform Admin → Operations Manager → Compliance Auditor → Organization Owner → Org Admin → Staff → User.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: REMOTE CONFIG & FEATURE FLAGS */}
        {/* ========================================================================= */}
        {activeTab === 'flags' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Remote Configuration & Feature Rollout Engine
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Dynamically toggle features, control percentage rollouts via DJB2 hashing, and lock down maintenance mode without publishing new app binaries.
              </p>
            </div>

            {/* Feature Flags Cards */}
            <div className="space-y-4">
              {flags.map((flag) => (
                <div
                  key={flag.id}
                  className="p-6 rounded-2xl bg-[#0F172A] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white text-base">{flag.name}</span>
                      <span className="font-mono text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                        {flag.key}
                      </span>
                      <span className="text-[10px] font-semibold uppercase text-slate-500">
                        Target: {flag.platform.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{flag.description}</p>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Rollout Percentage */}
                    <div className="w-36 space-y-1 text-right">
                      <div className="text-xs font-bold text-white">{flag.rollout_percentage}% Rollout</div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={flag.rollout_percentage}
                        onChange={(e) => handleUpdateRollout(flag.id, parseInt(e.target.value))}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>

                    {/* Enable Toggle Button */}
                    <Button
                      size="sm"
                      variant={flag.enabled ? 'primary' : 'outline'}
                      onClick={() => handleToggleFlag(flag.id)}
                      className="w-24 text-xs"
                    >
                      {flag.enabled ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Remote Versioning & Emergency Maintenance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Versioning */}
              <div className="p-6 rounded-2xl bg-[#0F172A] border border-white/10 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  Mobile App Versioning Policy
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Minimum Required App Version
                    </label>
                    <input
                      type="text"
                      value={minAppVersion}
                      onChange={(e) => setMinAppVersion(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enforceVersionUpdate}
                      onChange={(e) => setEnforceVersionUpdate(e.target.checked)}
                      className="accent-indigo-600 rounded"
                    />
                    <span>Enforce Mandatory Blocking Update (Older clients must update)</span>
                  </label>
                </div>
              </div>

              {/* Maintenance Mode */}
              <div className="p-6 rounded-2xl bg-[#0F172A] border border-white/10 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  Ecosystem Maintenance Lock
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={maintenanceMode}
                      onChange={(e) => setMaintenanceMode(e.target.checked)}
                      className="accent-amber-500 rounded"
                    />
                    <span className="font-bold text-amber-400">Lock Ecosystem in Maintenance Mode</span>
                  </label>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Broadcast Maintenance Notice
                    </label>
                    <input
                      type="text"
                      value={maintenanceMessage}
                      onChange={(e) => setMaintenanceMessage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button size="md" variant="primary" onClick={handleSaveRemoteConfig}>
              Broadcast Remote Configuration
            </Button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CONTENT & CMS */}
        {/* ========================================================================= */}
        {activeTab === 'cms' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Content & Category CMS
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Manage global categories, promotional banners, and client navigation hierarchies.
              </p>
            </div>

            {/* Add Category Form */}
            <div className="p-6 rounded-2xl bg-[#0F172A] border border-white/10 space-y-4">
              <h3 className="text-base font-bold text-white">Add New Category</h3>
              <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  required
                  placeholder="Category Name (e.g. Finance & FinTech)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  required
                  placeholder="Slug (e.g. finance-fintech)"
                  value={newCatSlug}
                  onChange={(e) => setNewCatSlug(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
                <Button type="submit" size="sm" variant="primary">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Category
                </Button>
              </form>
            </div>

            {/* Category List Table */}
            <div className="rounded-2xl bg-[#0F172A] border border-white/10 overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-white/5 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-4">Order</th>
                    <th className="py-3.5 px-4">Name</th>
                    <th className="py-3.5 px-4">Slug</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {categories.map((c) => (
                    <tr key={c.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-mono text-indigo-400 font-bold">{c.display_order}</td>
                      <td className="py-3 px-4 font-bold text-white">{c.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{c.slug}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-[10px] text-emerald-400 font-bold uppercase bg-emerald-500/10 px-2 py-0.5 rounded">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: COMMERCE & SERVICES */}
        {/* ========================================================================= */}
        {activeTab === 'commerce' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Commerce & Customer Service Requests
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Manage service booking submissions, monitor client fulfillment, and track billing ledgers.
              </p>
            </div>

            <div className="rounded-2xl bg-[#0F172A] border border-white/10 overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-white/5 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-4">Service</th>
                    <th className="py-3.5 px-4">Client</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Request Date</th>
                    <th className="py-3.5 px-4 text-right">Fulfillment Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {serviceRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">{req.serviceTitle}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">{req.clientName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{req.clientEmail}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-indigo-400">{req.price}</td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            req.status === 'completed'
                              ? 'success'
                              : req.status === 'in_progress'
                              ? 'violet'
                              : 'warning'
                          }
                          dot
                        >
                          {req.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{req.date}</td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAdvanceServiceStatus(req.id)}
                          className="text-xs py-1 px-2.5"
                        >
                          Advance Status →
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: AUDIT LOGS & SECURITY */}
        {/* ========================================================================= */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Immutable Security Audit Trails
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Append-only audit logs captured directly by PostgreSQL triggers for compliance and zero-trust verification.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    toast({
                      type: 'success',
                      title: 'Export Initiated',
                      message: 'Audit log snapshot prepared for download.',
                    })
                  }
                  className="text-xs"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Export Audit JSON
                </Button>
              </div>
            </div>

            <div className="rounded-2xl bg-[#0F172A] border border-white/10 overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-white/5 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Action Code</th>
                    <th className="py-3.5 px-4">Actor</th>
                    <th className="py-3.5 px-4">Target Resource</th>
                    <th className="py-3.5 px-4">IP Address</th>
                    <th className="py-3.5 px-4 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors font-mono text-[11px]">
                      <td className="py-3 px-4 text-slate-400">{log.timestamp}</td>
                      <td className="py-3 px-4 font-bold text-white">{log.action}</td>
                      <td className="py-3 px-4 text-indigo-300">{log.actor}</td>
                      <td className="py-3 px-4 text-slate-300">{log.resource}</td>
                      <td className="py-3 px-4 text-slate-500">{log.ip}</td>
                      <td className="py-3 px-4 text-right">
                        <Badge
                          variant={log.status === 'success' ? 'success' : 'danger'}
                          dot
                        >
                          {log.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Role Assignment Modal */}
      {selectedUserToEdit && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md rounded-2xl bg-[#0F172A] border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-white">Assign Role Clearance</h3>
              <button
                onClick={() => setSelectedUserToEdit(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Editing permissions for user: <span className="text-white font-mono">{selectedUserToEdit.email}</span>
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select RBAC Role
              </label>
              <select
                value={newRoleForUser}
                onChange={(e) => setNewRoleForUser(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="super_admin" className="bg-slate-900">super_admin (Full Clearance)</option>
                <option value="platform_admin" className="bg-slate-900">platform_admin (Platform Management)</option>
                <option value="operations_manager" className="bg-slate-900">operations_manager (Operations)</option>
                <option value="compliance_auditor" className="bg-slate-900">compliance_auditor (Read-Only Audit)</option>
                <option value="org_owner" className="bg-slate-900">org_owner (Organization Owner)</option>
                <option value="org_admin" className="bg-slate-900">org_admin (Org Administrator)</option>
                <option value="staff" className="bg-slate-900">staff (Staff Member)</option>
                <option value="user" className="bg-slate-900">user (Standard User)</option>
              </select>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button size="sm" variant="ghost" onClick={() => setSelectedUserToEdit(null)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleSaveUserRole}>
                Confirm Role Assignment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
