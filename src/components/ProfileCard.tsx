import React from 'react';
import type { User } from '../types';
import RoleBadge from './RoleBadge';
import ProfilePictureViewer from './ProfilePictureViewer'; // Importando o novo componente

interface ProfileCardProps {
  user: User;
  onViewChange: (view: string) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user, onViewChange }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
      <div className="relative w-20 h-20 mx-auto">
        <ProfilePictureViewer 
            user={user} 
            size="lg" 
            onClick={() => onViewChange('Meu Perfil')} 
        />
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-max">
          <RoleBadge role={user.role} />
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold">{user.name}</h2>
        <p className="text-sm text-slate-500">@{user.handle}</p>
      </div>
    </div>
  );
};

export default ProfileCard;