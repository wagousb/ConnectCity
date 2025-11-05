import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { DownloadIcon } from './Icons';

const PwaInstallPrompt: React.FC = () => {
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Não mostra o prompt se já estiver no modo PWA ou se o usuário já dispensou permanentemente
    if (window.matchMedia('(display-mode: standalone)').matches || localStorage.getItem('pwaInstallDismissed') === 'true') {
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPromptEvent) return;
    installPromptEvent.prompt();
    installPromptEvent.userChoice.then((choiceResult: { outcome: 'accepted' | 'dismissed' }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      setInstallPromptEvent(null);
      setShowPrompt(false);
    });
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  const handleDismissPermanently = () => {
    localStorage.setItem('pwaInstallDismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-full max-w-md">
        <img src="/logo-app.png" alt="Itamorotinga Logo" className="w-24 h-24 mx-auto mb-4" />
        <h1 className="font-bold text-4xl text-slate-800 font-script mb-2">Itamorotinga</h1>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Leve a cidade com você</h2>
        <p className="text-slate-600 mb-8">
          Adicione o aplicativo à sua tela inicial para acesso rápido e uma experiência completa, mesmo offline.
        </p>
        
        <button
          onClick={handleInstallClick}
          className="w-full flex items-center justify-center bg-primary text-white font-semibold px-6 py-3 rounded-lg text-lg hover:bg-primary-700 transition-colors shadow-lg"
        >
          <DownloadIcon className="h-6 w-6 mr-3" />
          Baixar o aplicativo
        </button>

        <button
          onClick={handleDismiss}
          className="mt-4 text-primary font-semibold hover:underline"
        >
          Usar no navegador
        </button>

        <div className="mt-8">
          <button onClick={handleDismissPermanently} className="text-xs text-slate-400 hover:underline">
            Não mostrar novamente
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PwaInstallPrompt;