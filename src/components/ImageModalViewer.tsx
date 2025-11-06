import React from 'react';
import ReactDOM from 'react-dom';
import { XIcon } from './Icons';

interface ImageModalViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  altText: string;
}

const ImageModalViewer: React.FC<ImageModalViewerProps> = ({ isOpen, onClose, imageUrl, altText }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
        <img 
          src={imageUrl} 
          alt={altText} 
          className="rounded-lg w-auto h-auto max-w-[90vw] max-h-[90vh] object-contain shadow-2xl" 
        />
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm text-slate-800 rounded-full p-2 hover:bg-white transition-colors"
          aria-label="Fechar visualização"
        >
          <XIcon className="h-6 w-6" />
        </button>
      </div>
    </div>,
    document.body
  );
};

export default ImageModalViewer;