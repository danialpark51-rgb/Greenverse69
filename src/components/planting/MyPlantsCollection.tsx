import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  fetchUserPlants,
  deleteUserPlant,
  fetchUserPlantFavorites,
  fetchUserPlantCarePlans,
  fetchUserPlantDiagnoses
} from '../../services/plantIntelligenceService';
import {
  DbUserPlant,
  DbPlantFavorite,
  DbPlantCarePlan,
  DbPlantDiagnosis
} from '../../types/plantIntelligence';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  Sprout,
  Heart,
  FileText,
  Stethoscope,
  Trash2,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

interface MyPlantsCollectionProps {
  onNavigateToTab?: (tab: string, plantName?: string) => void;
}

export const MyPlantsCollection: React.FC<MyPlantsCollectionProps> = ({ onNavigateToTab }) => {
  const { user } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'plants' | 'favorites' | 'plans' | 'diagnoses'>('plants');
  const [plants, setPlants] = useState<DbUserPlant[]>([]);
  const [favorites, setFavorites] = useState<DbPlantFavorite[]>([]);
  const [carePlans, setCarePlans] = useState<DbPlantCarePlan[]>([]);
  const [diagnoses, setDiagnoses] = useState<DbPlantDiagnosis[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    const [p, f, c, d] = await Promise.all([
      fetchUserPlants(user?.id),
      fetchUserPlantFavorites(user?.id),
      fetchUserPlantCarePlans(user?.id),
      fetchUserPlantDiagnoses(user?.id),
    ]);
    setPlants(p);
    setFavorites(f);
    setCarePlans(c);
    setDiagnoses(d);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, [user?.id]);

  const handleDeletePlant = async (id: string) => {
    if (!confirm('Remove this plant from your saved collection?')) return;
    setPlants((prev) => prev.filter((p) => p.id !== id));
    await deleteUserPlant(id, user?.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sprout className="w-5 h-5 text-forest-700" />
            My Plants & Botanical Portfolio
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Your unified botanical hub: saved specimens, active care plans, favorite species, and diagnostic history.
          </p>
        </div>
        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveSubTab('plants')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeSubTab === 'plants' ? 'bg-white text-forest-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Saved Plants ({plants.length})
          </button>
          <button
            onClick={() => setActiveSubTab('favorites')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeSubTab === 'favorites' ? 'bg-white text-forest-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Favorites ({favorites.length})
          </button>
          <button
            onClick={() => setActiveSubTab('plans')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeSubTab === 'plans' ? 'bg-white text-forest-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Care Plans ({carePlans.length})
          </button>
          <button
            onClick={() => setActiveSubTab('diagnoses')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeSubTab === 'diagnoses' ? 'bg-white text-forest-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Diagnoses ({diagnoses.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading your botanical collection...</div>
      ) : activeSubTab === 'plants' ? (
        plants.length === 0 ? (
          <Card className="p-12 text-center text-slate-400">
            <Sprout className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-700">No Plants Saved Yet</h4>
            <p className="text-xs max-w-sm mx-auto mt-1 text-slate-500">
              Identify a plant using the AI Vision tab or search the Encyclopedia to add specimens to your botanical garden.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {plants.map((plant) => (
              <Card key={plant.id} className="overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="h-36 bg-slate-100 overflow-hidden relative">
                    {plant.photo_url ? (
                      <img src={plant.photo_url} alt={plant.common_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                        No Photo
                      </div>
                    )}
                    <Badge variant="emerald" className="absolute top-2 left-2 text-[10px]">
                      {plant.care_status}
                    </Badge>
                  </div>
                  <div className="p-3.5 space-y-1">
                    <h4 className="font-semibold text-xs text-slate-900">{plant.common_name}</h4>
                    {plant.scientific_name && (
                      <p className="text-[11px] font-mono italic text-slate-500">{plant.scientific_name}</p>
                    )}
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-1">
                      <MapPin className="w-3 h-3 text-forest-600" />
                      <span>{plant.location_type}</span>
                      <span>•</span>
                      <span>Planted {plant.planting_date}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 border-t border-slate-100 flex items-center justify-between">
                  {onNavigateToTab && (
                    <button
                      onClick={() => onNavigateToTab('smart-assistant', plant.common_name)}
                      className="text-xs text-forest-700 font-medium hover:underline inline-flex items-center gap-1"
                    >
                      Care Plan <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeletePlant(plant.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Delete plant"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : activeSubTab === 'favorites' ? (
        favorites.length === 0 ? (
          <Card className="p-12 text-center text-slate-400">
            <Heart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-700">No Favorites Added</h4>
            <p className="text-xs max-w-sm mx-auto mt-1 text-slate-500">
              Browse the Botanical Encyclopedia and click the heart icon on any species to bookmark it.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {favorites.map((fav) => (
              <Card key={fav.id} className="p-3 space-y-2">
                <div className="h-28 bg-slate-100 rounded-lg overflow-hidden">
                  {fav.thumbnail_url ? (
                    <img src={fav.thumbnail_url} alt={fav.common_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                      Species Thumbnail
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 line-clamp-1">{fav.common_name}</h4>
                  <p className="text-[10px] font-mono italic text-slate-400 line-clamp-1">{fav.scientific_name}</p>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : activeSubTab === 'plans' ? (
        carePlans.length === 0 ? (
          <Card className="p-12 text-center text-slate-400">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-700">No Care Plans Formulated</h4>
            <p className="text-xs max-w-sm mx-auto mt-1 text-slate-500">
              Generate custom care plans in the Smart Care Advisor tab to store them here.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {carePlans.map((cp) => (
              <Card key={cp.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-slate-900">{cp.plant_name}</h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    Created {new Date(cp.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{cp.care_summary}</p>
                <div className="text-[11px] text-slate-500 pt-1">
                  💧 <span className="font-medium text-slate-700">Watering: </span>
                  {cp.full_plan_json?.watering?.frequency}
                </div>
              </Card>
            ))}
          </div>
        )
      ) : diagnoses.length === 0 ? (
        <Card className="p-12 text-center text-slate-400">
          <Stethoscope className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-700">No Pathological Records</h4>
          <p className="text-xs max-w-sm mx-auto mt-1 text-slate-500">
            Run a diagnostic scan in the AI Disease Diagnosis tab to track plant health history.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {diagnoses.map((diag) => (
            <Card key={diag.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-slate-900">{diag.primary_issue}</h4>
                  <p className="text-xs text-slate-500">Specimen: {diag.plant_name}</p>
                </div>
                <Badge
                  variant={
                    diag.severity === 'Severe'
                      ? 'amber'
                      : diag.severity === 'Moderate'
                      ? 'emerald'
                      : 'slate'
                  }
                >
                  {diag.severity} Severity
                </Badge>
              </div>
              <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded">
                <span className="font-medium text-slate-800">Primary Protocol: </span>
                {diag.treatment_recommendations?.[0] || 'Observe and isolate specimen'}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
