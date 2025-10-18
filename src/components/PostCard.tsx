import React, { useState, useRef, useEffect } from 'react';
import type { Post, User } from '@/types';
import { MessageCircleIcon, StarIcon, PaperclipIcon, MoreHorizontalIcon, PencilIcon, FileTextIcon, XIcon } from '@/components/Icons';
import { supabase } from '@/integrations/supabase/client';
import ContributionsSection from './ContributionsSection';
import RoleBadge from './RoleBadge';
import EditPostModal from './EditPostModal';
import EditHistoryModal from './EditHistoryModal';

interface PostCardProps {
  post: Post;
  currentUser: User;
  onVote: (postId: string, rating: number) => void;
  onViewChange: (view: { view: string; userId?: string; postId?: string }) => void;
  onPostDeleted: (postId: string) => void;
  onPostUpdated: (updatedPost: Post) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onVote, onViewChange, onPostDeleted, onPostUpdated }) => {
  const [isVoting, setIsVoting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAuthor = currentUser.id === post.author.id;
  const isModerator = currentUser.is_moderator;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getEntityBadgeColor = (entity: string) => {
    switch (entity) {
      case 'Prefeitura (Executivo)': return 'bg-blue-100 text-blue-800';
      case 'Câmara de vereadores (Legislativo)': return 'bg-green-100 text-green-800';
      case 'Secretários': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const handleVote = async (rating: number) => {
    if (!currentUser) return;
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

  const handleDelete = async () => {
    const { error } = await supabase.from('posts').delete().eq('id', post.id);
    if (error) {
      alert('Erro ao excluir a postagem: ' + error.message);
    } else {
      onPostDeleted(post.id);
    }
    setIsDeleteModalOpen(false);
  };

  const handleSaveEdit = async (updatedData: { title: string; content: string; target_entity: string }) => {
    const { error: editError } = await supabase.from('post_edits').insert({
      post_id: post.id,
      editor_id: currentUser.id,
      previous_title: post.title,
      new_title: updatedData.title,
      previous_content: post.content,
      new_content: updatedData.content,
      previous_target_entity: post.target_entity,
      new_target_entity: updatedData.target_entity,
    });

    if (editError) {
      alert('Erro ao salvar o histórico de edição: ' + editError.message);
      return;
    }

    const { data, error } = await supabase.from('posts').update({
      ...updatedData,
      edited_at: new Date().toISOString(),
    }).eq('id', post.id).select().single();

    if (error) {
      alert('Erro ao atualizar a postagem: ' + error.message);
    } else {
      onPostUpdated({ ...post, ...data });
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="relative cursor-pointer" onClick={() => onViewChange({ view: 'Profile', userId: post.author.id })}>
              <img src={post.author.avatarUrl} alt={post.author.name} className="h-12 w-12 rounded-full" />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-max">
                <RoleBadge role={post.author.role} size="xs" />
              </div>
            </div>
            <div className="cursor-pointer pt-2" onClick={() => onViewChange({ view: 'Profile', userId: post.author.id })}>
              <p className="font-bold hover:underline">{post.author.name.split(' ')[0]}</p>
              <p className="text-sm text-slate-500">@{post.author.handle} &middot; {post.timestamp}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getEntityBadgeColor(post.target_entity)}`}>
              Para: {post.target_entity}
            </span>
            {(isAuthor || isModerator) && (
              <div className="relative" ref={menuRef}>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full hover:bg-slate-100">
                  <MoreHorizontalIcon className="h-5 w-5 text-slate-500" />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-slate-200 z-10">
                    {isAuthor && (
                      <button onClick={() => { setIsEditModalOpen(true); setIsMenuOpen(false); }} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <PencilIcon className="h-4 w-4" />
                        <span>Editar</span>
                      </button>
                    )}
                    {(isAuthor || isModerator) && (
                      <button onClick={() => { setIsDeleteModalOpen(true); setIsMenuOpen(false); }} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        <XIcon className="h-4 w-4" />
                        <span>Excluir</span>
                      </button>
                    )}
                    {isModerator && post.edited_at && (
                       <button onClick={() => { setIsHistoryModalOpen(true); setIsMenuOpen(false); }} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <FileTextIcon className="h-4 w-4" />
                        <span>Ver Histórico</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="text-xl font-bold text-slate-800 hover:underline cursor-pointer" onClick={() => onViewChange({ view: 'PostDetail', postId: post.id })}>
            {post.title}
          </h3>
          {post.edited_at && <span className="text-xs text-slate-400 italic">(editado)</span>}
          <p className="my-2 text-slate-700 whitespace-pre-wrap">{post.content}</p>
        </div>

        {post.imageUrl && (
          <div className="my-4">
            <img src={post.imageUrl} alt="Imagem do projeto" className="rounded-lg w-full object-cover" />
          </div>
        )}

        {post.document_url && (
          <div className="my-4">
            <a href={post.document_url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 p-3 rounded-lg transition-colors">
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
          <button className="flex items-center space-x-2 hover:text-amber-500" onClick={() => setIsVoting(!isVoting)}>
            <StarIcon className={`h-5 w-5 transition-colors ${post.user_rating && post.user_rating > 0 ? 'text-amber-400 fill-amber-400' : (post.average_rating && post.average_rating > 0 ? 'text-amber-400' : '')}`} />
            {post.total_votes && post.total_votes > 0 ? (
              <span className="text-sm font-medium">{post.average_rating?.toFixed(1)} ({post.total_votes} {post.total_votes === 1 ? 'voto' : 'votos'})</span>
            ) : (
              <span className="text-sm font-medium">{post.user_rating && post.user_rating > 0 ? 'Avaliado' : 'Votar'}</span>
            )}
          </button>
        </div>

        {isVoting && (
          <div className="flex items-center justify-center space-x-1 mt-4 border-t border-slate-200 pt-4">
              {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon key={star} className={`h-8 w-8 cursor-pointer transition-colors ${(hoverRating || post.user_rating || 0) >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => handleVote(star)} />
              ))}
          </div>
        )}

        {isCommentsOpen && <ContributionsSection postId={post.id} postAuthorId={post.author.id} currentUser={currentUser} />}
      </div>
      {isEditModalOpen && <EditPostModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveEdit} post={post} />}
      {isHistoryModalOpen && <EditHistoryModal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} postId={post.id} />}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold">Confirmar Exclusão</h3>
            <p className="text-slate-600 mt-2">Tem certeza de que deseja excluir esta postagem? Esta ação não pode ser desfeita.</p>
            <div className="flex justify-end space-x-4 mt-6">
              <button onClick={() => setIsDeleteModalOpen(false)} className="bg-slate-200 text-slate-800 font-semibold px-4 py-2 rounded-md hover:bg-slate-300">Cancelar</button>
              <button onClick={handleDelete} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostCard;