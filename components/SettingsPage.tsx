import React from 'react';
import type { User } from '../types';
import { UserCircleIcon, ShieldCheckIcon, BellIcon, BookmarkIcon, SettingsIcon } from './Icons';

interface SettingsPageProps {
  user: User;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user }) => {
  const settingsItems = [
    { name: 'Perfil', icon: <UserCircleIcon className="h-6 w-6 text-primary" />, description: "Atualize sua foto, nome e informações pessoais." },
    { name: 'Conta', icon: <SettingsIcon className="h-6 w-6 text-primary" />, description: "Gerencie seu e-mail, senha e configurações de conta." },
    { name: 'Privacidade e Segurança', icon: <ShieldCheckIcon className="h-6 w-6 text-primary" />, description: "Controle quem vê suas informações e a segurança da sua conta." },
    { name: 'Notificações', icon: <BellIcon className="h-6 w-6 text-primary" />, description: "Escolha quais notificações você quer receber e como." },
    { name: 'Conteúdo Salvo', icon: <BookmarkIcon className="h-6 w-6 text-primary" />, description: "Veja e gerencie as publicações que você salvou." },
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <h1 className="text-2xl font-bold">Configurações</h1>
      <p className="text-slate-500 mt-1">Gerencie as configurações do seu perfil e da sua conta.</p>

      <div className="mt-8 space-y-4">
        {settingsItems.map(item => (
          <div key={item.name} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="bg-primary-50 p-3 rounded-full">
                {item.icon}
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">{item.name}</h3>
              <p className="text-sm text-slate-500">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;
