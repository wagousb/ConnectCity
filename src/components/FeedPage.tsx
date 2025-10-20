import React from 'react';
import type { Post, User } from '@/types';
import PostComposer from '@/components/PostComposer';
import PostCard from '@/components/PostCard';

interface FeedPageProps {
    user: User;
    posts: Post[];
    onVote: (postId: string, rating: number) => void;
    onPostPublished: () => void;
    onViewChange: (view: { view: string; userId?: string }) => void;
}

const FeedPage: React.FC<FeedPageProps> = ({ user, posts, onVote, onPostPublished, onViewChange }) => {
    const isFirstPost = !posts.some(post => post.author.id === user.id);

    return (
        <div className="space-y-6">
            <PostComposer user={user} onPostPublished={onPostPublished} isFirstPost={isFirstPost} />
            {posts.map(post => (
                <PostCard key={post.id} post={post} currentUser={user} onVote={onVote} onViewChange={onViewChange} />
            ))}
        </div>
    );
};

export default FeedPage;