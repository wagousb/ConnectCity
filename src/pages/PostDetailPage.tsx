import React from 'react';
import type { Post, User } from '@/types';
import PostCard from '@/components/PostCard';
import ContributionsSection from '@/components/ContributionsSection';
import { ArrowLeftIcon } from '@/components/Icons';

interface PostDetailPageProps {
  post: Post;
  currentUser: User;
  onVote: (postId: string, rating: number) => void;
  onViewChange: (view: { view: string; userId?: string; postId?: string }) => void;
}

const PostDetailPage: React.FC<PostDetailPageProps> = ({ post, currentUser, onVote, onViewChange }) => {
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <button 
          onClick={() => onViewChange({ view: 'Feed' })} 
          className="flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-primary"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Voltar para o Feed</span>
        </button>
      </div>
      <PostCard post={post} currentUser={currentUser} onVote={onVote} onViewChange={onViewChange} />
    </div>
  );
};

export default PostDetailPage;