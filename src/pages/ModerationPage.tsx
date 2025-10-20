import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@/types';
import { ShieldCheckIcon, FileTextIcon } from '@/components/Icons';

const ModerationPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('permissions');

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
          is_moderator: profile.is_moderator,
        }));
        setUsers(formattedUsers);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleRoleChange = (userId: string, newRole: string) => {
    setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user));
  };

  const handleModeratorToggle = (userId: string) => {
    setUsers(users.map(user => user.id === userId ? { ...user, is_moderator: !user.is_moderator } : user));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setMessage(null);

    const updatePromises = users.map(user =>
      supabase
        .from('profiles')
        .update({ role: user.role, is_moderator: user.is_moderator })
        .eq('id', user.id)
    );

    const results = await Promise.allSettled(updatePromises);
    
    setIsSaving(false);

    const failedUpdates = results.filter(result => result.status === 'rejected');

    if (failedUpdates.length > 0) {
      setMessage({ type: 'error', text: 'Algumas permissões não puderam ser atualizadas. Tente novamente.' });
      console.error('Failed updates:', failedUpdates);
    } else {
      setMessage({ type: 'success', text: 'Todas as permissões foram atualizadas com sucesso!' });
    }
  };

  const renderPermissions = () => {
    if (loading) return <p className="text-center text-slate-500 py-8">Carregando usuários...</p>;
    if (error) return <p className="text-center text-red-500 py-8">{error}</p>;

    return (
      <div className="space-y-4">
        {users.map(user => (
          <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
            <div className="flex items-center space-x-4">
              <img src={user.avatarUrl} alt={user.name} className="h-12 w-12 rounded-full" />
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-bold text-slate-800">{user.name}</p>
                  {user.is_moderator && <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">Moderador</span>}
                </div>
                <p className="text-sm text-slate-500">@{user.handle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!user.is_moderator}
                  onChange={() => handleModeratorToggle(user.id)}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-slate-700">Moderador</span>
              </label>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderReports = () => (
    <div className="text-center py-16">
      <FileTextIcon className="h-12 w-12 mx-auto text-slate-300" />
      <h3 className="mt-4 text-lg font-semibold text-slate-800">Nenhum relatório no momento</h3>
      <p className="mt-1 text-sm text-slate-500">Relatórios de usuários e publicações aparecerão aqui.</p>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">Painel de Moderação</h1>
          <p className="text-slate-500 mt-1">Gerencie permissões de usuários e analise relatórios.</p>
        </div>
        {activeTab === 'permissions' && (
          <button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="bg-primary text-white font-semibold px-6 py-2 rounded-md hover:bg-primary-700 transition-colors disabled:bg-primary-300 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        )}
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="border-b border-slate-200 mb-6">
        <nav className="flex -mb-px space-x-6">
          <button
            onClick={() => setActiveTab('permissions')}
            className={`flex items-center space-x-2 py-3 px-1 font-semibold text-sm transition-colors duration-200 ${activeTab === 'permissions' ? 'border-b-2 border-primary text-primary' : 'border-b-2 border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}
          >
            <ShieldCheckIcon className="h-5 w-5" />
            <span>Permissões</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center space-x-2 py-3 px-1 font-semibold text-sm transition-colors duration-200 ${activeTab === 'reports' ? 'border-b-2 border-primary text-primary' : 'border-b-2 border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}
          >
            <FileTextIcon className="h-5 w-5" />
            <span>Relatórios</span>
          </button>
        </nav>
      </div>

      {activeTab === 'permissions' && renderPermissions()}
      {activeTab === 'reports' && renderReports()}
    </div>
  );
};

export default ModerationPage;