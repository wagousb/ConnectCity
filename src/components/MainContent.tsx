import React from 'react';
import type { Post, User } from '@/types';
import PostCard from '@/components/PostCard';
import ProfilePage from '@/components/ProfilePage';
import FeedPage from '@/components/FeedPage';
import MembersPage from '@/pages/MembersPage';
import SettingsPage from '@/components/SettingsPage';
import NotificationsPage from '@/pages/NotificationsPage';

interface MainContentProps {
  posts: Post[];
  currentView: string;
  user: User;
  onToggleSave: (postId: string) => void;
  onToggleLike: (postId: string, isLiked: boolean) => void;
  onViewChange: (view: { view: string; userId?: string }) => void;
  onUserUpdate: (newProfileData: Partial<User>) => void;
  onPostPublished: () => void;
  viewedProfile: User | null;
  viewedProfilePosts: Post[];
  isProfileLoading: boolean;
}

const MainContent: React.FC<MainContentProps> = ({ 
  posts, currentView, user, onToggleSave, onToggleLike, 
  onViewChange, onUserUpdate, onPostPublished,
  viewedProfile, viewedProfilePosts, isProfileLoading
}) => {
  const renderContent = () => {
    switch (currentView) {
      case 'Feed':
        return <FeedPage user={user} posts={posts} onToggleSave={onToggleSave} onToggleLike={onToggleLike} onPostPublished={onPostPublished} onViewChange={onViewChange} />;
      case 'Meu Perfil':
        const userPosts = posts.filter(post => post.author.id === user.id);
        return <ProfilePage 
                  profileUser={user} 
                  currentUser={user}
                  posts={userPosts} 
                  onToggleSave={onToggleSave} 
                  onViewChange={onViewChange} 
                  onUserUpdate={onUserUpdate}
                  onToggleLike={onToggleLike}
                />;
      case 'Profile':
        if (isProfileLoading) return <div className="bg-white p-6 rounded-xl border border-slate-200 text-center"><p className="text-slate-500">Carregando perfil...</p></div>;
        if (!viewedProfile) return <div className="bg-white p-6 rounded-xl border border-slate-200 text-center"><p className="text-slate-500">Perfil não encontrado.</p></div>;
        return <ProfilePage 
                  profileUser={viewedProfile} 
                  currentUser={user}
                  posts={viewedProfilePosts} 
                  onToggleSave={onToggleSave} 
                  onViewChange={onViewChange} 
                  onUserUpdate={onUserUpdate}
                  onToggleLike={onToggleLike}
                />;
      case 'Membros':
        return <MembersPage currentUser={user} onViewChange={onViewChange} />;
      case 'Salvos':
        const savedPosts = posts.filter(post => post.saved);
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <h1 className="text-2xl font-bold">Publicações Salvas</h1>
              <p className="text-slate-500 mt-1">Aqui estão as publicações que você salvou para ver mais tarde.</p>
            </div>
            {savedPosts.length > 0 ? (
              savedPosts.map((post) => (
                <PostCard key={post.id} post={post} onToggleSave={onToggleSave} onToggleLike={onToggleLike} onViewChange={onViewChange} />
              ))
            ) : (
              <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-slate-500">
                <p>Você ainda não salvou nenhuma publicação.</p>
              </div>
            )}
          </div>
        );
      case 'Configurações':
        return <SettingsPage user={user} onViewChange={(viewName) => onViewChange({ view: viewName })} />;
      case 'Notificações':
        return <NotificationsPage user={user} onViewChange={onViewChange} />;
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