import React from 'react';
import type { Suggestion, Trend } from '@/types';
import WhoToFollow from '@/components/WhoToFollow';
import TrendingTopics from '@/components/TrendingTopics';

interface RightSidebarProps {
  suggestions: Suggestion[];
  trends: Trend[];
  onFollowToggle: (targetUserId: string) => void;
  onViewChange: (view: { view: string; userId?: string }) => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ suggestions, trends, onFollowToggle, onViewChange }) => {
  return (
    <aside className="space-y-6 sticky top-24">
      <WhoToFollow suggestions={suggestions} onFollowToggle={onFollowToggle} onViewChange={onViewChange} />
      <TrendingTopics trends={trends} />
    </aside>
  );
};

export default RightSidebar;