import React from 'react';
import type { User } from '@/types';
import ProfileCard from '@/components/ProfileCard';
import NavLinks from '@/components/NavLinks';

interface LeftSidebarProps {
  user: User;
  currentView: string;
  onViewChange: (view: { view: string; userId?: string }) => void;
  onUserUpdate: (newProfileData: Partial<User>) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ user, currentView, onViewChange, onUserUpdate }) => {
  return (
    <aside className="space-y-6 sticky top-24">
      <ProfileCard user={user} onViewChange={(viewName) => onViewChange({ view: viewName })} onUserUpdate={onUserUpdate} />
      <NavLinks activeLink={currentView} onLinkClick={(viewName) => onViewChange({ view: viewName })} />
    </aside>
  );
};

export default LeftSidebar;