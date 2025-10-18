import React from 'react';
import { ArrowLeftIcon } from './Icons';

interface NotificationsSettingsProps {
  onBack: () => void;
}

const NotificationsSettings: React.FC<NotificationsSettingsProps> = ({ onBack }) => {
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
      <div className="text-center text-slate-500 p-8">
        <p>As configurações de notificação estarão disponíveis em breve.</p>
      </div>
    </div>
  );
};

export default NotificationsSettings;