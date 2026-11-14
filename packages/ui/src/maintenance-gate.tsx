'use client';

import React, { useState } from 'react';
import { ShieldAlert, Clock, Key, RefreshCw } from 'lucide-react';
import { useRemoteConfig } from './remote-config-context';
import { Button } from './button';
import { Input } from './input';

export interface MaintenanceGateProps {
  children: React.ReactNode;
}

export function MaintenanceGate({ children }: MaintenanceGateProps) {
  const { isMaintenanceActive, maintenance, bypassMaintenance, refreshConfig, isLoading } =
    useRemoteConfig();
  const [showBypassInput, setShowBypassInput] = useState(false);
  const [secretKey, setSecretKey] = useState('');
  const [bypassError, setBypassError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (isLoading) {
    return <>{children}</>;
  }

  if (!isMaintenanceActive) {
    return <>{children}</>;
  }

  const handleBypassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBypassError('');
    const success = bypassMaintenance(secretKey);
    if (!success) {
      setBypassError('Invalid Staff Override Key. Access denied.');
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshConfig();
    setIsRefreshing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070A12] text-white p-4 overflow-y-auto">
      {/* Background radial gradient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative w-full max-w-xl mx-auto p-8 rounded-3xl bg-[#0B0F19]/90 border border-amber-500/30 shadow-2xl backdrop-blur-xl text-center space-y-6">
        {/* Animated Badge & Status */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.2)]">
              <ShieldAlert className="w-10 h-10 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            Scheduled Maintenance Active
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {maintenance.title || 'Ecosystem Maintenance in Progress'}
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
            {maintenance.message ||
              'We are currently applying vital database optimizations and security updates across NEXORA. All client sessions are temporarily locked to protect data integrity.'}
          </p>
        </div>

        {/* Bengali Announcement Support */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-xs text-slate-300">
          <p className="text-slate-400 font-medium">
            বাংলা: নেক্সোরা ইকোসিস্টেমে পরিকল্পিত রক্ষণাবেক্ষণ ও আপগ্রেড চলছে। সাময়িক অসুবিধার জন্য আমরা আন্তরিকভাবে দুঃখিত। শীঘ্রই সকল সেবা পুনরায় সচল হবে।
          </p>
        </div>

        {/* Time Info */}
        {(maintenance.start_time || maintenance.end_time) && (
          <div className="grid grid-cols-2 gap-3 text-left p-4 rounded-2xl bg-black/40 border border-white/5 text-xs">
            {maintenance.start_time && (
              <div>
                <span className="text-slate-500 block mb-0.5">Started At:</span>
                <span className="text-slate-300 font-mono">
                  {new Date(maintenance.start_time).toLocaleTimeString()}
                </span>
              </div>
            )}
            {maintenance.end_time && (
              <div>
                <span className="text-slate-500 block mb-0.5">Estimated Completion:</span>
                <span className="text-amber-400 font-mono font-semibold">
                  {new Date(maintenance.end_time).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="md"
            onClick={handleManualRefresh}
            isLoading={isRefreshing}
            className="w-full sm:w-auto text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-2" />
            Check Live Status
          </Button>

          <Button
            variant="ghost"
            size="md"
            onClick={() => setShowBypassInput(!showBypassInput)}
            className="w-full sm:w-auto text-xs text-slate-400 hover:text-white"
          >
            <Key className="w-3.5 h-3.5 mr-2 text-indigo-400" />
            Staff Emergency Override
          </Button>
        </div>

        {/* Staff Emergency Bypass Drawer */}
        {showBypassInput && (
          <form
            onSubmit={handleBypassSubmit}
            className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-3 text-left animate-in fade-in slide-in-from-top duration-200"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
              <Key className="w-3.5 h-3.5" />
              Staff Security Clearance Bypass
            </div>
            <p className="text-[11px] text-slate-400">
              Authorized engineers may provide the emergency override passkey to bypass maintenance lock in this session.
            </p>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Enter Staff Passkey..."
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="text-xs"
              />
              <Button type="submit" variant="primary" size="sm">
                Unlock
              </Button>
            </div>
            {bypassError && <p className="text-xs text-rose-400">{bypassError}</p>}
          </form>
        )}

        {/* Footer Guarantee */}
        <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-center gap-2">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>Real-time WebSocket Synchronized • Automated Auto-Resume</span>
        </div>
      </div>
    </div>
  );
}
