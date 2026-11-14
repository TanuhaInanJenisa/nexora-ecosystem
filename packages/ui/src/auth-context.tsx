'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import type { UserProfile, UserRole, PermissionCode } from '@nexora/types';
import { getBrowserClient, getUserProfile, getUserRoles, getUserPermissions, signOut as apiSignOut } from '@nexora/api';
import { hasPermission as checkPermission } from '@nexora/business-logic';

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  roles: UserRole[];
  permissions: PermissionCode[];
  isLoading: boolean;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: PermissionCode) => boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>(['user']);
  const [permissions, setPermissions] = useState<PermissionCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const client = getBrowserClient();

  const fetchUserData = useCallback(async (currentUser: User) => {
    try {
      const [fetchedProfile, fetchedRoles, fetchedPermissions] = await Promise.all([
        getUserProfile(client, currentUser.id).catch(() => null),
        getUserRoles(client, currentUser.id).catch(() => ['user' as UserRole]),
        getUserPermissions(client, currentUser.id).catch(() => ['content.read' as PermissionCode]),
      ]);

      setProfile(fetchedProfile);
      setRoles(fetchedRoles);
      setPermissions(fetchedPermissions);
    } catch (err) {
      console.error('Failed to hydrate user profile/roles:', err);
    }
  }, [client]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchUserData(user);
    }
  }, [user, fetchUserData]);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session } } = await client.auth.getSession();
        if (session?.user && mounted) {
          setUser(session.user);
          await fetchUserData(session.user);
        }
      } catch (err) {
        console.error('Error getting auth session:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initAuth();

    const { data: { subscription } } = client.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        await fetchUserData(session.user);
      } else {
        setUser(null);
        setProfile(null);
        setRoles(['user']);
        setPermissions([]);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [client, fetchUserData]);

  const hasRole = useCallback(
    (role: UserRole) => {
      if (roles.includes('super_admin')) return true;
      return roles.includes(role);
    },
    [roles]
  );

  const hasPermission = useCallback(
    (permission: PermissionCode) => {
      if (roles.includes('super_admin')) return true;
      return checkPermission(roles, permission);
    },
    [roles]
  );

  const signOut = useCallback(async () => {
    await apiSignOut(client);
    setUser(null);
    setProfile(null);
    setRoles(['user']);
    setPermissions([]);
  }, [client]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        roles,
        permissions,
        isLoading,
        hasRole,
        hasPermission,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
