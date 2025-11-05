import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { XIcon } from './Icons';

interface EditCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentContent: string;
  onSave: (newContent: string) => Promise<void>;
  isSaving: boolean;
}

const EditCommentModal: React.FC<EditCommentModalProps> = ({ isOpen, onClose, currentContent, onSave, isSaving }) => {
  const [content, setContent] = useState(currentContent);

  useEffect(() => {
    if (isOpen) {
      setContent(currentContent);
    }
  }, [isOpen, currentContent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSave(content);
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-xl font-bold text-slate-800">Editar Contribuição</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
            <XIcon className="h-6 w-6 text-slate-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-content" className="block text-sm font-medium text-slate-700">Sua contribuição</label>
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
              disabled={isSaving || !content.trim()}
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

export default EditCommentModal;