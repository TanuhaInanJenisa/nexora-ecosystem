import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  email: z.string().trim().email('Invalid email address format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  full_name: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100),
  phone_number: z.string().trim().optional(),
});

export const otpVerifySchema = z.object({
  email: z.string().trim().email(),
  token: z.string().length(6, 'Verification code must be 6 digits').regex(/^\d+$/, 'Code must contain only digits'),
  type: z.enum(['signup', 'recovery', 'magiclink', 'invite']).default('signup'),
});

export const profileUpdateSchema = z.object({
  full_name: z.string().trim().min(2).max(100).optional(),
  phone_number: z.string().trim().optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
  locale: z.enum(['en', 'bn']).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

