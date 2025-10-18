import React, { useState, useEffect, useRef } from 'react';
import type { User } from '@/types';
import { HomeIcon, SearchIcon, UsersIcon, BellIcon, SettingsIcon, LogoutIcon, ShieldCheckIcon, UserCircleIcon } from '@/components/Icons';
import { supabase } from '@/integrations/supabase/client';

interface HeaderProps {
  user: User;
  onViewChange: (view: { view: string; userId?: string }) => void;
  hasUnreadNotifications: boolean;
  isModerator: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, onViewChange, hasUnreadNotifications, isModerator }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menuItems = [
    { name: 'Meu Perfil', icon: <UserCircleIcon className="h-5 w-5" />, action: () => onViewChange({ view: 'Meu Perfil' }) },
    { name: 'Configurações', icon: <SettingsIcon className="h-5 w-5" />, action: () => onViewChange({ view: 'Configurações' }) },
  ];

  if (isModerator) {
    menuItems.push({ name: 'Moderação', icon: <ShieldCheckIcon className="h-5 w-5" />, action: () => onViewChange({ view: 'Moderação' }) });
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <button onClick={() => onViewChange({ view: 'Feed' })} className="flex items-center space-x-2 cursor-pointer">
              <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                C
              </span>
              <span className="font-bold text-xl text-slate-800">ConnectCity</span>
            </button>
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
          <div className="flex items-center space-x-2 md:space-x-6">
            <button 
              onClick={() => onViewChange({ view: 'Feed' })}
              className="text-slate-500 hover:text-primary p-2 rounded-full hover:bg-primary-50 hidden md:flex">
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
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-3 cursor-pointer p-1 rounded-full hover:bg-slate-100">
                <img src={user.avatarUrl} alt={user.name} className="h-9 w-9 rounded-full" />
                <div className="hidden lg:block text-sm text-left">
                  <p className="font-semibold text-slate-800 whitespace-nowrap">{user.name}</p>
                  <p className="text-slate-500">@{user.handle}</p>
                </div>
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2">
                  <div className="px-4 py-2 border-b border-slate-200">
                    <p className="font-bold text-slate-800">{user.name}</p>
                    <p className="text-sm text-slate-500">@{user.handle}</p>
                  </div>
                  <ul className="py-2">
                    {menuItems.map(item => (
                      <li key={item.name}>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            item.action();
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center space-x-3 px-4 py-2 text-slate-700 hover:bg-slate-50"
                        >
                          {item.icon}
                          <span>{item.name}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-slate-200">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleLogout();
                      }}
                      className="flex items-center space-x-3 px-4 py-3 text-slate-700 hover:bg-red-50 hover:text-red-600"
                    >
                      <LogoutIcon className="h-5 w-5" />
                      <span>Sair</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;