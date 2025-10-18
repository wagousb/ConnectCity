import React from 'react';
import type { Post, User, Suggestion, ConnectionRequest } from '@/types';
import PostCard from '@/components/PostCard';
import ProfilePage from '@/components/ProfilePage';
import FeedPage from '@/components/FeedPage';
import NetworkPage from '@/components/NetworkPage';
import SettingsPage from '@/components/SettingsPage';

interface MainContentProps {
  posts: Post[];
  currentView: string;
  user: User;
  suggestions: Suggestion[];
  connectionRequests: ConnectionRequest[];
  onToggleSave: (postId: string) => void;
  onViewChange: (view: string) => void;
}

const MainContent: React.FC<MainContentProps> = ({ posts, currentView, user, suggestions, connectionRequests, onToggleSave, onViewChange }) => {
  const renderContent = () => {
    switch (currentView) {
      case 'Feed':
        return <FeedPage user={user} posts={posts} onToggleSave={onToggleSave} />;
      case 'Meu Perfil':
        const userPosts = posts.filter(post => post.author.id === user.id);
        return <ProfilePage user={user} posts={userPosts} onToggleSave={onToggleSave} />;
      case 'Minha Rede':
        return <NetworkPage requests={connectionRequests} suggestions={suggestions} />;
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
                <PostCard key={post.id} post={post} onToggleSave={onToggleSave} />
              ))
            ) : (
              <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-slate-500">
                <p>Você ainda não salvou nenhuma publicação.</p>
              </div>
            )}
          </div>
        );
      case 'Configurações':
        return <SettingsPage user={user} onViewChange={onViewChange} />;
      case 'Notificações':
        return (
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h1 className="text-2xl font-bold">{currentView}</h1>
            <p className="text-slate-500 mt-1">O conteúdo para a página "{currentView}" aparecerá aqui.</p>
          </div>
        );
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