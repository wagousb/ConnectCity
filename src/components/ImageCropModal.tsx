import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { ImageIcon } from './Icons';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (croppedImageFile: File) => Promise<void>;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight,
  );
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({ isOpen, onClose, onSave }) => {
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [isSaving, setIsSaving] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [originalFileName, setOriginalFileName] = useState('new-avatar.jpeg');

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); // Reset crop on new image
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(e.target.files[0]);
      setOriginalFileName(e.target.files[0].name);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  };

  const handleSaveCrop = async () => {
    const image = imgRef.current;
    if (!image || !completedCrop) {
      return;
    }

    setIsSaving(true);
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = Math.floor(completedCrop.width * scaleX);
    canvas.height = Math.floor(completedCrop.height * scaleY);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsSaving(false);
      return;
    }

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;

    ctx.drawImage(
      image,
      cropX,
      cropY,
      canvas.width,
      canvas.height,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(async (blob) => {
      if (blob) {
        const croppedFile = new File([blob], originalFileName, { type: 'image/jpeg' });
        await onSave(croppedFile);
      }
      setIsSaving(false);
    }, 'image/jpeg');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Alterar Foto de Perfil</h2>
        {!imgSrc ? (
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-slate-400" />
            <p className="mt-2 text-slate-500">Arraste e solte uma imagem aqui, ou</p>
            <label htmlFor="upload-photo" className="mt-4 inline-block bg-primary text-white font-semibold px-4 py-2 rounded-md hover:bg-primary-700 transition-colors cursor-pointer">
              Selecione um arquivo
            </label>
            <input type="file" id="upload-photo" accept="image/*" className="hidden" onChange={onFileChange} />
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              circularCrop
            >
              <img ref={imgRef} src={imgSrc} onLoad={onImageLoad} alt="Crop me" style={{ maxHeight: '70vh' }} />
            </ReactCrop>
          </div>
        )}
        <div className="flex justify-end space-x-4 mt-6">
          <button onClick={onClose} className="bg-slate-200 text-slate-800 font-semibold px-4 py-2 rounded-md hover:bg-slate-300 transition-colors">
            Cancelar
          </button>
          <button 
            onClick={handleSaveCrop} 
            disabled={!completedCrop || isSaving}
            className="bg-primary text-white font-semibold px-4 py-2 rounded-md hover:bg-primary-700 transition-colors disabled:bg-primary-300"
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;