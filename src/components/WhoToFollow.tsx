import React, { useState } from 'react';
import type { Suggestion } from '../types';

interface WhoToFollowProps {
  suggestions: Suggestion[];
  onFollowToggle: (targetUserId: string) => void;
  onViewChange: (view: { view: string; userId?: string }) => void;
}

const WhoToFollow: React.FC<WhoToFollowProps> = ({ suggestions, onFollowToggle, onViewChange }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <h3 className="font-bold text-lg mb-4">Quem seguir</h3>
      <div className="space-y-4">
        {suggestions.map(({ id, user }) => {
          const isFollowing = user.isFollowing;
          return (
            <div key={id} className="flex items-center justify-between">
              <div 
                className="flex items-center space-x-3 cursor-pointer"
                onClick={() => onViewChange({ view: 'Profile', userId: user.id })}
              >
                <img src={user.avatarUrl} alt={user.name} className="h-10 w-10 rounded-full" />
                <div className="text-sm">
                  <p className="font-semibold hover:underline">{user.name}</p>
                  <p className="text-slate-500">@{user.handle}</p>
                </div>
              </div>
              <button 
                onClick={() => onFollowToggle(user.id)}
                onMouseEnter={() => setHoveredId(user.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`font-semibold px-4 py-1.5 rounded-full text-sm transition-colors w-32 text-center ${
                  isFollowing 
                    ? (hoveredId === user.id ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-200 text-slate-800')
                    : 'bg-primary text-white hover:bg-primary-700'
                }`}
              >
                {isFollowing ? (hoveredId === user.id ? 'Deixar de seguir' : 'Seguindo') : 'Seguir'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WhoToFollow;