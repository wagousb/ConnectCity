import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Comment as CommentType } from '@/types';
import Contribution from './Contribution';

interface ContributionsSectionProps {
  postId: string;
  postAuthorId: string;
  currentUser: User;
}

const ContributionsSection: React.FC<ContributionsSectionProps> = ({ postId, postAuthorId, currentUser }) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .rpc('get_comments_with_votes', { post_id_param: postId, user_id_param: currentUser.id });

    if (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    } else {
      const commentsData: CommentType[] = data.map((c: any) => ({
        id: c.id,
        content: c.content,
        created_at: c.created_at,
        post_id: c.post_id,
        parent_comment_id: c.parent_comment_id,
        is_deleted: c.is_deleted,
        author: {
          id: c.user_id,
          name: c.author_name,
          handle: c.author_handle,
          avatarUrl: c.author_avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.author_name || 'U')}&background=eef2ff&color=4f46e5&font-size=0.5`,
          role: c.author_role || 'cidadão',
        },
        agree_count: c.agree_count,
        disagree_count: c.disagree_count,
        user_vote: c.user_vote,
        replies: [],
      }));

      const commentMap = new Map(commentsData.map((c: CommentType) => [c.id, c]));
      const rootComments: CommentType[] = [];
      commentsData.forEach((c: CommentType) => {
        if (c.parent_comment_id && commentMap.has(c.parent_comment_id)) {
          commentMap.get(c.parent_comment_id)!.replies.push(c);
        } else {
          rootComments.push(c);
        }
      });
      setComments(rootComments);
    }
    setLoading(false);
  }, [postId, currentUser.id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handlePostComment = async (content: string, parentId: string | null = null) => {
    if (!content.trim()) return;
    setIsPosting(true);
    const { data: newCommentData, error } = await supabase.from('comments').insert({
      post_id: postId,
      user_id: currentUser.id,
      content: content,
      parent_comment_id: parentId,
    }).select().single();

    if (error) {
      console.error('Error posting comment:', error);
    } else {
      setNewComment('');
      await fetchComments();
      
      if (!parentId && currentUser.id !== postAuthorId) {
        await supabase.from('notifications').insert({
            user_id: postAuthorId,
            actor_id: currentUser.id,
            type: 'comment',
            entity_id: postId,
            comment_id: newCommentData.id
        });
      }

      if (parentId) {
        const { data: parentComment } = await supabase.from('comments').select('user_id').eq('id', parentId).single();
        if (parentComment && parentComment.user_id !== currentUser.id) {
            await supabase.from('notifications').insert({
                user_id: parentComment.user_id,
                actor_id: currentUser.id,
                type: 'reply',
                entity_id: postId,
                comment_id: newCommentData.id
            });
        }
      }
    }
    setIsPosting(false);
  };

  const handleCommentUpdated = (commentId: string, updates: Partial<CommentType>) => {
    const updateCommentInTree = (commentList: CommentType[]): CommentType[] => {
        return commentList.map(c => {
            if (c.id === commentId) {
                return { ...c, ...updates };
            }
            if (c.replies && c.replies.length > 0) {
                return { ...c, replies: updateCommentInTree(c.replies) };
            }
            return c;
        });
    };
    setComments(prevComments => updateCommentInTree(prevComments));
  };

  const handleCommentVote = async (comment: CommentType, voteType: 'agree' | 'disagree') => {
    const originalComments = JSON.parse(JSON.stringify(comments));
    
    let newOptimisticComment = { ...comment };
    const isRemovingVote = newOptimisticComment.user_vote === voteType;
    const isSwitchingVote = newOptimisticComment.user_vote && newOptimisticComment.user_vote !== voteType;

    if (isRemovingVote) {
      newOptimisticComment.user_vote = null;
      if (voteType === 'agree') newOptimisticComment.agree_count--; else newOptimisticComment.disagree_count--;
    } else if (isSwitchingVote) {
      newOptimisticComment.user_vote = voteType;
      if (voteType === 'agree') { newOptimisticComment.agree_count++; newOptimisticComment.disagree_count--; } else { newOptimisticComment.agree_count--; newOptimisticComment.disagree_count++; }
    } else {
      newOptimisticComment.user_vote = voteType;
      if (voteType === 'agree') newOptimisticComment.agree_count++; else newOptimisticComment.disagree_count++;
    }
    
    handleCommentUpdated(comment.id, newOptimisticComment);

    const isFirstVote = !comment.user_vote;

    let error;
    if (isRemovingVote) {
      ({ error } = await supabase.from('comment_votes').delete().match({ comment_id: comment.id, user_id: currentUser.id }));
    } else {
      ({ error } = await supabase.from('comment_votes').upsert({ comment_id: comment.id, user_id: currentUser.id, vote_type: voteType }, { onConflict: 'comment_id, user_id' }));
    }

    if (error) {
      console.error('Error voting:', error);
      setComments(originalComments);
    } else {
      if (!isRemovingVote && isFirstVote && currentUser.id !== comment.author.id) {
        await supabase.from('notifications').insert({
            user_id: comment.author.id,
            actor_id: currentUser.id,
            type: voteType === 'agree' ? 'comment_agree' : 'comment_disagree',
            entity_id: comment.post_id,
            comment_id: comment.id
        });
      }
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-200">
      {loading ? (
        <p className="text-slate-500 text-sm text-center">Carregando contribuições...</p>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <Contribution 
              key={comment.id} 
              comment={comment} 
              currentUser={currentUser} 
              onPostReply={handlePostComment} 
              onVote={handleCommentVote} 
              onCommentUpdated={handleCommentUpdated}
            />
          ))}
          {comments.length === 0 && <p className="text-slate-500 text-sm text-center py-4">Nenhuma contribuição ainda. Seja o primeiro!</p>}
        </div>
      )}

      <div className="flex space-x-3 mt-4 pt-4 border-t border-slate-100">
        <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escreva sua contribuição..."
            className="w-full text-sm border-slate-200 border rounded-lg p-2 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-200"
            rows={2}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={() => handlePostComment(newComment)}
              disabled={isPosting || !newComment.trim()}
              className="bg-primary text-white font-semibold px-4 py-1.5 rounded-full text-sm hover:bg-primary-700 transition-colors disabled:bg-primary-300"
            >
              {isPosting ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributionsSection;