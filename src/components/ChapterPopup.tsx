import React from 'react';
import { X, PlayCircle, FileText, BookOpen, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChapterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  chapterTitle: string;
  onSelectAction: (action: 'video' | 'notes' | 'read' | 'homework') => void;
}

export const ChapterPopup: React.FC<ChapterPopupProps> = ({ isOpen, onClose, chapterTitle, onSelectAction }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-brand-primary p-6 text-white text-center relative">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X size={18} />
            </button>
            <h2 className="text-2xl font-display font-bold mb-1">{chapterTitle}</h2>
            <p className="text-brand-primary-light text-sm font-medium">What would you like to do?</p>
          </div>

          {/* Actions */}
          <div className="p-6 grid grid-cols-2 gap-4">
            <button 
              onClick={() => onSelectAction('video')}
              className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 hover:scale-105 transition-all active:scale-95"
            >
              <PlayCircle size={36} strokeWidth={1.5} />
              <span className="font-bold">Video</span>
            </button>

            <button 
              onClick={() => onSelectAction('notes')}
              className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-105 transition-all active:scale-95"
            >
              <FileText size={36} strokeWidth={1.5} />
              <span className="font-bold">Notes</span>
            </button>

            <button 
              onClick={() => onSelectAction('read')}
              className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:scale-105 transition-all active:scale-95"
            >
              <BookOpen size={36} strokeWidth={1.5} />
              <span className="font-bold">Read</span>
            </button>

            <button 
              onClick={() => onSelectAction('homework')}
              className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-purple-50 text-purple-600 hover:bg-purple-100 hover:scale-105 transition-all active:scale-95"
            >
              <ImageIcon size={36} strokeWidth={1.5} />
              <span className="font-bold">Home Work</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
