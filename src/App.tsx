import React, { useState, useEffect } from 'react';
import type { User, Post, Suggestion, Trend, ConnectionRequest } from '@/types';
import Header from '@/components/Header';
import LeftSidebar from '@/components/LeftSidebar';
import MainContent from '@/components/MainContent';
import RightSidebar from '@/components/RightSidebar';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';
import Login from '@/pages/Login';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session?.user) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Erro ao buscar perfil:', error);
        } else if (data) {
          const nameForAvatar = data.name || session.user.email || 'U';
          const avatarUrl = data.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(nameForAvatar)}&background=eef2ff&color=4f46e5&font-size=0.5`;

          const profile: User = {
            id: data.id,
            name: data.name || session.user.email || 'Usuário',
            handle: data.handle || 'usuário',
            avatarUrl: avatarUrl,
            bannerUrl: data.banner_url || 'https://picsum.photos/seed/banner1/1500/500',
            followers: data.followers || 0,
            following: data.following || 0,
            bio: data.bio || 'Bem-vindo ao ConnectCity!',
            date_of_birth: data.date_of_birth,
            is_public: data.is_public,
            notifications_on_likes: data.notifications_on_likes,
            notifications_on_comments: data.notifications_on_comments,
            notifications_on_new_followers: data.notifications_on_new_followers,
          };
          setUser(profile);
        }
      };
      fetchProfile();
    } else {
      setUser(null);
    }
  }, [session]);

  const [currentView, setCurrentView] = useState('Feed');
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 'p1',
      author: { id: 'u2', name: 'Carlos Silva', handle: 'carlossilva', avatarUrl: 'https://ui-avatars.com/api/?name=Carlos+Silva&background=eef2ff&color=4f46e5' },
      content: 'Acabei de lançar um novo projeto de código aberto no GitHub! É uma biblioteca de componentes de UI para React. Confiram e me digam o que acham. #react #opensource #development\n\nhttps://github.com/example/repo',
      timestamp: '2h',
      likes: 128,
      comments: 24,
      shares: 15,
      saved: false,
    },
    {
      id: 'p2',
      author: { id: 'u1', name: 'alex johnson', handle: 'alexj', avatarUrl: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=eef2ff&color=4f46e5' },
      content: 'Explorando as novas funcionalidades do CSS Grid e Flexbox. Incrível como a web evoluiu! Qual é a sua propriedade CSS favorita?',
      imageUrl: 'https://picsum.photos/seed/post2/600/400',
      timestamp: '5h',
      likes: 256,
      comments: 64,
      shares: 32,
      saved: true,
    },
    {
      id: 'p3',
      author: { id: 'u3', name: 'Beatriz Costa', handle: 'beacosta', avatarUrl: 'https://ui-avatars.com/api/?name=Beatriz+Costa&background=eef2ff&color=4f46e5' },
      content: 'Participando de um webinar sobre IA generativa. O futuro é agora! 🤯',
      timestamp: '1d',
      likes: 98,
      comments: 12,
      shares: 5,
      saved: false,
    },
    {
      id: 'p4',
      author: { id: 'u1', name: 'alex johnson', handle: 'alexj', avatarUrl: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=eef2ff&color=4f46e5' },
      content: 'Dica do dia: Use `Promise.allSettled` quando precisar que todas as promessas sejam concluídas, independentemente de sucesso ou falha. Muito útil para lidar com múltiplas chamadas de API de forma robusta. #javascript #protip',
      timestamp: '2d',
      likes: 412,
      comments: 88,
      shares: 50,
      saved: false,
    }
  ]);
  
  const [suggestions] = useState<Suggestion[]>([
    { id: 's1', user: { id: 'u4', name: 'Daniel Almeida', handle: 'danielalmeida', avatarUrl: 'https://ui-avatars.com/api/?name=Daniel+Almeida&background=eef2ff&color=4f46e5' } },
    { id: 's2', user: { id: 'u5', name: 'Fernanda Lima', handle: 'fernandalima', avatarUrl: 'https://ui-avatars.com/api/?name=Fernanda+Lima&background=eef2ff&color=4f46e5' } },
    { id: 's3', user: { id: 'u6', name: 'Gustavo Pereira', handle: 'gustavopereira', avatarUrl: 'https://ui-avatars.com/api/?name=Gustavo+Pereira&background=eef2ff&color=4f46e5' } },
  ]);

  const [trends] = useState<Trend[]>([
    { id: 't1', hashtag: '#ReactJS', postCount: '12.5k publicações' },
    { id: 't2', hashtag: '#VagasDev', postCount: '8.9k publicações' },
    { id: 't3', hashtag: '#InteligenciaArtificial', postCount: '5.1k publicações' },
    { id: 't4', hashtag: '#UXDesign', postCount: '3.7k publicações' },
  ]);
  
  const [connectionRequests] = useState<ConnectionRequest[]>([
      { id: 'cr1', user: { id: 'u7', name: 'Helena Santos', handle: 'helenasantos', avatarUrl: 'https://ui-avatars.com/api/?name=Helena+Santos&background=eef2ff&color=4f46e5' }, mutuals: 12 },
      { id: 'cr2', user: { id: 'u8', name: 'Igor Martins', handle: 'igormartins', avatarUrl: 'https://ui-avatars.com/api/?name=Igor+Martins&background=eef2ff&color=4f46e5' }, mutuals: 5 },
  ]);

  const handleViewChange = (view: string) => {
    setCurrentView(view);
  };

  const handleToggleSave = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, saved: !post.saved } : post
    ));
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Carregando...</div>;
  }

  if (!session || !user) {
    return <Login />;
  }

  const userPosts = posts.map(post => {
    if (post.author.handle === 'alexj') {
      return { ...post, author: user };
    }
    return post;
  });

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header user={user} onViewChange={handleViewChange} />
      <main className="max-w-screen-xl mx-auto py-8 px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-3">
            <LeftSidebar user={user} currentView={currentView} onViewChange={handleViewChange} />
          </div>
          <div className="col-span-12 lg:col-span-6">
            <MainContent 
              posts={userPosts} 
              currentView={currentView} 
              user={user} 
              suggestions={suggestions}
              connectionRequests={connectionRequests}
              onToggleSave={handleToggleSave}
              onViewChange={handleViewChange}
            />
          </div>
          <div className="col-span-12 lg:col-span-3">
             <RightSidebar suggestions={suggestions} trends={trends} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;