import React from 'react';
import type { User } from '@/types';
import ProfileCard from '@/components/ProfileCard';
import NavLinks from '@/components/NavLinks';

interface LeftSidebarProps {
  user: User;
  currentView: string;
  onViewChange: (view: string) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ user, currentView, onViewChange }) => {
  return (
    <aside className="space-y-6 sticky top-24">
      <ProfileCard user={user} onViewChange={onViewChange} />
      <NavLinks activeLink={currentView} onLinkClick={onViewChange} />
    </aside>
  );
};

export default LeftSidebar;