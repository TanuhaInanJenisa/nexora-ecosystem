import { z } from 'zod';

export const communityPostSchema = z.object({
  title: z.string().trim().max(200).optional(),
  content: z.string().trim().min(3, 'Post content must be at least 3 characters').max(10000),
  media_urls: z.array(z.string().url()).max(5).optional(),
});

export const postCommentSchema = z.object({
  post_id: z.string().uuid(),
  parent_id: z.string().uuid().nullable().optional(),
  content: z.string().trim().min(1, 'Comment cannot be empty').max(2000),
});

export const moderationReportSchema = z.object({
  target_type: z.enum(['post', 'comment', 'user']),
  target_id: z.string().uuid(),
  reason: z.enum(['spam', 'harassment', 'hate_speech', 'misinformation', 'other']),
  details: z.string().max(1000).optional(),
});

export type CommunityPostInput = z.infer<typeof communityPostSchema>;
export type PostCommentInput = z.infer<typeof postCommentSchema>;
export type ModerationReportInput = z.infer<typeof moderationReportSchema>;

