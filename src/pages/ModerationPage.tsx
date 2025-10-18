import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@/types';
import RoleBadge from '@/components/RoleBadge';

const ModerationPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) {
        console.error('Error fetching users:', error);
        setError('Não foi possível carregar os usuários.');
      } else {
        const formattedUsers: User[] = data.map(profile => ({
          id: profile.id,
          name: profile.name || 'Usuário',
          handle: profile.handle || 'usuário',
          avatarUrl: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'U')}&background=eef2ff&color=4f46e5&font-size=0.5`,
          role: profile.role || 'cidadão',
        }));
        setUsers(formattedUsers);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      alert('Erro ao atualizar a patente.');
      console.error('Error updating role:', error);
    } else {
      setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user));
    }
  };

  if (loading) return <p className="text-center text-slate-500">Carregando usuários...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <h1 className="text-2xl font-bold mb-6">Painel de Moderação</h1>
      <div className="space-y-4">
        {users.map(user => (
          <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
            <div className="flex items-center space-x-4">
              <img src={user.avatarUrl} alt={user.name} className="h-12 w-12 rounded-full" />
              <div>
                <p className="font-bold text-slate-800">{user.name}</p>
                <p className="text-sm text-slate-500">@{user.handle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
                <RoleBadge role={user.role} />
                <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="bg-white border border-slate-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-primary focus:border-primary"
                >
                    <option value="cidadão">Cidadão</option>
                    <option value="secretário">Secretário</option>
                    <option value="vereador">Vereador</option>
                    <option value="prefeito">Prefeito</option>
                </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModerationPage;