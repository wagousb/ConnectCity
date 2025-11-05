import React, { useState } from 'react';
import type { Post, User } from '@/types';
import { MessageCircleIcon, StarIcon, PaperclipIcon, MegaphoneIcon, CheckCircleIcon, CalendarIcon, ClipboardListIcon } from '@/components/Icons';
import { supabase } from '@/integrations/supabase/client';
import ContributionsSection from './ContributionsSection';
import RoleBadge from './RoleBadge';
import PostActionsDropdown from './PostActionsDropdown';
import ConfirmationModal from './ConfirmationModal';
import PostEditModal from './PostEditModal';
import ReportPostModal from './ReportPostModal';

interface PostCardProps {
  post: Post;
  currentUser: User;
  onVote: (postId: string, rating: number) => void;
  onViewChange: (view: { view: string; userId?: string; postId?: string }) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onVote, onViewChange }) => {
  const [isVoting, setIsVoting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  
  const isAuthor = post.author.id === currentUser.id;
  const isIdea = post.type === 'idea';
  const isAnnouncement = post.type === 'announcement';
  const isSpeech = post.type === 'speech';

  const getEntityBadgeColor = (entity: string) => {
    switch (entity) {
      case 'Prefeitura': return 'bg-blue-100 text-blue-800';
      case 'Câmara de Vereadores': return 'bg-green-100 text-green-800';
      case 'Secretários': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Concluído': return 'bg-green-100 text-green-800';
      case 'Em andamento': return 'bg-yellow-100 text-yellow-800';
      case 'Não iniciado':
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const handleVote = async (rating: number) => {
    if (!currentUser || !isIdea) return; // Só permite votar em ideias

    const isFirstVote = !post.user_rating || post.user_rating === 0;

    const { error } = await supabase.from('ratings').upsert(
        { post_id: post.id, user_id: currentUser.id, rating },
        { onConflict: 'post_id, user_id' }
    );

    if (error) {
        console.error("Error voting:", error);
    } else {
        onVote(post.id, rating);
        setIsVoting(false);
        if (isFirstVote && currentUser.id !== post.author.id) {
            await supabase.from('notifications').insert({
                user_id: post.author.id,
                actor_id: currentUser.id,
                type: 'rating',
                entity_id: post.id
            });
        }
    }
  };

  const handleDeletePost = async () => {
    setIsSaving(true);
    const { error } = await supabase.from('posts').delete().eq('id', post.id);
    setIsSaving(false);
    setIsDeleteModalOpen(false);

    if (error) {
        console.error('Error deleting post:', error);
        alert('Erro ao excluir a ideia. Tente novamente.');
    } else {
        // Força o refresh do feed para remover o post
        onViewChange({ view: 'Feed' });
    }
  };

  const handleSaveEdit = async (updatedFields: { 
    title: string; 
    target_entity: string; 
    content: string;
    start_date?: string;
    end_date?: string;
    project_status?: 'Não iniciado' | 'Em andamento' | 'Concluído';
  }) => {
    setIsSaving(true);
    
    const { error: postUpdateError } = await supabase
        .from('posts')
        .update({
            title: updatedFields.title,
            target_entity: isIdea ? updatedFields.target_entity : null,
            content: updatedFields.content,
            edited_at: new Date().toISOString(),
            start_date: isAnnouncement ? updatedFields.start_date || null : null,
            end_date: isAnnouncement ? updatedFields.end_date || null : null,
            project_status: isAnnouncement ? updatedFields.project_status || null : null,
        })
        .eq('id', post.id);

    if (postUpdateError) {
        console.error('Error updating post:', postUpdateError);
        setIsSaving(false);
        alert('Erro ao salvar as alterações. Tente novamente.');
        return;
    }

    const { error: editInsertError } = await supabase
        .from('post_edits')
        .insert({
            post_id: post.id,
            editor_id: currentUser.id,
            previous_title: post.title,
            new_title: updatedFields.title,
            previous_content: post.content,
            new_content: updatedFields.content,
            previous_target_entity: post.target_entity,
            new_target_entity: isIdea ? updatedFields.target_entity : null,
        });

    if (editInsertError) {
        console.error('Error inserting post edit history:', editInsertError);
    }

    setIsSaving(false);
    setIsEditModalOpen(false);
    onViewChange({ view: 'Feed' }); 
  };

  const handleReportPost = async (reason: string) => {
    setIsReporting(true);
    const { error } = await supabase.from('reports').insert({
        post_id: post.id,
        reporter_id: currentUser.id,
        reason: reason,
    });
    setIsReporting(false);

    if (error) {
        console.error('Error reporting post:', error);
        alert('Erro ao enviar a denúncia. Tente novamente.');
    } else {
        alert('Denúncia enviada com sucesso. Agradecemos sua contribuição para manter a comunidade segura.');
    }
  };

  const getPostTypeHeader = () => {
    if (isAnnouncement) {
        return (
            <div className="flex items-center space-x-2 text-green-600 font-semibold text-sm mb-2">
                <CheckCircleIcon className="h-5 w-5 fill-green-600" />
                <span>Anúncio de Projeto Implementado</span>
            </div>
        );
    }
    if (isSpeech) {
        return (
            <div className="flex items-center space-x-2 text-primary font-semibold text-sm mb-2">
                <MegaphoneIcon className="h-5 w-5" />
                <span>Pronunciamento Oficial</span>
            </div>
        );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeletePost}
        title={`Excluir ${isIdea ? 'Ideia' : isAnnouncement ? 'Anúncio' : 'Pronunciamento'}`}
        confirmText={isSaving ? 'Excluindo...' : 'Sim, Excluir'}
        cancelText="Cancelar"
        confirmButtonClass="bg-red-600 hover:bg-red-700 disabled:bg-red-300"
        message={
          <p>Você tem certeza que deseja excluir esta {isIdea ? 'ideia' : isAnnouncement ? 'anúncio' : 'pronunciamento'}? Esta ação é permanente e removerá a postagem e todas as suas contribuições.</p>
        }
      />
      <PostEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        post={post}
        onSave={handleSaveEdit}
        isSaving={isSaving}
      />
      <ReportPostModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onReport={handleReportPost}
        isSubmitting={isReporting}
      />

      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div 
            className="relative cursor-pointer"
            onClick={() => onViewChange({ view: 'Profile', userId: post.author.id })}
          >
            <img src={post.author.avatarUrl} alt={post.author.name} className="h-12 w-12 rounded-full" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-max">
              <RoleBadge role={post.author.role} size="xs" />
            </div>
          </div>
          <div 
            className="cursor-pointer pt-2"
            onClick={() => onViewChange({ view: 'Profile', userId: post.author.id })}
          >
            <p className="font-bold hover:underline">{post.author.name.split(' ')[0]}</p>
            <p className="text-sm text-slate-500">@{post.author.handle} &middot; {post.timestamp}</p>
          </div>
        </div>
        <PostActionsDropdown 
            onEdit={() => setIsEditModalOpen(true)}
            onDelete={() => setIsDeleteModalOpen(true)}
            onReport={() => setIsReportModalOpen(true)}
            isAuthor={isAuthor}
        />
      </div>
      
      <div className="mt-6">
        {getPostTypeHeader()}
        {isIdea && post.target_entity && (
            <p className="text-xs font-semibold text-slate-500 mb-1">
                Para: 
                <span className={`ml-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${getEntityBadgeColor(post.target_entity)}`}>
                    {post.target_entity}
                </span>
            </p>
        )}
        <h3 
          className="text-xl font-bold text-slate-800 hover:underline cursor-pointer mt-2"
          onClick={() => onViewChange({ view: 'PostDetail', postId: post.id })}
        >
          {post.title}
        </h3>
        <p className="my-2 text-slate-700 whitespace-pre-wrap">{post.content}</p>
      </div>

      {isAnnouncement && (post.start_date || post.end_date || post.project_status) && (
        <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            {post.project_status && (
                <div className="flex items-center space-x-2">
                    <ClipboardListIcon className="h-5 w-5 text-slate-500" />
                    <span className="font-semibold text-slate-700">Status:</span>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusBadgeColor(post.project_status)}`}>
                        {post.project_status}
                    </span>
                </div>
            )}
            {post.start_date && (
                <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-5 w-5 text-slate-500" />
                    <span className="font-semibold text-slate-700">Início:</span>
                    <span className="text-slate-600">{new Date(post.start_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                </div>
            )}
            {post.end_date && (
                <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-5 w-5 text-slate-500" />
                    <span className="font-semibold text-slate-700">Fim:</span>
                    <span className="text-slate-600">{new Date(post.end_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                </div>
            )}
        </div>
      )}

      {post.imageUrl && (
        <div className="my-4">
          <img src={post.imageUrl} alt="Imagem do projeto" className="rounded-lg max-h-96 w-full object-cover" />
        </div>
      )}

      {post.document_url && (
        <div className="my-4">
          <a 
            href={post.document_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 p-3 rounded-lg transition-colors"
          >
            <PaperclipIcon className="h-5 w-5 text-slate-600" />
            <span className="text-sm font-medium text-primary hover:underline">Ver documento anexado (PDF)</span>
          </a>
        </div>
      )}

      <div className="flex items-center justify-between text-slate-500 pt-4 border-t border-slate-200">
        <button onClick={() => setIsCommentsOpen(!isCommentsOpen)} className="flex items-center space-x-2 hover:text-blue-500">
          <MessageCircleIcon className="h-5 w-5" />
          <span className="text-sm font-medium">{post.comments} Contribuições</span>
        </button>
        
        {isIdea && (
            <button 
              className="flex items-center space-x-2 hover:text-amber-500"
              onClick={() => setIsVoting(!isVoting)}
            >
              <StarIcon className={`h-5 w-5 transition-colors ${post.user_rating && post.user_rating > 0 ? 'text-amber-400 fill-amber-400' : (post.average_rating && post.average_rating > 0 ? 'text-amber-400' : '')}`} />
              {post.total_votes && post.total_votes > 0 ? (
                <span className="text-sm font-medium">
                  {post.average_rating?.toFixed(1)} ({post.total_votes} {post.total_votes === 1 ? 'voto' : 'votos'})
                </span>
              ) : (
                <span className="text-sm font-medium">{post.user_rating && post.user_rating > 0 ? 'Avaliado' : 'Votar'}</span>
              )}
            </button>
        )}
      </div>

      {isVoting && isIdea && (
        <div className="flex items-center justify-center space-x-1 mt-4 border-t border-slate-200 pt-4">
            {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                    key={star}
                    className={`h-8 w-8 cursor-pointer transition-colors ${
                        (hoverRating || post.user_rating || 0) >= star 
                        ? 'text-amber-400 fill-amber-400' 
                        : 'text-slate-300'
                    }`}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleVote(star)}
                />
            ))}
        </div>
      )}

      {isCommentsOpen && <ContributionsSection postId={post.id} postAuthorId={post.author.id} currentUser={currentUser} />}
    </div>
  );
};

export default PostCard;