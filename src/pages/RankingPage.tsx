import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Post, User, Profile } from '@/types';
import RankingCard from '@/components/RankingCard';
import { StarIcon } from '@/components/Icons';

interface RankingPageProps {
  currentUser: User;
  onViewChange: (view: { view: string; postId?: string }) => void;
}

const RankingPage: React.FC<RankingPageProps> = ({ onViewChange }) => {
  const [rankedPosts, setRankedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRankedPosts = useCallback(async () => {
    setLoading(true);
    
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('id, user_id, title, target_entity, content, image_url, document_url, created_at, comments(count), start_date, end_date, project_status');

    if (postsError) {
      console.error('Erro ao buscar posts para ranking:', postsError);
      setLoading(false);
      return;
    }

    const userIds = [...new Set(postsData.map(p => p.user_id))];

    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);
    
    if (profilesError) {
        console.error('Erro ao buscar perfis para ranking:', profilesError);
        setLoading(false);
        return;
    }
    const profilesMap = new Map(profilesData.map((profile: Profile) => [profile.id, profile]));

    const { data: ratingsData, error: ratingsError } = await supabase
        .from('ratings')
        .select('post_id, rating');
    
    if (ratingsError) console.error('Erro ao buscar avaliações para ranking:', ratingsError);

    const ratingsMap = new Map<string, { total: number; sum: number }>();
    ratingsData?.forEach(rating => {
        if (!ratingsMap.has(rating.post_id)) {
            ratingsMap.set(rating.post_id, { total: 0, sum: 0 });
        }
        const postRating = ratingsMap.get(rating.post_id)!;
        postRating.total += 1;
        postRating.sum += rating.rating;
    });

    const postsWithRatings = postsData
      .map(post => {
        const profile = profilesMap.get(post.user_id);
        if (!profile) return null;
        
        const postRating = ratingsMap.get(post.id);
        const totalVotes = postRating?.total || 0;
        const averageRating = totalVotes > 0 ? postRating!.sum / totalVotes : 0;

        const authorUser: User = {
            id: profile.id,
            name: profile.name || 'Usuário',
            handle: profile.handle || 'usuário',
            avatarUrl: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'U')}&background=eef2ff&color=4f46e5&font-size=0.5`,
            role: profile.role || 'cidadão',
            bannerUrl: profile.banner_url,
            bio: profile.bio,
            date_of_birth: profile.date_of_birth,
            is_public: profile.is_public,
            notifications_on_likes: profile.notifications_on_likes,
            notifications_on_comments: profile.notifications_on_comments,
            notifications_on_new_followers: profile.notifications_on_new_followers,
            is_moderator: profile.is_moderator,
        };

        return {
          id: post.id,
          title: post.title,
          target_entity: post.target_entity,
          content: post.content,
          imageUrl: post.image_url,
          document_url: post.document_url,
          timestamp: new Date(post.created_at).toLocaleDateString(),
          author: authorUser,
          comments: (post.comments as any)[0]?.count || 0,
          shares: 0,
          average_rating: averageRating,
          user_rating: 0, 
          total_votes: totalVotes,
          start_date: post.start_date,
          end_date: post.end_date,
          project_status: post.project_status,
        } as Post;
      })
      .filter((p): p is Post => p !== null);

    postsWithRatings.sort((a, b) => {
        if (b.average_rating !== a.average_rating) {
            return b.average_rating! - a.average_rating!;
        }
        return b.total_votes! - a.total_votes!;
    });

    setRankedPosts(postsWithRatings);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRankedPosts();
  }, [fetchRankedPosts]);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <h1 className="text-2xl font-bold mb-6 flex items-center space-x-3">
        <StarIcon className="h-7 w-7 text-amber-500 fill-amber-500" />
        <span>Ranking de Ideias</span>
      </h1>
      <p className="text-slate-500 mb-6">As ideias mais bem avaliadas pela comunidade, ordenadas por média de nota e número de votos.</p>
      
      {loading ? (
        <p className="text-slate-500 text-center py-8">Carregando ranking...</p>
      ) : rankedPosts.length === 0 ? (
        <p className="text-slate-500 text-center py-8">Nenhuma ideia avaliada ainda.</p>
      ) : (
        <div className="space-y-4">
          {rankedPosts.map((post, index) => (
            <RankingCard 
              key={post.id} 
              post={post} 
              rank={index + 1} 
              onViewChange={onViewChange} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RankingPage;