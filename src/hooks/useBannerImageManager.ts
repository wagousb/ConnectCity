import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@/types';

export const useBannerImageManager = (user: User, onUserUpdate: (newProfileData: Partial<User>) => void) => {
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const openCropModal = () => setIsCropModalOpen(true);
  const closeCropModal = () => setIsCropModalOpen(false);

  const handleSaveCroppedImage = async (imageFile: File) => {
    if (!user) return;

    const fileExt = imageFile.name.split('.').pop();
    const filePath = `${user.id}/${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('banners')
      .upload(filePath, imageFile, { upsert: true });

    if (uploadError) {
      console.error('Error uploading banner:', uploadError);
      return;
    }

    const { data: urlData } = supabase.storage.from('banners').getPublicUrl(filePath);
    const newBannerUrl = urlData.publicUrl;

    const { error: dbError } = await supabase
      .from('profiles')
      .update({ banner_url: newBannerUrl })
      .eq('id', user.id);

    if (dbError) {
      console.error('Error updating profile:', dbError);
    } else {
      onUserUpdate({ bannerUrl: newBannerUrl });
      closeCropModal();
    }
  };

  return {
    isCropModalOpen,
    openCropModal,
    closeCropModal,
    handleSaveCroppedImage,
  };
};