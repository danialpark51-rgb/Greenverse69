import React, { useState } from 'react';
import { PlantSpecies } from '../../types/planting';
import { findNativeSpecies } from '../../services/plantingIntelligenceService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import {
  TreeDeciduous,
  Leaf,
  Bird,
  ShieldCheck,
  CheckCircle2,
  Info,
  MapPin,
  Filter,
  Sparkles
} from 'lucide-react';

const REGIONS = [
  'Upper Mississippi Basin',
  'Pacific Northwest',
  'Florida Coastal Biosphere',
  'Northeast / Mid-Atlantic',
  'Midwest',
  'Great Lakes',
  'Cascadia',
  'Appalachian Montane'
];

export const NativePlantFinder: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>(REGIONS[0]);
  const [filterPollinator, setFilterPollinator] = useState<boolean>(false);
  const [filterCanopyLayer, setFilterCanopyLayer] = useState<string>('All');

  const nativeSpecies = findNativeSpecies(selectedRegion, {
    minPollinatorValue: filterPollinator,
    canopyLayer: filterCanopyLayer === 'All' ? undefined : filterCanopyLayer
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TreeDeciduous className="w-5 h-5 text-forest-700" />
            Native Plant & Biodiversity Flora Finder
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover verified indigenous keystone species evolved for regional ecological integrity.
          </p>
        </div>
        <Badge variant="emerald" className="w-fit text-xs">
          Botanically Verified Native Status
        </Badge>
      </div>

      {/* Authenticity Disclaimer */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-emerald-950">
        <Info className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold">Native Flora Verification: </span>
          Greenverse strict classification: Species are categorized as native only when supported by regional herbarium and USDA/USFS floristic surveys for the designated watershed. Introduced or naturalized alien ornamentals are excluded.
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-forest-700" />
            <span className="text-xs font-semibold text-slate-700">Native Ecoregion:</span>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800"
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Canopy Layer:</span>
            <select
              value={filterCanopyLayer}
              onChange={(e) => setFilterCanopyLayer(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800"
            >
              <option value="All">All Canopy Strata</option>
              <option value="Overstory Canopy">Overstory Canopy</option>
              <option value="Sub-canopy Understory">Sub-canopy Understory</option>
              <option value="Shrub Layer">Shrub Layer</option>
              <option value="Herbaceous Ground">Herbaceous Ground</option>
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={filterPollinator}
            onChange={(e) => setFilterPollinator(e.target.checked)}
            className="rounded border-slate-300 text-forest-700 focus:ring-forest-700 h-4 w-4"
          />
          <span>Pollinator Keystone Only</span>
        </label>
      </div>

      {/* Results Grid */}
      {nativeSpecies.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <TreeDeciduous className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No Native Species Found in Filter</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try expanding your canopy layer filter or selecting a broader adjacent ecological region.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nativeSpecies.map((sp) => (
            <Card key={sp.id} className="overflow-hidden hover:border-forest-600 transition-all flex flex-col justify-between">
              <div>
                <div className="relative h-40 w-full overflow-hidden">
                  <img
                    src={sp.imageUrl}
                    alt={sp.commonName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                    <Badge variant="emerald" className="text-[10px]">
                      Native: {selectedRegion}
                    </Badge>
                  </div>
                  {sp.pollinatorFriendly && (
                    <div className="absolute top-2.5 right-2.5 bg-amber-400 text-forest-950 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs">
                      Pollinator Keystone
                    </div>
                  )}
                </div>

                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm text-slate-900">{sp.commonName}</CardTitle>
                      <div className="text-xs italic text-slate-500">{sp.scientificName}</div>
                    </div>
                    <Badge variant="slate" className="text-[10px]">
                      {sp.canopyLayer.split(' ')[0]}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Mature Height</span>
                      <span className="font-semibold text-slate-700">{sp.matureHeightM}m</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Root Architecture</span>
                      <span className="font-semibold text-slate-700">{sp.rootSystem}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Carbon Storage</span>
                      <span className="font-semibold text-slate-700">{sp.carbonKgPerYear} kg/yr</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Sunlight Need</span>
                      <span className="font-semibold text-slate-700">{sp.sunlightRequirement}</span>
                    </div>
                  </div>

                  {/* Ecological Benefits */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Ecological Services & Habitat
                    </span>
                    <div className="space-y-1">
                      {sp.ecologicalBenefits.slice(0, 2).map((benefit, i) => (
                        <div key={i} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-forest-600 shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Family: {sp.family}</span>
                <span className="font-medium text-forest-800">Growth: {sp.growthRate}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
