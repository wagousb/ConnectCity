import React from 'react';
import type { Post, User } from '@/types';
import ProfilePage from '@/components/ProfilePage';
import FeedPage from '@/components/FeedPage';
import MembersPage from '@/pages/MembersPage';
import SettingsPage from '@/components/SettingsPage';
import NotificationsPage from '@/pages/NotificationsPage';
import PostDetailPage from '@/pages/PostDetailPage';
import ModerationPage from '@/pages/ModerationPage';

interface MainContentProps {
  posts: Post[];
  currentView: string;
  user: User;
  onVote: (postId: string, rating: number) => void;
  onViewChange: (view: { view: string; userId?: string; postId?: string }) => void;
  onUserUpdate: (newProfileData: Partial<User>) => void;
  onPostPublished: () => void;
  viewedProfile: User | null;
  viewedProfilePosts: Post[];
  isProfileLoading: boolean;
  isFeedLoading: boolean;
  viewedPost: Post | null;
  isPostLoading: boolean;
  isModerator: boolean;
  showWelcomeMessage?: boolean;
}

const MainContent: React.FC<MainContentProps> = ({ 
  posts, currentView, user, onVote,
  onViewChange, onUserUpdate, onPostPublished,
  viewedProfile, viewedProfilePosts, isProfileLoading,
  isFeedLoading, viewedPost, isPostLoading, isModerator,
  showWelcomeMessage
}) => {
  const renderContent = () => {
    switch (currentView) {
      case 'Feed':
        if (isFeedLoading) {
          return (
            <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
              <p className="text-slate-500 animate-pulse">Atualizando o feed...</p>
            </div>
          );
        }
        return <FeedPage user={user} posts={posts} onVote={onVote} onPostPublished={onPostPublished} onViewChange={onViewChange} />;
      case 'Meu Perfil':
        const userPosts = posts.filter(post => post.author.id === user.id);
        return <ProfilePage 
                  profileUser={user} 
                  currentUser={user}
                  posts={userPosts} 
                  onViewChange={onViewChange} 
                  onUserUpdate={onUserUpdate}
                  onVote={onVote}
                  isFirstLogin={showWelcomeMessage}
                />;
      case 'Profile':
        if (isProfileLoading) return <div className="bg-white p-6 rounded-xl border border-slate-200 text-center"><p className="text-slate-500">Carregando perfil...</p></div>;
        if (!viewedProfile) return <div className="bg-white p-6 rounded-xl border border-slate-200 text-center"><p className="text-slate-500">Perfil não encontrado.</p></div>;
        return <ProfilePage 
                  profileUser={viewedProfile} 
                  currentUser={user}
                  posts={viewedProfilePosts} 
                  onViewChange={onViewChange} 
                  onUserUpdate={onUserUpdate}
                  onVote={onVote}
                />;
      case 'PostDetail':
        if (isPostLoading) return <div className="bg-white p-6 rounded-xl border border-slate-200 text-center"><p className="text-slate-500">Carregando ideia...</p></div>;
        if (!viewedPost) return <div className="bg-white p-6 rounded-xl border border-slate-200 text-center"><p className="text-slate-500">Ideia não encontrada.</p></div>;
        return <PostDetailPage post={viewedPost} currentUser={user} onVote={onVote} onViewChange={onViewChange} />;
      case 'Membros':
        return <MembersPage currentUser={user} onViewChange={onViewChange} />;
      case 'Configurações':
        return <SettingsPage user={user} onViewChange={(viewName) => onViewChange({ view: viewName })} />;
      case 'Notificações':
        return <NotificationsPage user={user} onViewChange={onViewChange} />;
      case 'Moderação':
        if (!isModerator) {
            return (
                <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
                    <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
                    <p className="text-slate-500 mt-2">Você não tem permissão para acessar esta página.</p>
                </div>
            );
        }
        return <ModerationPage />;
      default:
        return (
            <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h1 className="text-2xl font-bold">Página não encontrada</h1>
            </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  );
};

export default MainContent;