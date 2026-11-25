import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Compass,
  Trophy,
  Calendar,
  MessageSquare,
  TrendingUp,
  BookOpen,
  Bell,
  Sparkles,
  X,
  CheckCircle2,
  TreePine,
  Heart,
  Medal,
} from 'lucide-react';
import { GreenCommunities } from '../components/community/GreenCommunities';
import { SquadMatcher } from '../components/community/SquadMatcher';
import { GreenChallenges } from '../components/community/GreenChallenges';
import { GreenEvents } from '../components/community/GreenEvents';
import { CommunityFeed } from '../components/community/CommunityFeed';
import { TeamProgressDashboard } from '../components/community/TeamProgressDashboard';
import { CommunityGreenBrain } from '../components/community/CommunityGreenBrain';
import { VolunteerNetwork } from '../components/community/VolunteerNetwork';
import { CommunityLeaderboard } from '../components/community/CommunityLeaderboard';
import { getNotifications, markNotificationAsRead } from '../services/communityService';
import { InAppNotification } from '../types/community';

export const CommunitiesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile } = useAuth();
  
  const currentTab = searchParams.get('tab') || 'communities';
  const setTab = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  // Notifications
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadNotifs = async () => {
      try {
        const notifs = await getNotifications();
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.is_read).length);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    };
    loadNotifs();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev =>
        prev.map((n: InAppNotification) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const tabs = [
    { id: 'communities', label: 'Communities', icon: Users, badge: 'Hub' },
    { id: 'squads', label: 'Squad Matcher', icon: Compass, badge: 'Match' },
    { id: 'challenges', label: 'Challenges', icon: Trophy, badge: 'Sprint' },
    { id: 'events', label: 'Green Events', icon: Calendar, badge: 'Map' },
    { id: 'feed', label: 'Community Feed', icon: MessageSquare, badge: 'Live' },
    { id: 'dashboard', label: 'Team Impact', icon: TrendingUp },
    { id: 'green-brain', label: 'Green Brain', icon: BookOpen, badge: 'Guides' },
    { id: 'volunteers', label: 'Volunteer Network', icon: Heart, badge: 'Open' },
    { id: 'leaderboard', label: 'Leaderboard', icon: Medal, badge: 'Ranked' },
  ];

  const currentUserId = user?.id || 'demo-user-id';
  const currentUserName = profile?.full_name || user?.email?.split('@')[0] || 'Environmental Steward';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-2 border border-emerald-100">
              <TreePine className="w-3.5 h-3.5 text-emerald-600" />
              Greenverse Collective Network • Batch 3
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Community & Squad Network
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Connect with fellow canopy guardians, form hyper-local planting squads, coordinate field events with real OpenStreetMap coordinates, and share arborist wisdom.
            </p>
          </div>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-2 text-slate-700"
              title="Community Activity Notifications"
            >
              <Bell className="w-5 h-5 text-slate-700" />
              <span className="text-xs font-semibold hidden sm:inline">Alerts</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 z-50 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Network Notifications
                    </h4>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">
                      No notifications at this time
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => handleMarkAsRead(notif.id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          notif.is_read
                            ? 'bg-slate-50/50 border-slate-100 text-slate-600'
                            : 'bg-emerald-50/50 border-emerald-200 text-slate-900 font-medium'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900">{notif.title}</span>
                          {!notif.is_read && (
                            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">{notif.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1.5 block">
                          {new Date(notif.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-1 border-t border-slate-100 pt-6 scrollbar-none">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/10'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <div>
        {currentTab === 'communities' && (
          <GreenCommunities />
        )}

        {currentTab === 'squads' && (
          <SquadMatcher />
        )}

        {currentTab === 'challenges' && (
          <GreenChallenges />
        )}

        {currentTab === 'events' && (
          <GreenEvents currentUserId={currentUserId} />
        )}

        {currentTab === 'feed' && (
          <CommunityFeed currentUserId={currentUserId} currentUserName={currentUserName} />
        )}

        {currentTab === 'dashboard' && (
          <TeamProgressDashboard />
        )}

        {currentTab === 'green-brain' && (
          <CommunityGreenBrain currentUserId={currentUserId} currentUserName={currentUserName} />
        )}

        {currentTab === 'volunteers' && (
          <VolunteerNetwork userId={currentUserId} userName={currentUserName} />
        )}

        {currentTab === 'leaderboard' && (
          <CommunityLeaderboard />
        )}
      </div>
    </div>
  );
};
