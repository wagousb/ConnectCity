import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import type { Post } from '@/types';
import { XIcon } from './Icons';

interface PostEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onSave: (updatedPost: { 
    title: string; 
    target_entity: string; 
    content: string;
    start_date?: string;
    end_date?: string;
    project_status?: 'Não iniciado' | 'Em andamento' | 'Concluído';
  }) => Promise<void>;
  isSaving: boolean;
}

const PostEditModal: React.FC<PostEditModalProps> = ({ isOpen, onClose, post, onSave, isSaving }) => {
  const [title, setTitle] = useState(post.title);
  const [targetEntity, setTargetEntity] = useState(post.target_entity || '');
  const [content, setContent] = useState(post.content);
  const [startDate, setStartDate] = useState(post.start_date || '');
  const [endDate, setEndDate] = useState(post.end_date || '');
  const [projectStatus, setProjectStatus] = useState(post.project_status || 'Não iniciado');
  const [noStartDate, setNoStartDate] = useState(!post.start_date);
  const [noEndDate, setNoEndDate] = useState(!post.end_date);
  
  const isIdea = post.type === 'idea';
  const isAnnouncement = post.type === 'announcement';

  useEffect(() => {
    if (isOpen) {
      setTitle(post.title);
      setTargetEntity(post.target_entity || '');
      setContent(post.content);
      setStartDate(post.start_date || '');
      setEndDate(post.end_date || '');
      setProjectStatus(post.project_status || 'Não iniciado');
      setNoStartDate(!post.start_date);
      setNoEndDate(!post.end_date);
    }
  }, [isOpen, post]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || (isIdea && !targetEntity)) return;
    onSave({ 
        title, 
        target_entity: targetEntity, 
        content, 
        start_date: noStartDate ? undefined : startDate, 
        end_date: noEndDate ? undefined : endDate, 
        project_status: projectStatus 
    });
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-xl font-bold text-slate-800">Editar {isIdea ? 'Ideia' : isAnnouncement ? 'Anúncio' : 'Pronunciamento'}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
            <XIcon className="h-6 w-6 text-slate-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-title" className="block text-sm font-medium text-slate-700">Título</label>
            <input
              type="text"
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              required
            />
          </div>
          {isIdea && (
            <div>
              <label htmlFor="edit-entity" className="block text-sm font-medium text-slate-700">Destinatário</label>
              <select
                id="edit-entity"
                value={targetEntity}
                onChange={(e) => setTargetEntity(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                required
              >
                <option value="Prefeitura">Prefeitura</option>
                <option value="Câmara de Vereadores">Câmara de Vereadores</option>
                <option value="Secretários">Secretários</option>
              </select>
            </div>
          )}
          {isAnnouncement && (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="edit-start-date" className="block text-xs font-medium text-slate-600 mb-1">Início</label>
                        <input type="date" id="edit-start-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full text-sm border-slate-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:bg-slate-200 disabled:cursor-not-allowed" disabled={noStartDate} />
                        <div className="mt-2 flex items-center">
                            <input type="checkbox" id="edit-no-start-date" checked={noStartDate} onChange={(e) => { setNoStartDate(e.target.checked); if (e.target.checked) setStartDate(''); }} className="h-4 w-4 text-primary border-slate-300 rounded focus:ring-primary" />
                            <label htmlFor="edit-no-start-date" className="ml-2 text-xs text-slate-600">Sem data de início</label>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="edit-end-date" className="block text-xs font-medium text-slate-600 mb-1">Fim</label>
                        <input type="date" id="edit-end-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full text-sm border-slate-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:bg-slate-200 disabled:cursor-not-allowed" disabled={noEndDate} />
                        <div className="mt-2 flex items-center">
                            <input type="checkbox" id="edit-no-end-date" checked={noEndDate} onChange={(e) => { setNoEndDate(e.target.checked); if (e.target.checked) setEndDate(''); }} className="h-4 w-4 text-primary border-slate-300 rounded focus:ring-primary" />
                            <label htmlFor="edit-no-end-date" className="ml-2 text-xs text-slate-600">Sem previsão de finalização</label>
                        </div>
                    </div>
                </div>
                <div>
                    <label htmlFor="edit-project-status" className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                    <select id="edit-project-status" value={projectStatus} onChange={(e) => setProjectStatus(e.target.value as any)} className="w-full text-sm border-slate-300 rounded-md p-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-200">
                        <option value="Não iniciado">Não iniciado</option>
                        <option value="Em andamento">Em andamento</option>
                        <option value="Concluído">Concluído</option>
                    </select>
                </div>
            </div>
          )}
          <div>
            <label htmlFor="edit-content" className="block text-sm font-medium text-slate-700">Descrição</label>
            <textarea
              id="edit-content"
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm resize-none"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button 
              type="button"
              onClick={onClose} 
              className="bg-slate-200 text-slate-800 font-semibold px-4 py-2 rounded-md hover:bg-slate-300 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={isSaving || !title.trim() || !content.trim() || (isIdea && !targetEntity)}
              className="bg-primary text-white font-semibold px-4 py-2 rounded-md hover:bg-primary-700 transition-colors disabled:bg-primary-300"
            >
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default PostEditModal;