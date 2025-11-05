import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { XIcon } from './Icons';

function PwaReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error:', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (offlineReady || needRefresh) {
    return (
      <div className="fixed right-4 bottom-4 z-50 bg-slate-800 text-white p-4 rounded-lg shadow-lg flex items-center space-x-4 animate-fade-in-up">
        <div className="flex-1">
          {offlineReady ? (
            <span>App pronto para funcionar offline.</span>
          ) : (
            <span>Nova versão disponível, clique para atualizar.</span>
          )}
        </div>
        {needRefresh && (
          <button
            className="bg-primary font-semibold px-4 py-1.5 rounded-md hover:bg-primary-700 transition-colors text-sm"
            onClick={() => updateServiceWorker(true)}
          >
            Atualizar
          </button>
        )}
        <button onClick={close} className="p-1 rounded-full hover:bg-slate-700">
          <XIcon className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return null;
}

export default PwaReloadPrompt;