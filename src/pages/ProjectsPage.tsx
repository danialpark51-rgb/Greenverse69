import React, { useState } from 'react';
import { MOCK_PROJECTS } from '../data/mockData';
import { EnvironmentalProject } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { SearchInput } from '../components/common/SearchInput';
import { Modal } from '../components/common/Modal';
import {
  Sprout,
  Coins,
  MapPin,
  TrendingUp,
  CheckCircle2,
  PlusCircle,
  ShieldCheck,
  Calendar,
  Users
} from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<EnvironmentalProject | null>(null);
  const [isBackModalOpen, setIsBackModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [backSuccess, setBackSuccess] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Pledge amount state
  const [pledgeAmount, setPledgeAmount] = useState('100');

  const filteredProjects = MOCK_PROJECTS.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.leadOrganization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBackProject = (project: EnvironmentalProject) => {
    setSelectedProject(project);
    setIsBackModalOpen(true);
  };

  const submitPledge = (e: React.FormEvent) => {
    e.preventDefault();
    setBackSuccess(true);
    setTimeout(() => {
      setBackSuccess(false);
      setIsBackModalOpen(false);
    }, 1200);
  };

  const submitNewProject = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateSuccess(true);
    setTimeout(() => {
      setCreateSuccess(false);
      setIsCreateModalOpen(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sprout className="w-6 h-6 text-forest-700" />
            Reforestation Projects & Transparent Funding
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Community and institutional funding campaigns backed by satellite biomass audits and smart escrow milestones.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<PlusCircle className="w-4 h-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Submit Reforestation Campaign
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="space-y-4">
        <div className="max-w-md w-full">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
            placeholder="Search campaigns, regions, organizations..."
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => {
            const percentRaised = Math.min(100, Math.round((proj.raisedAmount / proj.fundingGoal) * 100));
            return (
              <Card key={proj.id} hoverEffect className="overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={proj.imageUrl}
                      alt={proj.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="forest" size="sm">
                        {proj.category}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant={proj.status === 'funding' ? 'lime' : 'emerald'} size="sm">
                        {proj.status === 'funding' ? `${proj.daysLeft} days left` : 'Fully Funded'}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-5 space-y-3">
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{proj.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{proj.subtitle}</p>

                    <div className="text-[11px] text-forest-800 font-medium">
                      By {proj.leadOrganization} · {proj.location}
                    </div>

                    {/* Funding Progress Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-900">${proj.raisedAmount.toLocaleString()}</span>
                        <span className="text-slate-500 font-mono">of ${proj.fundingGoal.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-forest-600 h-full rounded-full transition-all"
                          style={{ width: `${percentRaised}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>{percentRaised}% Funded</span>
                        <span>{proj.backersCount} Backers</span>
                      </div>
                    </div>

                    {/* Impact metrics pill */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-forest-700 font-semibold">{proj.targetTrees.toLocaleString()} trees</span>
                      <span className="text-slate-500 font-medium">~{proj.verifiedTonsCO2e.toLocaleString()}t CO2e</span>
                    </div>
                  </CardContent>
                </div>

                <div className="p-5 pt-0">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => handleBackProject(proj)}
                  >
                    Fund Project (Pledge)
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Back Project Modal */}
      <Modal
        isOpen={isBackModalOpen}
        onClose={() => setIsBackModalOpen(false)}
        title={selectedProject ? `Back ${selectedProject.title}` : 'Fund Campaign'}
        description="Funds held in automated milestone-locked ecological escrow."
      >
        {backSuccess ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900">Pledge Confirmed!</h4>
            <p className="text-xs text-slate-500">
              You will receive digital Tree Passports as saplings are planted and satellite verified.
            </p>
          </div>
        ) : (
          <form onSubmit={submitPledge} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Pledge Tier Amount</label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {['50', '100', '250'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setPledgeAmount(amt)}
                    className={`py-2 rounded-lg border font-bold text-center ${
                      pledgeAmount === amt
                        ? 'border-forest-600 bg-forest-50 text-forest-900'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    ${amt} USD
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={pledgeAmount}
                onChange={(e) => setPledgeAmount(e.target.value)}
                className="w-full px-3 py-2 border border-sage-300 rounded-lg bg-white text-slate-800"
                placeholder="Or custom amount"
              />
            </div>

            <div className="p-3 bg-sage-50 rounded-lg border border-sage-200 space-y-1">
              <div className="font-semibold text-slate-800">Your Impact Projection:</div>
              <div className="flex justify-between text-slate-600">
                <span>Saplings Funded:</span>
                <strong className="text-forest-700">{Math.round(parseInt(pledgeAmount || '0') / 5)} native trees</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>$VERD Reward:</span>
                <strong className="text-lime-700">+{Math.round(parseInt(pledgeAmount || '0') * 1.5)} $VERD</strong>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsBackModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Confirm ${pledgeAmount} Pledge
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Submit New Reforestation Campaign"
        description="Propose an ecological corridor, mangrove shoreline, or urban rewilding plot."
      >
        {createSuccess ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900">Campaign Submitted for Review!</h4>
            <p className="text-xs text-slate-500">MRV verification team will review GIS polygons within 48 hours.</p>
          </div>
        ) : (
          <form onSubmit={submitNewProject} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Campaign Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Great Lakes Wetland Hardwood Buffer"
                className="w-full px-3 py-2 border border-sage-300 rounded-lg bg-white text-slate-800"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Target Funding (USD)</label>
              <input
                type="number"
                required
                defaultValue="75000"
                className="w-full px-3 py-2 border border-sage-300 rounded-lg bg-white text-slate-800"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Target Tree Count</label>
              <input
                type="number"
                required
                defaultValue="15000"
                className="w-full px-3 py-2 border border-sage-300 rounded-lg bg-white text-slate-800"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Submit Campaign
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
