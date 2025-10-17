import React, { useState } from 'react';
import type { User, Post, Suggestion, Trend, ConnectionRequest } from './types';
import Header from './components/Header';
import LeftSidebar from './components/LeftSidebar';
import MainContent from './components/MainContent';
import RightSidebar from './components/RightSidebar';

// Mock Data
const mockUser: User = {
  id: 'u1',
  name: 'alex johnson',
  handle: 'alexj',
  avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
  bannerUrl: 'https://picsum.photos/seed/banner1/1500/500',
  followers: 5600,
  following: 780,
  bio: 'Fotógrafo e entusiasta de tecnologia. Explorando o mundo, um clique de cada vez. 📸'
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('Feed');
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 'p1',
      author: { id: 'u2', name: 'Carlos Silva', handle: 'carlossilva', avatarUrl: 'https://i.pravatar.cc/150?u=u2' },
      content: 'Acabei de lançar um novo projeto de código aberto no GitHub! É uma biblioteca de componentes de UI para React. Confiram e me digam o que acham. #react #opensource #development\n\nhttps://github.com/example/repo',
      timestamp: '2h',
      likes: 128,
      comments: 24,
      shares: 15,
      saved: false,
    },
    {
      id: 'p2',
      author: mockUser,
      content: 'Explorando as novas funcionalidades do CSS Grid e Flexbox. Incrível como a web evoluiu! Qual é a sua propriedade CSS favorita?',
      imageUrl: 'https://picsum.photos/seed/post2/600/400',
      timestamp: '5h',
      likes: 256,
      comments: 64,
      shares: 32,
      saved: true,
    },
    {
      id: 'p3',
      author: { id: 'u3', name: 'Beatriz Costa', handle: 'beacosta', avatarUrl: 'https://i.pravatar.cc/150?u=u3' },
      content: 'Participando de um webinar sobre IA generativa. O futuro é agora! 🤯',
      timestamp: '1d',
      likes: 98,
      comments: 12,
      shares: 5,
      saved: false,
    },
    {
      id: 'p4',
      author: mockUser,
      content: 'Dica do dia: Use `Promise.allSettled` quando precisar que todas as promessas sejam concluídas, independentemente de sucesso ou falha. Muito útil para lidar com múltiplas chamadas de API de forma robusta. #javascript #protip',
      timestamp: '2d',
      likes: 412,
      comments: 88,
      shares: 50,
      saved: false,
    }
  ]);
  
  const [suggestions] = useState<Suggestion[]>([
    { id: 's1', user: { id: 'u4', name: 'Daniel Almeida', handle: 'danielalmeida', avatarUrl: 'https://i.pravatar.cc/150?u=u4' } },
    { id: 's2', user: { id: 'u5', name: 'Fernanda Lima', handle: 'fernandalima', avatarUrl: 'https://i.pravatar.cc/150?u=u5' } },
    { id: 's3', user: { id: 'u6', name: 'Gustavo Pereira', handle: 'gustavopereira', avatarUrl: 'https://i.pravatar.cc/150?u=u6' } },
  ]);

  const [trends] = useState<Trend[]>([
    { id: 't1', hashtag: '#ReactJS', postCount: '12.5k publicações' },
    { id: 't2', hashtag: '#VagasDev', postCount: '8.9k publicações' },
    { id: 't3', hashtag: '#InteligenciaArtificial', postCount: '5.1k publicações' },
    { id: 't4', hashtag: '#UXDesign', postCount: '3.7k publicações' },
  ]);
  
  const [connectionRequests] = useState<ConnectionRequest[]>([
      { id: 'cr1', user: { id: 'u7', name: 'Helena Santos', handle: 'helenasantos', avatarUrl: 'https://i.pravatar.cc/150?u=u7' }, mutuals: 12 },
      { id: 'cr2', user: { id: 'u8', name: 'Igor Martins', handle: 'igormartins', avatarUrl: 'https://i.pravatar.cc/150?u=u8' }, mutuals: 5 },
  ]);

  const handleViewChange = (view: string) => {
    setCurrentView(view);
  };

  const handleToggleSave = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, saved: !post.saved } : post
    ));
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header user={mockUser} onViewChange={handleViewChange} />
      <main className="max-w-screen-xl mx-auto py-8 px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-3">
            <LeftSidebar user={mockUser} currentView={currentView} onViewChange={handleViewChange} />
          </div>
          <div className="col-span-12 lg:col-span-6">
            <MainContent 
              posts={posts} 
              currentView={currentView} 
              user={mockUser} 
              suggestions={suggestions}
              connectionRequests={connectionRequests}
              onToggleSave={handleToggleSave}
            />
          </div>
          <div className="col-span-12 lg:col-span-3">
             <RightSidebar suggestions={suggestions} trends={trends} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;