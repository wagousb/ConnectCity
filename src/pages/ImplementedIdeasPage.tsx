import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Post, User, Profile } from '@/types';
import PostCard from '@/components/PostCard';
import { CheckCircleIcon } from '@/components/Icons';

interface ImplementedIdeasPageProps {
  currentUser: User;
  onVote: (postId: string, rating: number) => void;
  onViewChange: (view: { view: string; userId?: string; postId?: string }) => void;
}

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

const ImplementedIdeasPage: React.FC<ImplementedIdeasPageProps> = ({ currentUser, onVote, onViewChange }) => {
  const [implementedPosts, setImplementedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchImplementedPosts = useCallback(async () => {
    setLoading(true);
    
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*, comments(count)')
      .eq('status', 'implemented')
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('Erro ao buscar posts implementados:', postsError);
      setLoading(false);
      return;
    }

    if (!postsData || postsData.length === 0) {
        setImplementedPosts([]);
        setLoading(false);
        return;
    }

    const userIds = [...new Set(postsData.map((post) => post.user_id))];
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);

    if (profilesError) {
      console.error('Erro ao buscar perfis:', profilesError);
      setLoading(false);
      return;
    }
    const profilesMap = new Map(profilesData.map((profile: Profile) => [profile.id, profile]));

    const postIds = postsData.map(p => p.id);
    
    const { data: ratingsData } = await supabase.from('ratings').select('post_id, user_id, rating').in('post_id', postIds);

    const ratingsMap = new Map<string, { total: number; sum: number; userRating?: number }>();
    ratingsData?.forEach(rating => {
        if (!ratingsMap.has(rating.post_id)) {
            ratingsMap.set(rating.post_id, { total: 0, sum: 0 });
        }
        const postRating = ratingsMap.get(rating.post_id)!;
        postRating.total += 1;
        postRating.sum += rating.rating;
        if (rating.user_id === currentUser.id) {
            postRating.userRating = rating.rating;
        }
    });

    const formattedPosts: (Post | null)[] = postsData
      .map(post => {
        const profile = profilesMap.get(post.user_id);
        if (!profile) return null;
        
        const postRating = ratingsMap.get(post.id);

        return {
          id: post.id,
          type: post.type || 'idea',
          title: post.title,
          target_entity: post.target_entity,
          content: post.content,
          imageUrl: post.image_url,
          document_url: post.document_url,
          timestamp: timeAgo(post.created_at),
          author: {
            id: profile.id,
            name: profile.name,
            handle: profile.handle,
            avatarUrl: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=eef2ff&color=4f46e5&font-size=0.5`,
            bannerUrl: profile.banner_url,
            bio: profile.bio,
            role: profile.role || 'cidadão',
            is_moderator: profile.is_moderator,
          },
          comments: (post.comments as any)[0]?.count || 0,
          shares: 0,
          average_rating: postRating ? postRating.sum / postRating.total : 0,
          user_rating: postRating?.userRating || 0,
          total_votes: postRating?.total || 0,
          start_date: post.start_date,
          end_date: post.end_date,
          project_status: post.project_status,
        };
      });

    setImplementedPosts(formattedPosts.filter((p): p is Post => p !== null));
    setLoading(false);
  }, [currentUser.id]);

  useEffect(() => {
    fetchImplementedPosts();
  }, [fetchImplementedPosts]);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <h1 className="text-2xl font-bold mb-6 flex items-center space-x-3">
        <CheckCircleIcon className="h-7 w-7 text-green-600 fill-green-600" />
        <span>Ideias que Viraram Realidade</span>
      </h1>
      <p className="text-slate-500 mb-6">Celebre as ideias da comunidade que foram implementadas e fizeram a diferença na cidade!</p>
      
      {loading ? (
        <p className="text-slate-500 text-center py-8">Carregando ideias implementadas...</p>
      ) : implementedPosts.length === 0 ? (
        <p className="text-slate-500 text-center py-8">Nenhuma ideia foi marcada como implementada ainda. Continue contribuindo!</p>
      ) : (
        <div className="space-y-6">
          {implementedPosts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              currentUser={currentUser} 
              onVote={onVote} 
              onViewChange={onViewChange} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImplementedIdeasPage;