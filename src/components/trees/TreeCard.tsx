import React from 'react';
import { DbTree, HealthStatus } from '../../types/tree';
import { Badge } from '../common/Badge';
import { QrCode, MapPin, Calendar, Leaf } from 'lucide-react';

interface TreeCardProps {
  tree: DbTree;
  selected?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

const healthVariant = (h: HealthStatus): 'emerald' | 'forest' | 'amber' | 'rose' => {
  if (h === 'thriving') return 'emerald';
  if (h === 'stable') return 'forest';
  if (h === 'attention_required') return 'amber';
  return 'rose';
};

const healthLabel = (h: HealthStatus) => {
  if (h === 'thriving') return 'Thriving';
  if (h === 'stable') return 'Stable';
  if (h === 'attention_required') return 'Needs Attention';
  return 'Critical';
};

export const TreeCard: React.FC<TreeCardProps> = ({ tree, selected, onClick, compact }) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border transition-all ${onClick ? 'cursor-pointer' : ''} ${
        selected
          ? 'bg-forest-50/70 border-forest-600 shadow-sm ring-1 ring-forest-500'
          : 'bg-white border-sage-200 hover:border-forest-300 hover:bg-slate-50/60'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-mono text-xs font-bold text-forest-900 flex items-center gap-1.5">
            <QrCode className="w-3.5 h-3.5 text-forest-700 shrink-0" />
            {tree.tree_code}
          </div>
          <div className="text-sm font-semibold text-slate-800 mt-1 truncate">
            {tree.name || tree.species}
          </div>
          {!compact && tree.scientific_name && (
            <div className="text-[11px] italic text-slate-400 truncate">{tree.scientific_name}</div>
          )}
        </div>
        <Badge variant={healthVariant(tree.health_status)} size="sm">
          {healthLabel(tree.health_status)}
        </Badge>
      </div>

      {!compact && (
        <div className="mt-3 pt-2.5 border-t border-sage-100 space-y-1 text-[11px] text-slate-500">
          {tree.location_description && (
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{tree.location_description}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 shrink-0" />
              {tree.planting_date}
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-forest-700">
              <Leaf className="w-3 h-3 shrink-0" />
              {tree.carbon_offset_kg} kg CO₂e
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
