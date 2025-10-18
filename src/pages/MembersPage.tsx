import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@/types';
import RoleBadge from '@/components/RoleBadge';

interface MembersPageProps {
  currentUser: User;
  onViewChange: (view: { view: string; userId?: string }) => void;
}

const MembersPage: React.FC<MembersPageProps> = ({ currentUser, onViewChange }) => {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .not('id', 'eq', currentUser.id); // Exclui o usuário atual

      if (error) {
        console.error('Error fetching members:', error);
      } else {
        const formattedMembers: User[] = data.map(profile => ({
          id: profile.id,
          name: profile.name || 'Usuário',
          handle: profile.handle || 'usuário',
          avatarUrl: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'U')}&background=eef2ff&color=4f46e5&font-size=0.5`,
          bio: profile.bio || '',
          role: profile.role || 'cidadão',
        }));
        setMembers(formattedMembers);
      }
      setLoading(false);
    };

    fetchMembers();
  }, [currentUser.id]);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <h1 className="text-2xl font-bold mb-6">Membros da Comunidade</h1>
      {loading ? (
        <p className="text-slate-500 text-center">Carregando membros...</p>
      ) : members.length === 0 ? (
        <p className="text-slate-500 text-center">Nenhum outro membro encontrado.</p>
      ) : (
        <div className="space-y-4">
          {members.map(member => (
            <div
              key={member.id}
              className="flex items-start space-x-4 p-3 rounded-lg hover:bg-slate-50 cursor-pointer"
              onClick={() => onViewChange({ view: 'Profile', userId: member.id })}
            >
              <div className="flex flex-col items-center">
                <img src={member.avatarUrl} alt={member.name} className="h-12 w-12 rounded-full" />
                <div className="mt-1">
                  <RoleBadge role={member.role} size="xs" />
                </div>
              </div>
              <div>
                <p className="font-bold text-slate-800 hover:underline">{member.name}</p>
                <p className="text-sm text-slate-500">@{member.handle}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MembersPage;