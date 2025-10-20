import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Notification, User } from '@/types';
import { MessageCircleIcon, StarIcon, ThumbsUpIcon, ThumbsDownIcon } from '@/components/Icons';

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
  onViewChange: (view: { view: string; userId?: string; postId?: string }) => void;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ user, onViewChange }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndMarkNotifications = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*, actor:actor_id(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        setLoading(false);
        return;
      }

      const postIds = [...new Set(data.map(n => n.entity_id).filter(Boolean))];
      let postTitlesMap = new Map<string, string>();

      if (postIds.length > 0) {
          const { data: postsData, error: postsError } = await supabase
              .from('posts')
              .select('id, title')
              .in('id', postIds);
          if (postsError) {
              console.error('Error fetching post titles for notifications:', postsError);
          } else {
              postTitlesMap = new Map(postsData.map(p => [p.id, p.title]));
          }
      }

      const commentIds = data.map(n => n.comment_id).filter(Boolean);
      let commentsMap = new Map<string, string>();

      if (commentIds.length > 0) {
          const { data: commentsData, error: commentsError } = await supabase
              .from('comments')
              .select('id, content')
              .in('id', commentIds);
          if (commentsError) {
              console.error('Error fetching comments for notifications:', commentsError);
          } else {
              commentsMap = new Map(commentsData.map(c => [c.id, c.content]));
          }
      }

      const formattedNotifications: Notification[] = data
        .map((n: any) => ({
          id: n.id,
          type: n.type,
          is_read: n.is_read,
          created_at: n.created_at,
          entity_id: n.entity_id,
          postTitle: n.entity_id ? postTitlesMap.get(n.entity_id) : undefined,
          comment_id: n.comment_id,
          commentContent: n.comment_id ? commentsMap.get(n.comment_id) : undefined,
          actor: {
            id: n.actor.id,
            name: n.actor.name,
            handle: n.actor.handle,
            avatarUrl: n.actor.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(n.actor.name)}&background=eef2ff&color=4f46e5&font-size=0.5`,
            role: n.actor.role || 'cidadão', // Ensure role is included
          }
      }));
      setNotifications(formattedNotifications);
      setLoading(false);

      // After displaying, mark them as read in the database
      await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', user.id)
          .eq('is_read', false);
    };

    fetchAndMarkNotifications();
  }, [user.id]);

  const renderNotification = (notification: Notification) => {
    const { actor, type, created_at, entity_id, postTitle, commentContent } = notification;
    const time = timeAgo(created_at);

    const iconClasses = "h-6 w-6 text-white";
    let icon, text;

    const actorName = <span className="font-bold hover:underline" onClick={(e) => { e.stopPropagation(); onViewChange({ view: 'Profile', userId: actor.id })}}>{actor.name.split(' ')[0]}</span>;
    const ideaName = <span className="font-bold text-slate-700">"{postTitle || 'uma ideia'}"</span>;
    const commentText = commentContent ? <span className="text-slate-500 italic">"{commentContent}"</span> : null;

    switch (type) {
      case 'comment':
        icon = <div className="bg-blue-500 p-2 rounded-full"><MessageCircleIcon className={iconClasses} /></div>;
        text = <p className="text-slate-600">{actorName} deixou uma contribuição na sua ideia {ideaName}{commentText && ': '}{commentText}</p>;
        break;
      case 'rating':
        icon = <div className="bg-amber-500 p-2 rounded-full"><StarIcon className={iconClasses} /></div>;
        text = <p className="text-slate-600">Você recebeu um voto na ideia {ideaName}. <span className="text-slate-400">(Os votos são secretos)</span></p>;
        break;
      case 'reply':
        icon = <div className="bg-purple-500 p-2 rounded-full"><MessageCircleIcon className={iconClasses} /></div>;
        text = <p className="text-slate-600">{actorName} respondeu à sua contribuição na ideia {ideaName}{commentText && ': '}{commentText}</p>;
        break;
      case 'comment_agree':
        icon = <div className="bg-green-500 p-2 rounded-full"><ThumbsUpIcon className={iconClasses} /></div>;
        text = <p className="text-slate-600">{actorName} concordou com a sua contribuição na ideia {ideaName}.</p>;
        break;
      case 'comment_disagree':
        icon = <div className="bg-red-500 p-2 rounded-full"><ThumbsDownIcon className={iconClasses} /></div>;
        text = <p className="text-slate-600">{actorName} discordou da sua contribuição na ideia {ideaName}.</p>;
        break;
      default:
        return null;
    }

    const isAnonymous = type === 'rating';

    return (
      <div 
        key={notification.id} 
        className={`flex items-start space-x-4 p-4 rounded-lg cursor-pointer hover:bg-slate-50 ${!notification.is_read ? 'bg-primary-50' : ''}`}
        onClick={() => entity_id && onViewChange({ view: 'PostDetail', postId: entity_id })}
      >
        {isAnonymous ? (
            <div>{icon}</div>
        ) : (
            <div className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onViewChange({ view: 'Profile', userId: actor.id })}}>
                <img src={actor.avatarUrl} alt={actor.name} className="h-10 w-10 rounded-full" />
            </div>
        )}
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