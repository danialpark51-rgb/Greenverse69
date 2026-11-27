import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertTriangle, Satellite, QrCode, ArrowRight, Sparkles } from 'lucide-react';
import { Badge } from './Badge';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface NotificationItem {
  id: string | number;
  title: string;
  desc: string;
  time: string;
  type: string;
  read: boolean;
  link_url?: string;
}

// No demo notifications — real notifications are fetched from Supabase per authenticated user

export const NotificationDropdown: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async () => {
    if (!isSupabaseConfigured || !user?.id) {
      setNotifications([]);
      return;
    }
    setLoading(true);
    try {
      // SECURITY: Always filter by the authenticated user's ID.
      // RLS on in_app_notifications also enforces this server-side.
      const { data, error } = await supabase
        .from('in_app_notifications')
        .select('id, title, message, type, is_read, link_url, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(15);

      if (!error && data) {
        const formatted: NotificationItem[] = data.map((n: any) => ({
          id: n.id,
          title: n.title,
          desc: n.message,
          time: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: n.type || 'general',
          read: !!n.is_read,
          link_url: n.link_url,
        }));
        setNotifications(formatted);
      } else if (error) {
        console.warn('[NotificationDropdown] Error fetching notifications:', error.message);
      }
    } catch (err) {
      console.warn('[NotificationDropdown] Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadNotifications();

    if (!isSupabaseConfigured || !user?.id) return;
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'in_app_notifications', filter: `user_id=eq.${user.id}` },
        () => {
          loadNotifications();
        }
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn('[NotificationDropdown] Realtime channel error:', err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, loadNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (isSupabaseConfigured && user?.id) {
      try {
        await supabase
          .from('in_app_notifications')
          .update({ is_read: true })
          .eq('user_id', user.id);
      } catch (err) {
        console.warn('[NotificationDropdown] Error marking notifications as read:', err);
      }
    }
  };

  const handleMarkRead = async (id: string | number, linkUrl?: string) => {
    // Optimistically mark as read
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (isSupabaseConfigured && user?.id) {
      try {
        await supabase
          .from('in_app_notifications')
          .update({ is_read: true })
          .eq('id', id)
          .eq('user_id', user.id);
      } catch (err) {
        console.warn('[NotificationDropdown] Error marking notification read:', err);
      }
    }
    if (linkUrl) {
      setIsOpen(false);
      navigate(linkUrl);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-600 hover:text-forest-800 hover:bg-sage-100 transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-soft-lg border border-sage-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-3 bg-sage-50/60 border-b border-sage-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="emerald" size="sm">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-forest-700 hover:underline font-medium"
            >
              Mark all as read
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-xs text-slate-500">
                <p>Loading notifications…</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                <p className="font-semibold text-slate-700 mb-1">No notifications yet</p>
                <p>Activity alerts and updates will appear here.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkRead(n.id, n.link_url)}
                  className={`p-3.5 hover:bg-sage-50/40 transition-colors cursor-pointer flex gap-3 ${
                    !n.read ? 'bg-forest-50/30' : ''
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {n.type === 'verification' && (
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Satellite className="w-4 h-4" />
                      </div>
                    )}
                    {n.type === 'alert' && (
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    )}
                    {n.type === 'passport' && (
                      <div className="w-8 h-8 rounded-lg bg-forest-100 text-forest-700 flex items-center justify-center">
                        <QrCode className="w-4 h-4" />
                      </div>
                    )}
                    {n.type !== 'verification' && n.type !== 'alert' && n.type !== 'passport' && (
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{n.desc}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-forest-800 hover:text-forest-950 inline-flex items-center gap-1"
            >
              View verification log <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

