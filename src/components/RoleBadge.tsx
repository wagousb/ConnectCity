import React from 'react';

interface RoleBadgeProps {
  role: string;
  size?: 'xs' | 'sm' | 'md';
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'sm' }) => {
  const getBadgeStyle = () => {
    switch (role) {
      case 'prefeito':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'vereador':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'secretário':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cidadão':
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const sizeStyles = {
    xs: 'text-[10px] font-semibold px-1.5 py-0.5',
    sm: 'text-xs font-semibold px-2 py-0.5',
    md: 'text-sm font-semibold px-3 py-1',
  };

  return (
    <span className={`capitalize rounded-full border ${getBadgeStyle()} ${sizeStyles[size]}`}>
      {role}
    </span>
  );
};

export default RoleBadge;