import React from 'react';
import type { Trend } from '@/types';
import TrendingTopics from '@/components/TrendingTopics';

interface RightSidebarProps {
  trends: Trend[];
}

const RightSidebar: React.FC<RightSidebarProps> = ({ trends }) => {
  return (
    <aside className="space-y-6 sticky top-24">
      <TrendingTopics trends={trends} />
    </aside>
  );
};

export default RightSidebar;