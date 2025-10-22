import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import type { Post } from '@/types';
import { XIcon } from './Icons';

interface PostEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onSave: (updatedPost: { title: string; target_entity: string; content: string }) => Promise<void>;
  isSaving: boolean;
}

const PostEditModal: React.FC<PostEditModalProps> = ({ isOpen, onClose, post, onSave, isSaving }) => {
  const [title, setTitle] = useState(post.title);
  const [targetEntity, setTargetEntity] = useState(post.target_entity);
  const [content, setContent] = useState(post.content);

  useEffect(() => {
    if (isOpen) {
      setTitle(post.title);
      setTargetEntity(post.target_entity);
      setContent(post.content);
    }
  }, [isOpen, post]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !targetEntity) return;
    onSave({ title, target_entity: targetEntity, content });
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-xl font-bold text-slate-800">Editar Ideia</h2>
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
              disabled={isSaving || !title.trim() || !content.trim()}
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