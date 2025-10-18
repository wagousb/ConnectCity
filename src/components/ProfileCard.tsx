import React from 'react';
import type { User } from '../types';
import { PencilIcon } from './Icons';
import ImageCropModal from './ImageCropModal';
import ProfilePictureModal from './ProfilePictureModal';
import { useProfilePictureManager } from '@/hooks/useProfilePictureManager';

interface ProfileCardProps {
  user: User;
  onViewChange: (view: string) => void;
  onUserUpdate: (newProfileData: Partial<User>) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user, onViewChange, onUserUpdate }) => {
  const {
    isCropModalOpen,
    isProfilePicModalOpen,
    openProfilePicModal,
    closeProfilePicModal,
    openCropModal,
    closeCropModal,
    handleSaveCroppedImage,
  } = useProfilePictureManager(user, onUserUpdate);

  return (
    <>
      <ProfilePictureModal
        isOpen={isProfilePicModalOpen}
        onClose={closeProfilePicModal}
        onChange={openCropModal}
        imageUrl={user.avatarUrl}
        userName={user.name}
      />
      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={closeCropModal}
        onSave={handleSaveCroppedImage}
      />
      <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
        <div className="relative w-20 h-20 mx-auto">
            <button onClick={openProfilePicModal} className="relative group rounded-full">
                <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-20 h-20 rounded-full border-4 border-white group-hover:opacity-75 transition-opacity"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <PencilIcon className="h-6 w-6 text-white" />
                </div>
            </button>
        </div>
        <h2 className="text-xl font-bold mt-4">{user.name}</h2>
        <p className="text-sm text-slate-500">@{user.handle}</p>
        <div className="flex justify-around my-6 text-sm">
          <button onClick={() => onViewChange('Seguindo')} className="text-left p-2 rounded-md hover:bg-slate-50 transition-colors">
            <p className="font-bold text-lg text-center">{user.following ? (user.following / 1000).toFixed(1) + 'k' : '0'}</p>
            <p className="text-slate-500">Seguindo</p>
          </button>
          <button onClick={() => onViewChange('Seguidores')} className="text-left p-2 rounded-md hover:bg-slate-50 transition-colors">
            <p className="font-bold text-lg text-center">{user.followers ? (user.followers / 1000).toFixed(1) + 'k' : '0'}</p>
            <p className="text-slate-500">Seguidores</p>
          </button>
        </div>
        <button 
          className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary-700 transition-colors duration-300"
          onClick={() => onViewChange('Meu Perfil')}
        >
          Meu Perfil
        </button>
      </div>
    </>
  );
};

export default ProfileCard;