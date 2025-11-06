import React from 'react';
import type { User } from '@/types';

interface UserPermissionRowProps {
  user: User;
  onRoleChange: (userId: string, newRole: string) => void;
  onModeratorToggle: (userId: string) => void;
}

const UserPermissionRow: React.FC<UserPermissionRowProps> = ({ user, onRoleChange, onModeratorToggle }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-slate-200">
      <div className="flex items-center space-x-4 flex-1 min-w-0 mb-3 sm:mb-0">
        <img src={user.avatarUrl} alt={user.name} className="h-12 w-12 rounded-full flex-shrink-0" />
        <div className="min-w-0">
          <div className="flex items-center space-x-2 truncate">
            <p className="font-bold text-slate-800 truncate">{user.name}</p>
            {user.is_moderator && <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 flex-shrink-0">Moderador</span>}
          </div>
          <p className="text-sm text-slate-500 truncate">@{user.handle}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4 flex-shrink-0">
        <select
          value={user.role}
          onChange={(e) => onRoleChange(user.id, e.target.value)}
          className="bg-white border border-slate-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-primary focus:border-primary"
        >
          <option value="cidadão">Cidadão</option>
          <option value="secretário">Secretário</option>
          <option value="vereador">Vereador</option>
          <option value="prefeito">Prefeito</option>
        </select>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!user.is_moderator}
            onChange={() => onModeratorToggle(user.id)}
            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium text-slate-700">Moderador</span>
        </label>
      </div>
    </div>
  );
};

export default UserPermissionRow;