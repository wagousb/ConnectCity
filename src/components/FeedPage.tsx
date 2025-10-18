import React from 'react';
import type { Post, User } from '@/types';
import PostComposer from '@/components/PostComposer';
import PostCard from '@/components/PostCard';

interface FeedPageProps {
    user: User;
    posts: Post[];
    onToggleSave: (postId: string) => void;
}

const FeedPage: React.FC<FeedPageProps> = ({ user, posts, onToggleSave }) => {
    return (
        <div className="space-y-6">
            <PostComposer user={user} />
            {posts.map(post => (
                <PostCard key={post.id} post={post} onToggleSave={onToggleSave} />
            ))}
        </div>
    );
};

export default FeedPage;