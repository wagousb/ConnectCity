import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@/types';
import { ArrowLeftIcon } from './Icons';

interface PrivacySettingsProps {
  user: User;
  onBack: () => void;
}

const PrivacySettings: React.FC<PrivacySettingsProps> = ({ user, onBack }) => {
  const [isPublic, setIsPublic] = useState(user.is_public ?? true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleTogglePrivacy = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIsPublic = e.target.checked;
    setIsPublic(newIsPublic);
    setLoading(true);
    setMessage(null);

    const { error } = await supabase
      .from('profiles')
      .update({ is_public: newIsPublic })
      .eq('id', user.id);

    setLoading(false);

    if (error) {
      setMessage({ type: 'error', text: 'Erro ao atualizar a privacidade: ' + error.message });
      setIsPublic(!newIsPublic); // Revert on error
    } else {
      setMessage({ type: 'success', text: 'Configuração de privacidade atualizada.' });
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 mr-4">
          <ArrowLeftIcon className="h-6 w-6 text-slate-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold">Privacidade e Segurança</h2>
          <p className="text-sm text-slate-500">Controle suas informações.</p>
        </div>
      </div>
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
          <div>
            <h3 className="font-medium text-slate-800">Perfil Público</h3>
            <p className="text-sm text-slate-500">Permitir que outros usuários vejam seu perfil.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={handleTogglePrivacy}
              className="sr-only peer"
              disabled={loading}
            />
            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
        {message && (
          <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivacySettings;