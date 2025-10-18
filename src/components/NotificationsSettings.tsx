import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@/types';
import { ArrowLeftIcon } from './Icons';

interface NotificationsSettingsProps {
  user: User;
  onBack: () => void;
}

const NotificationsSettings: React.FC<NotificationsSettingsProps> = ({ user, onBack }) => {
  const [settings, setSettings] = useState({
    likes: user.notifications_on_likes ?? true,
    comments: user.notifications_on_comments ?? true,
  });
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleToggle = async (settingName: keyof typeof settings) => {
    const newSettings = { ...settings, [settingName]: !settings[settingName] };
    setSettings(newSettings);
    setLoading(settingName);
    setMessage(null);

    const updatePayload = {
      ['notifications_on_' + settingName]: newSettings[settingName],
    };

    const { error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id);

    setLoading(null);

    if (error) {
      setMessage({ type: 'error', text: 'Erro ao atualizar as notificações: ' + error.message });
      // Revert on error
      setSettings(settings);
    } else {
      setMessage({ type: 'success', text: 'Configurações de notificação atualizadas.' });
    }
  };

  const notificationOptions = [
    { key: 'likes' as keyof typeof settings, label: 'Votos', description: 'Receber notificações sobre votos em suas publicações.' },
    { key: 'comments' as keyof typeof settings, label: 'Contribuições', description: 'Receber notificações quando alguém fizer uma contribuição em suas publicações.' },
  ];

  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 mr-4">
          <ArrowLeftIcon className="h-6 w-6 text-slate-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold">Notificações</h2>
          <p className="text-sm text-slate-500">Escolha como você quer ser notificado.</p>
        </div>
      </div>
      <div className="space-y-4 pt-4">
        {notificationOptions.map(option => (
          <div key={option.key} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
            <div>
              <h3 className="font-medium text-slate-800">{option.label}</h3>
              <p className="text-sm text-slate-500">{option.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings[option.key]}
                onChange={() => handleToggle(option.key)}
                className="sr-only peer"
                disabled={loading === option.key}
              />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        ))}
        {message && (
          <div className={`mt-4 p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsSettings;