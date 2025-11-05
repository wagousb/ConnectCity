import React, { useState } from 'react';
import type { User } from '@/types';
import { UserCircleIcon, ShieldCheckIcon, BellIcon, SettingsIcon, DownloadIcon } from '@/components/Icons';
import ProfileSettingsForm from './ProfileSettingsForm';
import AccountSettings from './AccountSettings';
import PrivacySettings from './PrivacySettings';
import NotificationsSettings from './NotificationsSettings';
import { usePwaInstall } from '@/contexts/PwaInstallContext';
import { useIsMobile } from '@/hooks/useIsMobile';

interface SettingsPageProps {
  user: User;
  onViewChange: (view: string) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user }) => {
  const [activeSetting, setActiveSetting] = useState<string | null>(null);
  const { canInstall, triggerInstall } = usePwaInstall();
  const isMobile = useIsMobile();

  const baseSettingsItems = [
    { name: 'Perfil', icon: <UserCircleIcon className="h-6 w-6 text-primary" />, description: "Atualize sua foto, nome e informações pessoais." },
    { name: 'Conta', icon: <SettingsIcon className="h-6 w-6 text-primary" />, description: "Gerencie seu e-mail, senha e configurações de conta." },
    { name: 'Notificações', icon: <BellIcon className="h-6 w-6 text-primary" />, description: "Escolha quais notificações você quer receber e como." },
  ];

  const moderatorSettingsItem = { name: 'Privacidade e Segurança', icon: <ShieldCheckIcon className="h-6 w-6 text-primary" />, description: "Controle quem vê suas informações e a segurança da sua conta." };

  const settingsItems = user.is_moderator 
    ? [...baseSettingsItems, moderatorSettingsItem]
    : baseSettingsItems;

  const handleItemClick = (name: string) => {
    setActiveSetting(name);
  };

  const renderContent = () => {
    switch (activeSetting) {
      case 'Perfil':
        return <ProfileSettingsForm user={user} onBack={() => setActiveSetting(null)} />;
      case 'Conta':
        return <AccountSettings onBack={() => setActiveSetting(null)} />;
      case 'Privacidade e Segurança':
        if (!user.is_moderator) {
            // Fallback de segurança caso o usuário tente acessar via URL/estado
            return (
                <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
                    <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
                    <p className="text-slate-500 mt-2">Você não tem permissão para acessar esta configuração.</p>
                    <button onClick={() => setActiveSetting(null)} className="mt-4 text-primary hover:underline">Voltar para Configurações</button>
                </div>
            );
        }
        return <PrivacySettings user={user} onBack={() => setActiveSetting(null)} />;
      case 'Notificações':
        return <NotificationsSettings user={user} onBack={() => setActiveSetting(null)} />;
      default:
        return (
          <>
            <h1 className="text-2xl font-bold">Configurações</h1>
            <p className="text-slate-500 mt-1">Gerencie as configurações do seu perfil e da sua conta.</p>
            <div className="mt-8 space-y-4">
              {settingsItems.map(item => (
                <div key={item.name} onClick={() => handleItemClick(item.name)} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className="bg-primary-50 p-3 rounded-full">
                      {item.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{item.name}</h3>
                    <p className="text-sm text-slate-500">{item.description}</p>
                  </div>
                </div>
              ))}
              {canInstall && isMobile && (
                <div onClick={triggerInstall} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className="bg-primary-50 p-3 rounded-full">
                      <DownloadIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Baixar Aplicativo</h3>
                    <p className="text-sm text-slate-500">Instale o aplicativo em seu dispositivo para uma experiência melhor.</p>
                  </div>
                </div>
              )}
            </div>
          </>
        );
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      {renderContent()}
    </div>
  );
};

export default SettingsPage;