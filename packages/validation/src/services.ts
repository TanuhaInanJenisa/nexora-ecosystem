import { z } from 'zod';

export const serviceRequestSchema = z.object({
  service_id: z.string().uuid('Valid service ID required'),
  notes: z.string().max(1000).optional(),
  scheduled_at: z.string().datetime().optional(),
});

export const serviceItemSchema = z.object({
  category_id: z.string().uuid(),
  title: z.string().min(3).max(150),
  slug: z.string().min(3).max(150).regex(/^[a-z0-9-]+$/),
  description: z.string().min(10).max(5000),
  price: z.number().nonnegative(),
  currency: z.string().length(3).default('USD'),
  duration_minutes: z.number().int().positive().optional(),
  image_url: z.string().url().optional(),
  is_available: z.boolean().default(true),
});

export type ServiceRequestInput = z.infer<typeof serviceRequestSchema>;
export type ServiceItemInput = z.infer<typeof serviceItemSchema>;

