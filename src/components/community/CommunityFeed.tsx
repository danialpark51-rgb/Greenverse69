import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Heart,
  Share2,
  Image,
  Send,
  MoreVertical,
  Plus,
  Trash2,
  TreePine,
  Award,
  Sparkles,
  Compass,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  User
} from 'lucide-react';
import { CommunityPost, PostComment } from '../../types/community';
import {
  getCommunityPosts,
  createPost,
  likePost,
  getPostComments,
  addPostComment,
  deletePostComment
} from '../../services/communityService';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { ImageUpload } from '../common/ImageUpload';

interface CommunityFeedProps {
  currentUserId?: string;
  currentUserName?: string;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  currentUserId,
  currentUserName = 'Environmental Steward'
}) => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPostType, setSelectedPostType] = useState<string>('all');
  
  // Post creation modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<CommunityPost['post_type']>('tree_progress');
  const [mediaUrl, setMediaUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Comments state per post
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, PostComment[]>>({});
  const [commentInput, setCommentInput] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await getCommunityPosts();
      setPosts(data);
    } catch (err) {
      console.error('Failed to load community feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();

    if (!isSupabaseConfigured) return;
    const channel = supabase
      .channel('community-feed-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'community_posts' },
        () => {
          loadPosts();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'post_likes' },
        () => {
          loadPosts();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'post_comments' },
        () => {
          loadPosts();
        }
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn('[CommunityFeed] Realtime subscription status error:', err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLike = async (postId: string) => {
    try {
      const isLiked = await likePost(postId, currentUserId);
      setPosts(prev =>
        prev.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              user_has_liked: isLiked,
              likes_count: isLiked ? p.likes_count + 1 : Math.max(0, p.likes_count - 1),
            };
          }
          return p;
        })
      );
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const toggleComments = async (postId: string) => {
    if (activeCommentsPostId === postId) {
      setActiveCommentsPostId(null);
      return;
    }
    setActiveCommentsPostId(postId);
    if (!commentsMap[postId]) {
      try {
        setLoadingComments(true);
        const comments = await getPostComments(postId);
        setCommentsMap(prev => ({ ...prev, [postId]: comments }));
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        setLoadingComments(false);
      }
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentInput.trim()) return;
    if (!currentUserId) {
      alert('Please sign in to join the discussion and post comments.');
      return;
    }
    try {
      const newComment = await addPostComment(
        postId,
        commentInput.trim(),
        currentUserId,
        currentUserName
      );
      setCommentsMap((prev: Record<string, PostComment[]>) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment],
      }));
      setPosts((prev: CommunityPost[]) =>
        prev.map(p => (p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p))
      );
      setCommentInput('');
    } catch (err) {
      console.error('Failed to submit comment:', err);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      await deletePostComment(commentId, currentUserId);
      setCommentsMap((prev: Record<string, PostComment[]>) => ({
        ...prev,
        [postId]: (prev[postId] || []).filter(c => c.id !== commentId),
      }));
      setPosts((prev: CommunityPost[]) =>
        prev.map(p => (p.id === postId ? { ...p, comments_count: Math.max(0, p.comments_count - 1) } : p))
      );
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (!currentUserId) {
      alert('Please sign in to publish a post to the Greenverse community network.');
      return;
    }

    try {
      setSubmitting(true);
      await createPost({
        author_id: currentUserId,
        author_name: currentUserName,
        author_avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUserId}`,
        title: title.trim() || undefined,
        content: content.trim(),
        post_type: postType,
        media_url: mediaUrl.trim() || undefined,
      });

      setShowCreateModal(false);
      setTitle('');
      setContent('');
      setMediaUrl('');
      setPostType('tree_progress');
      await loadPosts();
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPosts = posts.filter(p => {
    if (selectedPostType === 'all') return true;
    return p.post_type === selectedPostType;
  });

  const getPostTypeBadge = (type: CommunityPost['post_type']) => {
    switch (type) {
      case 'tree_progress':
        return { label: 'Tree Progress', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: TreePine };
      case 'achievement':
        return { label: 'Squad Milestone', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Award };
      case 'question':
        return { label: 'Ask Community', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: HelpCircle };
      case 'field_update':
        return { label: 'Field Update', bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: Compass };
      default:
        return { label: 'Discussion', bg: 'bg-slate-50 text-slate-700 border-slate-200', icon: MessageSquare };
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner / Create Post Trigger */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Live Environmental Feed
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Community Activity Stream</h2>
          <p className="text-sm text-slate-600 mt-1">
            Real stories, sapling growth milestones, canopy photos, and verified impact from active stewards.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm whitespace-nowrap self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Share Field Update
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Updates' },
          { id: 'tree_progress', label: 'Tree Progress' },
          { id: 'achievement', label: 'Milestones' },
          { id: 'field_update', label: 'Field Logs' },
          { id: 'question', label: 'Q&A' },
          { id: 'general', label: 'General' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedPostType(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedPostType === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Feed Stream */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-slate-600">Gathering latest community updates...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
          <TreePine className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">No updates in this category yet</h3>
          <p className="text-sm text-slate-600 max-w-sm mx-auto mb-6">
            Be the first to post a photo or log planting progress for your network!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            Create First Post
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map(post => {
            const badge = getPostTypeBadge(post.post_type);
            const BadgeIcon = badge.icon;
            const comments = commentsMap[post.id] || [];
            const isCommentsOpen = activeCommentsPostId === post.id;

            return (
              <div
                key={post.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden"
              >
                {/* Post Header */}
                <div className="p-6 pb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.author_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${post.author_id}`}
                      alt={post.author_name}
                      className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{post.author_name}</span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.bg}`}>
                          <BadgeIcon className="w-3 h-3" />
                          {badge.label}
                        </span>
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

                {/* Post Title & Body */}
                <div className="px-6 pb-4">
                  {post.title && (
                    <h3 className="font-bold text-slate-900 text-base mb-1.5">{post.title}</h3>
                  )}
                  <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                    {post.content}
                  </p>
                </div>

                {/* Optional Media */}
                {post.media_url && (
                  <div className="px-6 pb-4">
                    <div className="rounded-xl overflow-hidden border border-slate-100 max-h-96 bg-slate-50">
                      <img
                        src={post.media_url}
                        alt="Post media"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Post Engagement Bar */}
                <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                        post.user_has_liked
                          ? 'text-rose-600 bg-rose-50'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${post.user_has_liked ? 'fill-rose-600 text-rose-600' : ''}`}
                      />
                      <span>{post.likes_count}</span>
                    </button>

                    <button
                      onClick={() => toggleComments(post.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.comments_count} Comments</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-400">Greenverse Verified Stream</span>
                </div>

                {/* Comments Section */}
                {isCommentsOpen && (
                  <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 space-y-4">
                    {/* Add Comment Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={e => setCommentInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddComment(post.id)}
                        placeholder="Write an encouraging comment or question..."
                        className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={!commentInput.trim()}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Reply
                      </button>
                    </div>

                    {/* Comments List */}
                    {loadingComments ? (
                      <div className="text-center py-4 text-xs text-slate-500">Loading discussion...</div>
                    ) : comments.length === 0 ? (
                      <div className="text-center py-3 text-xs text-slate-500">
                        No comments yet. Start the conversation!
                      </div>
                    ) : (
                      <div className="space-y-3 pt-2">
                        {comments.map(c => (
                          <div key={c.id} className="flex items-start gap-2.5">
                            <img
                              src={c.author_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${c.author_id}`}
                              alt={c.author_name}
                              className="w-7 h-7 rounded-full bg-slate-200 shrink-0 mt-0.5"
                            />
                            <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex-1 text-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-slate-900">{c.author_name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  {currentUserId && c.author_id === currentUserId && (
                                    <button
                                      onClick={() => handleDeleteComment(post.id, c.id)}
                                      className="text-[10px] text-slate-400 hover:text-rose-600 transition-colors"
                                      title="Delete comment"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-slate-700 leading-relaxed">{c.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 md:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Share Field Update</h3>
                <p className="text-xs text-slate-500 mt-0.5">Post an update to the collective community stream</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'tree_progress', label: 'Tree Progress' },
                    { id: 'achievement', label: 'Squad Milestone' },
                    { id: 'field_update', label: 'Field Update' },
                    { id: 'question', label: 'Community Q&A' },
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setPostType(t.id as any)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all ${
                        postType === t.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Headline (Optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. 50 Bur Oaks planted with the Mississippi River Restoration Squad"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Post Details *</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Describe your environmental action, observations, or questions for fellow planters..."
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <ImageUpload
                  label="Photo / Field Media Attachment (Optional)"
                  value={mediaUrl}
                  onChange={url => setMediaUrl(url)}
                  bucket="community"
                  userId={currentUserId}
                  folder="posts"
                  placeholderText="Click or drop photo to attach to post"
                  aspectRatio="video"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !content.trim()}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Publishing...' : 'Share Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
