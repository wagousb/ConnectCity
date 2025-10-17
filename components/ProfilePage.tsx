import React, { useState } from 'react';
import type { User, Post } from '../types';
import PostCard from './PostCard';
import { PencilIcon } from './Icons';

interface ProfilePageProps {
  user: User;
  posts: Post[];
  onToggleSave: (postId: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, posts, onToggleSave }) => {
  const [activeTab, setActiveTab] = useState('Publicações');
  const tabs = ['Publicações', 'Respostas', 'Mídia', 'Curtidas'];

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Banner and Profile Header */}
      <div className="relative">
        <img
          src={user.bannerUrl}
          alt={`${user.name}'s banner`}
          className="w-full h-48 md:h-64 object-cover"
        />
        <div className="absolute top-full left-6 -translate-y-1/2">
            <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white"
            />
        </div>
        <div className="absolute top-4 right-4">
             <button className="bg-white/80 backdrop-blur-sm text-slate-800 font-semibold px-4 py-2 rounded-full text-sm hover:bg-white transition-colors flex items-center space-x-2">
                <PencilIcon className="h-4 w-4" />
                <span>Editar Perfil</span>
            </button>
        </div>
      </div>

      {/* User Info */}
      <div className="pt-16 md:pt-20 px-6 pb-6">
        <h1 className="text-2xl md:text-3xl font-bold">{user.name}</h1>
        <p className="text-slate-500">@{user.handle}</p>
        <p className="mt-4 text-slate-700">{user.bio}</p>
        
        <div className="flex items-center space-x-6 mt-4 text-sm text-slate-500">
            <span><span className="font-bold text-slate-800">{user.following ? (user.following / 1000).toFixed(1) + 'k' : '0'}</span> Seguindo</span>
            <span><span className="font-bold text-slate-800">{user.followers ? (user.followers / 1000).toFixed(1) + 'k' : '0'}</span> Seguidores</span>
            <span><span className="font-bold text-slate-800">{posts.length}</span> Publicações</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex -mb-px px-6">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 mr-8 font-semibold text-sm transition-colors duration-200 ${
                activeTab === tab 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'border-b-2 border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'Publicações' && (
          <div className="space-y-6 p-6">
            {posts.length > 0 ? (
              posts.map(post => (
                <PostCard key={post.id} post={post} onToggleSave={onToggleSave} />
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
  );
};

export default ProfilePage;