import { APP_NAME } from '@nexora/shared';
import {
  Sliders,
  Users,
  Shield,
  Activity,
  Bell,
  Cpu,
  Layers,
  Smartphone,
  Globe,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const stats = [
    { label: 'Active Users', value: '1', change: 'Online', icon: Users },
    { label: 'Security Health', value: '100%', change: 'Enforced', icon: Shield },
    { label: 'Feature Flags', value: 'Active', change: 'Realtime', icon: Sliders },
    { label: 'System Status', value: 'Optimal', change: 'All Services Operational', icon: Activity },
  ];

  const modules = [
    { name: 'Feature Flag Center', desc: 'Manage rollouts, overrides, and live toggles', icon: Sliders },
    { name: 'Mobile App Control', desc: 'Remote configs, banners, and forced updates', icon: Smartphone },
    { name: 'Website Management', desc: 'Dynamic CMS, hero banners, and SEO', icon: Globe },
    { name: 'Role & RBAC Security', desc: 'Granular permissions and audit trails', icon: Shield },
    { name: 'AI & Automation', desc: 'Manage model routing, usage quotas, and agents', icon: Cpu },
    { name: 'Notification Center', desc: 'Broadcast push, emails, and in-app alerts', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-[#0F172A]/80 backdrop-blur px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            NX
          </div>
          <div>
            <h1 className="font-bold text-lg text-white leading-tight">{APP_NAME}</h1>
            <p className="text-xs text-indigo-400 font-medium">SUPER ADMIN COMMAND CENTER</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Phase 01 Active
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Central Ecosystem Overview</h2>
          <p className="text-sm text-slate-400 mt-1">
            Super Admin module ready for centralized Supabase database connection and dynamic application control.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">{stat.label}</span>
                  <Icon className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="text-2xl font-bold mt-2 text-white">{stat.value}</div>
                <div className="text-xs text-emerald-400 mt-1 font-medium">{stat.change}</div>
              </div>
            );
          })}
        </div>

        {/* Core Administrative Modules */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Control Center Modules (30 Modules Architecture)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.name} className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-indigo-500/50 transition-all">
                  <Icon className="w-6 h-6 text-violet-400 mb-3" />
                  <h4 className="font-semibold text-white">{m.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{m.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

