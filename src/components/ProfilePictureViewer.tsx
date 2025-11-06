import React, { useState } from 'react';
import ProfilePictureModal from './ProfilePictureModal';
import type { User } from '@/types';

interface ProfilePictureViewerProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void; // Opcional: para manter a navegação de perfil
}

const sizeClasses = {
  sm: 'h-10 w-10',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
};

const ProfilePictureViewer: React.FC<ProfilePictureViewerProps> = ({ user, size = 'md', onClick }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Previne que o clique suba para elementos pai (como o PostCard)
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  // Se o usuário não tiver avatar, não faz sentido abrir o modal
  const canView = !!user.avatarUrl;

  return (
    <>
      <button 
        onClick={canView ? handleImageClick : onClick} 
        className={`rounded-full flex-shrink-0 ${canView ? 'cursor-pointer' : 'cursor-default'}`}
        disabled={!canView}
      >
        <img 
          src={user.avatarUrl} 
          alt={user.name} 
          className={`${sizeClasses[size]} rounded-full object-cover`} 
        />
      </button>

      {canView && (
        <ProfilePictureModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          // Passamos uma função vazia para onChange, pois não queremos editar o perfil de terceiros
          onChange={() => {}} 
          imageUrl={user.avatarUrl}
          userName={user.name}
          isViewerOnly={true} // Nova prop para desabilitar o botão de edição
        />
      )}
    </>
  );
};

export default ProfilePictureViewer;