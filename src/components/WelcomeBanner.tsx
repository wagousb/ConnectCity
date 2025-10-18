import React from 'react';
import type { User } from '@/types';
import { PartyPopperIcon, PencilIcon } from './Icons';

interface WelcomeBannerProps {
  user: User;
  isFirstLogin?: boolean;
  onNavigateToSettings: () => void;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ user, isFirstLogin, onNavigateToSettings }) => {
  const isProfileDefault = user.bio === 'Bem-vindo ao ConnectCity!';

  if (!isFirstLogin && !isProfileDefault) {
    return null;
  }

  return (
    <div className="bg-primary-50 border-l-4 border-primary p-4 rounded-r-lg mb-6">
      <div className="flex">
        <div className="py-1">
          <PartyPopperIcon className="h-6 w-6 text-primary mr-4" />
        </div>
        <div>
          {isFirstLogin && (
            <h3 className="font-bold text-primary">Bem-vindo(a) ao ConnectCity, {user.name}!</h3>
          )}
          <p className="text-sm text-slate-700 mt-1">
            Seu perfil é sua identidade na comunidade. Que tal personalizá-lo? Adicione uma bio e troque sua foto para que outros membros possam te conhecer melhor.
          </p>
          <button 
            onClick={onNavigateToSettings}
            className="mt-3 bg-primary text-white font-semibold px-4 py-1.5 rounded-md hover:bg-primary-700 transition-colors text-sm flex items-center space-x-2"
          >
            <PencilIcon className="h-4 w-4" />
            <span>Editar Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;