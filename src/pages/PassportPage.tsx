import React, { useState } from 'react';
import { MOCK_TREES } from '../data/mockData';
import { TreeRecord } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { SearchInput } from '../components/common/SearchInput';
import { Modal } from '../components/common/Modal';
import {
  QrCode,
  ShieldCheck,
  Calendar,
  MapPin,
  Trees,
  Award,
  Sparkles,
  ExternalLink,
  Plus,
  Droplets,
  Activity,
  Maximize2
} from 'lucide-react';

export const PassportPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTree, setSelectedTree] = useState<TreeRecord>(MOCK_TREES[0]);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const filteredTrees = MOCK_TREES.filter(
    (t) =>
      t.treeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.plantedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <QrCode className="w-6 h-6 text-forest-700" />
            Digital Tree Passport Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tamper-proof digital twins linking physical saplings to verifiable biometric telemetry & carbon audit trails.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="emerald" dot>NFC & QR Tagging Active</Badge>
          <Badge variant="forest">Tier 1 Verification</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Search & Tree List */}
        <div className="lg:col-span-1 space-y-4">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
            placeholder="Search passport code, species, planter..."
          />

          <div className="space-y-3">
            {filteredTrees.map((tree) => {
              const isSelected = selectedTree.id === tree.id;
              return (
                <div
                  key={tree.id}
                  onClick={() => setSelectedTree(tree)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-forest-50/70 border-forest-600 shadow-sm ring-1 ring-forest-500'
                      : 'bg-white border-sage-200 hover:border-forest-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-mono text-xs font-bold text-forest-900 flex items-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5 text-forest-700" />
                        {tree.treeCode}
                      </div>
                      <div className="text-sm font-semibold text-slate-800 mt-1">{tree.species}</div>
                      <div className="text-[11px] text-slate-500">{tree.location.siteName}</div>
                    </div>
                    <Badge
                      variant={tree.status === 'thriving' ? 'emerald' : 'amber'}
                      size="sm"
                    >
                      {tree.status === 'thriving' ? 'Thriving' : 'Attention'}
                    </Badge>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-sage-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Planted {tree.plantedDate}</span>
                    <span className="font-semibold text-forest-700">{tree.carbonOffsetKg} kg CO2e</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Full Digital Twin Passport Certificate */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="overflow-hidden border-2 border-forest-100">
            {/* Passport Header Ribbon */}
            <div className="p-6 bg-gradient-to-r from-forest-deep via-forest-rich to-forest-moss text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-lime-400 font-bold">
                  OFFICIAL BIOSPHERE DIGITAL TWIN
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white mt-1">
                  {selectedTree.treeCode}
                </h2>
                <div className="text-xs text-forest-200 mt-0.5">
                  {selectedTree.species} (<span className="italic">{selectedTree.scientificName}</span>)
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="lime"
                  size="sm"
                  icon={<QrCode className="w-4 h-4" />}
                  onClick={() => setIsQrModalOpen(true)}
                >
                  View QR Certificate
                </Button>
              </div>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Photo & Biometric Twin Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <img
                    src={selectedTree.imageUrl}
                    alt={selectedTree.species}
                    className="w-full h-48 rounded-xl object-cover border border-sage-200 shadow-sm"
                  />
                  <div className="mt-2 text-center text-[10px] text-slate-400">
                    Multispectral drone optical capture · 2026
                  </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400">Canopy Height</span>
                    <div className="text-base font-bold text-slate-900 mt-0.5">{selectedTree.heightMeters} m</div>
                    <span className="text-[10px] text-emerald-600 font-medium">↑ +0.4m this season</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400">Stem Diameter (DBH)</span>
                    <div className="text-base font-bold text-slate-900 mt-0.5">{selectedTree.dbhCm} cm</div>
                    <span className="text-[10px] text-slate-500">Sub-surface caliper</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400">Survival Probability</span>
                    <div className="text-base font-bold text-emerald-700 mt-0.5">{selectedTree.survivalProbability}%</div>
                    <span className="text-[10px] text-slate-500">AI Vitality Score</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400">Verified Carbon Sink</span>
                    <div className="text-base font-bold text-forest-800 mt-0.5">{selectedTree.carbonOffsetKg} kg</div>
                    <span className="text-[10px] text-forest-600">Verra VCS eligible</span>
                  </div>
                </div>
              </div>

              {/* Provenance & Ownership Log */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Planetary Registry Credentials
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4 text-forest-700 shrink-0" />
                    <span>Coordinates: {selectedTree.location.lat}°N, {selectedTree.location.lng}°W</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Planter: {selectedTree.plantedBy}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4 text-forest-700 shrink-0" />
                    <span>Planted Date: {selectedTree.plantedDate} ({selectedTree.ageMonths} months old)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <ShieldCheck className="w-4 h-4 text-forest-700 shrink-0" />
                    <span>Audit Status: Satellite Verified</span>
                  </div>
                </div>
              </div>

              {/* Field Arborist Notes */}
              <div className="p-4 bg-forest-50/60 rounded-xl border border-forest-100 text-xs">
                <div className="font-semibold text-forest-900 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-forest-700" />
                  Field Inspector Field Notes
                </div>
                <p className="text-slate-600 leading-relaxed">{selectedTree.notes}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* QR Code Modal Dialog */}
      <Modal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title={`Tree Passport: ${selectedTree.treeCode}`}
        description="Physical NFC & QR Tag for on-site scanning"
      >
        <div className="text-center space-y-4 py-2">
          <div className="p-4 bg-white border-2 border-forest-600 rounded-2xl inline-block shadow-soft">
            <img
              src={selectedTree.qrCodeUrl}
              alt={selectedTree.treeCode}
              className="w-48 h-48 mx-auto"
            />
          </div>
          <div>
            <div className="font-mono text-sm font-bold text-slate-900">{selectedTree.treeCode}</div>
            <div className="text-xs text-slate-500 mt-1">Scan with any smartphone or Greenverse NFC wand to inspect biometrics in the field.</div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => alert('Certificate downloaded as PDF')}
          >
            Download Physical Metal Tag Badge (PDF)
          </Button>
        </div>
      </Modal>
    </div>
  );
};
