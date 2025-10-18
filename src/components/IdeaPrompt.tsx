import React from 'react';
import { LightbulbIcon } from './Icons';

interface IdeaPromptProps {
  isFirstPost: boolean;
}

const IdeaPrompt: React.FC<IdeaPromptProps> = ({ isFirstPost }) => {
  const title = isFirstPost ? "Publique sua primeira ideia!" : "Tem uma nova ideia?";
  const subtitle = isFirstPost 
    ? "Compartilhe sua visão para a cidade e comece a fazer a diferença." 
    : "Continue contribuindo com projetos para melhorar nossa comunidade.";

  return (
    <div className="bg-primary-50 border-2 border-dashed border-primary-200 rounded-xl p-6 text-center">
      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
        <LightbulbIcon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-slate-800">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
    </div>
  );
};

export default IdeaPrompt;