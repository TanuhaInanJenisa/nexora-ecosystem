'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Bell,
  CheckCheck,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Info,
  Clock,
} from 'lucide-react';
import type { AppNotification } from '@nexora/types';
import {
  getBrowserClient,
  fetchUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToUserNotifications,
  SAMPLE_NOTIFICATIONS,
} from '@nexora/api';
import { useAuth } from './auth-context';
import { useToast } from './toast';

export function NotificationDropdown() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(SAMPLE_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const client = getBrowserClient();

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const fetched = await fetchUserNotifications(client, user.id);
      setNotifications(fetched);
    } catch (err) {
      console.warn('Error loading notifications:', err);
    }
  }, [client, user]);

  useEffect(() => {
    if (!user) return;

    loadNotifications();

    const unsubscribe = subscribeToUserNotifications(client, user.id, (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      toast({
        type: 'info',
        title: newNotif.title,
        message: newNotif.body,
      });
    });

    return () => {
      unsubscribe();
    };
  }, [user, loadNotifications, client, toast]);

  // Handle outside click to dismiss dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAsRead = async (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
    );
    await markNotificationAsRead(client, notifId);
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
    );
    if (user) {
      await markAllNotificationsAsRead(client, user.id);
    }
    toast({
      type: 'success',
      title: 'Notifications Updated',
      message: 'All notifications marked as read.',
    });
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case 'security_alert':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'service_update':
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
      default:
        return <Info className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
        aria-label="Toggle notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-indigo-600 text-[9px] font-black text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[#0F172A]/95 border border-white/10 shadow-2xl backdrop-blur-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="px-4 py-2 border-b border-white/5 flex gap-2 bg-white/5 text-[11px]">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-0.5 rounded-md font-medium transition-colors ${
                filter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-0.5 rounded-md font-medium transition-colors ${
                filter === 'unread' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
            {filteredNotifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No notifications to display
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleMarkAsRead(notif.id)}
                  className={`p-3.5 flex gap-3 hover:bg-white/5 transition-colors cursor-pointer ${
                    !notif.is_read ? 'bg-indigo-950/20' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0 mt-0.5">
                    {getIconForType(notif.type)}
                  </div>

                  <div className="flex-1 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${!notif.is_read ? 'text-white' : 'text-slate-300'}`}>
                        {notif.title}
                      </span>
                      {!notif.is_read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                      {notif.body}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 pt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {notif.deep_link && (
                        <ExternalLink className="w-2.5 h-2.5 ml-1 text-indigo-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
