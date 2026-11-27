import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  searchPerenualSpecies,
  fetchPerenualSpeciesDetails,
  togglePlantFavorite,
  fetchUserPlantFavorites,
  saveUserPlant
} from '../../services/plantIntelligenceService';
import {
  PerenualSpeciesItem,
  PerenualSpeciesDetails,
  DbPlantFavorite
} from '../../types/plantIntelligence';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  BookOpen,
  Search,
  Heart,
  Droplets,
  Sun,
  Shield,
  Layers,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Plus,
  BookmarkPlus,
  Loader2,
  AlertTriangle,
  Info,
  X,
  Sparkles
} from 'lucide-react';

interface PlantDatabaseEncyclopediaProps {
  onPlantSaved?: () => void;
  onNavigateToCarePlan?: (plantName: string, scientificName?: string) => void;
}

export const PlantDatabaseEncyclopedia: React.FC<PlantDatabaseEncyclopediaProps> = ({
  onPlantSaved,
  onNavigateToCarePlan
}) => {
  const { user } = useAuth();

  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [wateringFilter, setWateringFilter] = useState('');
  const [sunlightFilter, setSunlightFilter] = useState('');
  const [indoorOnly, setIndoorOnly] = useState<boolean | undefined>(undefined);

  const [speciesList, setSpeciesList] = useState<PerenualSpeciesItem[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [lastPage, setLastPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Favorites
  const [favorites, setFavorites] = useState<DbPlantFavorite[]>([]);

  // Selected Detail Modal
  const [selectedDetails, setSelectedDetails] = useState<PerenualSpeciesDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Save feedback
  const [saveSuccessMap, setSaveSuccessMap] = useState<Record<number, boolean>>({});

  const loadFavorites = async () => {
    if (!user?.id) return;
    const favs = await fetchUserPlantFavorites(user.id);
    setFavorites(favs);
  };

  useEffect(() => {
    loadFavorites();
  }, [user?.id]);

  const handleSearch = async (targetPage: number = 1) => {
    setLoading(true);
    setError(null);
    setPage(targetPage);

    const res = await searchPerenualSpecies({
      q: query.trim() || undefined,
      page: targetPage,
      watering: wateringFilter || undefined,
      sunlight: sunlightFilter || undefined,
      indoor: indoorOnly,
    });

    setLoading(false);

    if (res.success && res.data) {
      setSpeciesList(res.data.data || []);
      setTotalItems(res.data.total || (res.data.data ? res.data.data.length : 0));
      setLastPage(res.data.last_page || 1);
    } else {
      setError(res.error || 'Failed to search plant encyclopedia.');
    }
  };

  // Initial fetch with common trees/plants
  useEffect(() => {
    handleSearch(1);
  }, [wateringFilter, sunlightFilter, indoorOnly]);

  const handleOpenDetails = async (item: PerenualSpeciesItem) => {
    setLoadingDetails(true);
    setDetailsError(null);
    setSelectedDetails(null);

    const res = await fetchPerenualSpeciesDetails(item.id);
    setLoadingDetails(false);

    if (res.success && res.data) {
      setSelectedDetails(res.data);
    } else {
      setDetailsError(res.error || 'Failed to load detailed botanical profile.');
    }
  };

  const handleToggleFavorite = async (item: PerenualSpeciesItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) {
      alert('Please log in to save plant favorites.');
      return;
    }

    const res = await togglePlantFavorite({
      user_id: user.id,
      species_id: String(item.id),
      common_name: item.common_name,
      scientific_name: item.scientific_name?.[0],
      thumbnail_url: item.default_image?.thumbnail || item.default_image?.small_url,
      source: 'perenual',
    });

    if (res.isFavorited) {
      setFavorites((prev) => [
        ...prev,
        {
          id: `fav-${Date.now()}`,
          user_id: user.id,
          species_id: String(item.id),
          common_name: item.common_name,
          scientific_name: item.scientific_name?.[0] || null,
          thumbnail_url: item.default_image?.thumbnail || null,
          source: 'perenual',
          created_at: new Date().toISOString(),
        },
      ]);
    } else {
      setFavorites((prev) => prev.filter((f) => f.species_id !== String(item.id)));
    }
  };

  const handleSaveToMyPlants = async (item: PerenualSpeciesItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) {
      alert('Please log in to save plants.');
      return;
    }

    const res = await saveUserPlant({
      user_id: user.id,
      common_name: item.common_name,
      scientific_name: item.scientific_name?.[0],
      category: 'Perennial',
      location_type: 'Outdoor',
      photo_url: item.default_image?.regular_url || item.default_image?.medium_url,
      perenual_species_id: String(item.id),
      planting_date: new Date().toISOString().split('T')[0],
      care_status: 'Healthy',
      notes: `Sourced from Perenual botanical database (Species #${item.id}).`,
    });

    if (res.success) {
      setSaveSuccessMap((prev) => ({ ...prev, [item.id]: true }));
      if (onPlantSaved) onPlantSaved();
      setTimeout(() => {
        setSaveSuccessMap((prev) => ({ ...prev, [item.id]: false }));
      }, 3000);
    }
  };

  const isFavorited = (speciesId: number) => {
    return favorites.some((f) => f.species_id === String(speciesId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-forest-700" />
            Plant & Tree Intelligence Encyclopedia
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Search 10,000+ botanical species via the Perenual API. Filter by solar irradiance, hydration needs, and hardiness.
          </p>
        </div>
        <Badge variant="emerald" className="text-xs">
          Perenual Botanical API
        </Badge>
      </div>

      {/* Search & Filter Controls */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(1);
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search common name, botanical genus (e.g. Oak, Lavandula, Ficus)..."
                className="w-full pl-9 pr-3 py-2 border border-sage-300 rounded-lg text-xs text-slate-800 bg-white"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={loading}
              className="text-xs shrink-0"
            >
              {loading ? 'Searching...' : 'Search Encyclopedia'}
            </Button>
          </form>

          {/* Filter Row */}
          <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500">Watering:</span>
              <select
                value={wateringFilter}
                onChange={(e) => setWateringFilter(e.target.value)}
                className="px-2 py-1 border border-sage-200 rounded text-xs text-slate-700 bg-white"
              >
                <option value="">All Levels</option>
                <option value="frequent">Frequent</option>
                <option value="average">Average</option>
                <option value="minimum">Minimum</option>
                <option value="none">None / Drought</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500">Sunlight:</span>
              <select
                value={sunlightFilter}
                onChange={(e) => setSunlightFilter(e.target.value)}
                className="px-2 py-1 border border-sage-200 rounded text-xs text-slate-700 bg-white"
              >
                <option value="">All Exposures</option>
                <option value="full_sun">Full Sun</option>
                <option value="sun-part_shade">Part Shade</option>
                <option value="full_shade">Full Shade</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-500">Environment:</span>
              <select
                value={indoorOnly === undefined ? '' : indoorOnly ? 'indoor' : 'outdoor'}
                onChange={(e) => {
                  if (e.target.value === 'indoor') setIndoorOnly(true);
                  else if (e.target.value === 'outdoor') setIndoorOnly(false);
                  else setIndoorOnly(undefined);
                }}
                className="px-2 py-1 border border-sage-200 rounded text-xs text-slate-700 bg-white"
              >
                <option value="">Any</option>
                <option value="indoor">Indoor Houseplants</option>
                <option value="outdoor">Outdoor Trees & Garden</option>
              </select>
            </div>

            {totalItems > 0 && (
              <span className="ml-auto text-[11px] font-mono text-slate-400">
                Page {page} of {lastPage} ({totalItems} species)
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          {error}
        </div>
      )}

      {/* Species Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : speciesList.length === 0 ? (
        <Card className="p-12 text-center text-slate-400">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-600">No plant records found</p>
          <p className="text-[11px] text-slate-500">Try broadening your search term or resetting the filters.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {speciesList.map((plant) => {
            const favorited = isFavorited(plant.id);
            const saved = saveSuccessMap[plant.id];

            return (
              <Card
                key={plant.id}
                onClick={() => handleOpenDetails(plant)}
                className="overflow-hidden hover:shadow-soft-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Plant Image */}
                  <div className="relative h-40 bg-slate-100 overflow-hidden">
                    {plant.default_image?.regular_url || plant.default_image?.medium_url ? (
                      <img
                        src={plant.default_image.regular_url || plant.default_image.medium_url!}
                        alt={plant.common_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs bg-sage-50">
                        No Botanical Photo
                      </div>
                    )}
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => handleToggleFavorite(plant, e)}
                      className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm transition-colors ${
                        favorited
                          ? 'bg-rose-500 text-white'
                          : 'bg-black/40 text-white hover:bg-black/60'
                      }`}
                      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="p-3.5 space-y-1.5">
                    <h4 className="text-xs font-semibold text-slate-900 group-hover:text-forest-700 transition-colors line-clamp-1">
                      {plant.common_name}
                    </h4>
                    <p className="text-[11px] font-mono italic text-slate-500 line-clamp-1">
                      {plant.scientific_name?.[0]}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {plant.watering && (
                        <span className="px-1.5 py-0.5 bg-sky-50 text-sky-700 border border-sky-100 rounded text-[9px]">
                          💧 {plant.watering}
                        </span>
                      )}
                      {plant.sunlight?.[0] && (
                        <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[9px]">
                          ☀️ {plant.sunlight[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-forest-700 font-medium group-hover:underline">
                    View Profile →
                  </span>
                  <button
                    onClick={(e) => handleSaveToMyPlants(plant, e)}
                    disabled={saved}
                    className={`p-1.5 rounded border transition-colors ${
                      saved
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                    title="Save to My Plants"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => handleSearch(page - 1)}
            icon={<ChevronLeft className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Previous
          </Button>
          <span className="text-xs font-mono text-slate-600 px-3">
            Page {page} of {lastPage}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= lastPage || loading}
            onClick={() => handleSearch(page + 1)}
            className="text-xs"
          >
            Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      )}

      {/* Plant Details Modal */}
      {(loadingDetails || selectedDetails || detailsError) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-soft-2xl border border-sage-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {loadingDetails ? (
              <div className="p-12 text-center text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-forest-700 mb-2" />
                <p className="text-xs font-semibold text-slate-800">Retrieving Botanical Profile...</p>
              </div>
            ) : detailsError ? (
              <div className="p-6 text-center space-y-3">
                <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
                <p className="text-xs text-rose-700 font-semibold">{detailsError}</p>
                <Button variant="outline" size="sm" onClick={() => setDetailsError(null)}>
                  Close
                </Button>
              </div>
            ) : selectedDetails ? (
              <div>
                {/* Modal Header with Image */}
                <div className="relative h-56 bg-slate-900">
                  {selectedDetails.default_image?.regular_url ? (
                    <img
                      src={selectedDetails.default_image.regular_url}
                      alt={selectedDetails.common_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      Botanical Profile Image
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedDetails(null)}
                    className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-lime-300 font-semibold">
                      {selectedDetails.family ? `Family: ${selectedDetails.family}` : 'Botanical Encyclopedia'}
                    </span>
                    <h3 className="text-lg font-bold">{selectedDetails.common_name}</h3>
                    <p className="text-xs font-mono italic text-slate-300">
                      {selectedDetails.scientific_name?.join(', ')}
                    </p>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-5 space-y-4 text-xs">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-[10px] text-slate-500 font-semibold block">Watering</span>
                      <span className="font-semibold text-slate-800 text-[11px] capitalize">
                        {selectedDetails.watering || 'Average'}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-[10px] text-slate-500 font-semibold block">Sunlight</span>
                      <span className="font-semibold text-slate-800 text-[11px] capitalize truncate block">
                        {selectedDetails.sunlight?.join(', ') || 'Full Sun'}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-[10px] text-slate-500 font-semibold block">Cycle</span>
                      <span className="font-semibold text-slate-800 text-[11px] capitalize">
                        {selectedDetails.cycle || 'Perennial'}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-[10px] text-slate-500 font-semibold block">Hardiness</span>
                      <span className="font-semibold text-slate-800 text-[11px]">
                        {selectedDetails.hardiness ? `Zone ${selectedDetails.hardiness.min} - ${selectedDetails.hardiness.max}` : 'Temperate'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedDetails.description && (
                    <div className="p-3 bg-sage-50/60 rounded-xl border border-sage-100 text-slate-700 leading-relaxed text-[11px]">
                      {selectedDetails.description}
                    </div>
                  )}

                  {/* Botanical Traits */}
                  <div className="space-y-1.5">
                    <div className="font-semibold text-slate-800">Growth & Maintenance Profile</div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                      <div>
                        • <span className="font-medium text-slate-800">Growth Rate: </span>
                        {selectedDetails.growth_rate || 'Moderate'}
                      </div>
                      <div>
                        • <span className="font-medium text-slate-800">Maintenance: </span>
                        {selectedDetails.maintenance || 'Low'}
                      </div>
                      <div>
                        • <span className="font-medium text-slate-800">Toxicity to Pets: </span>
                        {selectedDetails.poisonous_to_pets ? '⚠️ Toxic to animals' : 'Non-toxic'}
                      </div>
                      <div>
                        • <span className="font-medium text-slate-800">Toxicity to Humans: </span>
                        {selectedDetails.poisonous_to_humans ? '⚠️ Poisonous' : 'Non-toxic'}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        handleSaveToMyPlants(selectedDetails as any, { stopPropagation: () => {} } as any);
                      }}
                      className="text-xs"
                    >
                      Save to My Plants
                    </Button>

                    {onNavigateToCarePlan && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedDetails(null);
                          onNavigateToCarePlan(selectedDetails.common_name, selectedDetails.scientific_name?.[0]);
                        }}
                        className="text-xs"
                      >
                        Generate Care Plan →
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
