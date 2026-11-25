import React, { useState } from 'react';
import {
  PlantSpecies,
  SpeciesMatchCriteria,
  SpeciesMatchResult,
  SunlightCondition,
  SoilType,
  WaterAvailability
} from '../../types/planting';
import { matchSpecies } from '../../services/plantingIntelligenceService';
import { SPECIES_CATALOG } from '../../data/speciesCatalog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import {
  Sparkles,
  TreeDeciduous,
  CheckCircle2,
  AlertCircle,
  Columns,
  Search,
  Filter,
  Droplets,
  Sun,
  Layers,
  ArrowUpDown,
  Leaf,
  Bird,
  ShieldCheck,
  Eye,
  Plus
} from 'lucide-react';

export const SpeciesMatchEngine: React.FC = () => {
  const [criteria, setCriteria] = useState<SpeciesMatchCriteria>({
    region: 'Upper Mississippi Basin',
    sunlight: 'Full Sun',
    soilType: 'Loam',
    waterAvailability: 'Automated Irrigation',
    maxHeightM: 30,
    nativeOnly: false,
    pollinatorOnly: false,
  });

  const [matches, setMatches] = useState<SpeciesMatchResult[]>(() => matchSpecies(criteria));
  const [selectedSpecies, setSelectedSpecies] = useState<PlantSpecies | null>(matches[0]?.species || SPECIES_CATALOG[0]);
  const [compareList, setCompareList] = useState<PlantSpecies[]>([SPECIES_CATALOG[0], SPECIES_CATALOG[1]]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const handleFilter = (updated: SpeciesMatchCriteria) => {
    setCriteria(updated);
    const results = matchSpecies(updated);
    setMatches(results);
    if (results.length > 0 && (!selectedSpecies || !results.some(r => r.species.id === selectedSpecies.id))) {
      setSelectedSpecies(results[0].species);
    }
  };

  const toggleCompare = (species: PlantSpecies) => {
    setCompareList((prev) => {
      const exists = prev.some((s) => s.id === species.id);
      if (exists) {
        return prev.filter((s) => s.id !== species.id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), species];
      }
      return [...prev, species];
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TreeDeciduous className="w-5 h-5 text-forest-700" />
            Species Match & Botanical Recommendation Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked ecological suitability matching native flora against microclimate, soil, water and height requirements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {compareList.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              icon={<Columns className="w-3.5 h-3.5" />}
              onClick={() => setIsCompareModalOpen(true)}
              className="text-xs"
            >
              Compare Species ({compareList.length})
            </Button>
          )}
          <Badge variant="lime" dot>Botanical AI</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Criteria Filters */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Matching Criteria</CardTitle>
                <CardDescription>Filter parameters for target plot</CardDescription>
              </div>
              <Filter className="w-4 h-4 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs">
            {/* Region / Watershed */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Target Watershed / Eco-Region</label>
              <select
                value={criteria.region}
                onChange={(e) => handleFilter({ ...criteria, region: e.target.value })}
                className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="Upper Mississippi Basin">Upper Mississippi Basin / Midwest</option>
                <option value="Pacific Northwest">Pacific Northwest / Cascadia</option>
                <option value="Eastern Deciduous Forest">Eastern Woodlands / Appalachia</option>
                <option value="Florida Coastal Biosphere">Coastal Marine / Subtropical</option>
                <option value="Great Plains">Great Plains / Prairie Savanna</option>
              </select>
            </div>

            {/* Sunlight Requirement */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Available Sunlight</label>
              <select
                value={criteria.sunlight}
                onChange={(e) => handleFilter({ ...criteria, sunlight: e.target.value as SunlightCondition })}
                className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="Full Sun">Full Sun (6+ hrs)</option>
                <option value="Partial Shade">Partial Shade (3 - 6 hrs)</option>
                <option value="Full Shade">Full Shade (&lt;3 hrs)</option>
              </select>
            </div>

            {/* Soil Type */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Soil Texture</label>
              <select
                value={criteria.soilType}
                onChange={(e) => handleFilter({ ...criteria, soilType: e.target.value as SoilType })}
                className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="Loam">Loam (Balanced)</option>
                <option value="Clay">Clay (Heavy / Dense)</option>
                <option value="Sandy">Sandy (Rapid Draining)</option>
                <option value="Silty">Silty</option>
                <option value="Peaty">Peaty / Organic</option>
              </select>
            </div>

            {/* Water availability */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Water Access</label>
              <select
                value={criteria.waterAvailability}
                onChange={(e) => handleFilter({ ...criteria, waterAvailability: e.target.value as WaterAvailability })}
                className="w-full border border-sage-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="Automated Irrigation">Automated Irrigation</option>
                <option value="Periodic Manual Hose">Periodic Manual Hose</option>
                <option value="Rainfall Only">Natural Rainfall Only</option>
                <option value="Seasonal Drought Prone">Drought Prone / Rain Only</option>
              </select>
            </div>

            {/* Max height slider */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Max Mature Height Constraint:</span>
                <span className="font-mono text-forest-700">{criteria.maxHeightM} m</span>
              </div>
              <input
                type="range"
                min="3"
                max="40"
                step="1"
                value={criteria.maxHeightM}
                onChange={(e) => handleFilter({ ...criteria, maxHeightM: Number(e.target.value) })}
                className="w-full accent-forest-700"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>3m (Shrub)</span>
                <span>15m (Sub-canopy)</span>
                <span>40m (Overstory)</span>
              </div>
            </div>

            {/* Toggles */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={criteria.pollinatorOnly}
                  onChange={(e) => handleFilter({ ...criteria, pollinatorOnly: e.target.checked })}
                  className="rounded text-forest-700 focus:ring-forest-500"
                />
                <span className="text-slate-700 font-medium">Pollinator & Butterfly Support Only</span>
              </label>
            </div>

            <div className="pt-2">
              <div className="p-3 bg-forest-50 border border-forest-200 rounded-xl text-forest-900 text-[11px]">
                Showing <strong className="text-forest-950 font-bold">{matches.length} species</strong> ranked by multi-factorial compatibility.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Center & Right 2 Columns: Ranked Species & Selected Profile */}
        <div className="lg:col-span-2 space-y-5">
          {/* Detailed Selected Species Profile */}
          {selectedSpecies && (
            <Card className="border-2 border-forest-100 overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-forest-deep via-forest-rich to-forest-moss text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-lime-400 font-bold">
                    {selectedSpecies.canopyLayer.toUpperCase()} · {selectedSpecies.family}
                  </div>
                  <h3 className="text-2xl font-black tracking-tight text-white mt-1">
                    {selectedSpecies.commonName}
                  </h3>
                  <div className="text-xs text-forest-200 italic mt-0.5">
                    {selectedSpecies.scientificName}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={compareList.some(s => s.id === selectedSpecies.id) ? 'outline' : 'lime'}
                    size="sm"
                    icon={<Columns className="w-3.5 h-3.5" />}
                    onClick={() => toggleCompare(selectedSpecies)}
                    className="text-xs"
                  >
                    {compareList.some(s => s.id === selectedSpecies.id) ? 'Remove Compare' : '+ Add to Compare'}
                  </Button>
                </div>
              </div>

              <CardContent className="p-6 space-y-5 text-xs">
                {/* Photo & Biometric Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-1">
                    <img
                      src={selectedSpecies.imageUrl}
                      alt={selectedSpecies.commonName}
                      className="w-full h-44 rounded-xl object-cover border border-sage-200 shadow-xs"
                    />
                    <div className="mt-2 text-center text-[10px] text-slate-400">
                      Standard specimen profile
                    </div>
                  </div>

                  <div className="md:col-span-2 grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400">Mature Height & Spread</span>
                      <div className="font-bold text-slate-900 mt-0.5">
                        {selectedSpecies.matureHeightM}m tall × {selectedSpecies.matureSpreadM}m wide
                      </div>
                      <span className="text-[10px] text-slate-500">Spacing: {selectedSpecies.recommendedSpacingM}m</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400">Growth Rate</span>
                      <div className="font-bold text-forest-800 mt-0.5">{selectedSpecies.growthRate} Growth</div>
                      <span className="text-[10px] text-slate-500">Maint: {selectedSpecies.maintenanceLevel}</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400">Water & Drought Resilience</span>
                      <div className="font-bold text-blue-900 mt-0.5">{selectedSpecies.waterNeed} Need</div>
                      <span className="text-[10px] text-emerald-700 font-medium">Drought: {selectedSpecies.droughtTolerance}</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400">Carbon Sequestration</span>
                      <div className="font-bold text-emerald-700 mt-0.5">{selectedSpecies.carbonKgPerYear} kg CO₂ / yr</div>
                      <span className="text-[10px] text-slate-500">High biomass</span>
                    </div>
                  </div>
                </div>

                {/* Ecological Benefits & Risks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <div className="font-semibold text-forest-900 flex items-center gap-1.5">
                      <Leaf className="w-3.5 h-3.5 text-forest-700" />
                      Ecological Keystone Benefits:
                    </div>
                    <ul className="space-y-1">
                      {selectedSpecies.ecologicalBenefits.map((ben, i) => (
                        <li key={i} className="text-slate-600 text-[11px] flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{ben}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5">
                    <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      Site Considerations & Constraints:
                    </div>
                    <ul className="space-y-1">
                      {selectedSpecies.potentialRisks.map((risk, i) => (
                        <li key={i} className="text-slate-600 text-[11px] flex items-start gap-1.5">
                          <span className="text-amber-600 font-bold">•</span>
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ranked Species List */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Ranked Compatibility Matches
            </div>

            <div className="space-y-2.5">
              {matches.map((item) => {
                const isSelected = selectedSpecies?.id === item.species.id;
                return (
                  <div
                    key={item.species.id}
                    onClick={() => setSelectedSpecies(item.species)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-forest-50/70 border-forest-600 shadow-sm ring-1 ring-forest-500'
                        : 'bg-white border-sage-200 hover:border-forest-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{item.species.commonName}</span>
                          <span className="text-xs text-slate-400 italic">({item.species.scientificName})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {item.species.canopyLayer} · Height: {item.species.matureHeightM}m · Drought: {item.species.droughtTolerance}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-base font-black text-forest-800">{item.matchScore}%</div>
                        <span className="text-[10px] text-slate-400">Match</span>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-2 text-[10px]">
                      {item.reasons.map((r, idx) => (
                        <span key={idx} className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-medium">
                          ✓ {r}
                        </span>
                      ))}
                      {item.drawbacks.map((d, idx) => (
                        <span key={idx} className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md font-medium">
                          ! {d}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Modal */}
      <Modal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        title="Side-by-Side Species Comparison Matrix"
        description="Compare mature traits, growth dynamics, and ecological properties."
      >
        <div className="overflow-x-auto text-xs py-2">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="p-2 font-semibold">Attribute</th>
                {compareList.map((s) => (
                  <th key={s.id} className="p-2 font-bold text-slate-900">
                    {s.commonName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="p-2 font-semibold text-slate-500">Scientific Name</td>
                {compareList.map((s) => (
                  <td key={s.id} className="p-2 italic">{s.scientificName}</td>
                ))}
              </tr>
              <tr>
                <td className="p-2 font-semibold text-slate-500">Canopy Layer</td>
                {compareList.map((s) => (
                  <td key={s.id} className="p-2">{s.canopyLayer}</td>
                ))}
              </tr>
              <tr>
                <td className="p-2 font-semibold text-slate-500">Mature Height × Spread</td>
                {compareList.map((s) => (
                  <td key={s.id} className="p-2">{s.matureHeightM}m × {s.matureSpreadM}m</td>
                ))}
              </tr>
              <tr>
                <td className="p-2 font-semibold text-slate-500">Recommended Spacing</td>
                {compareList.map((s) => (
                  <td key={s.id} className="p-2 font-mono font-bold text-forest-700">{s.recommendedSpacingM} m</td>
                ))}
              </tr>
              <tr>
                <td className="p-2 font-semibold text-slate-500">Drought Tolerance</td>
                {compareList.map((s) => (
                  <td key={s.id} className="p-2 font-medium">{s.droughtTolerance}</td>
                ))}
              </tr>
              <tr>
                <td className="p-2 font-semibold text-slate-500">Water Requirement</td>
                {compareList.map((s) => (
                  <td key={s.id} className="p-2">{s.waterNeed}</td>
                ))}
              </tr>
              <tr>
                <td className="p-2 font-semibold text-slate-500">Carbon Yield / Yr</td>
                {compareList.map((s) => (
                  <td key={s.id} className="p-2 font-bold text-emerald-700">{s.carbonKgPerYear} kg CO₂</td>
                ))}
              </tr>
              <tr>
                <td className="p-2 font-semibold text-slate-500">Pollinator Support</td>
                {compareList.map((s) => (
                  <td key={s.id} className="p-2">{s.pollinatorFriendly ? '✓ High Resource' : 'Limited'}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
};
