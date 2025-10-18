import React from 'react';
import type { Post, User } from '@/types';
import PostComposer from '@/components/PostComposer';
import PostCard from '@/components/PostCard';

interface FeedPageProps {
    user: User;
    posts: Post[];
    onToggleSave: (postId: string) => void;
    onToggleLike: (postId: string, isLiked: boolean) => void;
    onPostPublished: () => void;
    onViewChange: (view: { view: string; userId?: string }) => void;
}

const FeedPage: React.FC<FeedPageProps> = ({ user, posts, onToggleSave, onToggleLike, onPostPublished, onViewChange }) => {
    return (
        <div className="space-y-6">
            <PostComposer user={user} onPostPublished={onPostPublished} />
            {posts.map(post => (
                <PostCard key={post.id} post={post} onToggleSave={onToggleSave} onToggleLike={onToggleLike} onViewChange={onViewChange} />
            ))}
        </div>
    );
};

export default FeedPage;