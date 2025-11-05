import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Post, User, Profile } from '@/types';
import RankingCard from '@/components/RankingCard';
import RankedCommentCard, { type RankedComment } from '@/components/RankedCommentCard';
import { StarIcon, ThumbsUpIcon } from '@/components/Icons';

interface RankingPageProps {
  currentUser: User;
  onViewChange: (view: { view: string; postId?: string }) => void;
}

const RankingPage: React.FC<RankingPageProps> = ({ onViewChange }) => {
  const [activeTab, setActiveTab] = useState<'ideas' | 'contributions'>('ideas');
  const [rankedPosts, setRankedPosts] = useState<Post[]>([]);
  const [rankedComments, setRankedComments] = useState<RankedComment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRankedPosts = useCallback(async () => {
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('id, user_id, title, target_entity, content, image_url, document_url, created_at, comments(count), start_date, end_date, project_status, type');

    if (postsError) {
      console.error('Erro ao buscar posts para ranking:', postsError);
      return [];
    }

    const userIds = [...new Set(postsData.map(p => p.user_id))];
    const { data: profilesData } = await supabase.from('profiles').select('*').in('id', userIds);
    const profilesMap = new Map(profilesData?.map((profile: Profile) => [profile.id, profile]));

    const postIds = postsData.map(p => p.id);
    const { data: ratingsData } = await supabase.from('ratings').select('post_id, rating').in('post_id', postIds);
    
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
          type: post.type || 'idea',
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

    return postsWithRatings;
  }, []);

  const fetchRankedComments = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_ranked_comments');

    if (error) {
      console.error('Error fetching ranked comments:', error);
      return [];
    }

    const formattedComments: RankedComment[] = data.map((c: any) => ({
      comment_id: c.comment_id,
      comment_content: c.comment_content,
      comment_created_at: c.comment_created_at,
      agree_count: c.agree_count,
      post_id: c.post_id,
      post_title: c.post_title,
      author: {
        id: c.author_id,
        name: c.author_name,
        handle: c.author_handle,
        avatarUrl: c.author_avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.author_name || 'U')}&background=eef2ff&color=4f46e5&font-size=0.5`,
        role: c.author_role || 'cidadão',
      } as User,
    }));
    return formattedComments;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [posts, comments] = await Promise.all([
        fetchRankedPosts(),
        fetchRankedComments(),
      ]);
      setRankedPosts(posts);
      setRankedComments(comments);
      setLoading(false);
    };

    fetchData();
  }, [fetchRankedPosts, fetchRankedComments]);

  const renderIdeasRanking = () => (
    <>
      <p className="text-slate-500 mb-6">As ideias mais bem avaliadas pela comunidade, ordenadas por média de nota e número de votos.</p>
      {rankedPosts.length === 0 ? (
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
    </>
  );

  const renderCommentsRanking = () => (
    <>
      <p className="text-slate-500 mb-6">As contribuições mais apoiadas pela comunidade, classificadas pelo número de 'Concordo'.</p>
      {rankedComments.length === 0 ? (
        <p className="text-slate-500 text-center py-8">Nenhuma contribuição foi votada ainda.</p>
      ) : (
        <div className="space-y-4">
          {rankedComments.map((comment, index) => (
            <RankedCommentCard 
              key={comment.comment_id} 
              rankedComment={comment} 
              rank={index + 1} 
              onViewChange={onViewChange} 
            />
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <h1 className="text-2xl font-bold mb-6">Ranking da Comunidade</h1>
      
      <div className="border-b border-slate-200 mb-6">
        <nav className="flex -mb-px space-x-6">
          <button
            onClick={() => setActiveTab('ideas')}
            className={`flex items-center space-x-2 py-3 px-1 font-semibold text-sm transition-colors duration-200 ${activeTab === 'ideas' ? 'border-b-2 border-primary text-primary' : 'border-b-2 border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}
          >
            <StarIcon className="h-5 w-5" />
            <span>Ideias</span>
          </button>
          <button
            onClick={() => setActiveTab('contributions')}
            className={`flex items-center space-x-2 py-3 px-1 font-semibold text-sm transition-colors duration-200 ${activeTab === 'contributions' ? 'border-b-2 border-primary text-primary' : 'border-b-2 border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}
          >
            <ThumbsUpIcon className="h-5 w-5" />
            <span>Contribuições</span>
          </button>
        </nav>
      </div>

      {loading ? (
        <p className="text-slate-500 text-center py-8">Carregando rankings...</p>
      ) : (
        <div>
          {activeTab === 'ideas' && renderIdeasRanking()}
          {activeTab === 'contributions' && renderCommentsRanking()}
        </div>
      )}
    </div>
  );
};

export default RankingPage;