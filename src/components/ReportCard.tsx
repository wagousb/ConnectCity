import React, { useState } from 'react';
import type { Report } from '@/types';
import { FileTextIcon, ClockIcon, CheckCircleIcon, XIcon } from './Icons';

interface ReportCardProps {
  report: Report;
  onUpdateStatus: (reportId: string, newStatus: 'resolved' | 'rejected') => Promise<void>;
  onViewPost: (postId: string) => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onUpdateStatus, onViewPost }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (status: 'resolved' | 'rejected') => {
    setIsUpdating(true);
    await onUpdateStatus(report.id, status);
    setIsUpdating(false);
  };

  const timeAgo = (date: string): string => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d atrás";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h atrás";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "min atrás";
    return "agora";
  }

  return (
    <div className="p-4 border border-red-200 bg-red-50 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-3 border-b border-red-100 pb-3">
        <div className="flex items-center space-x-2">
          <FileTextIcon className="h-5 w-5 text-red-600" />
          <h3 className="font-bold text-red-800">Denúncia Pendente</h3>
        </div>
        <div className="flex items-center space-x-1 text-xs text-slate-500">
            <ClockIcon className="h-3 w-3" />
            <span>{timeAgo(report.created_at)}</span>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <p className="text-slate-700">
          <span className="font-semibold">Motivo:</span> {report.reason}
        </p>
        <p className="text-slate-700">
          <span className="font-semibold">Denunciado por:</span> @{report.reporter_handle}
        </p>
        <p className="text-slate-700">
          <span className="font-semibold">Ideia:</span> 
          <button 
            onClick={() => onViewPost(report.post_id)}
            className="ml-1 text-primary font-medium hover:underline"
          >
            {report.post_title}
          </button>
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-red-100 flex justify-end space-x-3">
        <button
          onClick={() => handleUpdate('rejected')}
          disabled={isUpdating}
          className="flex items-center space-x-1 px-3 py-1.5 text-sm font-semibold rounded-md text-slate-700 bg-slate-200 hover:bg-slate-300 transition-colors disabled:opacity-50"
        >
          <XIcon className="h-4 w-4" />
          <span>{isUpdating ? 'Rejeitando...' : 'Rejeitar'}</span>
        </button>
        <button
          onClick={() => handleUpdate('resolved')}
          disabled={isUpdating}
          className="flex items-center space-x-1 px-3 py-1.5 text-sm font-semibold rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors disabled:bg-green-300 disabled:opacity-50"
        >
          <CheckCircleIcon className="h-4 w-4" />
          <span>{isUpdating ? 'Resolvendo...' : 'Resolver'}</span>
        </button>
      </div>
    </div>
  );
};

export default ReportCard;