
import React from 'react';
import type { Suggestion } from '../types';

interface WhoToFollowProps {
  suggestions: Suggestion[];
}

const WhoToFollow: React.FC<WhoToFollowProps> = ({ suggestions }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <h3 className="font-bold text-lg mb-4">Quem seguir</h3>
      <div className="space-y-4">
        {suggestions.map(({ id, user }) => (
          <div key={id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={user.avatarUrl} alt={user.name} className="h-10 w-10 rounded-full" />
              <div className="text-sm">
                <p className="font-semibold">{user.name}</p>
                <p className="text-slate-500">@{user.handle}</p>
              </div>
            </div>
            <button className="bg-slate-200 text-slate-800 font-semibold px-4 py-1.5 rounded-full text-sm hover:bg-slate-300 transition-colors">
              Seguir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhoToFollow;
