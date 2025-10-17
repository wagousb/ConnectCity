
import React from 'react';
import type { Suggestion, Trend } from '../types';
import WhoToFollow from './WhoToFollow';
import TrendingTopics from './TrendingTopics';

interface RightSidebarProps {
  suggestions: Suggestion[];
  trends: Trend[];
}

const RightSidebar: React.FC<RightSidebarProps> = ({ suggestions, trends }) => {
  return (
    <aside className="space-y-6 sticky top-24">
      <WhoToFollow suggestions={suggestions} />
      <TrendingTopics trends={trends} />
    </aside>
  );
};

export default RightSidebar;
