import React, { useState, useEffect, useCallback } from 'react';
import type { User, Post, Suggestion, Trend, ConnectionRequest } from '@/types';
import Header from '@/components/Header';
import LeftSidebar from '@/components/LeftSidebar';
import MainContent from '@/components/MainContent';
import RightSidebar from '@/components/RightSidebar';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';
import Login from '@/pages/Login';

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

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [currentView, setCurrentView] = useState('Feed');

  const fetchPosts = useCallback(async () => {
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('Erro ao buscar posts:', postsError);
      return;
    }

    if (!postsData || postsData.length === 0) {
      setPosts([]);
      return;
    }

    const userIds = [...new Set(postsData.map(p => p.user_id))];

    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);

    if (profilesError) {
      console.error('Erro ao buscar perfis:', profilesError);
      return;
    }

    const profilesMap = new Map(profilesData.map(p => [p.id, p]));

    const formattedPosts: Post[] = postsData
      .map(post => {
        const profile = profilesMap.get(post.user_id);
        if (!profile) {
          return null;
        }
        return {
          id: post.id,
          content: post.content,
          imageUrl: post.image_url,
          timestamp: timeAgo(post.created_at),
          author: {
            id: profile.id,
            name: profile.name,
            handle: profile.handle,
            avatarUrl: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=eef2ff&color=4f46e5&font-size=0.5`,
            bannerUrl: profile.banner_url,
            bio: profile.bio,
            followers: profile.followers,
            following: profile.following,
          },
          likes: 0,
          comments: 0,
          shares: 0,
          saved: false,
        };
      })
      .filter((p): p is Post => p !== null);

    setPosts(formattedPosts);
  }, []);

  const fetchSuggestions = useCallback(async (userId: string) => {
    const { data: profilesData, error } = await supabase
      .from('profiles')
      .select('*')
      .not('id', 'eq', userId)
      .limit(3);

    if (error) {
      console.error('Erro ao buscar sugestões:', error);
      return;
    }

    const formattedSuggestions: Suggestion[] = profilesData.map(profile => ({
      id: profile.id,
      user: {
        id: profile.id,
        name: profile.name || 'Usuário',
        handle: profile.handle || 'usuário',
        avatarUrl: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'U')}&background=eef2ff&color=4f46e5&font-size=0.5`,
      }
    }));
    setSuggestions(formattedSuggestions);
  }, []);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        await fetchPosts();
      }
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (_event === 'SIGNED_IN') {
        fetchPosts();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchPosts]);

  useEffect(() => {
    if (session?.user) {
      const fetchProfileAndSuggestions = async () => {
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
        await fetchSuggestions(session.user.id);
      };
      fetchProfileAndSuggestions();
    } else {
      setUser(null);
    }
  }, [session, fetchSuggestions]);
  
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

  const handleUserUpdate = (newProfileData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...newProfileData });
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Carregando...</div>;
  }

  if (!session || !user) {
    return <Login />;
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header user={user} onViewChange={handleViewChange} />
      <main className="max-w-screen-xl mx-auto py-8 px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-3">
            <LeftSidebar user={user} currentView={currentView} onViewChange={handleViewChange} onUserUpdate={handleUserUpdate} />
          </div>
          <div className="col-span-12 lg:col-span-6">
            <MainContent 
              posts={posts} 
              currentView={currentView} 
              user={user} 
              suggestions={suggestions}
              connectionRequests={connectionRequests}
              onToggleSave={handleToggleSave}
              onViewChange={handleViewChange}
              onUserUpdate={handleUserUpdate}
              onPostPublished={fetchPosts}
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