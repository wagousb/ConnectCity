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
    onPostDeleted: (postId: string) => void;
    onPostUpdated: (updatedPost: Post) => void;
}

const FeedPage: React.FC<FeedPageProps> = ({ user, posts, onVote, onPostPublished, onViewChange, onPostDeleted, onPostUpdated }) => {
    const isFirstPost = !posts.some(post => post.author.id === user.id);

    return (
        <div className="space-y-6">
            <PostComposer user={user} onPostPublished={onPostPublished} isFirstPost={isFirstPost} />
            {posts.map(post => (
                <PostCard 
                    key={post.id} 
                    post={post} 
                    currentUser={user} 
                    onVote={onVote} 
                    onViewChange={onViewChange} 
                    onPostDeleted={onPostDeleted}
                    onPostUpdated={onPostUpdated}
                />
            ))}
        </div>
    );
};

export default FeedPage;