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
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [currentView, setCurrentView] = useState('Feed');

  const fetchPosts = useCallback(async (currentUserId?: string) => {
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('Erro ao buscar posts:', postsError);
      return;
    }
    if (!postsData) {
        setPosts([]);
        return;
    }

    const userIds = [...new Set(postsData.map((post) => post.user_id))];
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);

    if (profilesError) {
      console.error('Erro ao buscar perfis:', profilesError);
      return;
    }
    const profilesMap = new Map(profilesData.map((profile) => [profile.id, profile]));

    const postIds = postsData.map(p => p.id);
    const { data: likesData, error: likesError } = await supabase
      .from('likes')
      .select('post_id, user_id')
      .in('post_id', postIds);

    if (likesError) {
      console.error('Erro ao buscar curtidas:', likesError);
    }

    const likesMap = new Map<string, number>();
    const currentUserLikedPosts = new Set<string>();

    likesData?.forEach(like => {
      likesMap.set(like.post_id, (likesMap.get(like.post_id) || 0) + 1);
      if (like.user_id === currentUserId) {
        currentUserLikedPosts.add(like.post_id);
      }
    });
    
    if (currentUserId) {
      setLikedPostIds(currentUserLikedPosts);
    }

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
          likes: likesMap.get(post.id) || 0,
          comments: 0,
          shares: 0,
          saved: false,
          isLiked: currentUserLikedPosts.has(post.id),
        };
      })
      .filter((p): p is Post => p !== null);

    setPosts(formattedPosts);
  }, []);

  const fetchSuggestions = useCallback(async (userId: string, currentFollowingIds: Set<string>) => {
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
        isFollowing: currentFollowingIds.has(profile.id),
      }
    }));
    setSuggestions(formattedSuggestions);
  }, []);

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
      const fetchInitialData = async () => {
        setLoading(true);
        const userId = session.user.id;

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error('Erro ao buscar perfil:', profileError);
        } else if (profileData) {
          const nameForAvatar = profileData.name || session.user.email || 'U';
          const avatarUrl = profileData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(nameForAvatar)}&background=eef2ff&color=4f46e5&font-size=0.5`;
          setUser({
            id: profileData.id,
            name: profileData.name || session.user.email || 'Usuário',
            handle: profileData.handle || 'usuário',
            avatarUrl: avatarUrl,
            bannerUrl: profileData.banner_url || 'https://picsum.photos/seed/banner1/1500/500',
            followers: profileData.followers || 0,
            following: profileData.following || 0,
            bio: profileData.bio || 'Bem-vindo ao ConnectCity!',
            date_of_birth: profileData.date_of_birth,
            is_public: profileData.is_public,
            notifications_on_likes: profileData.notifications_on_likes,
            notifications_on_comments: profileData.notifications_on_comments,
            notifications_on_new_followers: profileData.notifications_on_new_followers,
          });
        }

        const { data: followingData, error: followingError } = await supabase
          .from('followers')
          .select('following_id')
          .eq('follower_id', userId);
        
        let currentFollowingIds = new Set<string>();
        if (followingError) {
          console.error('Error fetching following list:', followingError);
        } else {
          currentFollowingIds = new Set(followingData.map(f => f.following_id));
          setFollowingIds(currentFollowingIds);
        }

        await fetchPosts(userId);
        await fetchSuggestions(userId, currentFollowingIds);
        setLoading(false);
      };
      fetchInitialData();
    } else {
      setUser(null);
      setFollowingIds(new Set());
      setSuggestions([]);
    }
  }, [session, fetchPosts, fetchSuggestions]);
  
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

  const handleFollowToggle = async (targetUserId: string) => {
    if (!user) return;
    const isCurrentlyFollowing = followingIds.has(targetUserId);
    setFollowingIds(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyFollowing) newSet.delete(targetUserId);
      else newSet.add(targetUserId);
      return newSet;
    });
    if (isCurrentlyFollowing) {
      await supabase.from('followers').delete().match({ follower_id: user.id, following_id: targetUserId });
    } else {
      await supabase.from('followers').insert({ follower_id: user.id, following_id: targetUserId });
    }
  };

  const handleToggleLike = async (postId: string, isLiked: boolean) => {
    if (!user) return;

    setPosts(posts.map(p => p.id === postId ? { ...p, isLiked: !isLiked, likes: p.likes + (!isLiked ? 1 : -1) } : p));
    setLikedPostIds(prev => {
        const newSet = new Set(prev);
        if (isLiked) newSet.delete(postId);
        else newSet.add(postId);
        return newSet;
    });

    if (isLiked) {
      await supabase.from('likes').delete().match({ user_id: user.id, post_id: postId });
    } else {
      await supabase.from('likes').insert({ user_id: user.id, post_id: postId });
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
              onToggleLike={handleToggleLike}
              onViewChange={handleViewChange}
              onUserUpdate={handleUserUpdate}
              onPostPublished={() => fetchPosts(user.id)}
              onFollowToggle={handleFollowToggle}
              followingIds={followingIds}
            />
          </div>
          <div className="col-span-12 lg:col-span-3">
             <RightSidebar suggestions={suggestions} trends={trends} onFollowToggle={handleFollowToggle} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;