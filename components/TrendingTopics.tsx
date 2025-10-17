
import React from 'react';
import type { Trend } from '../types';

interface TrendingTopicsProps {
  trends: Trend[];
}

const TrendingTopics: React.FC<TrendingTopicsProps> = ({ trends }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <h3 className="font-bold text-lg mb-4">Assuntos do Momento</h3>
      <div className="space-y-3">
        {trends.map((trend) => (
          <div key={trend.id}>
            <p className="font-semibold text-sm hover:underline cursor-pointer">{trend.hashtag}</p>
            <p className="text-xs text-slate-500">{trend.postCount}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingTopics;
