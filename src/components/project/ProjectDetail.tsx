import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Coins, MapPin, Calendar, Users, ShieldCheck, TreePine,
  TrendingUp, BookOpen, Award, AlertCircle, CheckCircle2, Sprout, Heart, X, Send
} from 'lucide-react';
import { Project, FundingCampaign, ProjectMilestone, ProjectUpdate } from '../../types/project';
import {
  fetchProjectCampaign, fetchMilestones, fetchProjectUpdates, createPledge
} from '../../services/projectService';
import { InteractiveMap } from '../map/InteractiveMap';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  currentUserId?: string;
  currentUserName?: string;
  onNavigateTab?: (tab: string, projectId: string) => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onBack,
  currentUserId,
  currentUserName,
  onNavigateTab
}) => {
  const [campaign, setCampaign] = useState<FundingCampaign | null>(null);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'funding' | 'progress' | 'map'>('overview');

  // Pledge form
  const [showPledgeForm, setShowPledgeForm] = useState(false);
  const [pledgeAmount, setPledgeAmount] = useState('');
  const [pledgeName, setPledgeName] = useState(currentUserName || '');
  const [pledgeEmail, setPledgeEmail] = useState('');
  const [pledgeAnon, setPledgeAnon] = useState(false);
  const [pledgeType, setPledgeType] = useState<'financial_pledge' | 'in_kind_pledge' | 'seedling_pledge'>('financial_pledge');
  const [pledgeSubmitting, setPledgeSubmitting] = useState(false);
  const [pledgeSuccess, setPledgeSuccess] = useState(false);
  const [localProject, setLocalProject] = useState(project);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [camp, miles, upds] = await Promise.all([
          fetchProjectCampaign(project.id),
          fetchMilestones(project.id),
          fetchProjectUpdates(project.id)
        ]);
        setCampaign(camp);
        setMilestones(miles);
        setUpdates(upds);
      } catch (err) {
        console.error('Failed to load project details:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [project.id]);

  const handlePledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pledgeName.trim()) return;
    try {
      setPledgeSubmitting(true);
      await createPledge({
        project_id: project.id,
        campaign_id: campaign?.id,
        pledge_type: pledgeType,
        amount: parseFloat(pledgeAmount) || 0,
        currency: localProject.currency,
        supporter_name: pledgeName,
        supporter_email: pledgeEmail,
        is_anonymous: pledgeAnon
      }, currentUserId);
      setLocalProject(prev => ({
        ...prev,
        pledged_amount: prev.pledged_amount + (parseFloat(pledgeAmount) || 0),
        supporters_count: prev.supporters_count + 1
      }));
      setPledgeSuccess(true);
      setTimeout(() => { setPledgeSuccess(false); setShowPledgeForm(false); }, 2500);
    } catch (err) {
      console.error('Pledge failed:', err);
    } finally {
      setPledgeSubmitting(false);
    }
  };

  const totalFunded = localProject.current_funding_raised + localProject.pledged_amount;
  const pct = Math.min(100, Math.round((totalFunded / (localProject.funding_target || 1)) * 100));
  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const overallProgress = milestones.length
    ? Math.round(milestones.reduce((acc, m) => acc + m.current_progress_percentage, 0) / milestones.length)
    : 0;

  const verificationColor = {
    verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    reviewed: 'bg-blue-50 text-blue-700 border-blue-200',
    submitted_for_review: 'bg-amber-50 text-amber-700 border-amber-200',
    unverified: 'bg-slate-50 text-slate-600 border-slate-200',
    flagged: 'bg-red-50 text-red-700 border-red-200'
  }[localProject.verification_status] || 'bg-slate-50 text-slate-600 border-slate-200';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" /> Back to Project Hub
      </button>

      {/* Hero */}
      <div className="relative h-72 md:h-96 rounded-3xl overflow-hidden">
        <img
          src={localProject.cover_image_url || 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80'}
          alt={localProject.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${verificationColor}`}>
              {localProject.verification_status === 'verified' && <ShieldCheck className="w-3 h-3 inline mr-1" />}
              {localProject.verification_status.replace('_', ' ').toUpperCase()}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white border border-white/30 backdrop-blur-sm">
              {localProject.category.replace(/_/g, ' ')}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">{localProject.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-white/80">
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{localProject.location_name}</span>
            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />By {localProject.owner_name}</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Funding Progress', value: `${pct}%`, sub: `${localProject.currency} ${totalFunded.toLocaleString()} of ${localProject.funding_target.toLocaleString()}`, icon: Coins, color: 'emerald' },
          { label: 'Supporters', value: localProject.supporters_count.toString(), sub: 'pledges registered', icon: Heart, color: 'rose' },
          { label: 'Milestones', value: `${completedMilestones}/${milestones.length}`, sub: `${overallProgress}% overall progress`, icon: Award, color: 'amber' },
          { label: 'Volunteers', value: `${localProject.volunteers_registered}/${localProject.volunteers_needed}`, sub: 'field positions filled', icon: Users, color: 'blue' }
        ].map(stat => (
          <div key={stat.label} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className={`text-${stat.color}-600 mb-2`}><stat.icon className="w-5 h-5" /></div>
            <div className="text-2xl font-extrabold text-slate-900">{stat.value}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{stat.sub}</div>
            <div className="text-[10px] font-semibold text-slate-700 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Funding Progress Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div className="flex justify-between text-xs font-semibold text-slate-700 mb-2">
          <span>{localProject.currency} {localProject.current_funding_raised.toLocaleString()} <span className="text-emerald-600 font-bold">verified receipts</span> + {localProject.currency} {localProject.pledged_amount.toLocaleString()} <span className="text-amber-600 font-bold">pledged</span></span>
          <span className="text-slate-500">Goal: {localProject.currency} {localProject.funding_target.toLocaleString()}</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
          <div className="bg-emerald-600 h-full rounded-l-full transition-all" style={{ width: `${Math.min(100, Math.round((localProject.current_funding_raised / (localProject.funding_target || 1)) * 100))}%` }} />
          <div className="bg-amber-400 h-full transition-all" style={{ width: `${Math.min(100 - Math.round((localProject.current_funding_raised / (localProject.funding_target || 1)) * 100), Math.round((localProject.pledged_amount / (localProject.funding_target || 1)) * 100))}%` }} />
        </div>
        <div className="flex gap-4 mt-2 text-[11px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>Verified receipts (project transparency records)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>Pledged (community interest, not yet fulfilled)</span>
        </div>
      </div>

      {/* Detail Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'funding', label: 'Support Project' },
            { id: 'progress', label: 'Progress & Updates' },
            { id: 'map', label: 'Location Map' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3.5 text-xs font-semibold transition-colors ${
                activeTab === tab.id ? 'bg-slate-50 text-slate-900 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-700'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2">About This Initiative</h3>
                <p className="text-sm text-slate-700 leading-relaxed">{localProject.description}</p>
              </div>
              {localProject.problem_statement && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-amber-600" />Environmental Problem</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{localProject.problem_statement}</p>
                </div>
              )}
              {localProject.proposed_solution && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" />Proposed Solution</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{localProject.proposed_solution}</p>
                </div>
              )}
              {localProject.objectives?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2">Project Objectives</h4>
                  <ul className="space-y-1.5">
                    {localProject.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-[10px]">{i + 1}</span>
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {localProject.expected_outcomes?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2">Expected Outcomes</h4>
                  <ul className="space-y-1">
                    {localProject.expected_outcomes.map((out, i) => (
                      <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                        <Sprout className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />{out}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { label: 'Timeline', value: localProject.estimated_timeline },
                  { label: 'Start Date', value: localProject.start_date },
                  { label: 'End Date', value: localProject.end_date },
                  { label: 'Project Type', value: localProject.project_type?.replace('_', ' ') }
                ].filter(r => r.value).map(row => (
                  <div key={row.label} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-slate-500 text-[11px]">{row.label}</div>
                    <div className="font-semibold text-slate-900 mt-0.5 capitalize">{row.value}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                {onNavigateTab && (
                  <>
                    <button onClick={() => onNavigateTab('volunteers', localProject.id)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold">
                      View Volunteer Roles
                    </button>
                    <button onClick={() => onNavigateTab('milestones', localProject.id)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold">
                      View Milestones
                    </button>
                    <button onClick={() => onNavigateTab('impact', localProject.id)}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold">
                      Impact Estimator
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'funding' && (
            <div className="space-y-5">
              {pledgeSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm font-semibold text-emerald-800 text-center">
                  ✓ Thank you! Your pledge has been recorded. Greenverse does not process real payments — your pledge is a community commitment tracked transparently.
                </div>
              )}

              {!showPledgeForm ? (
                <div className="space-y-4">
                  {campaign && (
                    <>
                      <h3 className="text-base font-bold text-slate-900">{campaign.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{campaign.description}</p>
                      {campaign.budget_purpose && (
                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-900">
                          <strong>Budget Purpose:</strong> {campaign.budget_purpose}
                        </div>
                      )}

                      {campaign.tiers && campaign.tiers.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-slate-900">Contribution Tiers</h4>
                          {campaign.tiers.map(tier => (
                            <div key={tier.id} className="p-4 border border-slate-200 rounded-2xl hover:border-emerald-300 transition-colors">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-slate-900 text-sm">{tier.title}</span>
                                <span className="text-emerald-700 font-extrabold">{campaign.currency} {tier.amount}</span>
                              </div>
                              <p className="text-xs text-slate-600 mb-2">{tier.description}</p>
                              <div className="flex flex-wrap gap-1 mb-2">
                                {tier.benefits.map((b, bi) => (
                                  <span key={bi} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium">{b}</span>
                                ))}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] text-slate-500">{tier.backers_count} backers</span>
                                <button onClick={() => { setPledgeAmount(String(tier.amount)); setShowPledgeForm(true); }}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold">
                                  Select Tier
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  <button onClick={() => setShowPledgeForm(true)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold transition-colors">
                    Register Your Pledge / Support
                  </button>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                    <strong>⚠ Important:</strong> This registers your pledge as a community commitment. No real payment is processed through Greenverse at this time. Payment gateway integration (Razorpay / Stripe) requires separate configuration and project admin activation.
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePledge} className="space-y-4">
                  <h3 className="font-bold text-slate-900">Register Your Support</h3>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Support Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'financial_pledge', label: 'Financial Pledge' },
                        { id: 'in_kind_pledge', label: 'In-Kind Support' },
                        { id: 'seedling_pledge', label: 'Seedlings / Plants' }
                      ].map(t => (
                        <button key={t.id} type="button" onClick={() => setPledgeType(t.id as any)}
                          className={`p-2.5 rounded-xl border text-xs font-medium text-center ${pledgeType === t.id ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-600'}`}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {pledgeType === 'financial_pledge' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Pledge Amount ({localProject.currency})</label>
                      <input type="number" min="1" value={pledgeAmount} onChange={e => setPledgeAmount(e.target.value)}
                        placeholder="e.g. 50" className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl" />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name *</label>
                    <input type="text" required value={pledgeName} onChange={e => setPledgeName(e.target.value)}
                      placeholder="Displayed in supporter list" className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email (Optional)</label>
                    <input type="email" value={pledgeEmail} onChange={e => setPledgeEmail(e.target.value)}
                      placeholder="For project update notifications only" className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl" />
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={pledgeAnon} onChange={e => setPledgeAnon(e.target.checked)} className="rounded" />
                    Register as anonymous supporter (name hidden from public list)
                  </label>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setShowPledgeForm(false)}
                      className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900">Cancel</button>
                    <button type="submit" disabled={pledgeSubmitting}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold disabled:opacity-50">
                      {pledgeSubmitting ? 'Registering...' : 'Confirm Pledge'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-6">
              {milestones.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Project Milestones</h3>
                  <div className="space-y-3">
                    {milestones.map(m => (
                      <div key={m.id} className={`p-4 rounded-2xl border transition-all ${
                        m.status === 'completed' ? 'bg-emerald-50 border-emerald-200' :
                        m.status === 'in_progress' ? 'bg-blue-50 border-blue-200' :
                        m.status === 'overdue' ? 'bg-red-50 border-red-200' :
                        'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold text-slate-900">{m.title}</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            m.status === 'completed' ? 'bg-emerald-600 text-white' :
                            m.status === 'in_progress' ? 'bg-blue-600 text-white' :
                            m.status === 'overdue' ? 'bg-red-600 text-white' :
                            'bg-slate-300 text-slate-700'
                          }`}>{m.status.replace('_', ' ')}</span>
                        </div>
                        <div className="w-full bg-white rounded-full h-2 mb-2">
                          <div className={`h-full rounded-full ${m.status === 'completed' ? 'bg-emerald-600' : 'bg-blue-500'}`}
                            style={{ width: `${m.current_progress_percentage}%` }} />
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-600">
                          <span>{m.current_progress_percentage}% complete</span>
                          <span>Due: {new Date(m.due_date).toLocaleDateString()}</span>
                        </div>
                        {m.responsible_member_name && (
                          <div className="text-[11px] text-slate-500 mt-1">Lead: {m.responsible_member_name}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Project Updates</h3>
                {updates.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No updates posted yet.</p>
                ) : (
                  <div className="space-y-4">
                    {updates.map(upd => (
                      <div key={upd.id} className="border-l-2 border-emerald-300 pl-4">
                        <div className="text-[11px] text-slate-500">{upd.author_name} · {new Date(upd.created_at).toLocaleDateString()}</div>
                        <h4 className="text-xs font-bold text-slate-900 mt-0.5">{upd.title}</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{upd.content}</p>
                        {upd.media_url && (
                          <img src={upd.media_url} alt="Update media" className="mt-2 w-full max-h-32 object-cover rounded-lg" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'map' && localProject.latitude && localProject.longitude && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-600" />Project Location</h3>
              <div className="rounded-xl overflow-hidden border border-slate-200">
                <InteractiveMap
                  center={[localProject.latitude, localProject.longitude]}
                  zoom={13}
                  height="380px"
                  enableClickToPick={false}
                  enableSearch={false}
                  markers={[{
                    id: localProject.id,
                    lat: localProject.latitude,
                    lng: localProject.longitude,
                    title: localProject.title,
                    subtitle: localProject.location_name,
                    variant: 'emerald'
                  }]}
                />
              </div>
              <p className="text-xs text-slate-500">Coordinates: {localProject.latitude.toFixed(5)}°, {localProject.longitude.toFixed(5)}° · Source: OpenStreetMap</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
