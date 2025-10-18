import React, { useState } from 'react';
import type { Comment as CommentType, User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { ThumbsUpIcon, ThumbsDownIcon } from './Icons';
import RoleBadge from './RoleBadge';

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

interface ContributionProps {
  comment: CommentType;
  currentUser: User;
  onPostReply: (content: string, parentId: string | null) => Promise<void>;
  onVote: () => void;
}

const Contribution: React.FC<ContributionProps> = ({ comment, currentUser, onPostReply, onVote }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isPostingReply, setIsPostingReply] = useState(false);

  const handleVote = async (voteType: 'agree' | 'disagree') => {
    const isRemovingVote = comment.user_vote === voteType;
    const isFirstVote = !comment.user_vote;

    if (isRemovingVote) {
      const { error } = await supabase.from('comment_votes').delete().match({ comment_id: comment.id, user_id: currentUser.id });
      if (error) console.error('Error removing vote:', error);
      else onVote();
      return;
    }

    const { error } = await supabase.from('comment_votes').upsert(
      { comment_id: comment.id, user_id: currentUser.id, vote_type: voteType },
      { onConflict: 'comment_id, user_id' }
    );
    if (error) {
      console.error('Error voting:', error);
    } else {
      onVote();
      if (isFirstVote && currentUser.id !== comment.author.id) {
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

  const handleReplySubmit = async () => {
    setIsPostingReply(true);
    await onPostReply(replyContent, comment.id);
    setIsPostingReply(false);
    setReplyContent('');
    setIsReplying(false);
  };

  return (
    <div className="flex items-start space-x-3">
      <div className="flex flex-col items-center">
        <img src={comment.author.avatarUrl} alt={comment.author.name} className="h-10 w-10 rounded-full" />
        <div className="mt-1">
          <RoleBadge role={comment.author.role} size="xs" />
        </div>
      </div>
      <div className="flex-1">
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm">{comment.author.name}</span>
            <span className="text-xs text-slate-500">@{comment.author.handle}</span>
            <span className="text-xs text-slate-400">&middot; {timeAgo(comment.created_at)}</span>
          </div>
          <p className="text-sm text-slate-800 mt-1">{comment.content}</p>
        </div>
        <div className="flex items-center space-x-4 mt-1 text-xs text-slate-500 font-medium">
          <button onClick={() => handleVote('agree')} className={`flex items-center space-x-1 hover:text-green-600 ${comment.user_vote === 'agree' ? 'text-green-600' : ''}`}>
            <ThumbsUpIcon className="h-4 w-4" />
            <span>{comment.agree_count} Concordo</span>
          </button>
          <button onClick={() => handleVote('disagree')} className={`flex items-center space-x-1 hover:text-red-600 ${comment.user_vote === 'disagree' ? 'text-red-600' : ''}`}>
            <ThumbsDownIcon className="h-4 w-4" />
            <span>{comment.disagree_count} Discordo</span>
          </button>
          <button onClick={() => setIsReplying(!isReplying)} className="hover:underline">Responder</button>
        </div>

        {(comment.replies && comment.replies.length > 0) || isReplying ? (
          <div className="mt-3 space-y-3 pl-6 border-l-2 border-slate-100">
            {comment.replies && comment.replies.map(reply => (
              <Contribution key={reply.id} comment={reply} currentUser={currentUser} onPostReply={onPostReply} onVote={onVote} />
            ))}
            
            {isReplying && (
              <div className="flex space-x-3 pt-3">
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`Respondendo a ${comment.author.name}...`}
                    className="w-full text-sm border-slate-200 border rounded-lg p-2 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-200"
                    rows={2}
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button onClick={() => setIsReplying(false)} className="text-slate-500 text-xs font-semibold px-3 py-1 rounded-full hover:bg-slate-100">Cancelar</button>
                    <button
                      onClick={handleReplySubmit}
                      disabled={isPostingReply || !replyContent.trim()}
                      className="bg-primary text-white font-semibold px-3 py-1 rounded-full text-xs hover:bg-primary-700 transition-colors disabled:bg-primary-300"
                    >
                      {isPostingReply ? 'Enviando...' : 'Responder'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Contribution;