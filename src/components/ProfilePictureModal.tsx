import React from 'react';
import ReactDOM from 'react-dom';
import { PencilIcon } from './Icons';

interface ProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChange: () => void;
  imageUrl: string;
  userName: string;
}

const ProfilePictureModal: React.FC<ProfilePictureModalProps> = ({ isOpen, onClose, onChange, imageUrl, userName }) => {
  if (!isOpen) return null;

  const handleChangeClick = () => {
    onChange();
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt={`${userName}'s profile picture`} className="rounded-lg w-full h-auto max-h-[80vh] object-contain" />
        <div className="absolute top-4 right-4 flex space-x-2">
           <button 
            onClick={handleChangeClick}
            className="bg-white/80 backdrop-blur-sm text-slate-800 font-semibold px-4 py-2 rounded-full text-sm hover:bg-white transition-colors flex items-center space-x-2">
            <PencilIcon className="h-4 w-4" />
            <span>Alterar Foto</span>
          </button>
        </div>
         <button onClick={onClose} className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm text-slate-800 rounded-full p-2 hover:bg-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    </div>,
    document.body
  );
};

export default ProfilePictureModal;