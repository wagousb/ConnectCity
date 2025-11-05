import React, { useState, useRef } from 'react';
import type { User } from '@/types';
import { ImageIcon, PaperclipIcon, XIcon, LightbulbIcon, MegaphoneIcon, CheckCircleIcon } from '@/components/Icons';
import { supabase } from '@/integrations/supabase/client';

interface PostComposerProps {
  user: User;
  onPostPublished: () => void;
  isFirstPost: boolean;
}

const PostComposer: React.FC<PostComposerProps> = ({ user, onPostPublished, isFirstPost }) => {
  const isMayor = user.role === 'prefeito';
  const isSecretary = user.role === 'secretário';
  const canAnnounce = isMayor || isSecretary;
  
  const [postType, setPostType] = useState<'idea' | 'announcement' | 'speech'>('idea');
  const [title, setTitle] = useState('');
  const [targetEntity, setTargetEntity] = useState('');
  const [description, setDescription] = useState('');
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [projectStatus, setProjectStatus] = useState<'Não iniciado' | 'Em andamento' | 'Concluído'>('Não iniciado');
  const [noStartDate, setNoStartDate] = useState(false);
  const [noEndDate, setNoEndDate] = useState(false);

  const [isPublishing, setIsPublishing] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const getComposerTitle = () => {
    switch (postType) {
      case 'announcement': return "Anuncie um novo projeto em andamento!";
      case 'speech': return "Faça um pronunciamento oficial para a cidade.";
      case 'idea':
      default: return "Tem uma ideia de projeto para a sua cidade?";
    }
  };

  const getComposerSubtitle = () => {
    switch (postType) {
      case 'announcement': return "Compartilhe o progresso e os detalhes de um projeto que está sendo implementado.";
      case 'speech': return "Comunique decisões importantes, visões ou mensagens diretas à comunidade.";
      case 'idea':
      default: return isFirstPost 
        ? "Toda grande mudança começa com um pensamento. Compartilhe o seu com a cidade." 
        : "Não guarde para você! Publique seu novo projeto e continue fazendo a diferença.";
    }
  };

  const getComposerIcon = () => {
    switch (postType) {
      case 'announcement': return <CheckCircleIcon className="h-8 w-8 text-primary" />;
      case 'speech': return <MegaphoneIcon className="h-8 w-8 text-primary" />;
      case 'idea':
      default: return <LightbulbIcon className="h-8 w-8 text-primary" />;
    }
  };

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
    setPostType('idea');
    setStartDate('');
    setEndDate('');
    setProjectStatus('Não iniciado');
    setNoStartDate(false);
    setNoEndDate(false);
  };

  const handlePublish = async () => {
    if (!title.trim() || !description.trim() || (postType === 'idea' && !targetEntity)) {
        alert('Por favor, preencha o título, a descrição e o destinatário (se for uma ideia).');
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

        const { data: newPost, error: insertError } = await supabase.from('posts').insert({
            user_id: user.id,
            type: postType,
            title,
            target_entity: postType === 'idea' ? targetEntity : null,
            content: description,
            image_url: imageUrl,
            document_url: documentUrl,
            status: postType === 'announcement' ? 'implemented' : 'pending',
            start_date: postType === 'announcement' ? (startDate || null) : null,
            end_date: postType === 'announcement' ? (endDate || null) : null,
            project_status: postType === 'announcement' ? projectStatus : null,
        }).select('id').single();

        if (insertError) throw new Error(`Erro ao publicar: ${insertError.message}`);

        if (newPost && (postType === 'announcement' || postType === 'speech')) {
            const { error: fnError } = await supabase.functions.invoke('notify-all-users', {
                body: {
                    post_id: newPost.id,
                    actor_id: user.id,
                    post_type: postType,
                },
            });

            if (fnError) {
                console.error('Erro ao notificar todos os usuários:', fnError);
            }
        }

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
      {canAnnounce && (
        <div className="mb-4 flex space-x-4 border-b border-slate-100 pb-4">
          <button 
            onClick={() => setPostType('idea')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${postType === 'idea' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            <LightbulbIcon className="h-4 w-4 inline mr-1" /> Ideia de Projeto
          </button>
          <button 
            onClick={() => setPostType('announcement')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${postType === 'announcement' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            disabled={!canAnnounce && postType !== 'announcement'}
          >
            <CheckCircleIcon className="h-4 w-4 inline mr-1" /> Anúncio de Projeto
          </button>
          {isMayor && (
            <button 
              onClick={() => setPostType('speech')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${postType === 'speech' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              <MegaphoneIcon className="h-4 w-4 inline mr-1" /> Pronunciamento
            </button>
          )}
        </div>
      )}
      
      {!canAnnounce && (
        <div className="mb-4 flex space-x-4 border-b border-slate-100 pb-4">
            <button 
                onClick={() => setPostType('idea')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors bg-primary text-white`}
            >
                <LightbulbIcon className="h-4 w-4 inline mr-1" /> Ideia de Projeto
            </button>
        </div>
      )}

      <div className="bg-gradient-to-br from-primary-50 to-indigo-100 p-6 rounded-lg mb-6 flex items-center space-x-4">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md shrink-0">
            {getComposerIcon()}
        </div>
        <div>
            <h3 className="text-xl font-bold text-slate-800">{getComposerTitle()}</h3>
            <p className="mt-1 text-slate-600">{getComposerSubtitle()}</p>
        </div>
      </div>

      <div className="flex space-x-4">
        <img src={user.avatarUrl} alt={user.name} className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={postType === 'speech' ? 'Assunto do Pronunciamento' : 'Título da ideia/projeto'}
            className="w-full text-lg border-slate-200 border rounded-lg p-2 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
          {postType === 'idea' && (
            <select
              value={targetEntity}
              onChange={(e) => setTargetEntity(e.target.value)}
              className={`w-full border-slate-200 border rounded-lg p-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-200 ${!targetEntity ? 'text-slate-400' : 'text-slate-900'}`}
              required
            >
              <option value="" disabled>Escolha um destinatário</option>
              <option value="Prefeitura">Prefeitura</option>
              <option value="Câmara de Vereadores">Câmara de Vereadores</option>
              <option value="Secretários">Secretários</option>
            </select>
          )}
          {postType === 'announcement' && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="start-date" className="block text-xs font-medium text-slate-600 mb-1">Previsão de Início</label>
                        <input type="date" id="start-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full text-sm border-slate-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:bg-slate-200 disabled:cursor-not-allowed" disabled={noStartDate} />
                        <div className="mt-2 flex items-center">
                            <input type="checkbox" id="no-start-date" checked={noStartDate} onChange={(e) => { setNoStartDate(e.target.checked); if (e.target.checked) setStartDate(''); }} className="h-4 w-4 text-primary border-slate-300 rounded focus:ring-primary" />
                            <label htmlFor="no-start-date" className="ml-2 text-xs text-slate-600">Sem data de início</label>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="end-date" className="block text-xs font-medium text-slate-600 mb-1">Prazo de Finalização</label>
                        <input type="date" id="end-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full text-sm border-slate-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:bg-slate-200 disabled:cursor-not-allowed" disabled={noEndDate} />
                        <div className="mt-2 flex items-center">
                            <input type="checkbox" id="no-end-date" checked={noEndDate} onChange={(e) => { setNoEndDate(e.target.checked); if (e.target.checked) setEndDate(''); }} className="h-4 w-4 text-primary border-slate-300 rounded focus:ring-primary" />
                            <label htmlFor="no-end-date" className="ml-2 text-xs text-slate-600">Sem previsão de finalização</label>
                        </div>
                    </div>
                </div>
                <div>
                    <label htmlFor="project-status" className="block text-xs font-medium text-slate-600 mb-1">Status do Projeto</label>
                    <select id="project-status" value={projectStatus} onChange={(e) => setProjectStatus(e.target.value as any)} className="w-full text-sm border-slate-300 rounded-md p-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-200">
                        <option value="Não iniciado">Não iniciado</option>
                        <option value="Em andamento">Em andamento</option>
                        <option value="Concluído">Concluído</option>
                    </select>
                </div>
            </div>
          )}
          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={() => setIsDescriptionFocused(true)}
              onBlur={() => setIsDescriptionFocused(false)}
              className="w-full text-base border-slate-200 border rounded-lg p-2 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-200"
              rows={4}
              placeholder={postType === 'speech' ? 'Escreva seu pronunciamento aqui...' : 'Descreva sua ideia/projeto aqui...'}
            ></textarea>
            {isDescriptionFocused && postType === 'idea' && (
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
          disabled={!title.trim() || !description.trim() || (postType === 'idea' && !targetEntity) || isPublishing}
          className="bg-primary text-white font-semibold px-6 py-2 rounded-full hover:bg-primary-700 transition-colors disabled:bg-primary-300 disabled:cursor-not-allowed"
        >
          {isPublishing ? 'Publicando...' : 'Publicar'}
        </button>
      </div>
    </div>
  );
};

export default PostComposer;