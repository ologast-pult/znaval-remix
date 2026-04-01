import React, { useState, useEffect } from 'react';
import { RepresentativeRequest } from '../types';
import { Check, X, ExternalLink, Mail, Building, User, Info, Clock, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminRepresentativeDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onSync?: () => void;
  isSyncing?: boolean;
}

const AdminRepresentativeDashboard: React.FC<AdminRepresentativeDashboardProps> = ({ isOpen, onClose, onSync, isSyncing }) => {
  const [requests, setRequests] = useState<RepresentativeRequest[]>([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border-4 border-black w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
      >
        <div className="p-4 border-b-4 border-black flex justify-between items-center bg-black text-white">
          <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
            <User size={24} />
            Панель управления
          </h2>
          <div className="flex items-center gap-4">
            {onSync && (
              <button 
                onClick={onSync}
                disabled={isSyncing}
                className="flex items-center gap-2 px-3 py-1 bg-white text-black text-[10px] font-black uppercase hover:bg-gray-200 transition-all border-2 border-white disabled:opacity-50"
              >
                <Settings size={14} className={isSyncing ? 'animate-spin' : ''} />
                {isSyncing ? 'Синхронизация...' : 'Синхронизировать данные'}
              </button>
            )}
            <button onClick={onClose} className="hover:rotate-90 transition-transform">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8f8f8]">
            <div className="text-center py-12 opacity-40">
              <p className="text-sm font-black uppercase">Функциональность запросов отключена</p>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminRepresentativeDashboard;
