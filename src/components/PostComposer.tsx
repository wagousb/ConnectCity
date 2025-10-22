import React, { useState, useRef } from 'react';
import type { User } from '@/types';
import { ImageIcon, PaperclipIcon, XIcon, LightbulbIcon } from '@/components/Icons';
import { supabase } from '@/integrations/supabase/client';

interface PostComposerProps {
  user: User;
  onPostPublished: () => void;
  isFirstPost: boolean;
}

const PostComposer: React.FC<PostComposerProps> = ({ user, onPostPublished, isFirstPost }) => {
  const [title, setTitle] = useState('');
  const [targetEntity, setTargetEntity] = useState('');
  const [description, setDescription] = useState('');
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const [isPublishing, setIsPublishing] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const titleText = "Tem uma ideia de projeto para a sua cidade?";
  const subtitleText = isFirstPost 
    ? "Toda grande mudança começa com um pensamento. Compartilhe o seu com a cidade." 
    : "Não guarde para você! Publique seu novo projeto e continue fazendo a diferença.";

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

  const handleDocumentSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDocumentFile(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const removeDocument = () => {
    setDocumentFile(null);
    if (docInputRef.current) {
      docInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setTitle('');
    setTargetEntity('');
    setDescription('');
    removeImage();
    removeDocument();
  };

  const handlePublish = async () => {
    if (!title.trim() || !description.trim() || !targetEntity) {
        alert('Por favor, preencha todos os campos, incluindo o destino da ideia.');
        return;
    }

    setIsPublishing(true);
    let imageUrl: string | undefined = undefined;
    let documentUrl: string | undefined = undefined;

    try {
        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;
            const { error } = await supabase.storage.from('post-images').upload(fileName, imageFile);
            if (error) throw new Error(`Erro no upload da imagem: ${error.message}`);
            const { data } = supabase.storage.from('post-images').getPublicUrl(fileName);
            imageUrl = data.publicUrl;
        }

        if (documentFile) {
            const fileExt = documentFile.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;
            const { error } = await supabase.storage.from('post-documents').upload(fileName, documentFile);
            if (error) throw new Error(`Erro no upload do documento: ${error.message}`);
            const { data } = supabase.storage.from('post-documents').getPublicUrl(fileName);
            documentUrl = data.publicUrl;
        }

        const { error: insertError } = await supabase.from('posts').insert({
            user_id: user.id,
            title,
            target_entity: targetEntity,
            content: description,
            image_url: imageUrl,
            document_url: documentUrl,
        });

        if (insertError) throw new Error(`Erro ao publicar a ideia: ${insertError.message}`);

        resetForm();
        onPostPublished();
    } catch (error: any) {
        console.error('Falha na publicação:', error);
        alert(error.message);
    } finally {
        setIsPublishing(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <div className="bg-gradient-to-br from-primary-50 to-indigo-100 p-6 rounded-lg mb-6 flex items-center space-x-4">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md shrink-0">
            <LightbulbIcon className="h-8 w-8 text-primary" />
        </div>
        <div>
            <h3 className="text-xl font-bold text-slate-800">{titleText}</h3>
            <p className="mt-1 text-slate-600">{subtitleText}</p>
        </div>
      </div>

      <div className="flex space-x-4">
        <img src={user.avatarUrl} alt={user.name} className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título da ideia de projeto"
            className="w-full text-lg border-slate-200 border rounded-lg p-2 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
          <select
            value={targetEntity}
            onChange={(e) => setTargetEntity(e.target.value)}
            className={`w-full border-slate-200 border rounded-lg p-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-200 ${!targetEntity ? 'text-slate-400' : 'text-slate-900'}`}
            required
          >
            <option value="" disabled>Escolha um destinatário</option>
            <option value="Prefeitura (Executivo)">Prefeitura (Executivo)</option>
            <option value="Câmara de vereadores (Legislativo)">Câmara de vereadores (Legislativo)</option>
            <option value="Secretários">Secretários</option>
          </select>
          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={() => setIsDescriptionFocused(true)}
              onBlur={() => setIsDescriptionFocused(false)}
              className="w-full text-base border-slate-200 border rounded-lg p-2 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-200"
              rows={4}
              placeholder="Descreva sua ideia de projeto aqui..."
            ></textarea>
            {isDescriptionFocused && (
              <div className="absolute bottom-full mb-2 w-full bg-slate-800 text-white text-sm rounded-lg py-3 px-4 z-10 shadow-lg">
                <p>Lembre-se de adicionar o máximo de detalhes possíveis, como <strong>Localização</strong>, <strong>importância</strong> e <strong>contribuições</strong> do projeto.</p>
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-800"></div>
              </div>
            )}
          </div>
          
          {imagePreview && (
            <div className="relative">
              <img src={imagePreview} alt="Pré-visualização" className="rounded-lg max-h-80 w-full object-cover" />
              <button onClick={removeImage} className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1.5 hover:bg-opacity-75">
                <XIcon className="h-5 w-5" />
              </button>
            </div>
          )}

          {documentFile && (
            <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                <span className="text-sm text-slate-700 truncate">{documentFile.name}</span>
                <button onClick={removeDocument} className="text-slate-500 hover:text-red-600 p-1 rounded-full">
                    <XIcon className="h-4 w-4" />
                </button>
            </div>
          )}

        </div>
      </div>
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200">
        <div className="flex space-x-2">
            <input type="file" ref={imageInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
            <button onClick={() => imageInputRef.current?.click()} className="text-slate-500 hover:text-primary p-2 rounded-full hover:bg-primary-50" title="Anexar Imagem">
                <ImageIcon className="h-6 w-6" />
            </button>
            <input type="file" ref={docInputRef} onChange={handleDocumentSelect} accept=".pdf" className="hidden" />
            <button onClick={() => docInputRef.current?.click()} className="text-slate-500 hover:text-primary p-2 rounded-full hover:bg-primary-50" title="Anexar PDF">
                <PaperclipIcon className="h-6 w-6" />
            </button>
        </div>
        <button
          onClick={handlePublish}
          disabled={!title.trim() || !description.trim() || !targetEntity || isPublishing}
          className="bg-primary text-white font-semibold px-6 py-2 rounded-full hover:bg-primary-700 transition-colors disabled:bg-primary-300 disabled:cursor-not-allowed"
        >
          {isPublishing ? 'Enviando...' : 'Enviar Ideia'}
        </button>
      </div>
    </div>
  );
};

export default PostComposer;