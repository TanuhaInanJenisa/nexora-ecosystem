'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, useToast } from '@nexora/ui';
import { getBrowserClient, signIn, getUserRoles } from '@nexora/api';
import { loginSchema } from '@nexora/validation';
import { APP_NAME } from '@nexora/shared';
import { Shield, ArrowRight, Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const client = getBrowserClient();
      const authData = await signIn(client, { email, password });
      
      if (!authData.user) {
        throw new Error('Authentication failed');
      }

      // Check RBAC permissions
      const roles = await getUserRoles(client, authData.user.id);
      const isAuthorizedStaff = roles.some((r) => r !== 'user');

      if (!isAuthorizedStaff) {
        await client.auth.signOut();
        toast({
          type: 'error',
          title: 'Access Forbidden',
          message: 'Your account does not possess administrative privileges.',
        });
        return;
      }

      toast({
        type: 'success',
        title: 'Authentication Verified',
        message: 'Welcome to the Super Admin Command Center.',
      });
      router.push('/');
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Login Denied',
        message: err.message || 'Invalid administrative credentials.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#070A12] text-slate-100">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 mb-2 shadow-lg shadow-indigo-500/10">
            <Shield className="w-7 h-7 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-black text-white">{APP_NAME} COMMAND CENTER</h1>
          <p className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">
            Administrative & Staff Access Only
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="w-4 h-4 text-violet-400" />
              Secure Staff Login
            </CardTitle>
            <CardDescription>
              Session activity and audit logs are recorded for security compliance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <Input
                label="Admin Email"
                type="email"
                placeholder="admin@nexora.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                required
              />

              <Input
                label="Security Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                required
              />

              <Button
                type="submit"
                variant="violet"
                className="w-full mt-2"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Authenticate & Enter
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t border-slate-800/80 pt-4">
            <span className="text-xs text-slate-500">
              Zero-Trust Architecture • Protected by Row Level Security
            </span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

