import React from 'react';
import type { ConnectionRequest } from '../types';

interface NetworkPageProps {
  requests: ConnectionRequest[];
}

const NetworkPage: React.FC<NetworkPageProps> = ({ requests }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h2 className="font-bold text-lg mb-4">Convites</h2>
        {requests.length > 0 ? (
            <div className="space-y-4">
            {requests.map(req => (
                <div key={req.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200">
                <div className="flex items-center space-x-4">
                    <img src={req.user.avatarUrl} alt={req.user.name} className="h-12 w-12 rounded-full" />
                    <div>
                    <p className="font-semibold">{req.user.name}</p>
                    <p className="text-sm text-slate-500">{req.mutuals} amigos em comum</p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button className="bg-slate-200 text-slate-800 font-semibold px-4 py-1.5 rounded-full text-sm hover:bg-slate-300 transition-colors">
                    Ignorar
                    </button>
                    <button className="bg-primary text-white font-semibold px-4 py-1.5 rounded-full text-sm hover:bg-primary-700 transition-colors">
                    Aceitar
                    </button>
                </div>
                </div>
            ))}
            </div>
        ) : (
            <p className="text-slate-500">Nenhum convite pendente.</p>
        )}
      </div>
    </div>
  );
};

export default NetworkPage;