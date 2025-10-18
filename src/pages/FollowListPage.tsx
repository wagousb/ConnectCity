import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@/types';
import { ArrowLeftIcon } from '@/components/Icons';

interface FollowListPageProps {
  type: 'following' | 'followers';
  currentUserId: string;
  profileUserId: string;
  onFollowToggle: (targetUserId: string) => void;
  followingIds: Set<string>;
  onBack: () => void;
  onViewChange: (view: { view: string; userId?: string }) => void;
}

const FollowListPage: React.FC<FollowListPageProps> = ({ type, currentUserId, profileUserId, onFollowToggle, followingIds, onBack, onViewChange }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const title = type === 'following' ? 'Seguindo' : 'Seguidores';

  useEffect(() => {
    const fetchFollows = async () => {
      setLoading(true);
      
      const fromTable = 'followers';
      const selectId = type === 'following' ? 'following_id' : 'follower_id';
      const whereId = type === 'following' ? 'follower_id' : 'following_id';

      const { data: followData, error: followError } = await supabase
        .from(fromTable)
        .select(selectId)
        .eq(whereId, profileUserId);

      if (followError) {
        console.error(`Error fetching ${type}:`, followError);
        setLoading(false);
        return;
      }

      const userIds = followData.map(item => item[selectId]);

      if (userIds.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        setLoading(false);
        return;
      }

      const formattedUsers: User[] = profilesData.map(profile => ({
        id: profile.id,
        name: profile.name || 'Usuário',
        handle: profile.handle || 'usuário',
        avatarUrl: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'U')}&background=eef2ff&color=4f46e5&font-size=0.5`,
        bio: profile.bio || '',
      }));

      setUsers(formattedUsers);
      setLoading(false);
    };

    fetchFollows();
  }, [type, profileUserId]);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 mr-4">
          <ArrowLeftIcon className="h-6 w-6 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
      </div>
      
      {loading ? (
        <p className="text-slate-500 text-center py-8">Carregando...</p>
      ) : users.length === 0 ? (
        <p className="text-slate-500 text-center py-8">
          {type === 'following' ? 'Não está seguindo ninguém ainda.' : 'Nenhum seguidor ainda.'}
        </p>
      ) : (
        <div className="space-y-4">
          {users.map(user => {
            const isFollowing = followingIds.has(user.id);
            const isCurrentUser = user.id === currentUserId;
            return (
              <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                <div 
                  className="flex items-center space-x-4 cursor-pointer flex-1"
                  onClick={() => onViewChange({ view: 'Profile', userId: user.id })}
                >
                  <img src={user.avatarUrl} alt={user.name} className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 hover:underline">{user.name}</p>
                    <p className="text-sm text-slate-500">@{user.handle}</p>
                    {user.bio && <p className="text-sm text-slate-600 mt-1 max-w-xs truncate">{user.bio}</p>}
                  </div>
                </div>
                {!isCurrentUser && (
                  <button 
                    onClick={() => onFollowToggle(user.id)}
                    onMouseEnter={() => setHoveredId(user.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`font-semibold px-4 py-1.5 rounded-full text-sm transition-colors flex-shrink-0 w-32 text-center ${
                      isFollowing 
                        ? (hoveredId === user.id ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-200 text-slate-800')
                        : 'bg-primary text-white hover:bg-primary-700'
                    }`}
                  >
                    {isFollowing ? (hoveredId === user.id ? 'Deixar de seguir' : 'Seguindo') : 'Seguir'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FollowListPage;