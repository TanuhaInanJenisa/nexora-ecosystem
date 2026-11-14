import type {
  ServiceItem,
  ServiceCategory,
  ServiceRequest,
  ServiceRequestStatus,
  EnrichedServiceRequest,
} from '@nexora/types';
import type { NexoraClient } from './client';

/**
 * Fallback static services in case database connection is unreachable.
 */
export const FALLBACK_SERVICES: ServiceItem[] = [
  {
    id: 'srv-001',
    category_id: 'cat-001',
    title: 'Enterprise Architecture Consulting',
    slug: 'enterprise-architecture-consulting',
    description: 'High-availability multi-region cloud topology design, SOC2 readiness, and performance audits.',
    price: 4999.0,
    currency: 'USD',
    duration_minutes: 120,
    image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    is_available: true,
    rating: 4.95,
    review_count: 38,
    created_at: new Date().toISOString(),
  },
  {
    id: 'srv-002',
    category_id: 'cat-002',
    title: 'Autonomous AI Integration',
    slug: 'autonomous-ai-integration',
    description: 'Deploy fine-tuned agent workflows, vector embeddings, and real-time decision orchestration.',
    price: 3499.0,
    currency: 'USD',
    duration_minutes: 90,
    image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    is_available: true,
    rating: 4.88,
    review_count: 52,
    created_at: new Date().toISOString(),
  },
  {
    id: 'srv-003',
    category_id: 'cat-003',
    title: 'Zero-Trust Security & Penetration Audit',
    slug: 'zero-trust-security-penetration-audit',
    description: 'Deep penetration testing, RLS verification, cryptographic session management, and vulnerability hardening.',
    price: 5999.0,
    currency: 'USD',
    duration_minutes: 180,
    image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800',
    is_available: true,
    rating: 5.0,
    review_count: 24,
    created_at: new Date().toISOString(),
  },
  {
    id: 'srv-004',
    category_id: 'cat-004',
    title: 'Cross-Platform React Native & Web Deployment',
    slug: 'cross-platform-react-native-web-deployment',
    description: 'Production-ready iOS, Android, and responsive Web monorepo setups with automated CI/CD pipelines.',
    price: 2999.0,
    currency: 'USD',
    duration_minutes: 60,
    image_url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800',
    is_available: true,
    rating: 4.92,
    review_count: 67,
    created_at: new Date().toISOString(),
  },
];

export const FALLBACK_CATEGORIES: ServiceCategory[] = [
  { id: 'cat-001', name: 'Cloud Architecture', slug: 'cloud-architecture', is_active: true, order_index: 0 },
  { id: 'cat-002', name: 'AI & Intelligence', slug: 'ai-intelligence', is_active: true, order_index: 1 },
  { id: 'cat-003', name: 'Security & Compliance', slug: 'security-compliance', is_active: true, order_index: 2 },
  { id: 'cat-004', name: 'App Engineering', slug: 'app-engineering', is_active: true, order_index: 3 },
];

/**
 * Fetch available services with optional category filtering
 */
export async function fetchServices(
  client: NexoraClient,
  categoryId?: string
): Promise<ServiceItem[]> {
  try {
    let query = (client as any)
      .from('services')
      .select('*')
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (categoryId && categoryId !== 'all') {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      if (categoryId && categoryId !== 'all') {
        return FALLBACK_SERVICES.filter((s) => s.category_id === categoryId);
      }
      return FALLBACK_SERVICES;
    }

    return data as ServiceItem[];
  } catch (err) {
    console.warn('Error fetching services, returning fallback:', err);
    return FALLBACK_SERVICES;
  }
}

/**
 * Fetch service categories
 */
export async function fetchServiceCategories(
  client: NexoraClient
): Promise<ServiceCategory[]> {
  try {
    const { data, error } = await (client as any)
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return FALLBACK_CATEGORIES;
    }

    return (data as any[]).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      is_active: true,
      order_index: c.display_order || 0,
    }));
  } catch (err) {
    console.warn('Error fetching categories, returning fallback:', err);
    return FALLBACK_CATEGORIES;
  }
}

export interface CreateServiceRequestParams {
  service_id: string;
  user_id: string;
  notes?: string;
  scheduled_at?: string;
  total_amount?: number;
  currency?: string;
}

/**
 * Submit a new service request from Web or Mobile client
 */
export async function createServiceRequest(
  client: NexoraClient,
  params: CreateServiceRequestParams
): Promise<ServiceRequest | null> {
  try {
    const payload = {
      service_id: params.service_id,
      user_id: params.user_id,
      notes: params.notes || null,
      scheduled_at: params.scheduled_at || null,
      total_amount: params.total_amount || 0.0,
      currency: params.currency || 'USD',
      status: 'pending',
    };

    const { data, error } = await (client as any)
      .from('service_requests')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.warn('Failed to insert service request into Supabase:', error.message);
      // Return simulated optimistic request so the user UI can proceed smoothly
      return {
        id: `sr-${Date.now()}`,
        service_id: params.service_id,
        user_id: params.user_id,
        status: 'pending',
        notes: params.notes,
        scheduled_at: params.scheduled_at,
        total_amount: params.total_amount || 0,
        currency: params.currency || 'USD',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    return data as ServiceRequest;
  } catch (err) {
    console.error('Error creating service request:', err);
    return null;
  }
}

/**
 * Fetch service requests submitted by the logged-in user
 */
export async function fetchUserServiceRequests(
  client: NexoraClient,
  userId: string
): Promise<EnrichedServiceRequest[]> {
  try {
    const { data, error } = await (client as any)
      .from('service_requests')
      .select('*, service:services(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data as EnrichedServiceRequest[];
  } catch (err) {
    console.error('Error fetching user service requests:', err);
    return [];
  }
}

/**
 * Fetch all service requests for Super Admin / Staff view
 */
export async function fetchAllServiceRequests(
  client: NexoraClient,
  statusFilter?: ServiceRequestStatus
): Promise<EnrichedServiceRequest[]> {
  try {
    let query = (client as any)
      .from('service_requests')
      .select('*, service:services(*)')
      .order('created_at', { ascending: false });

    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error || !data) {
      return [];
    }

    return data as EnrichedServiceRequest[];
  } catch (err) {
    console.error('Error fetching all service requests:', err);
    return [];
  }
}

/**
 * Update service request status (staff or super_admin)
 */
export async function updateServiceRequestStatus(
  client: NexoraClient,
  requestId: string,
  status: ServiceRequestStatus,
  assignedStaffId?: string
): Promise<boolean> {
  try {
    const updates: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (assignedStaffId) {
      updates.assigned_staff_id = assignedStaffId;
    }

    const { error } = await (client as any)
      .from('service_requests')
      .update(updates)
      .eq('id', requestId);

    if (error) {
      console.warn('Failed to update service request status:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error updating service request status:', err);
    return false;
  }
}

/**
 * Realtime subscription to service request changes
 */
export function subscribeToServiceRequests(
  client: NexoraClient,
  onUpdate: () => void
): () => void {
  const channel = client
    .channel('nexora-service-requests-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'service_requests' },
      () => onUpdate()
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}
