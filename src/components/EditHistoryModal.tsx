import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { supabase } from '@/integrations/supabase/client';
import type { PostEdit } from '@/types';

interface EditHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

const EditHistoryModal: React.FC<EditHistoryModalProps> = ({ isOpen, onClose, postId }) => {
  const [history, setHistory] = useState<PostEdit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchHistory = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('post_edits')
          .select('*')
          .eq('post_id', postId)
          .order('edited_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching edit history:', error);
        } else {
          setHistory(data);
        }
        setLoading(false);
      };
      fetchHistory();
    }
  }, [isOpen, postId]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Histórico de Edições</h2>
        {loading ? (
          <p>Carregando histórico...</p>
        ) : history.length === 0 ? (
          <p>Nenhuma edição encontrada.</p>
        ) : (
          <div className="space-y-4">
            {history.map(edit => (
              <div key={edit.id} className="border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-500 mb-2">
                  Editado em: {new Date(edit.edited_at).toLocaleString('pt-BR')}
                </p>
                <div className="space-y-2 text-sm">
                  {edit.previous_title !== edit.new_title && (
                    <div>
                      <strong className="font-semibold">Título:</strong>
                      <p className="text-red-600 line-through">De: {edit.previous_title}</p>
                      <p className="text-green-600">Para: {edit.new_title}</p>
                    </div>
                  )}
                  {edit.previous_content !== edit.new_content && (
                    <div>
                      <strong className="font-semibold">Descrição:</strong>
                      <p className="text-red-600 line-through whitespace-pre-wrap">De: {edit.previous_content}</p>
                      <p className="text-green-600 whitespace-pre-wrap">Para: {edit.new_content}</p>
                    </div>
                  )}
                  {edit.previous_target_entity !== edit.new_target_entity && (
                    <div>
                      <strong className="font-semibold">Destinatário:</strong>
                      <p className="text-red-600 line-through">De: {edit.previous_target_entity}</p>
                      <p className="text-green-600">Para: {edit.new_target_entity}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="bg-slate-200 text-slate-800 font-semibold px-4 py-2 rounded-md hover:bg-slate-300 transition-colors">
            Fechar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EditHistoryModal;