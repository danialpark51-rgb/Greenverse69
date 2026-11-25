import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { PlantSpacingPlanner } from '../components/planting/PlantSpacingPlanner';
import { Link } from 'react-router-dom';
import {
  Grid3X3,
  Sliders,
  Trees,
  Maximize2,
  Download,
  RotateCcw,
  Sparkles,
  Info,
  Ruler,
  Compass,
  ArrowRight
} from 'lucide-react';

export const DesignerPage: React.FC = () => {
  const [designerMode, setDesignerMode] = useState<'matrix' | 'spacing'>('matrix');
  const [method, setMethod] = useState<'miyawaki' | 'agroforestry' | 'timber_corridor'>('miyawaki');
  const [gridSize, setGridSize] = useState<number>(6); // 6x6 grid
  const [selectedCell, setSelectedCell] = useState<number | null>(null);

  // Cell species allocation (0: canopy, 1: sub-canopy, 2: shrub, 3: ground cover)
  const cellTypes = ['Bur Oak (Canopy)', 'Serviceberry (Sub-tree)', 'Dogwood (Shrub)', 'Fern / Grass (Cover)'];
  const cellColors = [
    'bg-forest-800 text-white',
    'bg-forest-600 text-white',
    'bg-emerald-500 text-white',
    'bg-lime-400 text-forest-950',
  ];

  const totalCells = gridSize * gridSize;
  const treeDensityPerSqM = method === 'miyawaki' ? 3.0 : method === 'agroforestry' ? 0.8 : 1.2;
  const estimatedCanopyCoverage = method === 'miyawaki' ? '98%' : method === 'agroforestry' ? '65%' : '80%';
  const estimatedSaplingsCount = Math.round(totalCells * treeDensityPerSqM * 4);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Grid3X3 className="w-6 h-6 text-forest-700" />
            Plant & Plantation Designer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Simulate multi-tier plantation grids, spacing geometry, and canopy closure dynamics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex rounded-lg bg-sage-100 p-0.5 text-xs">
            <button
              onClick={() => setDesignerMode('matrix')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                designerMode === 'matrix' ? 'bg-forest-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stratum Grid
            </button>
            <button
              onClick={() => setDesignerMode('spacing')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                designerMode === 'spacing' ? 'bg-forest-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Spacing Geometry
            </button>
          </div>

          <Link to="/intelligence?tab=site-finder">
            <Button variant="outline" size="sm" icon={<Compass className="w-3.5 h-3.5" />} className="text-xs">
              Site Finder
            </Button>
          </Link>
        </div>
      </div>

      {designerMode === 'spacing' ? (
        <PlantSpacingPlanner />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Plantation Controls & Stats */}
          <Card className="lg:col-span-1 space-y-4">
            <CardHeader>
              <div>
                <CardTitle>Methodology & Spacing</CardTitle>
                <CardDescription>Select ecological planting architecture</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              {/* Method switcher */}
              <div>
                <label className="block font-medium text-slate-700 mb-1.5">Planting Framework</label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => setMethod('miyawaki')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      method === 'miyawaki'
                        ? 'border-forest-600 bg-forest-50/70 text-forest-900 font-semibold shadow-xs'
                        : 'border-sage-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>Miyawaki Ultra-Dense Forest</span>
                      <Badge variant="lime" size="sm">Fast Growth</Badge>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 font-normal">
                      3 saplings/m² across 4 natural layers. Reaches maturity 10x faster.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('agroforestry')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      method === 'agroforestry'
                        ? 'border-forest-600 bg-forest-50/70 text-forest-900 font-semibold shadow-xs'
                        : 'border-sage-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>Silvopasture / Agroforestry</span>
                      <Badge variant="forest" size="sm">Productive</Badge>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 font-normal">
                      Wide spacing supporting understory crops, foraging, and perennial pollinators.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('timber_corridor')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      method === 'timber_corridor'
                        ? 'border-forest-600 bg-forest-50/70 text-forest-900 font-semibold shadow-xs'
                        : 'border-sage-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>Riparian Wildlife Corridor</span>
                      <Badge variant="emerald" size="sm">Habitat</Badge>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 font-normal">
                      Continuous shaded riverbank canopy preventing thermal stress in streams.
                    </p>
                  </button>
                </div>
              </div>

              {/* Grid dimension slider */}
              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span>Plot Matrix Size:</span>
                  <span className="font-bold text-forest-800">{gridSize} × {gridSize} ({totalCells} Cells)</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="8"
                  step="1"
                  value={gridSize}
                  onChange={(e) => setGridSize(parseInt(e.target.value))}
                  className="w-full accent-forest-700 cursor-pointer"
                />
              </div>

              {/* Simulation KPI breakdown */}
              <div className="p-3 bg-sage-50 rounded-xl border border-sage-200 space-y-2">
                <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-forest-700" />
                  Live Grid Projections
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Saplings Required:</span>
                  <strong className="text-slate-900">{estimatedSaplingsCount} units</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>3-Year Canopy Closure:</span>
                  <strong className="text-forest-700">{estimatedCanopyCoverage}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Carbon Sink Potential:</span>
                  <strong className="text-emerald-700">~{(estimatedSaplingsCount * 0.04).toFixed(1)} t CO2e / yr</strong>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right 2 Columns: Interactive Grid Canvas */}
          <Card className="lg:col-span-2 flex flex-col">
            <CardHeader>
              <div>
                <CardTitle>Canopy Stratum Visualizer</CardTitle>
                <CardDescription>Click any cell to inspect or alter layer stratum</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<RotateCcw className="w-3.5 h-3.5" />}
                  onClick={() => setSelectedCell(null)}
                >
                  Reset Selection
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col justify-between">
              {/* Interactive Cell Matrix */}
              <div
                className="grid gap-2 p-4 bg-slate-50 border border-slate-200 rounded-xl mx-auto my-auto max-w-md w-full aspect-square"
                style={{
                  gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({ length: totalCells }).map((_, index) => {
                  const layerTypeIdx = (index + (index % 3)) % 4;
                  const isSelected = selectedCell === index;

                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedCell(index)}
                      className={`rounded-lg cursor-pointer transition-all duration-200 flex flex-col items-center justify-center text-[10px] font-bold p-1 border shadow-xs select-none ${
                        cellColors[layerTypeIdx]
                      } ${
                        isSelected ? 'ring-4 ring-lime-400 scale-105 z-10' : 'hover:opacity-90'
                      }`}
                    >
                      <Trees className="w-3.5 h-3.5 mb-0.5 opacity-80" />
                      <span className="text-[9px]">#{index + 1}</span>
                    </div>
                  );
                })}
              </div>

              {/* Layer Legend */}
              <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {cellTypes.map((type, idx) => (
                  <div key={type} className="flex items-center gap-2">
                    <span className={`w-3.5 h-3.5 rounded-md shrink-0 ${cellColors[idx]}`} />
                    <span className="text-[11px] text-slate-700 truncate">{type}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
