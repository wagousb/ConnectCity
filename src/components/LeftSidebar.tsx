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
    <aside className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <div className="space-y-6">
        <ProfileCard user={user} onViewChange={(viewName) => onViewChange({ view: viewName })} />
        <NavLinks activeLink={currentView} onLinkClick={(viewName) => onViewChange({ view: viewName })} isModerator={isModerator} />
      </div>
    </aside>
  );
};

export default LeftSidebar;