import React, { useState } from 'react';
import type { User } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { PencilIcon } from './Icons';
import ImageCropModal from './ImageCropModal';
import ProfilePictureModal from './ProfilePictureModal';

interface ProfileCardProps {
  user: User;
  onViewChange: (view: string) => void;
  onUserUpdate: (newProfileData: Partial<User>) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user, onViewChange, onUserUpdate }) => {
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isProfilePicModalOpen, setIsProfilePicModalOpen] = useState(false);

  const handleSaveCroppedImage = async (imageFile: File) => {
    const fileExt = imageFile.name.split('.').pop();
    const filePath = `${user.id}/${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, imageFile, { upsert: true });

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      return;
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const newAvatarUrl = urlData.publicUrl;

    const { error: dbError } = await supabase
      .from('profiles')
      .update({ avatar_url: newAvatarUrl })
      .eq('id', user.id);

    if (dbError) {
      console.error('Error updating profile:', dbError);
    } else {
      onUserUpdate({ avatarUrl: newAvatarUrl });
      setIsCropModalOpen(false);
    }
  };

  return (
    <>
      <ProfilePictureModal
        isOpen={isProfilePicModalOpen}
        onClose={() => setIsProfilePicModalOpen(false)}
        onChange={() => setIsCropModalOpen(true)}
        imageUrl={user.avatarUrl}
        userName={user.name}
      />
      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        onSave={handleSaveCroppedImage}
      />
      <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
        <div className="relative w-20 h-20 mx-auto -mt-16">
            <button onClick={() => setIsProfilePicModalOpen(true)} className="relative group rounded-full">
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
    </>
  );
};

export default ProfileCard;