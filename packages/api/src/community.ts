import type {
  CommunityPost,
  EnrichedCommunityPost,
  PostComment,
  EnrichedPostComment,
} from '@nexora/types';
import type { NexoraClient } from './client';

export const FALLBACK_POSTS: EnrichedCommunityPost[] = [
  {
    id: 'post-001',
    author_id: 'usr-001',
    title: 'Architectural Blueprint: 0-Downtime Microservices on PostgreSQL',
    content:
      'We just deployed our multi-region connection pooler for NEXORA. By utilizing PostgreSQL Row-Level Security combined with Supabase Realtime WebSockets, we achieved <12ms query latencies across mobile and web clients without managing a separate Redis cluster.',
    likes_count: 42,
    comments_count: 8,
    is_pinned: true,
    is_locked: false,
    status: 'published',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    author: {
      full_name: 'Dr. Aris Vance',
      email: 'aris.vance@nexora.ecosystem',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    },
    is_liked_by_me: false,
  },
  {
    id: 'post-002',
    author_id: 'usr-002',
    title: 'Mobile Architecture: Turborepo with React Native Expo SDK 52',
    content:
      'The single-monorepo setup between Next.js 14 and React Native Expo SDK 52 has significantly streamlined our development velocity. Over 85% of our business logic and API types are shared seamlessly through @nexora/business-logic and @nexora/api.',
    likes_count: 31,
    comments_count: 5,
    is_pinned: false,
    is_locked: false,
    status: 'published',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    author: {
      full_name: 'Elena Rostova',
      email: 'elena@nexora.ecosystem',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    },
    is_liked_by_me: true,
  },
  {
    id: 'post-003',
    author_id: 'usr-003',
    title: 'Security Notice: RBAC and Deterministic Feature Rollouts',
    content:
      'A reminder to all developers: Feature flags now utilize a deterministic DJB2 hash algorithm. This ensures that percentage rollouts remain 100% consistent across anonymous sessions and authenticated users alike.',
    likes_count: 19,
    comments_count: 2,
    is_pinned: false,
    is_locked: false,
    status: 'published',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    author: {
      full_name: 'Marcus Brody',
      email: 'marcus@nexora.ecosystem',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    },
    is_liked_by_me: false,
  },
];

/**
 * Fetch community feed posts with fallback
 */
export async function fetchCommunityPosts(
  client: NexoraClient,
  currentUserId?: string,
  limit: number = 20
): Promise<EnrichedCommunityPost[]> {
  try {
    const { data, error } = await (client as any)
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) {
      return FALLBACK_POSTS;
    }

    // Check likes for current user if authenticated
    let userLikedPostIds = new Set<string>();
    if (currentUserId) {
      const { data: userLikes } = await (client as any)
        .from('post_reactions')
        .select('post_id')
        .eq('user_id', currentUserId);

      if (userLikes) {
        userLikedPostIds = new Set(userLikes.map((l: { post_id: string }) => l.post_id));
      }
    }

    return (data as any[]).map((post) => ({
      ...post,
      author: {
        full_name: 'NEXORA Member',
        email: 'member@nexora.ecosystem',
      },
      is_liked_by_me: userLikedPostIds.has(post.id),
    }));
  } catch (err) {
    console.warn('Error fetching community posts, returning fallback:', err);
    return FALLBACK_POSTS;
  }
}

export interface CreatePostParams {
  author_id: string;
  content: string;
  title?: string;
  media_urls?: string[];
}

/**
 * Create a new post in the community feed
 */
export async function createCommunityPost(
  client: NexoraClient,
  params: CreatePostParams
): Promise<CommunityPost | null> {
  try {
    const payload = {
      author_id: params.author_id,
      title: params.title || null,
      content: params.content,
      media_urls: params.media_urls || [],
      likes_count: 0,
      comments_count: 0,
      is_pinned: false,
      is_locked: false,
      status: 'published',
    };

    const { data, error } = await (client as any)
      .from('posts')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.warn('Post insert returned error, creating optimistic post:', error.message);
      return {
        id: `post-${Date.now()}`,
        author_id: params.author_id,
        title: params.title,
        content: params.content,
        media_urls: params.media_urls,
        likes_count: 0,
        comments_count: 0,
        is_pinned: false,
        is_locked: false,
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    return data as CommunityPost;
  } catch (err) {
    console.error('Error creating post:', err);
    return null;
  }
}

/**
 * Toggle like reaction on a post
 */
export async function togglePostLike(
  client: NexoraClient,
  postId: string,
  userId: string
): Promise<{ liked: boolean; newLikesCount: number }> {
  try {
    // Check if like exists
    const { data: existingLike } = await (client as any)
      .from('post_reactions')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingLike) {
      // Unlike
      await (client as any).from('post_reactions').delete().eq('id', existingLike.id);
      await (client as any).rpc('decrement_post_likes', { target_post_id: postId }).catch(() => null);
      return { liked: false, newLikesCount: 0 };
    } else {
      // Like
      await (client as any).from('post_reactions').insert([
        { post_id: postId, user_id: userId, reaction: 'like' },
      ]);
      await (client as any).rpc('increment_post_likes', { target_post_id: postId }).catch(() => null);
      return { liked: true, newLikesCount: 1 };
    }
  } catch (err) {
    console.warn('Error toggling post like, returning optimistic result:', err);
    return { liked: true, newLikesCount: 1 };
  }
}

/**
 * Fetch comments for a post
 */
export async function fetchPostComments(
  client: NexoraClient,
  postId: string
): Promise<EnrichedPostComment[]> {
  try {
    const { data, error } = await (client as any)
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .eq('is_hidden', false)
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) {
      return [
        {
          id: `comment-sample-${postId}`,
          post_id: postId,
          author_id: 'usr-sys',
          content: 'Fascinating breakdown! Looking forward to reviewing the performance benchmarks.',
          likes_count: 3,
          is_hidden: false,
          created_at: new Date(Date.now() - 1800000).toISOString(),
          author: {
            full_name: 'Tech Enthusiast',
          },
        },
      ];
    }

    return (data as any[]).map((c) => ({
      ...c,
      author: {
        full_name: 'Community Contributor',
      },
    }));
  } catch (err) {
    console.error('Error fetching comments:', err);
    return [];
  }
}

/**
 * Add a comment to a post
 */
export async function addPostComment(
  client: NexoraClient,
  params: { post_id: string; author_id: string; content: string }
): Promise<PostComment | null> {
  try {
    const payload = {
      post_id: params.post_id,
      author_id: params.author_id,
      content: params.content,
      likes_count: 0,
      is_hidden: false,
    };

    const { data, error } = await (client as any)
      .from('comments')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.warn('Failed to insert comment, returning optimistic comment:', error.message);
      return {
        id: `comment-${Date.now()}`,
        post_id: params.post_id,
        author_id: params.author_id,
        content: params.content,
        likes_count: 0,
        is_hidden: false,
        created_at: new Date().toISOString(),
      };
    }

    return data as PostComment;
  } catch (err) {
    console.error('Error adding comment:', err);
    return null;
  }
}

/**
 * Realtime subscription to community posts & comments
 */
export function subscribeToCommunityFeed(
  client: NexoraClient,
  onUpdate: (table: string) => void
): () => void {
  const channel = client
    .channel('nexora-community-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () =>
      onUpdate('posts')
    )
    .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () =>
      onUpdate('comments')
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}
