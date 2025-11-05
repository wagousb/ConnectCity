import React, { useState, useRef, useEffect } from 'react';
import { PencilIcon, TrashIcon, MoreVerticalIcon } from './Icons';

interface PostActionsDropdownProps {
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  isAuthor: boolean;
}

const PostActionsDropdown: React.FC<PostActionsDropdownProps> = ({ onEdit, onDelete, onReport, isAuthor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        aria-label="Mais opções"
      >
        <MoreVerticalIcon className="h-5 w-5" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-10">
          <ul className="py-1">
            {isAuthor ? (
              <>
                <li>
                  <button
                    onClick={() => handleAction(onEdit)}
                    className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span>Editar</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleAction(onDelete)}
                    className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                    <span>Excluir</span>
                  </button>
                </li>
              </>
            ) : (
              <li>
                <button
                  onClick={() => handleAction(onReport)}
                  className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Denunciar</span>
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PostActionsDropdown;