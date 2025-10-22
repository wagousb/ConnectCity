import React from 'react';
import type { Post } from '@/types';
import { StarIcon, MessageCircleIcon } from '@/components/Icons';
import RoleBadge from './RoleBadge';

interface RankingCardProps {
  post: Post;
  rank: number;
  onViewChange: (view: { view: string; postId?: string }) => void;
}

const RankingCard: React.FC<RankingCardProps> = ({ post, rank, onViewChange }) => {
  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'text-4xl text-amber-500';
    if (rank === 2) return 'text-3xl text-slate-400';
    if (rank === 3) return 'text-2xl text-amber-700';
    return 'text-xl text-slate-500';
  };

  return (
    <div 
      className="flex items-start space-x-4 p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
      onClick={() => onViewChange({ view: 'PostDetail', postId: post.id })}
    >
      <div className={`font-extrabold pt-1 ${getRankStyle(rank)} w-10 text-center flex-shrink-0`}>
        #{rank}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
            <img src={post.author.avatarUrl} alt={post.author.name} className="h-6 w-6 rounded-full" />
            <p className="text-sm font-semibold text-slate-800 truncate">{post.author.name.split(' ')[0]}</p>
            <RoleBadge role={post.author.role} size="xs" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 truncate hover:underline">
          {post.title}
        </h3>
        <p className="text-sm text-slate-500 truncate mt-1">{post.content}</p>
        
        <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
          <div className="flex items-center space-x-1">
            <StarIcon className="h-4 w-4 text-amber-400 fill-amber-400" />
            <span>{post.average_rating?.toFixed(1)} ({post.total_votes} votos)</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageCircleIcon className="h-4 w-4" />
            <span>{post.comments} contribuições</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingCard;