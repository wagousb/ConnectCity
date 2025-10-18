import React from 'react';
import { HomeIcon, UsersIcon, BellIcon, BookmarkIcon, SettingsIcon, LogoutIcon } from '@/components/Icons';
import { supabase } from '@/integrations/supabase/client';

interface NavLinksProps {
  activeLink: string;
  onLinkClick: (linkName: string) => void;
}

const NavLinks: React.FC<NavLinksProps> = ({ activeLink, onLinkClick }) => {
  const links = [
    { name: 'Feed', icon: <HomeIcon className="h-6 w-6" /> },
    { name: 'Minha Rede', icon: <UsersIcon className="h-6 w-6" /> },
    { name: 'Notificações', icon: <BellIcon className="h-6 w-6" /> },
    { name: 'Salvos', icon: <BookmarkIcon className="h-6 w-6" /> },
    { name: 'Configurações', icon: <SettingsIcon className="h-6 w-6" /> },
  ];

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="bg-white p-4 rounded-xl border border-slate-200">
      <ul className="space-y-1">
        {links.map((link) => (
          <li key={link.name}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onLinkClick(link.name);
              }}
              className={`flex items-center space-x-4 p-3 rounded-lg font-semibold transition-colors duration-200 ${
                activeLink === link.name
                  ? 'bg-primary-50 text-primary'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {link.icon}
              <span>{link.name}</span>
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-4 pt-4 border-t border-slate-200">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleLogout();
          }}
          className="flex items-center space-x-4 p-3 rounded-lg font-semibold transition-colors duration-200 text-slate-600 hover:bg-red-50 hover:text-red-600"
        >
          <LogoutIcon className="h-6 w-6" />
          <span>Sair</span>
        </a>
      </div>
    </nav>
  );
};

export default NavLinks;