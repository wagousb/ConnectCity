import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@/types';
import RankedCommentCard, { type RankedComment } from '@/components/RankedCommentCard';
import { ThumbsUpIcon } from '@/components/Icons';

interface CommentRankingPageProps {
  onViewChange: (view: { view: string; postId?: string }) => void;
}

const CommentRankingPage: React.FC<CommentRankingPageProps> = ({ onViewChange }) => {
  const [rankedComments, setRankedComments] = useState<RankedComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankedComments = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_ranked_comments');

      if (error) {
        console.error('Error fetching ranked comments:', error);
      } else {
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
        setRankedComments(formattedComments);
      }
      setLoading(false);
    };

    fetchRankedComments();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <h1 className="text-2xl font-bold mb-6 flex items-center space-x-3">
        <ThumbsUpIcon className="h-7 w-7 text-green-600" />
        <span>Top Contribuições</span>
      </h1>
      <p className="text-slate-500 mb-6">As contribuições mais apoiadas pela comunidade, classificadas pelo número de 'Concordo'.</p>
      
      {loading ? (
        <p className="text-slate-500 text-center py-8">Carregando ranking...</p>
      ) : rankedComments.length === 0 ? (
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
    </div>
  );
};

export default CommentRankingPage;