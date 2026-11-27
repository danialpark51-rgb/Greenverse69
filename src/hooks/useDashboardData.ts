/**
 * useDashboardData — Greenverse Dashboard Live Data Hook
 *
 * Fetches real metrics, activity, and wallet balance from Supabase.
 * Falls back to null values gracefully when tables are empty or the
 * migration has not yet run. Never fabricates data.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface DashboardMetrics {
  treesRegistered: number | null;
  activeProjects: number | null;
  openOpportunities: number | null;
  walletBalance: number | null;
  pendingNotifications: number | null;
}

export interface DashboardActivity {
  id: string;
  title: string;
  description: string;
  type: 'tree' | 'project' | 'community' | 'wallet' | 'notification';
  created_at: string;
}

export interface DashboardState {
  metrics: DashboardMetrics;
  recentActivity: DashboardActivity[];
  recentNotifications: Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
  }>;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useDashboardData(): DashboardState {
  const { user } = useAuth();
  const userId = user?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    treesRegistered: null,
    activeProjects: null,
    openOpportunities: null,
    walletBalance: null,
    pendingNotifications: null,
  });
  const [recentActivity, setRecentActivity] = useState<DashboardActivity[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<
    Array<{ id: string; title: string; message: string; type: string; is_read: boolean; created_at: string }>
  >([]);

  const isMountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Run all queries in parallel
      const results = await Promise.allSettled([
        // 1. Total trees registered (public — no auth filter needed)
        supabase.from('trees').select('id', { count: 'exact', head: true }),

        // 2. Active projects count (public)
        supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'active'),

        // 3. Open opportunities count (public)
        supabase.from('gigs').select('id', { count: 'exact', head: true }).eq('status', 'open'),

        // 4. User wallet balance (authenticated)
        userId
          ? supabase.from('user_wallets').select('green_points_balance').eq('user_id', userId).maybeSingle()
          : Promise.resolve({ data: null, error: null }),

        // 5. Unread notifications for current user (authenticated)
        userId
          ? supabase
              .from('in_app_notifications')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', userId)
              .eq('is_read', false)
          : Promise.resolve({ count: 0, data: null, error: null }),

        // 6. Recent notifications for the user (for dashboard preview)
        userId
          ? supabase
              .from('in_app_notifications')
              .select('id, title, message, type, is_read, created_at')
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
              .limit(5)
          : Promise.resolve({ data: [], error: null }),

        // 7. Recent community posts for activity feed (public)
        supabase
          .from('community_posts')
          .select('id, title, content, created_at, post_type')
          .order('created_at', { ascending: false })
          .limit(5),

        // 8. Try get_or_create_user_wallet RPC for balance (more reliable)
        userId
          ? supabase.rpc('get_or_create_user_wallet')
          : Promise.resolve({ data: null, error: null }),
      ]);

      if (!isMountedRef.current) return;

      // Extract counts safely
      const treesResult = results[0];
      const projectsResult = results[1];
      const opportunitiesResult = results[2];
      const walletDirectResult = results[3];
      const unreadCountResult = results[4];
      const recentNotifResult = results[5];
      const communityPostsResult = results[6];
      const walletRpcResult = results[7];

      const treesCount =
        treesResult.status === 'fulfilled' && !treesResult.value.error
          ? (treesResult.value.count ?? null)
          : null;

      const projectsCount =
        projectsResult.status === 'fulfilled' && !projectsResult.value.error
          ? (projectsResult.value.count ?? null)
          : null;

      const opportunitiesCount =
        opportunitiesResult.status === 'fulfilled' && !opportunitiesResult.value.error
          ? (opportunitiesResult.value.count ?? null)
          : null;

      // Wallet: prefer RPC, fall back to direct select
      let walletBalance: number | null = null;
      if (
        walletRpcResult.status === 'fulfilled' &&
        (walletRpcResult.value as any).data?.success &&
        (walletRpcResult.value as any).data?.wallet
      ) {
        walletBalance = (walletRpcResult.value as any).data.wallet.green_points_balance ?? null;
      } else if (
        walletDirectResult.status === 'fulfilled' &&
        !(walletDirectResult.value as any).error &&
        (walletDirectResult.value as any).data
      ) {
        walletBalance = (walletDirectResult.value as any).data.green_points_balance ?? null;
      }

      const unreadCount =
        unreadCountResult.status === 'fulfilled' && !(unreadCountResult.value as any).error
          ? ((unreadCountResult.value as any).count ?? null)
          : null;

      setMetrics({
        treesRegistered: treesCount,
        activeProjects: projectsCount,
        openOpportunities: opportunitiesCount,
        walletBalance,
        pendingNotifications: unreadCount,
      });

      // Recent notifications
      if (
        recentNotifResult.status === 'fulfilled' &&
        !(recentNotifResult.value as any).error &&
        Array.isArray((recentNotifResult.value as any).data)
      ) {
        setRecentNotifications((recentNotifResult.value as any).data);
      }

      // Activity feed from community posts
      const activityItems: DashboardActivity[] = [];
      if (
        communityPostsResult.status === 'fulfilled' &&
        !(communityPostsResult.value as any).error &&
        Array.isArray((communityPostsResult.value as any).data)
      ) {
        for (const post of (communityPostsResult.value as any).data as any[]) {
          activityItems.push({
            id: post.id,
            title: post.title || 'Community Post',
            description: post.content?.slice(0, 100) || '',
            type: 'community',
            created_at: post.created_at,
          });
        }
      }
      setRecentActivity(activityItems);
    } catch (err: any) {
      if (!isMountedRef.current) return;
      setError(err?.message || 'Failed to load dashboard data.');
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [userId]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchData();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchData]);

  // Realtime subscription on wallet and notifications for live updates
  useEffect(() => {
    if (!isSupabaseConfigured || !userId) return;

    const channel = supabase
      .channel(`dashboard-live-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_wallets', filter: `user_id=eq.${userId}` },
        () => {
          if (isMountedRef.current) fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'in_app_notifications', filter: `user_id=eq.${userId}` },
        () => {
          if (isMountedRef.current) fetchData();
        }
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn('[Dashboard] Realtime subscription error:', err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchData]);

  return {
    metrics,
    recentActivity,
    recentNotifications,
    loading,
    error,
    refresh: fetchData,
  };
}
