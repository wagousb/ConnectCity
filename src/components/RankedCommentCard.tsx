import React from 'react';
import type { User } from '@/types';
import { ThumbsUpIcon } from '@/components/Icons';
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

export interface RankedComment {
    comment_id: string;
    comment_content: string;
    comment_created_at: string;
    agree_count: number;
    post_id: string;
    post_title: string;
    author: User;
}

interface RankedCommentCardProps {
  rankedComment: RankedComment;
  rank: number;
  onViewChange: (view: { view: string; postId?: string }) => void;
}

const RankedCommentCard: React.FC<RankedCommentCardProps> = ({ rankedComment, rank, onViewChange }) => {
  const { comment_content, agree_count, post_id, post_title, author, comment_created_at } = rankedComment;

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'text-4xl text-amber-500';
    if (rank === 2) return 'text-3xl text-slate-400';
    if (rank === 3) return 'text-2xl text-amber-700';
    return 'text-xl text-slate-500';
  };

  return (
    <div 
      className="flex items-start space-x-4 p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
      onClick={() => onViewChange({ view: 'PostDetail', postId: post_id })}
    >
      <div className={`font-extrabold pt-1 ${getRankStyle(rank)} w-10 text-center flex-shrink-0`}>
        #{rank}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-2">
            <img src={author.avatarUrl} alt={author.name} className="h-8 w-8 rounded-full" />
            <div>
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-semibold text-slate-800 truncate">{author.name}</p>
                    <RoleBadge role={author.role} size="xs" />
                </div>
                <p className="text-xs text-slate-500">@{author.handle} &middot; {timeAgo(comment_created_at)}</p>
            </div>
        </div>
        
        <p className="text-slate-700 my-2">"{comment_content}"</p>
        
        <div className="flex items-center justify-between mt-2 text-sm">
            <p className="text-slate-500 text-xs truncate">
                Na ideia: <span className="font-semibold text-primary hover:underline">{post_title}</span>
            </p>
            <div className="flex items-center space-x-1 text-green-600 font-semibold">
                <ThumbsUpIcon className="h-4 w-4" />
                <span>{agree_count}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RankedCommentCard;