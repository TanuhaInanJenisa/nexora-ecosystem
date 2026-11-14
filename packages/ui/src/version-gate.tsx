'use client';

import React, { useState } from 'react';
import { Sparkles, Download, X, AlertTriangle } from 'lucide-react';
import { useRemoteConfig } from './remote-config-context';
import { Button } from './button';

export interface VersionGateProps {
  currentVersion?: string;
  children: React.ReactNode;
}

export function VersionGate({ currentVersion = '1.0.0', children }: VersionGateProps) {
  const { versionStatus, versionPolicy, isLoading } = useRemoteConfig();
  const [softUpdateDismissed, setSoftUpdateDismissed] = useState(false);

  if (isLoading) {
    return <>{children}</>;
  }

  // 1. HARD BLOCKING FORCE UPDATE GATE
  if (versionStatus.isForceUpdate) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070A12] text-white p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative w-full max-w-lg mx-auto p-8 rounded-3xl bg-[#0B0F19]/95 border border-indigo-500/30 shadow-2xl backdrop-blur-xl text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-3xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_40px_rgba(99,102,241,0.2)]">
              <AlertTriangle className="w-10 h-10 text-amber-400 animate-bounce" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Mandatory Release Required
            </div>
            <h1 className="text-2xl font-extrabold text-white">Update Required</h1>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
              Your NEXORA client version (<span className="font-mono text-white">v{currentVersion}</span>) has reached end-of-life. Version{' '}
              <span className="font-mono text-emerald-400 font-semibold">v{versionPolicy.latest_version}</span> or above is required to continue.
            </p>
          </div>

          {versionPolicy.release_notes && (
            <div className="text-left p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-slate-300 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                What&apos;s New in v{versionPolicy.latest_version}:
              </span>
              <p className="leading-relaxed">{versionPolicy.release_notes}</p>
            </div>
          )}

          <div className="pt-2">
            <a
              href={versionPolicy.update_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full"
            >
              <Button variant="primary" size="lg" className="w-full text-sm font-semibold">
                <Download className="w-4 h-4 mr-2" />
                Download Update Now
              </Button>
            </a>
          </div>

          <p className="text-[11px] text-slate-500">
            For security, outdated clients cannot establish database sessions.
          </p>
        </div>
      </div>
    );
  }

  // 2. SOFT UPDATE ANNOUNCEMENT BANNER
  const showSoftBanner = versionStatus.needsUpdate && !softUpdateDismissed;

  return (
    <>
      {showSoftBanner && (
        <aside
          aria-label="New version available notification"
          className="relative z-40 bg-gradient-to-r from-indigo-900/90 via-violet-900/90 to-indigo-900/90 border-b border-indigo-500/30 px-4 py-2 text-white shadow-lg backdrop-blur-md"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs gap-3">
            <div className="flex items-center gap-2 truncate">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-semibold text-white">New Version Available:</span>
              <span className="text-slate-200 truncate">
                NEXORA v{versionStatus.latestVersion} is out with major performance and security enhancements.
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <a
                href={versionPolicy.update_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-emerald-300 hover:text-emerald-200 underline underline-offset-2 transition-colors"
              >
                Update Now
              </a>
              <button
                onClick={() => setSoftUpdateDismissed(true)}
                className="text-slate-400 hover:text-white transition-colors p-1"
                aria-label="Dismiss banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>
      )}
      {children}
    </>
  );
}

