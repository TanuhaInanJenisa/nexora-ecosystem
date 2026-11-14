export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  is_active: boolean;
  order_index: number;
}

export interface ServiceItem {
  id: string;
  category_id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  duration_minutes?: number;
  image_url?: string;
  is_available: boolean;
  rating: number;
  review_count: number;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export type ServiceRequestStatus =
  | 'pending'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export interface ServiceRequest {
  id: string;
  user_id: string;
  service_id: string;
  status: ServiceRequestStatus;
  scheduled_at?: string;
  notes?: string;
  total_amount: number;
  currency: string;
  assigned_staff_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  features: string[];
  max_requests: number;
  is_active: boolean;
}

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'paused';

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  payment_method_id?: string;
  created_at: string;
}

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

export interface PaymentTransaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: 'stripe' | 'bkash' | 'sslcommerz' | 'manual';
  provider_tx_id?: string;
  idempotency_key: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

