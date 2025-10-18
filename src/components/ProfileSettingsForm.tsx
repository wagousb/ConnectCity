import React, { useState } from 'react';
import type { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeftIcon } from './Icons';
import ImageUpload from './ImageUpload';

interface ProfileSettingsFormProps {
  user: User;
  onBack: () => void;
}

const ProfileSettingsForm: React.FC<ProfileSettingsFormProps> = ({ user, onBack }) => {
  const [name, setName] = useState(user.name);
  const [handle, setHandle] = useState(user.handle);
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [bannerUrl, setBannerUrl] = useState(user.bannerUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from('profiles')
      .update({
        name,
        handle,
        bio,
        avatar_url: avatarUrl,
        banner_url: bannerUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    setIsSaving(false);

    if (error) {
      setMessage({ type: 'error', text: 'Erro ao atualizar o perfil: ' + error.message });
    } else {
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso! As alterações podem levar um momento para serem refletidas.' });
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 mr-4">
          <ArrowLeftIcon className="h-6 w-6 text-slate-600" />
        </button>
        <div>
            <h2 className="text-xl font-bold">Editar Perfil</h2>
            <p className="text-sm text-slate-500">Atualize suas informações pessoais.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <ImageUpload
          label="Foto de Perfil"
          bucketName="avatars"
          userId={user.id}
          currentUrl={avatarUrl}
          onUpload={(url) => setAvatarUrl(url)}
        />
        <ImageUpload
          label="Foto de Capa"
          bucketName="banners"
          userId={user.id}
          currentUrl={bannerUrl}
          onUpload={(url) => setBannerUrl(url)}
        />
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nome</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="handle" className="block text-sm font-medium text-slate-700">Nome de usuário</label>
          <input
            type="text"
            id="handle"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-slate-700">Bio</label>
          <textarea
            id="bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>

        {message && (
          <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-primary text-white font-semibold px-6 py-2 rounded-md hover:bg-primary-700 transition-colors disabled:bg-primary-300 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettingsForm;