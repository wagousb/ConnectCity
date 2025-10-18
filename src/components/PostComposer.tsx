import React, { useState } from 'react';
import type { User } from '@/types';
import { ImageIcon, BarChartIcon, SmileIcon } from '@/components/Icons';

interface PostComposerProps {
  user: User;
}

const PostComposer: React.FC<PostComposerProps> = ({ user }) => {
  const [postText, setPostText] = useState('');

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <div className="flex space-x-4">
        <img src={user.avatarUrl} alt={user.name} className="h-12 w-12 rounded-full" />
        <div className="flex-1">
          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            className="w-full text-lg border-none focus:ring-0 resize-none p-0 placeholder-slate-400 bg-transparent"
            rows={3}
            placeholder="O que está acontecendo?"
          ></textarea>
        </div>
      </div>
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200">
        <div className="flex space-x-2">
            <button className="text-slate-500 hover:text-primary p-2 rounded-full hover:bg-primary-50">
                <ImageIcon className="h-6 w-6" />
            </button>
            <button className="text-slate-500 hover:text-primary p-2 rounded-full hover:bg-primary-50">
                <BarChartIcon className="h-6 w-6" />
            </button>
            <button className="text-slate-500 hover:text-primary p-2 rounded-full hover:bg-primary-50">
                <SmileIcon className="h-6 w-6" />
            </button>
        </div>
        <button
          disabled={!postText.trim()}
          className="bg-primary text-white font-semibold px-6 py-2 rounded-full hover:bg-primary-700 transition-colors disabled:bg-primary-300 disabled:cursor-not-allowed"
        >
          Publicar
        </button>
      </div>
    </div>
  );
};

export default PostComposer;