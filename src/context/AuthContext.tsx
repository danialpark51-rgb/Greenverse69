import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UserProfile {
  id?: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  role?: string;
  organization?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ data?: any; error?: any }>;
  refreshProfile: () => Promise<void>;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  updateProfile: async () => ({ error: 'Not implemented' }),
  refreshProfile: async () => {},
  isConfigured: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Ref to track component mount status and prevent state updates on unmounted components
  const isMountedRef = useRef<boolean>(true);

  // Helper to load profile safely without throwing or breaking if RLS restricts access
  const loadProfile = useCallback(async (userId: string, userEmail?: string, userMetadata?: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!isMountedRef.current) return;

      if (!error && data) {
        setProfile(data as UserProfile);
      } else {
        // Fallback to user metadata if table has no row or RLS restricts unauthenticated reads
        setProfile({
          id: userId,
          full_name: userMetadata?.full_name || userEmail?.split('@')[0] || 'Forester',
          email: userEmail,
          avatar_url: userMetadata?.avatar_url || '',
          role: 'Verified Forester',
        });
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      setProfile({
        id: userId,
        full_name: userMetadata?.full_name || userEmail?.split('@')[0] || 'Forester',
        email: userEmail,
        role: 'Verified Forester',
      });
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await loadProfile(user.id, user.email, user.user_metadata);
    }
  }, [user, loadProfile]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error('User is not authenticated') };
    }

    try {
      const payload = {
        id: user.id,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(payload)
        .select()
        .maybeSingle();

      if (!error && data && isMountedRef.current) {
        setProfile(data as UserProfile);
      } else if (!error && isMountedRef.current) {
        setProfile((prev) => ({ ...prev, ...updates }));
      }

      return { data, error };
    } catch (err: any) {
      // Update local state even if remote upsert meets RLS restrictions
      if (isMountedRef.current) {
        setProfile((prev) => ({ ...prev, ...updates }));
      }
      return { error: err };
    }
  }, [user]);

  useEffect(() => {
    isMountedRef.current = true;

    // 1. Initial session hydration from local storage
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (!isMountedRef.current) return;

        if (error) {
          console.warn('[Greenverse Auth] Session retrieval notice:', error.message);
        }

        setSession(initialSession);
        const currentUser = initialSession?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await loadProfile(currentUser.id, currentUser.email, currentUser.user_metadata);
        }
      } catch (err: any) {
        console.warn('[Greenverse Auth] Session hydration notice:', err?.message || err);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // 2. Reliable auth state listener avoiding duplicate instances
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, currentSession: Session | null) => {
      if (!isMountedRef.current) return;

      setSession(currentSession);
      const authUser = currentSession?.user ?? null;
      setUser(authUser);

      if (authUser) {
        await loadProfile(authUser.id, authUser.email, authUser.user_metadata);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      if (isMountedRef.current) {
        setUser(null);
        setSession(null);
        setProfile(null);
      }
    } catch (err) {
      console.error('[Greenverse Auth] Error during sign out:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signOut,
        updateProfile,
        refreshProfile,
        isConfigured: isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
