import React, { useState } from 'react';
import { MOCK_OPPORTUNITIES } from '../data/mockData';
import { GreenOpportunity } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { SearchInput } from '../components/common/SearchInput';
import { Modal } from '../components/common/Modal';
import {
  Briefcase,
  MapPin,
  Clock,
  Coins,
  CheckCircle2,
  Filter,
  Sparkles,
  Send,
  Building2
} from 'lucide-react';

export const OpportunitiesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedOpp, setSelectedOpp] = useState<GreenOpportunity | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  const filteredOpportunities = MOCK_OPPORTUNITIES.filter((opp) => {
    const matchesType = typeFilter === 'all' || opp.type === typeFilter;
    const matchesSearch =
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const handleApply = (opp: GreenOpportunity) => {
    setSelectedOpp(opp);
    setIsApplyModalOpen(true);
  };

  const submitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    setApplySuccess(true);
    setTimeout(() => {
      setApplySuccess(false);
      setIsApplyModalOpen(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-forest-700" />
            Green Opportunities & Ecological Careers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Verified environmental positions, research fellowships, and compensated volunteer expeditions.
          </p>
        </div>
        <Badge variant="emerald" dot>138 Opportunities Open</Badge>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:max-w-md">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
            placeholder="Search roles, organizations, skills..."
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto py-1">
          {['all', 'Full-time', 'Research Fellowship', 'Volunteer Expedition'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all border ${
                typeFilter === type
                  ? 'bg-forest-rich text-white border-forest-moss shadow-sm'
                  : 'bg-white text-slate-600 border-sage-200 hover:bg-slate-50'
              }`}
            >
              {type === 'all' ? 'All Roles' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOpportunities.map((opp) => (
          <Card key={opp.id} hoverEffect className="flex flex-col justify-between">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={opp.type === 'Full-time' ? 'forest' : opp.type === 'Research Fellowship' ? 'lime' : 'emerald'}
                      size="sm"
                    >
                      {opp.type}
                    </Badge>
                    {opp.isRemote && (
                      <span className="text-[10px] text-slate-400 font-medium">Remote OK</span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{opp.title}</h3>
                  <div className="text-xs text-forest-800 font-semibold flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5" />
                    {opp.organization}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-slate-900">{opp.compensation}</div>
                  <div className="text-[10px] text-slate-400">Deadline: {opp.deadline}</div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{opp.description}</p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {opp.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {opp.location}
                </span>

                <Button
                  variant="primary"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleApply(opp)}
                >
                  Apply Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Application Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title={selectedOpp ? `Apply: ${selectedOpp.title}` : 'Apply for Opportunity'}
        description={selectedOpp?.organization}
      >
        {applySuccess ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900">Application Submitted!</h4>
            <p className="text-xs text-slate-500">
              Your profile, biometric credentials, and tree planting history have been securely forwarded to {selectedOpp?.organization}.
            </p>
          </div>
        ) : (
          <form onSubmit={submitApplication} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Applicant Name</label>
              <input
                type="text"
                defaultValue="Elena Rostova"
                required
                className="w-full px-3 py-2 border border-sage-300 rounded-lg bg-white text-slate-800"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                defaultValue="elena.rostova@canopyguard.org"
                required
                className="w-full px-3 py-2 border border-sage-300 rounded-lg bg-white text-slate-800"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Portfolio & Field Experience Note</label>
              <textarea
                rows={3}
                required
                placeholder="Mention previous reforestation projects, drone operation, or GIS skills..."
                className="w-full px-3 py-2 border border-sage-300 rounded-lg bg-white text-slate-800"
              />
            </div>

            <div className="p-3 bg-forest-50 rounded-lg border border-forest-100 flex items-start gap-2 text-[11px] text-forest-800">
              <Sparkles className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
              <span>
                Your <strong>Verified 428 Trees Planted</strong> record and Level 8 Forester badge will be attached to your application package automatically.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsApplyModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" icon={<Send className="w-3.5 h-3.5" />}>
                Submit Application
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
