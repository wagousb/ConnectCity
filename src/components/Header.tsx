import React from 'react';
import type { User } from '@/types';
import { HomeIcon, SearchIcon, UsersIcon, BellIcon } from '@/components/Icons';

interface HeaderProps {
  user: User;
  onViewChange: (view: { view: string; userId?: string }) => void;
  hasUnreadNotifications: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, onViewChange, hasUnreadNotifications }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                C
              </span>
              <span className="font-bold text-xl text-slate-800">ConnectCity</span>
            </div>
            <div className="relative hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Pesquisar..."
                className="bg-slate-100 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
              />
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => onViewChange({ view: 'Feed' })}
              className="text-slate-500 hover:text-primary p-2 rounded-full hover:bg-primary-50">
              <HomeIcon className="h-6 w-6" />
            </button>
            <button 
              onClick={() => onViewChange({ view: 'Membros' })}
              className="text-slate-500 hover:text-primary p-2 rounded-full hover:bg-primary-50">
              <UsersIcon className="h-6 w-6" />
            </button>
            <button 
              onClick={() => onViewChange({ view: 'Notificações' })}
              className="relative text-slate-500 hover:text-primary p-2 rounded-full hover:bg-primary-50">
              <BellIcon className="h-6 w-6" />
              {hasUnreadNotifications && (
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              )}
            </button>
            <button 
              onClick={() => onViewChange({ view: 'Meu Perfil' })}
              className="flex items-center space-x-3 cursor-pointer p-1 rounded-md hover:bg-slate-100">
              <img src={user.avatarUrl} alt={user.name} className="h-9 w-9 rounded-full" />
              <div className="hidden lg:block text-sm text-left">
                <p className="font-semibold text-slate-800 whitespace-nowrap">{user.name}</p>
                <p className="text-slate-500">@{user.handle}</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;