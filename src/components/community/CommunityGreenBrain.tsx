import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Bookmark,
  ThumbsUp,
  Share2,
  Plus,
  Tag,
  Sparkles,
  ExternalLink,
  X,
  Compass,
  FileText
} from 'lucide-react';
import { GreenBrainArticle } from '../../types/community';
import {
  getGreenBrainArticles,
  createGreenBrainArticle,
  upvoteGreenBrainArticle,
  bookmarkGreenBrainArticle
} from '../../services/communityService';

interface CommunityGreenBrainProps {
  currentUserId?: string;
  currentUserName?: string;
}

export const CommunityGreenBrain: React.FC<CommunityGreenBrainProps> = ({
  currentUserId = 'demo-user-id',
  currentUserName = 'Environmental Contributor'
}) => {
  const [articles, setArticles] = useState<GreenBrainArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<GreenBrainArticle | null>(null);

  // Create article modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Tree Care');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await getGreenBrainArticles(selectedCategory, searchQuery);
      setArticles(data);
    } catch (err) {
      console.error('Failed to load green brain articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadArticles();
  };

  const handleUpvote = async (articleId: string) => {
    try {
      const isUpvoted = await upvoteGreenBrainArticle(articleId, currentUserId);
      setArticles(prev =>
        prev.map(a => {
          if (a.id === articleId) {
            return {
              ...a,
              user_has_upvoted: isUpvoted,
              upvotes_count: isUpvoted ? a.upvotes_count + 1 : Math.max(0, a.upvotes_count - 1),
            };
          }
          return a;
        })
      );
      if (selectedArticle && selectedArticle.id === articleId) {
        setSelectedArticle((prev: GreenBrainArticle | null) =>
          prev
            ? {
                ...prev,
                user_has_upvoted: isUpvoted,
                upvotes_count: isUpvoted ? prev.upvotes_count + 1 : Math.max(0, prev.upvotes_count - 1),
              }
            : null
        );
      }
    } catch (err) {
      console.error('Failed to upvote guide:', err);
    }
  };

  const handleBookmark = async (articleId: string) => {
    try {
      const isBookmarked = await bookmarkGreenBrainArticle(articleId, currentUserId);
      setArticles(prev =>
        prev.map(a => (a.id === articleId ? { ...a, user_has_bookmarked: isBookmarked } : a))
      );
      if (selectedArticle && selectedArticle.id === articleId) {
        setSelectedArticle((prev: GreenBrainArticle | null) =>
          prev ? { ...prev, user_has_bookmarked: isBookmarked } : null
        );
      }
    } catch (err) {
      console.error('Failed to bookmark guide:', err);
    }
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !summary.trim()) {
      setFormError('Please fill in the title, summary, and article content');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      await createGreenBrainArticle({
        author_id: currentUserId,
        author_name: currentUserName,
        title: title.trim(),
        category,
        summary: summary.trim(),
        content: content.trim(),
        tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
        is_verified: false, // Community guides start as non-verified until reviewed
      });

      setShowCreateModal(false);
      setTitle('');
      setSummary('');
      setContent('');
      setTagsInput('');
      await loadArticles();
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit article');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    'all',
    'Tree Care',
    'Soil Health',
    'Urban Forestry',
    'Local Solutions',
    'Species Selection',
    'Water Management',
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            Decentralized Environmental Wisdom
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Community Green Brain</h2>
          <p className="text-sm text-slate-600 mt-1">
            Peer-tested planting tutorials, soil conditioning practices, and verified forestry solutions shared by arborists and grassroots squads.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Publish Guide
        </button>
      </div>

      {/* Search & Categories Filter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search guides, mycorrhizal fungi, watering rings, native oaks, drought tips..."
            className="w-full pl-10 pr-24 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat === 'all' ? 'All Guides' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-slate-600">Querying Green Brain knowledge records...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">No articles found</h3>
          <p className="text-sm text-slate-600 max-w-sm mx-auto mb-6">
            We couldn't find guides matching your query. Share your experience and author the first one!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            Write a Guide
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(article => (
            <div
              key={article.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group"
            >
              <div>
                {/* Meta Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                    {article.category}
                  </span>
                  {article.is_verified ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50/50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Arborist Verified
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-400">
                      Community Shared
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3
                  onClick={() => setSelectedArticle(article)}
                  className="font-bold text-slate-900 text-base group-hover:text-emerald-700 cursor-pointer line-clamp-2 mb-2"
                >
                  {article.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                  {article.summary}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {article.tags.map((t: string) => (
                    <span
                      key={t}
                      className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleUpvote(article.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      article.user_has_upvoted
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${article.user_has_upvoted ? 'fill-emerald-600' : ''}`} />
                    <span>{article.upvotes_count}</span>
                  </button>

                  <button
                    onClick={() => handleBookmark(article.id)}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      article.user_has_bookmarked
                        ? 'text-amber-600 bg-amber-50'
                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                    title={article.user_has_bookmarked ? 'Saved to bookmarks' : 'Bookmark this guide'}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${article.user_has_bookmarked ? 'fill-amber-600' : ''}`} />
                  </button>
                </div>

                <button
                  onClick={() => setSelectedArticle(article)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Read Article →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Read Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 md:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                  {selectedArticle.category}
                </span>
                {selectedArticle.is_verified && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50/50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Solution
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedArticle.title}</h2>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>By {selectedArticle.author_name}</span>
                  <span>•</span>
                  <span>{new Date(selectedArticle.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{selectedArticle.upvotes_count} community upvotes</span>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-xs text-emerald-900 leading-relaxed font-medium">
                {selectedArticle.summary}
              </div>

              <div className="text-sm text-slate-700 space-y-4 leading-relaxed whitespace-pre-line border-t border-b border-slate-100 py-6">
                {selectedArticle.content}
              </div>

              {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  {selectedArticle.tags.map((t: string) => (
                    <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => handleUpvote(selectedArticle.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    selectedArticle.user_has_upvoted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  {selectedArticle.user_has_upvoted ? 'Upvoted' : 'Helpful Guide'}
                </button>

                <button
                  onClick={() => handleBookmark(selectedArticle.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold ${
                    selectedArticle.user_has_bookmarked
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  {selectedArticle.user_has_bookmarked ? 'Saved' : 'Save for Later'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publish Guide Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 md:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Publish to Green Brain</h3>
                <p className="text-xs text-slate-500 mt-0.5">Share environmental knowledge or planting techniques with the community</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateArticle} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Guide Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Mycorrhizal Inoculation for Urban Oak Saplings"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                >
                  <option value="Tree Care">Tree Care</option>
                  <option value="Soil Health">Soil Health</option>
                  <option value="Urban Forestry">Urban Forestry</option>
                  <option value="Local Solutions">Local Solutions</option>
                  <option value="Species Selection">Species Selection</option>
                  <option value="Water Management">Water Management</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Brief Summary *</label>
                <textarea
                  rows={2}
                  required
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  placeholder="One or two sentences explaining why this technique works and when to apply it..."
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Article / Step-by-Step Instructions *</label>
                <textarea
                  rows={6}
                  required
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Detail the materials needed, exact sequence of actions, and key warning signs to avoid..."
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  placeholder="roots, soil, moisture, mulch, drought"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
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
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Publish Guide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
