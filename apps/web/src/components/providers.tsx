'use client';

import React from 'react';
import {
  AuthProvider,
  ToastProvider,
  RemoteConfigProvider,
  MaintenanceGate,
  VersionGate,
} from '@nexora/ui';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <RemoteConfigProvider platform="web" currentVersion="1.0.0">
        <ToastProvider>
          <MaintenanceGate>
            <VersionGate currentVersion="1.0.0">
              {children}
            </VersionGate>
          </MaintenanceGate>
        </ToastProvider>
      </RemoteConfigProvider>
    </AuthProvider>
  );
}
