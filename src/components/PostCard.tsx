import React from 'react';
import type { Post } from '@/types';
import { HeartIcon, MessageCircleIcon, ShareIcon, BookmarkIconSolid, BookmarkIcon } from '@/components/Icons';

interface PostCardProps {
  post: Post;
  onToggleSave: (postId: string) => void;
  onToggleLike: (postId: string, isLiked: boolean) => void;
  onViewChange: (view: { view: string; userId?: string }) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onToggleSave, onToggleLike, onViewChange }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
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
      <p className="my-4 text-slate-700 whitespace-pre-wrap">{post.content}</p>
      {post.imageUrl && (
        <div className="my-4">
          <img src={post.imageUrl} alt="Post content" className="rounded-lg w-full object-cover" />
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
          <span className="text-sm font-medium">{post.comments} Comentários</span>
        </button>
        <button className="flex items-center space-x-2 hover:text-green-500">
          <ShareIcon className="h-5 w-5" />
          <span className="text-sm font-medium">{post.shares} Compart.</span>
        </button>
        <button 
          className={`flex items-center space-x-2 hover:text-primary ${post.saved ? 'text-primary' : ''}`}
          onClick={() => onToggleSave(post.id)}
        >
          {post.saved ? <BookmarkIconSolid className="h-5 w-5" /> : <BookmarkIcon className="h-5 w-5" />}
          <span className="text-sm font-medium">{post.saved ? 'Salvo' : 'Salvar'}</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;