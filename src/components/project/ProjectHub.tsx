import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Bookmark,
  Coins,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  Sparkles,
  TreePine,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Project, ProjectCategory } from '../../types/project';
import { fetchProjects, toggleBookmarkProject } from '../../services/projectService';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface ProjectHubProps {
  currentUserId?: string;
  onSelectProject: (project: Project) => void;
  onOpenCreateModal: () => void;
}

export const ProjectHub: React.FC<ProjectHubProps> = ({
  currentUserId,
  onSelectProject,
  onOpenCreateModal
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchProjects({
        search: searchQuery,
        category: selectedCategory,
        status: selectedStatus,
        project_type: selectedType,
        userId: currentUserId
      });
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedStatus, selectedType]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleToggleBookmark = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    try {
      const isBookmarked = await toggleBookmarkProject(projectId, currentUserId);
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, is_bookmarked: isBookmarked } : p))
      );
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const getCategoryBadge = (cat: ProjectCategory) => {
    const map: Record<string, { label: string; color: string }> = {
      tree_planting: { label: 'Tree Planting', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      forest_restoration: { label: 'Forest Restoration', color: 'bg-forest-50 text-forest-700 border-forest-200' },
      biodiversity: { label: 'Biodiversity', color: 'bg-teal-50 text-teal-700 border-teal-200' },
      recycling: { label: 'Recycling', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
      water_conservation: { label: 'Water Conservation', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      urban_greening: { label: 'Urban Greening', color: 'bg-lime-50 text-lime-800 border-lime-200' },
      climate_action: { label: 'Climate Action', color: 'bg-amber-50 text-amber-800 border-amber-200' },
      clean_energy: { label: 'Clean Energy', color: 'bg-orange-50 text-orange-800 border-orange-200' }
    };
    return map[cat] || { label: cat.replace('_', ' '), color: 'bg-slate-50 text-slate-700 border-slate-200' };
  };

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'forest_restoration', label: 'Forest Restoration' },
    { id: 'tree_planting', label: 'Tree Planting' },
    { id: 'biodiversity', label: 'Biodiversity' },
    { id: 'urban_greening', label: 'Urban Greening' },
    { id: 'water_conservation', label: 'Water Conservation' },
    { id: 'climate_action', label: 'Climate Action' },
    { id: 'clean_energy', label: 'Clean Energy' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider border border-emerald-100">
              <Coins className="w-3.5 h-3.5 text-emerald-600" />
              Ecological Project Discovery Hub
            </div>
            {isSupabaseConfigured && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-lime-50 text-forest-700 text-[11px] font-semibold border border-lime-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync Active
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Verified Environmental Projects & Crowdfunded Restorations
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Support community-led reforestation, urban pocket forests, and riparian corridors backed by transparent blockchain-compatible receipts and digital tree passports.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-semibold transition-all shadow-sm hover:shadow-md whitespace-nowrap self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Propose Green Project
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project title, watershed, keywords, or organizer..."
              className="w-full pl-10 pr-24 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Projects</option>
              <option value="pending_review">Pending Review</option>
              <option value="completed">Completed Initiatives</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Project Types</option>
              <option value="community">Community-Led</option>
              <option value="institutional">Institutional / NGO</option>
              <option value="grassroots">Grassroots Guilds</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-slate-600">Querying Greenverse project registry...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
          <TreePine className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">No matching environmental projects</h3>
          <p className="text-xs text-slate-600 max-w-sm mx-auto mb-6">
            We couldn't find any projects matching your filter criteria. Be the first to initiate a local restoration!
          </p>
          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            Submit Project Proposal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => {
            const catBadge = getCategoryBadge(proj.category);
            const totalFunded = proj.current_funding_raised + proj.pledged_amount;
            const percentRaised = Math.min(100, Math.round((totalFunded / (proj.funding_target || 1)) * 100));

            return (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj)}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Cover Media */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={proj.cover_image_url || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80'}
                      alt={proj.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Category & Status badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border backdrop-blur-sm bg-white/95 text-slate-900 shadow-sm`}>
                        {catBadge.label}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleToggleBookmark(e, proj.id)}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all ${
                        proj.is_bookmarked
                          ? 'bg-amber-500 text-white shadow-md'
                          : 'bg-black/30 hover:bg-black/50 text-white'
                      }`}
                      title={proj.is_bookmarked ? 'Saved to bookmarks' : 'Bookmark project'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${proj.is_bookmarked ? 'fill-white' : ''}`} />
                    </button>

                    {/* Trust status */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white">
                      {proj.verification_status === 'verified' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600/90 text-white backdrop-blur-sm shadow">
                          <ShieldCheck className="w-3 h-3" />
                          Arborist Verified
                        </span>
                      ) : proj.verification_status === 'reviewed' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-600/90 text-white backdrop-blur-sm shadow">
                          Reviewed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800/80 text-white backdrop-blur-sm shadow">
                          Community Staged
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                      {proj.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {proj.subtitle || proj.description}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate font-medium">{proj.location_name}</span>
                    </div>

                    {/* Funding Progress Bar */}
                    <div className="pt-2 space-y-1.5">
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="font-extrabold text-slate-900">
                          ${totalFunded.toLocaleString()}{' '}
                          <span className="text-[10px] font-normal text-slate-500">
                            (${proj.current_funding_raised.toLocaleString()} verified + ${proj.pledged_amount.toLocaleString()} pledged)
                          </span>
                        </span>
                        <span className="text-slate-500 font-medium">
                          of ${proj.funding_target.toLocaleString()}
                        </span>
                      </div>

                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentRaised}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-semibold text-emerald-700">{percentRaised}% Backed</span>
                        <span>{proj.supporters_count} Supporters</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{proj.volunteers_registered} / {proj.volunteers_needed} Volunteers</span>
                  </div>

                  <span className="font-semibold text-emerald-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Inspect Project <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
