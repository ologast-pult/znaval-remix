import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface LargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
}

export const LargeModal: React.FC<LargeModalProps> = ({ isOpen, onClose, title, children, headerActions }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-5xl max-h-[90vh] bg-paper-light border-4 border-black z-[101] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b-2 border-black bg-white">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                  <h2 className="text-xl font-black tracking-tighter uppercase">{title}</h2>
                </div>
                {headerActions && (
                  <div className="flex items-center gap-2">
                    {headerActions}
                  </div>
                )}
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 border-2 border-black flex items-center justify-center transition-all btn-newspaper-hover"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
              {children}
            </div>

            {/* Footer Decoration */}
            <div className="h-2 bg-black w-full" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
