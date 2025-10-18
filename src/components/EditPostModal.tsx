import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import type { Post } from '@/types';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPost: { title: string; content: string; target_entity: string }) => Promise<void>;
  post: Post;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ isOpen, onClose, onSave, post }) => {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [targetEntity, setTargetEntity] = useState(post.target_entity);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    await onSave({ title, content, target_entity: targetEntity });
    setIsSaving(false);
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Editar Ideia</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700">Título</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="targetEntity" className="block text-sm font-medium text-slate-700">Destinatário</label>
            <select
              id="targetEntity"
              value={targetEntity}
              onChange={(e) => setTargetEntity(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            >
              <option value="Prefeitura (Executivo)">Prefeitura (Executivo)</option>
              <option value="Câmara de vereadores (Legislativo)">Câmara de vereadores (Legislativo)</option>
              <option value="Secretários">Secretários</option>
            </select>
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-slate-700">Descrição</label>
            <textarea
              id="content"
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button onClick={onClose} className="bg-slate-200 text-slate-800 font-semibold px-4 py-2 rounded-md hover:bg-slate-300 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary text-white font-semibold px-4 py-2 rounded-md hover:bg-primary-700 transition-colors disabled:bg-primary-300"
          >
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EditPostModal;