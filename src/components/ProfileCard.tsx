import React from 'react';
import type { User } from '../types';
import { PencilIcon } from './Icons';
import ImageCropModal from './ImageCropModal';
import ProfilePictureModal from './ProfilePictureModal';
import { useProfilePictureManager } from '@/hooks/useProfilePictureManager';
import RoleBadge from './RoleBadge';

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
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
            <RoleBadge role={user.role} />
          </div>
        </div>
        <div className="mt-4 pt-2">
            <h2 className="text-xl font-bold hover:underline" onClick={() => onViewChange('Meu Perfil')}>{user.name}</h2>
            <p className="text-sm text-slate-500 hover:underline" onClick={() => onViewChange('Meu Perfil')}>@{user.handle}</p>
        </div>
      </div>
    </>
  );
};

export default ProfileCard;