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
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  
  const [currentView, setCurrentView] = useState<{ view: string; userId?: string; postId?: string }>({ view: 'Feed' });
  const [viewedProfile, setViewedProfile] = useState<User | null>(null);
  const [viewedProfilePosts, setViewedProfilePosts] = useState<Post[]>([]);
  const [viewedPost, setViewedPost] = useState<Post | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isFeedLoading, setIsFeedLoading] = useState(false);
  const [isPostLoading, setIsPostLoading] = useState(false);

  const isModerator = session?.user?.email === 'produwagner@gmail.com';

  const fetchPosts = useCallback(async (currentUserId?: string) => {
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*, comments(count)')
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
    
    const { data: ratingsData, error: ratingsError } = await supabase.from('ratings').select('post_id, user_id, rating').in('post_id', postIds);
    if (ratingsError) console.error('Erro ao buscar avaliações:', ratingsError);

    const ratingsMap = new Map<string, { total: number; sum: number; userRating?: number }>();
    ratingsData?.forEach(rating => {
        if (!ratingsMap.has(rating.post_id)) {
            ratingsMap.set(rating.post_id, { total: 0, sum: 0 });
        }
        const postRating = ratingsMap.get(rating.post_id)!;
        postRating.total += 1;
        postRating.sum += rating.rating;
        if (rating.user_id === currentUserId) {
            postRating.userRating = rating.rating;
        }
    });

    const formattedPosts: Post[] = postsData
      .map(post => {
        const profile = profilesMap.get(post.user_id);
        if (!profile) return null;
        
        const postRating = ratingsMap.get(post.id);

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
            role: profile.role || 'cidadão',
          },
          comments: (post.comments as any)[0]?.count || 0,
          shares: 0,
          average_rating: postRating ? postRating.sum / postRating.total : 0,
          user_rating: postRating?.userRating || 0,
          total_votes: postRating?.total || 0,
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
            role: profileData.role || 'cidadão',
          });
        }
        
        const { count, error: notificationError } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_read', false);

        if (notificationError) {
          console.error('Error checking notifications:', notificationError);
        } else if (count && count > 0) {
          setHasUnreadNotifications(true);
        }

        await fetchPosts(userId);
        setLoading(false);
      };
      fetchInitialData();
    } else if (!session?.user) {
      setUser(null);
    }
  }, [session, user, fetchPosts]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('public:notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => {
          setHasUnreadNotifications(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    const fetchViewData = async () => {
      if (currentView.view === 'Profile' && currentView.userId && user) {
        setIsProfileLoading(true);
        const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('id', currentView.userId).single();
        if (profileError || !profileData) {
          console.error('Error fetching viewed profile:', profileError);
          setIsProfileLoading(false);
          return;
        }
        const formattedProfile: User = {
            id: profileData.id, name: profileData.name || 'Usuário', handle: profileData.handle || 'usuário',
            avatarUrl: profileData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'U')}&background=eef2ff&color=4f46e5&font-size=0.5`,
            bannerUrl: profileData.banner_url || 'https://picsum.photos/seed/banner1/1500/500', bio: profileData.bio || '',
            role: profileData.role || 'cidadão',
        };
        setViewedProfile(formattedProfile);
        const { data: postsData, error: postsError } = await supabase.from('posts').select('*, comments(count)').eq('user_id', currentView.userId).order('created_at', { ascending: false });
        if (postsError) {
            console.error('Error fetching posts for profile:', postsError);
            setViewedProfilePosts([]);
        } else {
            const postIds = postsData.map(p => p.id);
            const { data: ratingsData } = await supabase.from('ratings').select('post_id, user_id, rating').in('post_id', postIds);
            const ratingsMap = new Map<string, { total: number; sum: number; userRating?: number }>();
            ratingsData?.forEach(rating => {
                if (!ratingsMap.has(rating.post_id)) ratingsMap.set(rating.post_id, { total: 0, sum: 0 });
                const postRating = ratingsMap.get(rating.post_id)!;
                postRating.total += 1; postRating.sum += rating.rating;
                if (rating.user_id === user.id) postRating.userRating = rating.rating;
            });
            const formattedPosts: Post[] = postsData.map(post => {
              const postRating = ratingsMap.get(post.id);
              return {
                id: post.id, title: post.title, target_entity: post.target_entity, content: post.content, imageUrl: post.image_url, document_url: post.document_url,
                timestamp: timeAgo(post.created_at), author: formattedProfile, comments: (post.comments as any)[0]?.count || 0, shares: 0,
                average_rating: postRating ? postRating.sum / postRating.total : 0, user_rating: postRating?.userRating || 0, total_votes: postRating?.total || 0,
              }
            });
            setViewedProfilePosts(formattedPosts);
        }
        setIsProfileLoading(false);
      } else if (currentView.view === 'PostDetail' && currentView.postId && user) {
        setIsPostLoading(true);
        
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select('*, comments(count)')
          .eq('id', currentView.postId)
          .single();

        if (postError || !postData) {
          console.error('Error fetching post:', postError);
          setViewedPost(null);
          setIsPostLoading(false);
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', postData.user_id)
          .single();

        if (profileError || !profileData) {
            console.error('Error fetching author profile for post:', profileError);
            setViewedPost(null);
            setIsPostLoading(false);
            return;
        }

        const { data: ratingsData } = await supabase.from('ratings').select('post_id, user_id, rating').eq('post_id', postData.id);
        const ratingsMap = new Map<string, { total: number; sum: number; userRating?: number }>();
        ratingsData?.forEach(rating => {
            if (!ratingsMap.has(rating.post_id)) ratingsMap.set(rating.post_id, { total: 0, sum: 0 });
            const postRating = ratingsMap.get(rating.post_id)!;
            postRating.total += 1; postRating.sum += rating.rating;
            if (rating.user_id === user.id) postRating.userRating = rating.rating;
        });
        const postRating = ratingsMap.get(postData.id);
        
        const formattedPost: Post = {
          id: postData.id,
          title: postData.title,
          target_entity: postData.target_entity,
          content: postData.content,
          imageUrl: postData.image_url,
          document_url: postData.document_url,
          timestamp: timeAgo(postData.created_at),
          author: {
            id: profileData.id,
            name: profileData.name,
            handle: profileData.handle,
            avatarUrl: profileData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'U')}&background=eef2ff&color=4f46e5&font-size=0.5`,
            bannerUrl: profileData.banner_url,
            bio: profileData.bio,
            role: profileData.role || 'cidadão',
          },
          comments: (postData.comments as any)[0]?.count || 0,
          shares: 0,
          average_rating: postRating ? postRating.sum / postRating.total : 0,
          user_rating: postRating?.userRating || 0,
          total_votes: postRating?.total || 0,
        };
        setViewedPost(formattedPost);
        setIsPostLoading(false);
      }
    };
    fetchViewData();
  }, [currentView, user]);
  
  const [trends] = useState<Trend[]>([
    { id: 't1', hashtag: '#ReactJS', postCount: '12.5k publicações' },
    { id: 't2', hashtag: '#VagasDev', postCount: '8.9k publicações' },
    { id: 't3', hashtag: '#InteligenciaArtificial', postCount: '5.1k publicações' },
    { id: 't4', hashtag: '#UXDesign', postCount: '3.7k publicações' },
  ]);
  
  const handleViewChange = async (view: { view: string; userId?: string; postId?: string }) => {
    if (view.view === 'Profile' && view.userId === currentView.userId && currentView.view === 'Profile') return;
    if (view.view === 'PostDetail' && view.postId === currentView.postId && currentView.view === 'PostDetail') return;
    
    if (view.view === 'Profile' && view.userId === user?.id) {
      setCurrentView({ view: 'Meu Perfil' });
      return;
    }

    if (view.view === 'Feed') {
      setIsFeedLoading(true);
      await fetchPosts(user?.id);
      if (user) {
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false);

        if (error) {
          console.error('Error checking notifications:', error);
        } else {
          setHasUnreadNotifications(!!count && count > 0);
        }
      }
      setIsFeedLoading(false);
    }

    if (view.view === 'Notificações') {
      setHasUnreadNotifications(false);
    }

    setCurrentView(view);
  };

  const handleUserUpdate = (newProfileData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...newProfileData });
    }
  };

  const handleVote = (postId: string, rating: number) => {
    if (!user) return;

    const updatePostRating = (p: Post) => {
        if (p.id !== postId) return p;
        const oldRating = p.user_rating || 0;
        const oldTotalVotes = p.total_votes || 0;
        const oldSum = (p.average_rating || 0) * oldTotalVotes;
        let newTotalVotes: number;
        let newSum: number;
        if (oldRating > 0) {
            newTotalVotes = oldTotalVotes;
            newSum = oldSum - oldRating + rating;
        } else {
            newTotalVotes = oldTotalVotes + 1;
            newSum = oldSum + rating;
        }
        const newAverage = newTotalVotes > 0 ? newSum / newTotalVotes : 0;
        return { ...p, user_rating: rating, total_votes: newTotalVotes, average_rating: newAverage };
    };

    setPosts(posts.map(updatePostRating));
    setViewedProfilePosts(viewedProfilePosts.map(updatePostRating));
    if (viewedPost && viewedPost.id === postId) {
      setViewedPost(updatePostRating(viewedPost));
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
      <Header user={user} onViewChange={handleViewChange} hasUnreadNotifications={hasUnreadNotifications} />
      <main className="max-w-screen-xl mx-auto py-8 px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-3">
            <LeftSidebar user={user} currentView={currentView.view} onViewChange={handleViewChange} onUserUpdate={handleUserUpdate} isModerator={isModerator} />
          </div>
          <div className="col-span-12 lg:col-span-6">
            <MainContent 
              posts={posts} 
              currentView={currentView.view} 
              user={user} 
              onVote={handleVote}
              onViewChange={handleViewChange}
              onUserUpdate={handleUserUpdate}
              onPostPublished={() => fetchPosts(user.id)}
              viewedProfile={viewedProfile}
              viewedProfilePosts={viewedProfilePosts}
              isProfileLoading={isProfileLoading}
              isFeedLoading={isFeedLoading}
              viewedPost={viewedPost}
              isPostLoading={isPostLoading}
              isModerator={isModerator}
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