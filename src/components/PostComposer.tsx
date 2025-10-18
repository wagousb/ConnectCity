import React, { useState, useRef } from 'react';
import type { User } from '@/types';
import { ImageIcon, BarChartIcon, SmileIcon, XIcon } from '@/components/Icons';
import { supabase } from '@/integrations/supabase/client';

interface PostComposerProps {
  user: User;
  onPostPublished: () => void;
}

const PostComposer: React.FC<PostComposerProps> = ({ user, onPostPublished }) => {
  const [postText, setPostText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePublish = async () => {
    if (!postText.trim() && !imageFile) return;

    setIsPublishing(true);
    let imageUrl: string | undefined = undefined;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(fileName, imageFile);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        alert('Erro ao enviar a imagem. Tente novamente.');
        setIsPublishing(false);
        return;
      }
      
      const { data } = supabase.storage.from('post-images').getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }

    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      content: postText,
      image_url: imageUrl,
    });

    if (error) {
      console.error('Error publishing post:', error);
      alert('Erro ao publicar o post. Tente novamente.');
    } else {
      setPostText('');
      removeImage();
      onPostPublished();
    }

    setIsPublishing(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <div className="flex space-x-4">
        <img src={user.avatarUrl} alt={user.name} className="h-12 w-12 rounded-full" />
        <div className="flex-1">
          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            className="w-full text-lg border-none focus:ring-0 resize-none p-0 placeholder-slate-400 bg-transparent"
            rows={3}
            placeholder="O que está acontecendo?"
          ></textarea>
          {imagePreview && (
            <div className="mt-4 relative">
              <img src={imagePreview} alt="Pré-visualização" className="rounded-lg max-h-80 w-full object-cover" />
              <button onClick={removeImage} className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1.5 hover:bg-opacity-75">
                <XIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200">
        <div className="flex space-x-2">
            <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="text-slate-500 hover:text-primary p-2 rounded-full hover:bg-primary-50">
                <ImageIcon className="h-6 w-6" />
            </button>
            <button className="text-slate-500 hover:text-primary p-2 rounded-full hover:bg-primary-50">
                <BarChartIcon className="h-6 w-6" />
            </button>
            <button className="text-slate-500 hover:text-primary p-2 rounded-full hover:bg-primary-50">
                <SmileIcon className="h-6 w-6" />
            </button>
        </div>
        <button
          onClick={handlePublish}
          disabled={(!postText.trim() && !imageFile) || isPublishing}
          className="bg-primary text-white font-semibold px-6 py-2 rounded-full hover:bg-primary-700 transition-colors disabled:bg-primary-300 disabled:cursor-not-allowed"
        >
          {isPublishing ? 'Publicando...' : 'Publicar'}
        </button>
      </div>
    </div>
  );
};

export default PostComposer;