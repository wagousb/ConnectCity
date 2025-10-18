import React, { useState } from 'react';
import type { Post, User } from '@/types';
import { HeartIcon, MessageCircleIcon, StarIcon, BookmarkIconSolid, BookmarkIcon, PaperclipIcon } from '@/components/Icons';
import { supabase } from '@/integrations/supabase/client';

interface PostCardProps {
  post: Post;
  currentUser: User;
  onToggleSave: (postId: string) => void;
  onToggleLike: (postId: string, isLiked: boolean) => void;
  onVote: (postId: string, rating: number) => void;
  onViewChange: (view: { view: string; userId?: string }) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onToggleSave, onToggleLike, onVote, onViewChange }) => {
  const [isVoting, setIsVoting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const getEntityBadgeColor = (entity: string) => {
    switch (entity) {
      case 'Poder Executivo (prefeitura)': return 'bg-blue-100 text-blue-800';
      case 'Poder legislativo (Câmara dos vereadores)': return 'bg-green-100 text-green-800';
      case 'Secretaria': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const handleVote = async (rating: number) => {
    if (!currentUser) return;

    const { error } = await supabase.from('ratings').upsert(
        { post_id: post.id, user_id: currentUser.id, rating },
        { onConflict: 'post_id, user_id' }
    );

    if (error) {
        console.error("Error voting:", error);
    } else {
        onVote(post.id, rating);
        setIsVoting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <div className="flex items-start justify-between">
        <div 
          className="flex items-center space-x-4 cursor-pointer"
          onClick={() => onViewChange({ view: 'Profile', userId: post.author.id })}
        >
          <img src={post.author.avatarUrl} alt={post.author.name} className="h-12 w-12 rounded-full" />
          <div>
            <p className="font-bold hover:underline">{post.author.name}</p>
            <p className="text-sm text-slate-500">@{post.author.handle} &middot; {post.timestamp}</p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getEntityBadgeColor(post.target_entity)}`}>
          Para: {post.target_entity}
        </span>
      </div>
      
      <div className="mt-4">
        <h3 className="text-xl font-bold text-slate-800">{post.title}</h3>
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
        <button 
          className={`flex items-center space-x-2 hover:text-red-500 ${post.isLiked ? 'text-red-500' : ''}`}
          onClick={() => onToggleLike(post.id, post.isLiked || false)}
        >
          <HeartIcon className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">{post.likes} Curtidas</span>
        </button>
        <button className="flex items-center space-x-2 hover:text-blue-500">
          <MessageCircleIcon className="h-5 w-5" />
          <span className="text-sm font-medium">{post.comments} Considerações</span>
        </button>
        <button 
          className="flex items-center space-x-2 hover:text-amber-500"
          onClick={() => setIsVoting(!isVoting)}
        >
          <StarIcon className="h-5 w-5" />
          <span className="text-sm font-medium">Votar</span>
        </button>
        <button 
          className={`flex items-center space-x-2 hover:text-primary ${post.saved ? 'text-primary' : ''}`}
          onClick={() => onToggleSave(post.id)}
        >
          {post.saved ? <BookmarkIconSolid className="h-5 w-5" /> : <BookmarkIcon className="h-5 w-5" />}
          <span className="text-sm font-medium">{post.saved ? 'Salvo' : 'Salvar'}</span>
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
    </div>
  );
};

export default PostCard;