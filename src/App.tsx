import React, { useState, useEffect, useCallback } from 'react';
import type { User, Post, Trend } from '@/types';
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
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  
  const [currentView, setCurrentView] = useState<{ view: string; userId?: string }>({ view: 'Feed' });
  const [viewedProfile, setViewedProfile] = useState<User | null>(null);
  const [viewedProfilePosts, setViewedProfilePosts] = useState<Post[]>([]);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

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
          title: post.title,
          target_entity: post.target_entity,
          content: post.content,
          imageUrl: post.image_url,
          document_url: post.document_url,
          timestamp: timeAgo(post.created_at),
          author: {
            id: profile.id,
            name: profile.name,
            handle: profile.handle,
            avatarUrl: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=eef2ff&color=4f46e5&font-size=0.5`,
            bannerUrl: profile.banner_url,
            bio: profile.bio,
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

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (!session) {
        setLoading(false);
      }
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
    // This effect runs when the session changes.
    // We only want to fetch the user's profile and posts on the initial load.
    // The `!user` check prevents this from running every time the tab is focused,
    // which can cause a session refresh.
    if (session?.user && !user) {
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
            bio: profileData.bio || 'Bem-vindo ao ConnectCity!',
            date_of_birth: profileData.date_of_birth,
            is_public: profileData.is_public,
            notifications_on_likes: profileData.notifications_on_likes,
            notifications_on_comments: profileData.notifications_on_comments,
            notifications_on_new_followers: profileData.notifications_on_new_followers,
          });
        }
        
        await fetchPosts(userId);
        setLoading(false);
      };
      fetchInitialData();
    } else if (!session?.user) {
      // Handle logout
      setUser(null);
    }
  }, [session, user, fetchPosts]);

  useEffect(() => {
    const fetchViewData = async () => {
      if (currentView.view !== 'Profile' || !currentView.userId || !user) {
        setViewedProfile(null);
        setViewedProfilePosts([]);
        return;
      }
  
      setIsProfileLoading(true);
  
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentView.userId)
        .single();
  
      if (profileError || !profileData) {
        console.error('Error fetching viewed profile:', profileError);
        setIsProfileLoading(false);
        return;
      }
      
      const formattedProfile: User = {
          id: profileData.id,
          name: profileData.name || 'Usuário',
          handle: profileData.handle || 'usuário',
          avatarUrl: profileData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'U')}&background=eef2ff&color=4f46e5&font-size=0.5`,
          bannerUrl: profileData.banner_url || 'https://picsum.photos/seed/banner1/1500/500',
          bio: profileData.bio || '',
      };
      setViewedProfile(formattedProfile);
  
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', currentView.userId)
        .order('created_at', { ascending: false });
  
      if (postsError) {
          console.error('Error fetching posts for profile:', postsError);
          setViewedProfilePosts([]);
      } else {
          const postIds = postsData.map(p => p.id);
          const { data: likesData } = await supabase.from('likes').select('post_id, user_id').in('post_id', postIds);
          const likesMap = new Map<string, number>();
          const currentUserLikedPosts = new Set<string>();
          likesData?.forEach(like => {
              likesMap.set(like.post_id, (likesMap.get(like.post_id) || 0) + 1);
              if (like.user_id === user.id) {
                  currentUserLikedPosts.add(like.post_id);
              }
          });
  
          const formattedPosts: Post[] = postsData.map(post => ({
              id: post.id,
              title: post.title,
              target_entity: post.target_entity,
              content: post.content,
              imageUrl: post.image_url,
              document_url: post.document_url,
              timestamp: timeAgo(post.created_at),
              author: formattedProfile,
              likes: likesMap.get(post.id) || 0,
              comments: 0,
              shares: 0,
              saved: false,
              isLiked: currentUserLikedPosts.has(post.id),
          }));
          setViewedProfilePosts(formattedPosts);
      }
  
      setIsProfileLoading(false);
    };
  
    fetchViewData();
  }, [currentView, user]);
  
  const [trends] = useState<Trend[]>([
    { id: 't1', hashtag: '#ReactJS', postCount: '12.5k publicações' },
    { id: 't2', hashtag: '#VagasDev', postCount: '8.9k publicações' },
    { id: 't3', hashtag: '#InteligenciaArtificial', postCount: '5.1k publicações' },
    { id: 't4', hashtag: '#UXDesign', postCount: '3.7k publicações' },
  ]);
  
  const handleViewChange = (view: { view: string; userId?: string }) => {
    if (view.view === 'Profile' && view.userId === currentView.userId && currentView.view === 'Profile') {
      return;
    }
    if (view.view === 'Profile' && view.userId === user?.id) {
      setCurrentView({ view: 'Meu Perfil' });
      return;
    }
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

  const handleToggleLike = async (postId: string, isLiked: boolean) => {
    if (!user) return;

    const updatePosts = (postList: Post[]) => postList.map(p => p.id === postId ? { ...p, isLiked: !isLiked, likes: p.likes + (!isLiked ? 1 : -1) } : p);
    setPosts(updatePosts);
    setViewedProfilePosts(updatePosts);

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
            <LeftSidebar user={user} currentView={currentView.view} onViewChange={handleViewChange} onUserUpdate={handleUserUpdate} />
          </div>
          <div className="col-span-12 lg:col-span-6">
            <MainContent 
              posts={posts} 
              currentView={currentView.view} 
              user={user} 
              onToggleSave={handleToggleSave}
              onToggleLike={handleToggleLike}
              onViewChange={handleViewChange}
              onUserUpdate={handleUserUpdate}
              onPostPublished={() => fetchPosts(user.id)}
              viewedProfile={viewedProfile}
              viewedProfilePosts={viewedProfilePosts}
              isProfileLoading={isProfileLoading}
            />
          </div>
          <div className="col-span-12 lg:col-span-3">
             <RightSidebar trends={trends} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;