import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { XIcon } from './Icons';

interface ReportPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReport: (reason: string) => Promise<void>;
  isSubmitting: boolean;
}

const ReportPostModal: React.FC<ReportPostModalProps> = ({ isOpen, onClose, onReport, isSubmitting }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const reasons = [
    'Conteúdo ofensivo ou de ódio',
    'Spam ou fraude',
    'Informação falsa ou enganosa',
    'Assédio ou bullying',
    'Conteúdo impróprio',
    'Outro (especificar abaixo)',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let reason = selectedReason;
    
    if (selectedReason === 'Outro (especificar abaixo)') {
      reason = customReason.trim();
    }

    if (!reason) return;

    await onReport(reason);
    
    // Reset state after successful submission
    setSelectedReason('');
    setCustomReason('');
    onClose();
  };

  if (!isOpen) return null;

  const isSubmitDisabled = isSubmitting || !selectedReason || (selectedReason === 'Outro (especificar abaixo)' && !customReason.trim());

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-xl font-bold text-slate-800">Denunciar Ideia</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
            <XIcon className="h-6 w-6 text-slate-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-slate-600">Por favor, selecione o motivo da denúncia. Sua denúncia é anônima.</p>
          
          <div className="space-y-2">
            {reasons.map((reason) => (
              <label key={reason} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50">
                <input
                  type="radio"
                  name="report-reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={() => {
                    setSelectedReason(reason);
                    if (reason !== 'Outro (especificar abaixo)') {
                      setCustomReason('');
                    }
                  }}
                  className="h-4 w-4 text-red-600 border-slate-300 focus:ring-red-500"
                />
                <span className="text-sm text-slate-700">{reason}</span>
              </label>
            ))}
          </div>

          {selectedReason === 'Outro (especificar abaixo)' && (
            <div>
              <label htmlFor="custom-reason" className="block text-sm font-medium text-slate-700 mb-1">Especifique o motivo:</label>
              <textarea
                id="custom-reason"
                rows={3}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm resize-none"
                placeholder="Descreva o problema..."
                required
              />
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button 
              type="submit"
              disabled={isSubmitDisabled}
              className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:bg-red-300"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Denúncia'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ReportPostModal;