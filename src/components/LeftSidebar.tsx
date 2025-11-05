import React from 'react';
import type { User } from '@/types';
import ProfileCard from '@/components/ProfileCard';
import NavLinks from '@/components/NavLinks';

interface LeftSidebarProps {
  user: User;
  currentView: string;
  onViewChange: (view: { view: string; userId?: string }) => void;
  isModerator: boolean;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ user, currentView, onViewChange, isModerator }) => {
  return (
    <aside className="space-y-6 sticky top-24">
      <ProfileCard user={user} onViewChange={(viewName) => onViewChange({ view: viewName })} />
      <NavLinks activeLink={currentView} onLinkClick={(viewName) => onViewChange({ view: viewName })} isModerator={isModerator} />
    </aside>
  );
};

export default LeftSidebar;