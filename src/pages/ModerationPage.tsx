import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Report } from '@/types';
import { ShieldCheckIcon, FileTextIcon } from '@/components/Icons';
import ReportCard from '@/components/ReportCard';
import UserPermissionRow from '@/components/UserPermissionRow';

interface ModerationPageProps {
  onViewChange: (view: { view: string; postId?: string }) => void;
}

const ModerationPage: React.FC<ModerationPageProps> = ({ onViewChange }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('reports');
  const [initialUsers, setInitialUsers] = useState<User[]>([]); // Para rastrear se houve mudanças

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
      console.error('Error fetching users:', error);
      setError('Não foi possível carregar os usuários.');
      setUsers([]);
      setInitialUsers([]);
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
      setInitialUsers(formattedUsers);
    }
    setLoading(false);
  }, []);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const { data: reportsData, error: reportsError } = await supabase
      .from('reports')
      .select('*, post:post_id(title), reporter:reporter_id(handle)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (reportsError) {
      console.error('Error fetching reports:', reportsError);
      setError('Não foi possível carregar as denúncias.');
      setReports([]);
    } else {
      const formattedReports: Report[] = reportsData.map((r: any) => ({
        id: r.id,
        post_id: r.post_id,
        reporter_id: r.reporter_id,
        reason: r.reason,
        status: r.status,
        created_at: r.created_at,
        post_title: r.post.title,
        reporter_handle: r.reporter.handle || 'usuário',
      }));
      setReports(formattedReports);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'permissions') {
      fetchUsers();
    } else if (activeTab === 'reports') {
      fetchReports();
    }
  }, [activeTab, fetchUsers, fetchReports]);

  const handleRoleChange = (userId: string, newRole: string) => {
    setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user));
    setMessage(null); // Clear success/error message on change
  };

  const handleModeratorToggle = (userId: string) => {
    setUsers(users.map(user => user.id === userId ? { ...user, is_moderator: !user.is_moderator } : user));
    setMessage(null); // Clear success/error message on change
  };

  const hasChanges = JSON.stringify(users.map(u => ({ id: u.id, role: u.role, is_moderator: u.is_moderator }))) !== 
                     JSON.stringify(initialUsers.map(u => ({ id: u.id, role: u.role, is_moderator: u.is_moderator })));

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setMessage(null);

    // Filtra apenas os usuários que realmente tiveram mudanças
    const usersToUpdate = users.filter(user => {
        const initialUser = initialUsers.find(u => u.id === user.id);
        return initialUser && (initialUser.role !== user.role || initialUser.is_moderator !== user.is_moderator);
    });

    if (usersToUpdate.length === 0) {
        setMessage({ type: 'success', text: 'Nenhuma alteração para salvar.' });
        setIsSaving(false);
        return;
    }

    const updatePromises = usersToUpdate.map(user =>
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
      // Atualiza o estado inicial para refletir o estado salvo
      setInitialUsers(users);
    }
  };

  const handleUpdateReportStatus = async (reportId: string, newStatus: 'resolved' | 'rejected') => {
    const { error } = await supabase
      .from('reports')
      .update({ status: newStatus })
      .eq('id', reportId);

    if (error) {
      console.error(`Error updating report ${reportId}:`, error);
      setMessage({ type: 'error', text: `Erro ao atualizar a denúncia ${reportId}.` });
    } else {
      setMessage({ type: 'success', text: `Denúncia marcada como ${newStatus === 'resolved' ? 'resolvida' : 'rejeitada'}.` });
      // Remove the report optimistically
      setReports(prevReports => prevReports.filter(r => r.id !== reportId));
    }
  };

  const renderPermissions = () => {
    if (loading) return <p className="text-center text-slate-500 py-8">Carregando usuários...</p>;
    if (error) return <p className="text-center text-red-500 py-8">{error}</p>;

    return (
      <div className="space-y-4">
        {users.map(user => (
          <UserPermissionRow 
            key={user.id} 
            user={user} 
            onRoleChange={handleRoleChange} 
            onModeratorToggle={handleModeratorToggle} 
          />
        ))}
      </div>
    );
  };

  const renderReports = () => {
    if (loading) return <p className="text-center text-slate-500 py-8">Carregando denúncias...</p>;
    if (error) return <p className="text-center text-red-500 py-8">{error}</p>;

    return (
      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="text-center py-16">
            <FileTextIcon className="h-12 w-12 mx-auto text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold text-slate-800">Nenhuma denúncia pendente</h3>
            <p className="mt-1 text-sm text-slate-500">Todas as denúncias foram revisadas. Bom trabalho!</p>
          </div>
        ) : (
          reports.map(report => (
            <ReportCard 
              key={report.id} 
              report={report} 
              onUpdateStatus={handleUpdateReportStatus} 
              onViewPost={(postId) => onViewChange({ view: 'PostDetail', postId })}
            />
          ))
        )}
      </div>
    );
  };

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
            disabled={isSaving || !hasChanges}
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
            onClick={() => setActiveTab('reports')}
            className={`flex items-center space-x-2 py-3 px-1 font-semibold text-sm transition-colors duration-200 ${activeTab === 'reports' ? 'border-b-2 border-primary text-primary' : 'border-b-2 border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}
          >
            <FileTextIcon className="h-5 w-5" />
            <span>Denúncias ({reports.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`flex items-center space-x-2 py-3 px-1 font-semibold text-sm transition-colors duration-200 ${activeTab === 'permissions' ? 'border-b-2 border-primary text-primary' : 'border-b-2 border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}
          >
            <ShieldCheckIcon className="h-5 w-5" />
            <span>Permissões</span>
          </button>
        </nav>
      </div>

      {activeTab === 'permissions' && renderPermissions()}
      {activeTab === 'reports' && renderReports()}
    </div>
  );
};

export default ModerationPage;