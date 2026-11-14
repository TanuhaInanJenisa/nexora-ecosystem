'use client';

import React from 'react';
import { AuthProvider, ToastProvider } from '@nexora/ui';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthProvider>
  );
}

