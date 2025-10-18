import React from 'react';
import { ArrowLeftIcon } from './Icons';

interface AccountSettingsProps {
  onBack: () => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ onBack }) => {
  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 mr-4">
          <ArrowLeftIcon className="h-6 w-6 text-slate-600" />
        </button>
        <div>
            <h2 className="text-xl font-bold">Conta</h2>
            <p className="text-sm text-slate-500">Gerencie seu e-mail e senha.</p>
        </div>
      </div>
      <div className="text-center text-slate-500 p-8">
        <p>A funcionalidade de gerenciamento de conta estará disponível em breve.</p>
      </div>
    </div>
  );
};

export default AccountSettings;