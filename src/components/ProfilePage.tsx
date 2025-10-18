import React, { useState } from 'react';
import type { User, Post } from '@/types';
import PostCard from '@/components/PostCard';
import { PencilIcon } from '@/components/Icons';
import ImageCropModal from './ImageCropModal';
import ProfilePictureModal from './ProfilePictureModal';
import { useProfilePictureManager } from '@/hooks/useProfilePictureManager';
import { useBannerImageManager } from '@/hooks/useBannerImageManager';

interface ProfilePageProps {
  profileUser: User;
  currentUser: User;
  posts: Post[];
  onToggleSave: (postId: string) => void;
  onVote: (postId: string, rating: number) => void;
  onViewChange: (view: { view: string; userId?: string }) => void;
  onUserUpdate: (newProfileData: Partial<User>) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ 
  profileUser, currentUser, posts, onToggleSave, onVote, onViewChange, onUserUpdate
}) => {
  const [activeTab, setActiveTab] = useState('Publicações');
  const tabs = ['Publicações', 'Respostas', 'Mídia', 'Curtidas'];
  const isOwnProfile = profileUser.id === currentUser.id;

  const {
    isCropModalOpen: isAvatarCropModalOpen,
    isProfilePicModalOpen,
    openProfilePicModal,
    closeProfilePicModal,
    openCropModal: openAvatarCropModal,
    closeCropModal: closeAvatarCropModal,
    handleSaveCroppedImage: handleSaveAvatar,
  } = useProfilePictureManager(profileUser, onUserUpdate);

  const {
    isCropModalOpen: isBannerCropModalOpen,
    openCropModal: openBannerCropModal,
    closeCropModal: closeBannerCropModal,
    handleSaveCroppedImage: handleSaveBanner,
  } = useBannerImageManager(profileUser, onUserUpdate);

  return (
    <>
      {isOwnProfile && (
        <>
          <ProfilePictureModal
            isOpen={isProfilePicModalOpen}
            onClose={closeProfilePicModal}
            onChange={openAvatarCropModal}
            imageUrl={profileUser.avatarUrl}
            userName={profileUser.name}
          />
          <ImageCropModal
            isOpen={isAvatarCropModalOpen}
            onClose={closeAvatarCropModal}
            onSave={handleSaveAvatar}
            title="Alterar Foto de Perfil"
            aspectRatio={1}
            circularCrop={true}
          />
          <ImageCropModal
            isOpen={isBannerCropModalOpen}
            onClose={closeBannerCropModal}
            onSave={handleSaveBanner}
            title="Alterar Foto de Capa"
            aspectRatio={3 / 1}
          />
        </>
      )}
      <div className="relative z-0 bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="relative">
          <img
            src={profileUser.bannerUrl}
            alt={`${profileUser.name}'s banner`}
            className="w-full h-48 md:h-64 object-cover"
          />
          <div className="absolute top-full left-6 -translate-y-1/2">
            <button 
              onClick={isOwnProfile ? openProfilePicModal : undefined}
              className={`relative group rounded-full ${isOwnProfile ? '' : 'cursor-default'}`}
              disabled={!isOwnProfile}
            >
              <img
                src={profileUser.avatarUrl}
                alt={profileUser.name}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white group-hover:opacity-75 transition-opacity"
              />
              {isOwnProfile && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <PencilIcon className="h-8 w-8 text-white" />
                </div>
              )}
            </button>
          </div>
          {isOwnProfile && (
            <div className="absolute top-4 right-4">
              <button
                onClick={openBannerCropModal}
                className="bg-white/80 backdrop-blur-sm text-slate-800 font-semibold px-4 py-2 rounded-full text-sm hover:bg-white transition-colors flex items-center space-x-2">
                <PencilIcon className="h-4 w-4" />
                <span>Editar Capa</span>
              </button>
            </div>
          )}
        </div>

        <div className="pt-16 md:pt-20 px-6 pb-6">
          <h1 className="text-2xl md:text-3xl font-bold">{profileUser.name}</h1>
          <p className="text-slate-500">@{profileUser.handle}</p>
          <p className="mt-4 text-slate-700">{profileUser.bio}</p>

          <div className="flex items-center space-x-6 mt-4 text-sm text-slate-500">
            <span><span className="font-bold text-slate-800">{posts.length}</span> Publicações</span>
          </div>
        </div>

        <div className="border-b border-slate-200">
          <nav className="flex -mb-px px-6">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 mr-8 font-semibold text-sm transition-colors duration-200 ${activeTab === tab
                    ? 'border-b-2 border-primary text-primary'
                    : 'border-b-2 border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                  }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div>
          {activeTab === 'Publicações' && (
            <div className="space-y-6 p-6">
              {posts.length > 0 ? (
                posts.map(post => (
                  <PostCard key={post.id} post={post} currentUser={currentUser} onToggleSave={onToggleSave} onVote={onVote} onViewChange={onViewChange} />
                ))
              ) : (
                <p className="text-slate-500 text-center">Nenhuma publicação ainda.</p>
              )}
            </div>
          )}
          {activeTab !== 'Publicações' && (
            <p className="p-6 text-slate-500 text-center">O conteúdo para "{activeTab}" aparecerá aqui.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfilePage;