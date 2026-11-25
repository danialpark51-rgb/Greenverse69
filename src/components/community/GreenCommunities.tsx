import React, { useState, useEffect } from 'react';
import { DbCommunity, CommunityCategory } from '../../types/community';
import { fetchCommunities, createCommunity, toggleJoinCommunity } from '../../services/communityService';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { SearchInput } from '../common/SearchInput';
import { Modal } from '../common/Modal';
import {
  Users,
  MapPin,
  Trees,
  CheckCircle2,
  PlusCircle,
  Filter,
  Globe,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Heart
} from 'lucide-react';

const CATEGORIES: CommunityCategory[] = [
  'Local neighborhood',
  'School and college',
  'Corporate',
  'Tree planting',
  'Biodiversity',
  'Waste management',
  'Climate action',
  'Water conservation',
  'Urban gardening',
];

export const GreenCommunities: React.FC = () => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<DbCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<DbCommunity | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CommunityCategory>('Tree planting');
  const [focusArea, setFocusArea] = useState('');
  const [locationName, setLocationName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const res = await fetchCommunities({
      search: searchTerm,
      category: selectedCategory,
      userId: user?.id,
    });
    setCommunities(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, selectedCategory]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);
    const res = await createCommunity(
      {
        name,
        description,
        category,
        focus_area: focusArea,
        location_name: locationName,
        is_private: isPrivate,
      },
      user?.id
    );
    setIsSubmitting(false);

    if (res.data) {
      setCommunities((prev) => [res.data!, ...prev]);
      setIsCreateModalOpen(false);
      setName('');
      setDescription('');
      setFocusArea('');
      setLocationName('');
      setFeedback(res.fromSupabase ? 'Community registered to cloud database!' : 'Community created in local session registry.');
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const handleToggleJoin = async (community: DbCommunity) => {
    const res = await toggleJoinCommunity(community.id, user?.id);
    setCommunities((prev) =>
      prev.map((c) =>
        c.id === community.id
          ? { ...c, isJoined: res.isJoined, members_count: res.membersCount, userRole: res.isJoined ? 'member' : null }
          : c
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-forest-700" />
            Green Communities Network
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover grassroots environmental chapters, unite with local neighbors, and track collective hectares restored.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={<PlusCircle className="w-4 h-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Community
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Search & Category Filter Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="max-w-md w-full">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
            placeholder="Search communities by name or region..."
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'All'
                ? 'bg-forest-800 text-white font-semibold'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-forest-800 text-white font-semibold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Communities Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400 gap-2 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-forest-600" />
          Loading environmental communities...
        </div>
      ) : communities.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-dashed border-sage-300 space-y-3">
          <Users className="w-10 h-10 text-sage-400 mx-auto" />
          <div className="text-sm font-semibold text-slate-700">No communities found</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or create the first community chapter in your region!
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            icon={<PlusCircle className="w-3.5 h-3.5" />}
          >
            Create New Community
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {communities.map((comm) => (
            <Card
              key={comm.id}
              className="overflow-hidden border border-sage-200 hover:border-forest-400 hover:shadow-soft transition-all flex flex-col justify-between"
            >
              <div>
                {/* Banner Thumbnail */}
                <div className="h-28 relative overflow-hidden bg-forest-900">
                  <img
                    src={comm.banner_url || 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80'}
                    alt={comm.name}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant={comm.is_private ? 'amber' : 'emerald'} size="sm">
                      {comm.is_private ? <Lock className="w-2.5 h-2.5 mr-1 inline" /> : null}
                      {comm.is_private ? 'Private' : 'Public'}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 left-3">
                    <Badge variant="forest" size="sm">{comm.category}</Badge>
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight line-clamp-1">
                      {comm.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {comm.description}
                    </p>
                  </div>

                  <div className="text-[11px] text-slate-600 flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                    <span className="truncate">{comm.location_name}</span>
                  </div>

                  {/* Impact Stats Strip */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="p-2 bg-sage-50 rounded-lg">
                      <span className="text-[10px] text-slate-400">Total Members</span>
                      <div className="font-bold text-slate-900">{comm.members_count} Stewards</div>
                    </div>
                    <div className="p-2 bg-sage-50 rounded-lg">
                      <span className="text-[10px] text-slate-400">Trees Planted</span>
                      <div className="font-bold text-forest-800">{comm.trees_planted_count.toLocaleString()}</div>
                    </div>
                  </div>
                </CardContent>
              </div>

              {/* Action Footer */}
              <div className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-slate-50">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-slate-600"
                  onClick={() => setSelectedCommunity(comm)}
                >
                  View Profile
                </Button>

                <Button
                  variant={comm.isJoined ? 'outline' : 'primary'}
                  size="sm"
                  className="text-xs"
                  onClick={() => handleToggleJoin(comm)}
                >
                  {comm.isJoined ? 'Joined ✓' : 'Join Chapter'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Community Detail Modal */}
      {selectedCommunity && (
        <Modal
          isOpen={!!selectedCommunity}
          onClose={() => setSelectedCommunity(null)}
          title={selectedCommunity.name}
          description={`${selectedCommunity.category} · ${selectedCommunity.location_name}`}
        >
          <div className="space-y-4 text-xs py-1">
            <p className="text-slate-700 leading-relaxed">{selectedCommunity.description}</p>
            <div className="p-3 bg-forest-50 border border-forest-200 rounded-xl space-y-1">
              <span className="font-semibold text-forest-900">Environmental Focus Area:</span>
              <p className="text-slate-600">{selectedCommunity.focus_area}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400">Members Count</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{selectedCommunity.members_count}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400">Trees Planted</span>
                <div className="text-sm font-bold text-forest-800 mt-0.5">{selectedCommunity.trees_planted_count.toLocaleString()}</div>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <Button
                variant={selectedCommunity.isJoined ? 'outline' : 'primary'}
                size="sm"
                onClick={() => {
                  handleToggleJoin(selectedCommunity);
                  setSelectedCommunity(null);
                }}
              >
                {selectedCommunity.isJoined ? 'Leave Community' : 'Join Community'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Community Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Establish an Environmental Community"
        description="Launch a regional neighborhood chapter, school club, or climate action group."
      >
        <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Community Name <span className="text-rose-500">*</span></label>
            <input
              type="text"
              placeholder="e.g. Cascadia Riverkeepers Alliance"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CommunityCategory)}
              className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Focus Area & Objective</label>
            <input
              type="text"
              placeholder="e.g. Floodplain reforestation & water quality telemetry"
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Location / District</label>
            <input
              type="text"
              placeholder="e.g. King County & Skykomish River Basin, WA"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Community Description</label>
            <textarea
              rows={3}
              placeholder="Describe your community mission, seasonal planting goals, and how members collaborate..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_private"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="rounded text-forest-700 focus:ring-forest-500"
            />
            <label htmlFor="is_private" className="text-slate-700 font-medium cursor-pointer">
              Private Chapter (Requires approval to join)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Launch Community
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
