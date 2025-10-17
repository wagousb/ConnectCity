import React from 'react';
import { HomeIcon, UsersIcon, BellIcon, BookmarkIcon, SettingsIcon } from './Icons';

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
    </nav>
  );
};

export default NavLinks;