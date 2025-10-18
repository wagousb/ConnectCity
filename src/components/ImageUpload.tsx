import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ImageIcon } from './Icons';

interface ImageUploadProps {
  bucketName: 'avatars' | 'banners';
  userId: string;
  currentUrl: string | null;
  onUpload: (url: string) => void;
  label: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ bucketName, userId, currentUrl, onUpload, label }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError(null);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar uma imagem para fazer o upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (!data.publicUrl) {
        throw new Error('Não foi possível obter a URL pública da imagem.');
      }

      onUpload(data.publicUrl);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="mt-1 flex items-center space-x-4">
        {currentUrl ? (
          <img src={currentUrl} alt={label} className="w-16 h-16 rounded-md object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-md bg-slate-100 flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-slate-400" />
          </div>
        )}
        <label htmlFor={`${bucketName}-upload`} className="cursor-pointer bg-white py-2 px-3 border border-slate-300 rounded-md shadow-sm text-sm leading-4 font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
          <span>{uploading ? 'Enviando...' : 'Alterar'}</span>
          <input id={`${bucketName}-upload`} name={`${bucketName}-upload`} type="file" className="sr-only" onChange={handleFileChange} disabled={uploading} accept="image/*" />
        </label>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default ImageUpload;