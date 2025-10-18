import React from 'react';
import type { User } from '../types';
import RoleBadge from './RoleBadge';

interface ProfileCardProps {
  user: User;
  onViewChange: (view: string) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user, onViewChange }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
      <div className="relative w-20 h-20 mx-auto">
        <button onClick={() => onViewChange('Meu Perfil')} className="rounded-full">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-20 h-20 rounded-full border-4 border-white hover:opacity-75 transition-opacity"
          />
        </button>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-max">
          <RoleBadge role={user.role} />
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold hover:underline cursor-pointer" onClick={() => onViewChange('Meu Perfil')}>{user.name}</h2>
        <p className="text-sm text-slate-500 hover:underline cursor-pointer" onClick={() => onViewChange('Meu Perfil')}>@{user.handle}</p>
      </div>
    </div>
  );
};

export default ProfileCard;