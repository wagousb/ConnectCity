import React from 'react';
import type { User } from '../types';

interface ProfileCardProps {
  user: User;
  onViewChange: (view: string) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user, onViewChange }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
      <img
        src={user.avatarUrl}
        alt={user.name}
        className="w-20 h-20 rounded-full mx-auto -mt-16 border-4 border-white"
      />
      <h2 className="text-xl font-bold mt-4">{user.name}</h2>
      <p className="text-sm text-slate-500">@{user.handle}</p>
      <div className="flex justify-around my-6 text-sm">
        <div>
          <p className="font-bold text-lg">{user.following ? (user.following / 1000).toFixed(1) + 'k' : '0'}</p>
          <p className="text-slate-500">Seguindo</p>
        </div>
        <div>
          <p className="font-bold text-lg">{user.followers ? (user.followers / 1000).toFixed(1) + 'k' : '0'}</p>
          <p className="text-slate-500">Seguidores</p>
        </div>
      </div>
      <button 
        className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary-700 transition-colors duration-300"
        onClick={() => onViewChange('Meu Perfil')}
      >
        Meu Perfil
      </button>
    </div>
  );
};

export default ProfileCard;