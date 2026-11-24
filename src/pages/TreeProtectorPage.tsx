import React, { useState } from 'react';
import { MOCK_HERITAGE_TREES } from '../data/mockData';
import { HeritageTree } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { SearchInput } from '../components/common/SearchInput';
import { Modal } from '../components/common/Modal';
import {
  ShieldAlert,
  TreeDeciduous,
  AlertTriangle,
  Eye,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileWarning
} from 'lucide-react';

export const TreeProtectorPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTree, setSelectedTree] = useState<HeritageTree>(MOCK_HERITAGE_TREES[0]);
  const [isPatrolModalOpen, setIsPatrolModalOpen] = useState(false);
  const [patrolSuccess, setPatrolSuccess] = useState(false);

  const filteredHeritage = MOCK_HERITAGE_TREES.filter(
    (t) =>
      t.commonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogPatrol = (e: React.FormEvent) => {
    e.preventDefault();
    setPatrolSuccess(true);
    setTimeout(() => {
      setPatrolSuccess(false);
      setIsPatrolModalOpen(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-forest-700" />
            Existing Tree Protector & Heritage Canopy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Citizen patrol watch, legal protections against illegal felling, and ancient landmark tree registry.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="emerald" dot>Canopy Watch Active</Badge>
          <Button
            variant="primary"
            size="sm"
            icon={<ShieldAlert className="w-4 h-4" />}
            onClick={() => setIsPatrolModalOpen(true)}
          >
            Log Citizen Patrol
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Heritage Tree Directory */}
        <div className="lg:col-span-1 space-y-4">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
            placeholder="Search heritage tree, species, location..."
          />

          <div className="space-y-3">
            {filteredHeritage.map((ht) => {
              const isSelected = selectedTree.id === ht.id;
              return (
                <div
                  key={ht.id}
                  onClick={() => setSelectedTree(ht)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-forest-50 border-forest-600 shadow-sm ring-1 ring-forest-500'
                      : 'bg-white border-sage-200 hover:border-forest-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-mono text-[10px] text-slate-400 font-bold">{ht.code}</div>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">{ht.commonName}</h4>
                      <p className="text-[11px] text-slate-500">{ht.location}</p>
                    </div>
                    <Badge variant={ht.riskScore > 40 ? 'rose' : 'emerald'} size="sm">
                      {ht.riskScore > 40 ? 'At Risk' : 'Protected'}
                    </Badge>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
                    <span>Est. Age: {ht.estimatedAgeYears} years</span>
                    <span className="font-semibold text-forest-700">{ht.heightMeters}m tall</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Landmark Detailed Profile & Threat Log */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="overflow-hidden border-2 border-forest-100">
            <CardHeader className="bg-forest-deep text-white">
              <div>
                <div className="text-[10px] font-mono text-lime-400 uppercase tracking-widest font-bold">
                  {selectedTree.legalStatus}
                </div>
                <CardTitle className="text-white text-xl mt-1">{selectedTree.commonName}</CardTitle>
                <CardDescription className="text-forest-200">
                  {selectedTree.scientificName} · Located at {selectedTree.location}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-lime-400">Threat Score: {selectedTree.riskScore}/100</div>
                <div className="text-[10px] text-forest-300">Last Patrol: {selectedTree.lastPatrolDate}</div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Biometrics & Dimensions */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-400">Estimated Tree Age</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">{selectedTree.estimatedAgeYears} yrs</div>
                  <div className="text-[10px] text-forest-700">Old Growth Landmark</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-400">Canopy Spread</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">{selectedTree.canopySpreadMeters} m</div>
                  <div className="text-[10px] text-slate-500">Full radial crown</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-400">Height from Base</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">{selectedTree.heightMeters} m</div>
                  <div className="text-[10px] text-slate-500">Lidar measured</div>
                </div>
              </div>

              {/* Observed Threats */}
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <FileWarning className="w-4 h-4 text-amber-500" />
                  Active Canopy & Ground Threats Identified
                </div>
                <div className="space-y-2">
                  {selectedTree.threats.map((threat, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between"
                    >
                      <span>{threat}</span>
                      <Badge variant="amber" size="sm">Active Monitor</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guardian Squad info */}
              <div className="p-4 bg-forest-50 rounded-xl border border-forest-200 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-forest-900">Assigned Guardian Squad</div>
                  <div className="text-slate-600 mt-0.5">{selectedTree.patrolSquad}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setIsPatrolModalOpen(true)}
                >
                  Join Guardian Patrol
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Log Citizen Patrol Modal */}
      <Modal
        isOpen={isPatrolModalOpen}
        onClose={() => setIsPatrolModalOpen(false)}
        title="Log Citizen Tree Patrol Report"
        description="Record physical inspection observations, bark integrity, and nearby construction threats."
      >
        {patrolSuccess ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900">Patrol Observation Logged!</h4>
            <p className="text-xs text-slate-500">Audit report added to tree history and broadcast to local canopy authorities.</p>
          </div>
        ) : (
          <form onSubmit={handleLogPatrol} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Tree Landmark</label>
              <input
                type="text"
                disabled
                value={`${selectedTree.commonName} (${selectedTree.code})`}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 font-medium"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Canopy Vigor Rating</label>
              <select className="w-full px-3 py-2 border border-sage-300 rounded-lg bg-white text-slate-800">
                <option>Healthy / Full Transpiration</option>
                <option>Minor Limb Damage Observed</option>
                <option>Active Root Encroachment / Machinery</option>
                <option>Severe Wilt / Immediate Hazard</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Observation Notes</label>
              <textarea
                rows={3}
                placeholder="Mention crown clearance, soil compaction, or unauthorized markings..."
                className="w-full px-3 py-2 border border-sage-300 rounded-lg bg-white text-slate-800"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsPatrolModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Submit Patrol Entry
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
