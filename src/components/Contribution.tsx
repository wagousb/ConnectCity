import React, { useState } from 'react';
import type { Comment as CommentType, User } from '@/types';
import { ThumbsUpIcon, ThumbsDownIcon, TrashIcon } from './Icons';
import RoleBadge from './RoleBadge';
import { supabase } from '@/integrations/supabase/client';

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
  onVote: (comment: CommentType, voteType: 'agree' | 'disagree') => void;
  onCommentDeleted: (commentId: string) => void; // Nova prop para notificar a seção pai
}

const Contribution: React.FC<ContributionProps> = ({ comment, currentUser, onPostReply, onVote, onCommentDeleted }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isPostingReply, setIsPostingReply] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const isAuthor = comment.author.id === currentUser.id;

  const handleVoteClick = async (voteType: 'agree' | 'disagree') => {
    if (isVoting) return;
    setIsVoting(true);
    await onVote(comment, voteType);
    setIsVoting(false);
  };

  const handleReplySubmit = async () => {
    setIsPostingReply(true);
    await onPostReply(replyContent, comment.id);
    setIsPostingReply(false);
    setReplyContent('');
    setIsReplying(false);
  };

  const handleDeleteComment = async () => {
    if (!window.confirm('Tem certeza que deseja excluir esta contribuição?')) return;

    // Exclusão otimista
    setIsDeleted(true);

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', comment.id);

    if (error) {
      console.error('Error deleting comment:', error);
      setIsDeleted(false); // Reverte se houver erro
      alert('Erro ao excluir o comentário. Tente novamente.');
    } else {
      // Notifica o componente pai (ContributionsSection) para remover o comentário da lista
      onCommentDeleted(comment.id);
    }
  };

  if (isDeleted) {
    return (
      <div className="flex items-start space-x-3 opacity-50 italic text-slate-500">
        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center"></div>
        <div className="flex-1 bg-slate-50 rounded-lg p-3">
          <p className="text-sm">Comentário excluído pelo usuário.</p>
        </div>
      </div>
    );
  }

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
            <span className="font-bold text-sm">{comment.author.name.split(' ')[0]}</span>
            <span className="text-xs text-slate-500">@{comment.author.handle}</span>
            <span className="text-xs text-slate-400">&middot; {timeAgo(comment.created_at)}</span>
          </div>
          <p className="text-sm text-slate-800 mt-1">{comment.content}</p>
        </div>
        <div className="flex items-center space-x-4 mt-1 text-xs text-slate-500 font-medium">
          <button 
            onClick={() => handleVoteClick('agree')} 
            disabled={isVoting}
            className={`flex items-center space-x-1 hover:text-green-600 ${comment.user_vote === 'agree' ? 'text-green-600' : ''} disabled:opacity-50`}
          >
            <ThumbsUpIcon className="h-4 w-4" />
            <span>{comment.agree_count} Concordo</span>
          </button>
          <button 
            onClick={() => handleVoteClick('disagree')} 
            disabled={isVoting}
            className={`flex items-center space-x-1 hover:text-red-600 ${comment.user_vote === 'disagree' ? 'text-red-600' : ''} disabled:opacity-50`}
          >
            <ThumbsDownIcon className="h-4 w-4" />
            <span>{comment.disagree_count} Discordo</span>
          </button>
          <button onClick={() => setIsReplying(!isReplying)} className="hover:underline">Responder</button>
          
          {isAuthor && (
            <button 
              onClick={handleDeleteComment}
              className="p-1 rounded-full text-slate-400 hover:text-red-600 transition-colors"
              title="Excluir comentário"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {(comment.replies && comment.replies.length > 0) || isReplying ? (
          <div className="mt-3 space-y-3 pl-6 border-l-2 border-slate-100">
            {comment.replies && comment.replies.map(reply => (
              <Contribution 
                key={reply.id} 
                comment={reply} 
                currentUser={currentUser} 
                onPostReply={onPostReply} 
                onVote={onVote} 
                onCommentDeleted={onCommentDeleted} // Passa a prop para os replies
              />
            ))}
            
            {isReplying && (
              <div className="flex space-x-3 pt-3">
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`Respondendo a ${comment.author.name.split(' ')[0]}...`}
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