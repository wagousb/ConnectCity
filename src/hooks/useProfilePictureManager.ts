import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@/types';

export const useProfilePictureManager = (user: User, onUserUpdate: (newProfileData: Partial<User>) => void) => {
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isProfilePicModalOpen, setIsProfilePicModalOpen] = useState(false);

  const openProfilePicModal = () => setIsProfilePicModalOpen(true);
  const closeProfilePicModal = () => setIsProfilePicModalOpen(false);

  const openCropModal = () => {
    closeProfilePicModal();
    setIsCropModalOpen(true);
  };
  const closeCropModal = () => setIsCropModalOpen(false);

  const handleSaveCroppedImage = async (imageFile: File) => {
    if (!user) return;

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
      closeCropModal();
    }
  };

  return {
    isCropModalOpen,
    isProfilePicModalOpen,
    openProfilePicModal,
    closeProfilePicModal,
    openCropModal,
    closeCropModal,
    handleSaveCroppedImage,
  };
};