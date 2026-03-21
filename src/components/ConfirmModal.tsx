import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-[340px] rounded-3xl shadow-2xl overflow-hidden border border-white/20"
          >
            <div className="p-8 text-center space-y-6">
              <motion.div 
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner"
              >
                <AlertTriangle size={40} className="drop-shadow-sm" />
              </motion.div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed px-2">
                  {message}
                </p>
              </div>
            </div>

            <div className="flex p-4 gap-3 bg-gray-50/50 border-t border-gray-100">
              <button 
                onClick={onClose}
                className="flex-1 py-4 px-6 text-gray-600 font-bold hover:bg-white rounded-2xl transition-all active:scale-95 border border-gray-200 shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex-1 py-4 px-6 bg-red-500 text-white font-bold hover:bg-red-600 rounded-2xl transition-all active:scale-95 shadow-lg shadow-red-200 flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
