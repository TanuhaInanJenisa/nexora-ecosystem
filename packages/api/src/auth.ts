import type { NexoraClient } from './client';
import type { UserProfile, UserRole, PermissionCode } from '@nexora/types';
import type { LoginInput, RegisterInput, OtpVerifyInput } from '@nexora/validation';

export async function signIn(client: NexoraClient, credentials: LoginInput) {
  const { data, error } = await client.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) throw error;
  return data;
}

export async function signUp(client: NexoraClient, input: RegisterInput) {
  const { data, error } = await client.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.full_name,
        locale: 'en',
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function verifyOtp(client: NexoraClient, input: OtpVerifyInput) {
  const { data, error } = await client.auth.verifyOtp({
    email: input.email,
    token: input.token,
    type: input.type,
  });

  if (error) throw error;
  return data;
}

export async function signInWithGoogle(client: NexoraClient, redirectTo?: string) {
  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTo || (typeof window !== 'undefined' ? window.location.origin : undefined),
    },
  });

  if (error) throw error;
  return data;
}

export async function signOut(client: NexoraClient) {
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(client: NexoraClient, email: string, redirectTo?: string) {
  const { data, error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) throw error;
  return data;
}

export async function getUserProfile(client: NexoraClient, userId: string): Promise<UserProfile | null> {
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // record not found
    throw error;
  }

  return data as unknown as UserProfile;
}

export async function getUserRoles(client: NexoraClient, userId: string): Promise<UserRole[]> {
  const { data, error } = await client
    .from('user_roles')
    .select('roles(name)')
    .eq('user_id', userId);

  if (error) throw error;
  if (!data) return ['user'];

  return data
    .map((item: any) => item.roles?.name)
    .filter(Boolean) as UserRole[];
}

export async function getUserPermissions(client: NexoraClient, userId: string): Promise<PermissionCode[]> {
  const roles = await getUserRoles(client, userId);
  if (roles.includes('super_admin')) {
    // Super admin has all permissions
    return [
      'user.read', 'user.write', 'user.update', 'user.suspend', 'user.delete',
      'admin.manage', 'app.config.read', 'app.config.update', 'feature.read',
      'feature.manage', 'payment.read', 'payment.refund', 'payment.manage',
      'content.read', 'content.create', 'content.publish', 'content.delete',
      'community.moderate', 'audit.read', 'service.manage', 'ai.manage', 'notification.send'
    ];
  }

  const { data, error } = await client
    .from('user_roles')
    .select('roles(role_permissions(permissions(code)))')
    .eq('user_id', userId);

  if (error) throw error;
  if (!data) return ['content.read'];

  const permissionsSet = new Set<PermissionCode>();
  for (const item of data as any[]) {
    const rolePermissions = item.roles?.role_permissions || [];
    for (const rp of rolePermissions) {
      if (rp.permissions?.code) {
        permissionsSet.add(rp.permissions.code);
      }
    }
  }

  return Array.from(permissionsSet);
}

