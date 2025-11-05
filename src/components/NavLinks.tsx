import React, { useState } from 'react';
import { HomeIcon, UsersIcon, BellIcon, SettingsIcon, LogoutIcon, ShieldCheckIcon, StarIcon, CheckCircleIcon } from '@/components/Icons';
import { supabase } from '@/integrations/supabase/client';

interface NavLinksProps {
  activeLink: string;
  onLinkClick: (linkName: string) => void;
  isModerator: boolean;
}

const NavLinks: React.FC<NavLinksProps> = ({ activeLink, onLinkClick, isModerator }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = [
    { name: 'Feed', icon: <HomeIcon className="h-6 w-6" /> },
    { name: 'Ranking', icon: <StarIcon className="h-6 w-6" /> },
    { name: 'Ideias Realizadas', icon: <CheckCircleIcon className="h-6 w-6" /> },
    { name: 'Membros', icon: <UsersIcon className="h-6 w-6" /> },
    { name: 'Notificações', icon: <BellIcon className="h-6 w-6" /> },
    { name: 'Configurações', icon: <SettingsIcon className="h-6 w-6" /> },
  ];

  if (isModerator) {
    links.push({ name: 'Moderação', icon: <ShieldCheckIcon className="h-6 w-6" /> });
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Error logging out:', error);
    }
  };

  const handleLinkClick = (linkName: string) => {
    onLinkClick(linkName);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      {/* Mobile header and toggle */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer lg:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <div className="flex items-center space-x-4">
          <SettingsIcon className="h-6 w-6 text-slate-600" />
          <span className="font-semibold text-slate-600">Menu</span>
        </div>
        <svg
          className={`w-5 h-5 text-slate-500 transform transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>

      {/* Navigation links */}
      <nav className={`lg:block ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-4 pb-4 lg:p-4">
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.name}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(link.name);
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
                handleLogout(); // Chama a função de logout diretamente
              }}
              className="flex items-center space-x-4 p-3 rounded-lg font-semibold transition-colors duration-200 text-slate-600 hover:bg-red-50 hover:text-red-600"
            >
              <LogoutIcon className="h-6 w-6" />
              <span>Sair</span>
            </a>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default NavLinks;