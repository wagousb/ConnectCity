import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Notification, User } from '@/types';
import { HeartIcon, UsersIcon } from '@/components/Icons';

const timeAgo = (date: string | Date): string => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "a";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "m";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "min";
    return Math.floor(seconds) + "s";
}

interface NotificationsPageProps {
  user: User;
  onViewChange: (view: { view: string; userId?: string }) => void;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ user, onViewChange }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*, actor:actor_id(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
      } else {
        const formattedNotifications: Notification[] = data
          .filter(n => n.type !== 'follow')
          .map(n => ({
            id: n.id,
            type: n.type,
            is_read: n.is_read,
            created_at: n.created_at,
            entity_id: n.entity_id,
            actor: {
              id: n.actor.id,
              name: n.actor.name,
              handle: n.actor.handle,
              avatarUrl: n.actor.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(n.actor.name)}&background=eef2ff&color=4f46e5&font-size=0.5`,
            }
        }));
        setNotifications(formattedNotifications);
      }
      setLoading(false);
    };

    const markAsRead = async () => {
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);
    };

    fetchNotifications();
    markAsRead();
  }, [user.id]);

  const renderNotification = (notification: Notification) => {
    const { actor, type, created_at } = notification;
    const time = timeAgo(created_at);

    const iconClasses = "h-6 w-6 text-white";
    let icon, text;

    const actorName = <span className="font-bold hover:underline" onClick={() => onViewChange({ view: 'Profile', userId: actor.id })}>{actor.name}</span>;

    switch (type) {
      case 'like':
        icon = <div className="bg-red-500 p-2 rounded-full"><HeartIcon className={iconClasses} /></div>;
        text = <p>{actorName} curtiu sua publicação.</p>;
        break;
      // 'follow' case removed
      default:
        return null;
    }

    return (
      <div key={notification.id} className={`flex items-start space-x-4 p-4 rounded-lg ${!notification.is_read ? 'bg-primary-50' : ''}`}>
        <div className="cursor-pointer" onClick={() => onViewChange({ view: 'Profile', userId: actor.id })}>
          {icon}
        </div>
        <div className="flex-1">
          {text}
          <p className="text-sm text-slate-500">{time}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <h1 className="text-2xl font-bold mb-6">Notificações</h1>
      {loading ? (
        <p className="text-slate-500 text-center">Carregando...</p>
      ) : notifications.length === 0 ? (
        <p className="text-slate-500 text-center">Nenhuma notificação ainda.</p>
      ) : (
        <div className="space-y-2">
          {notifications.map(renderNotification)}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;