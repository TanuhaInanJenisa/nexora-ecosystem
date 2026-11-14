export interface CommunityPost {
  id: string;
  author_id: string;
  title?: string;
  content: string;
  media_urls?: string[];
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  status: 'published' | 'hidden' | 'flagged';
  created_at: string;
  updated_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id?: string | null;
  content: string;
  likes_count: number;
  is_hidden: boolean;
  created_at: string;
}

export type ReactionType = 'like' | 'love' | 'celebrate' | 'insightful';

export interface PostReaction {
  id: string;
  user_id: string;
  post_id: string;
  reaction: ReactionType;
  created_at: string;
}

export interface ModerationReport {
  id: string;
  reporter_id: string;
  target_type: 'post' | 'comment' | 'user';
  target_id: string;
  reason: 'spam' | 'harassment' | 'hate_speech' | 'misinformation' | 'other';
  details?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  resolved_by?: string;
  created_at: string;
}

