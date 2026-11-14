'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, useToast } from '@nexora/ui';
import { getBrowserClient, resetPassword } from '@nexora/api';
import { APP_NAME } from '@nexora/shared';
import { Sparkles, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const client = getBrowserClient();
      await resetPassword(client, email);
      setIsSubmitted(true);
      toast({
        type: 'success',
        title: 'Reset Link Dispatched',
        message: 'Check your email inbox for instructions to reset your password.',
      });
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Error',
        message: err.message || 'Could not send reset link. Please check the email provided.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-slate-900 via-[#1E1B4B] to-[#0B0F19]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-black text-white">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-5 h-5 text-cyan-300" />
            </div>
            <span>{APP_NAME}</span>
          </Link>
          <p className="text-sm text-slate-400">Account Recovery</p>
        </div>

        <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              {isSubmitted
                ? 'An email has been sent with recovery instructions'
                : 'Enter your registered email address to receive a secure password reset link'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <div className="text-center py-4 space-y-4">
                <p className="text-sm text-slate-300">
                  We have sent instructions to <strong className="text-white">{email}</strong>. Please check your inbox and spam folder.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsSubmitted(false)}
                >
                  Resend Email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Registered Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isLoading}
                  rightIcon={<Send className="w-4 h-4" />}
                >
                  Send Reset Link
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="justify-center border-t border-slate-800 pt-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

