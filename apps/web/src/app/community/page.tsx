'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  useAuth,
  Button,
  useToast,
} from '@nexora/ui';
import type { EnrichedCommunityPost, EnrichedPostComment } from '@nexora/types';
import {
  getBrowserClient,
  fetchCommunityPosts,
  createCommunityPost,
  togglePostLike,
  fetchPostComments,
  addPostComment,
  subscribeToCommunityFeed,
  FALLBACK_POSTS,
} from '@nexora/api';
import {
  MessageSquare,
  Heart,
  Share2,
  Pin,
  Send,
  Sparkles,
  RefreshCw,
  Lock,
} from 'lucide-react';

export default function CommunityPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<EnrichedCommunityPost[]>(FALLBACK_POSTS);
  const [isLoading, setIsLoading] = useState(true);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // Comments state map: postId -> list of comments
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<Record<string, EnrichedPostComment[]>>({});
  const [commentInput, setCommentInput] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const client = getBrowserClient();

  const loadPosts = useCallback(async () => {
    try {
      const fetched = await fetchCommunityPosts(client, user?.id);
      setPosts(fetched);
    } catch (err) {
      console.warn('Could not fetch posts, using fallback:', err);
    } finally {
      setIsLoading(false);
    }
  }, [client, user?.id]);

  useEffect(() => {
    loadPosts();

    const unsubscribe = subscribeToCommunityFeed(client, (table) => {
      console.log(`[Realtime Community] Table updated: ${table}`);
      loadPosts();
    });

    return () => {
      unsubscribe();
    };
  }, [loadPosts, client]);

  // Handle publishing a new post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        type: 'warning',
        title: 'Authentication Required',
        message: 'Please sign in to publish community posts.',
      });
      return;
    }

    if (!newPostContent.trim()) {
      toast({
        type: 'error',
        title: 'Empty Content',
        message: 'Post content cannot be blank.',
      });
      return;
    }

    setIsPublishing(true);
    const created = await createCommunityPost(client, {
      author_id: user.id,
      title: newPostTitle.trim() || undefined,
      content: newPostContent.trim(),
    });

    if (created) {
      toast({
        type: 'success',
        title: 'Post Published',
        message: 'Your update is now live across the NEXORA ecosystem.',
      });

      // Optimistically append post
      const optimisticPost: EnrichedCommunityPost = {
        ...created,
        author: {
          full_name: profile?.full_name || user.email?.split('@')[0] || 'You',
          email: user.email,
        },
        is_liked_by_me: false,
      };

      setPosts((prev) => [optimisticPost, ...prev]);
      setNewPostTitle('');
      setNewPostContent('');
    } else {
      toast({
        type: 'error',
        title: 'Publish Failed',
        message: 'Could not create post. Please try again.',
      });
    }
    setIsPublishing(false);
  };

  // Handle toggling like
  const handleLike = async (postId: string) => {
    if (!user) {
      toast({
        type: 'warning',
        title: 'Authentication Required',
        message: 'Please sign in to like community discussions.',
      });
      return;
    }

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const wasLiked = p.is_liked_by_me;
          return {
            ...p,
            is_liked_by_me: !wasLiked,
            likes_count: wasLiked ? Math.max(0, p.likes_count - 1) : p.likes_count + 1,
          };
        }
        return p;
      })
    );

    await togglePostLike(client, postId, user.id);
  };

  // Toggle comments drawer for a post
  const handleToggleComments = async (postId: string) => {
    if (activeCommentsPostId === postId) {
      setActiveCommentsPostId(null);
      return;
    }

    setActiveCommentsPostId(postId);
    if (!postComments[postId]) {
      const comments = await fetchPostComments(client, postId);
      setPostComments((prev) => ({ ...prev, [postId]: comments }));
    }
  };

  // Submit comment
  const handleAddComment = async (postId: string) => {
    if (!user) {
      toast({
        type: 'warning',
        title: 'Authentication Required',
        message: 'Please sign in to post comments.',
      });
      return;
    }

    if (!commentInput.trim()) return;

    setIsSubmittingComment(true);
    const added = await addPostComment(client, {
      post_id: postId,
      author_id: user.id,
      content: commentInput.trim(),
    });

    if (added) {
      const enrichedComment: EnrichedPostComment = {
        ...added,
        author: {
          full_name: profile?.full_name || user.email?.split('@')[0] || 'You',
        },
      };

      setPostComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), enrichedComment],
      }));

      // Increment comment count in post
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p))
      );

      setCommentInput('');
      toast({
        type: 'success',
        title: 'Comment Added',
        message: 'Your comment was posted successfully.',
      });
    }
    setIsSubmittingComment(false);
  };

  return (
    <div className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Ecosystem Community Hub
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Engineering & Architecture Discussions
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Exchange architecture patterns, release updates, and ecosystem insights with fellow engineers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadPosts}
            isLoading={isLoading}
            className="text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh Feed
          </Button>
        </div>
      </div>

      {/* Post Composer */}
      {user ? (
        <form
          onSubmit={handleCreatePost}
          className="p-6 rounded-3xl bg-[#0F172A] border border-white/10 shadow-xl space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 text-sm">
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <span className="text-sm font-bold text-white block">
                {profile?.full_name || user.email?.split('@')[0]}
              </span>
              <span className="text-[11px] text-slate-400">Share your thoughts with the community</span>
            </div>
          </div>

          <input
            type="text"
            placeholder="Topic title (optional)..."
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
          />

          <textarea
            placeholder="What technical breakthrough or update are you working on? (Supports Markdown)"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
          />

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500">
              Post adheres to NEXORA Community Code of Conduct
            </span>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isPublishing}
              disabled={!newPostContent.trim()}
              className="font-semibold text-xs"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Publish Post
            </Button>
          </div>
        </form>
      ) : (
        <div className="p-6 rounded-3xl bg-indigo-950/20 border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Join the Community Discussion</h3>
              <p className="text-xs text-slate-400">Sign in to publish posts, join discussions, and react to updates.</p>
            </div>
          </div>

          <Link href="/login">
            <Button variant="primary" size="sm">
              Sign In to Participate
            </Button>
          </Link>
        </div>
      )}

      {/* Feed List */}
      <div className="space-y-6">
        {posts.map((post) => (
          <article
            key={post.id}
            className="p-6 rounded-3xl bg-[#0F172A] border border-white/10 shadow-lg space-y-4 hover:border-white/20 transition-colors"
          >
            {/* Post Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600/30 to-violet-600/30 border border-indigo-500/30 flex items-center justify-center font-bold text-white text-sm">
                  {post.author?.full_name ? post.author.full_name.charAt(0).toUpperCase() : 'N'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      {post.author?.full_name || 'Ecosystem Contributor'}
                    </span>
                    {post.is_pinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                        <Pin className="w-2.5 h-2.5" /> Pinned
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {new Date(post.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="space-y-2">
              {post.title && (
                <h2 className="text-lg font-bold text-white tracking-tight">{post.title}</h2>
              )}
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {post.content}
              </p>
            </div>

            {/* Interaction Bar */}
            <div className="flex items-center gap-6 pt-3 border-t border-white/5 text-xs text-slate-400">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-1.5 transition-colors ${
                  post.is_liked_by_me
                    ? 'text-rose-400 font-semibold'
                    : 'hover:text-rose-400 text-slate-400'
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${post.is_liked_by_me ? 'fill-rose-400' : ''}`}
                />
                <span>{post.likes_count}</span>
              </button>

              <button
                onClick={() => handleToggleComments(post.id)}
                className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{post.comments_count} Comments</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast({
                    type: 'info',
                    title: 'Link Copied',
                    message: 'Post link copied to clipboard.',
                  });
                }}
                className="flex items-center gap-1.5 hover:text-white transition-colors ml-auto"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>

            {/* Comments Section Drawer */}
            {activeCommentsPostId === post.id && (
              <div className="mt-4 pt-4 border-t border-white/5 space-y-4 animate-in fade-in duration-200">
                <div className="space-y-3">
                  {(postComments[post.id] || []).map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-indigo-300">
                          {comment.author?.full_name || 'Community Member'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(comment.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{comment.content}</p>
                    </div>
                  ))}
                </div>

                {/* Comment Input */}
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Write a constructive comment..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddComment(post.id);
                      }
                    }}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleAddComment(post.id)}
                    isLoading={isSubmittingComment}
                    disabled={!commentInput.trim()}
                    className="text-xs"
                  >
                    Reply
                  </Button>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
