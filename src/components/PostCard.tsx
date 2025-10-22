import React, { useState } from 'react';
import type { Post, User } from '@/types';
import { MessageCircleIcon, StarIcon, PaperclipIcon } from '@/components/Icons';
import { supabase } from '@/integrations/supabase/client';
import ContributionsSection from './ContributionsSection';
import RoleBadge from './RoleBadge';

interface PostCardProps {
  post: Post;
  currentUser: User;
  onVote: (postId: string, rating: number) => void;
  onViewChange: (view: { view: string; userId?: string; postId?: string }) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onVote, onViewChange }) => {
  const [isVoting, setIsVoting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  const getEntityBadgeColor = (entity: string) => {
    switch (entity) {
      case 'Prefeitura': return 'bg-blue-100 text-blue-800';
      case 'Câmara de Vereadores': return 'bg-green-100 text-green-800';
      case 'Secretários': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const handleVote = async (rating: number) => {
    if (!currentUser) return;

    const isFirstVote = !post.user_rating || post.user_rating === 0;

    const { error } = await supabase.from('ratings').upsert(
        { post_id: post.id, user_id: currentUser.id, rating },
        { onConflict: 'post_id, user_id' }
    );

    if (error) {
        console.error("Error voting:", error);
    } else {
        onVote(post.id, rating);
        setIsVoting(false);
        if (isFirstVote && currentUser.id !== post.author.id) {
            await supabase.from('notifications').insert({
                user_id: post.author.id,
                actor_id: currentUser.id,
                type: 'rating',
                entity_id: post.id
            });
        }
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div 
            className="relative cursor-pointer"
            onClick={() => onViewChange({ view: 'Profile', userId: post.author.id })}
          >
            <img src={post.author.avatarUrl} alt={post.author.name} className="h-12 w-12 rounded-full" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-max">
              <RoleBadge role={post.author.role} size="xs" />
            </div>
          </div>
          <div 
            className="cursor-pointer pt-2"
            onClick={() => onViewChange({ view: 'Profile', userId: post.author.id })}
          >
            <p className="font-bold hover:underline">{post.author.name.split(' ')[0]}</p>
            <p className="text-sm text-slate-500">@{post.author.handle} &middot; {post.timestamp}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <p className="text-xs font-semibold text-slate-500 mb-1">
          Para: 
          <span className={`ml-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${getEntityBadgeColor(post.target_entity)}`}>
            {post.target_entity}
          </span>
        </p>
        <h3 
          className="text-xl font-bold text-slate-800 hover:underline cursor-pointer mt-2"
          onClick={() => onViewChange({ view: 'PostDetail', postId: post.id })}
        >
          {post.title}
        </h3>
        <p className="my-2 text-slate-700 whitespace-pre-wrap">{post.content}</p>
      </div>

      {post.imageUrl && (
        <div className="my-4">
          <img src={post.imageUrl} alt="Imagem do projeto" className="rounded-lg w-full object-cover" />
        </div>
      )}

      {post.document_url && (
        <div className="my-4">
          <a 
            href={post.document_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 p-3 rounded-lg transition-colors"
          >
            <PaperclipIcon className="h-5 w-5 text-slate-600" />
            <span className="text-sm font-medium text-primary hover:underline">Ver documento anexado (PDF)</span>
          </a>
        </div>
      )}

      <div className="flex items-center justify-between text-slate-500 pt-4 border-t border-slate-200">
        <button onClick={() => setIsCommentsOpen(!isCommentsOpen)} className="flex items-center space-x-2 hover:text-blue-500">
          <MessageCircleIcon className="h-5 w-5" />
          <span className="text-sm font-medium">{post.comments} Contribuições</span>
        </button>
        <button 
          className="flex items-center space-x-2 hover:text-amber-500"
          onClick={() => setIsVoting(!isVoting)}
        >
          <StarIcon className={`h-5 w-5 transition-colors ${post.user_rating && post.user_rating > 0 ? 'text-amber-400 fill-amber-400' : (post.average_rating && post.average_rating > 0 ? 'text-amber-400' : '')}`} />
          {post.total_votes && post.total_votes > 0 ? (
            <span className="text-sm font-medium">
              {post.average_rating?.toFixed(1)} ({post.total_votes} {post.total_votes === 1 ? 'voto' : 'votos'})
            </span>
          ) : (
            <span className="text-sm font-medium">{post.user_rating && post.user_rating > 0 ? 'Avaliado' : 'Votar'}</span>
          )}
        </button>
      </div>

      {isVoting && (
        <div className="flex items-center justify-center space-x-1 mt-4 border-t border-slate-200 pt-4">
            {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                    key={star}
                    className={`h-8 w-8 cursor-pointer transition-colors ${
                        (hoverRating || post.user_rating || 0) >= star 
                        ? 'text-amber-400 fill-amber-400' 
                        : 'text-slate-300'
                    }`}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleVote(star)}
                />
            ))}
        </div>
      )}

      {isCommentsOpen && <ContributionsSection postId={post.id} postAuthorId={post.author.id} currentUser={currentUser} />}
    </div>
  );
};

export default PostCard;