import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Satellite, QrCode, ArrowRight } from 'lucide-react';
import { Badge } from './Badge';

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const notifications = [
    {
      id: 1,
      title: 'Satellite MRV Pass Completed',
      desc: 'Sentinel-2 multispectral pass successfully verified 3,840 saplings in Upper Mississippi.',
      time: '12m ago',
      type: 'verification',
      read: false,
    },
    {
      id: 2,
      title: 'Moisture Alert: Low Hydration',
      desc: 'Sector 4 Cascadia probe reports 38% moisture. Supplementary watering advised.',
      time: '1h ago',
      type: 'alert',
      read: false,
    },
    {
      id: 3,
      title: 'Digital Tree Passport Minted',
      desc: 'Western Red Cedar #GV-CED-1104 assigned verified cryptographic digital twin.',
      time: '3h ago',
      type: 'passport',
      read: true,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

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
              onClick={() => setIsOpen(false)}
              className="text-xs text-forest-700 hover:underline font-medium"
            >
              Mark all as read
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {notifications.map((n) => (
              <div
                key={n.id}
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
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                    <span className="text-[10px] text-slate-400">{n.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{n.desc}</p>
                </div>
              </div>
            ))}
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
