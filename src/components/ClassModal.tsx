import React from 'react';
import { cn } from '@/src/lib/utils';
import { SUBJECTS } from '@/src/constants';
import { motion, AnimatePresence } from 'motion/react';
import { X, GraduationCap, ChevronRight, BookOpen } from 'lucide-react';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (level: string, className: string) => void;
  title: string;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 200 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    y: 20,
    transition: { duration: 0.2 }
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 }
};

export const ClassModal: React.FC<ClassModalProps> = ({ isOpen, onClose, onSelect, title }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1003] flex items-center justify-center p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div 
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div 
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white w-full max-w-[450px] rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col relative z-10"
          >
            {/* Header */}
            <div className="bg-brand-primary p-8 relative text-center space-y-2 overflow-hidden">
              {/* Decorative background element */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white mx-auto mb-2">
                <GraduationCap size={24} />
              </div>
              <h2 className="text-2xl font-display font-bold text-white relative z-10">{title}</h2>
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all active:scale-90"
              >
                <X size={20} />
              </button>
            </div>

            {/* Selection Grid */}
            <div className="p-8 max-h-[60vh] overflow-y-auto no-scrollbar">
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
                {Object.entries(SUBJECTS).map(([level, classes]) => (
                  <div key={level} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-4 bg-brand-primary rounded-full" />
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{level}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.keys(classes).map((className) => (
                        <motion.button
                          key={`${level}-${className}`}
                          variants={itemVariants}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onSelect(level, className)}
                          className="bg-slate-50 text-slate-700 p-4 rounded-2xl font-bold border border-slate-100 flex items-center justify-between group hover:bg-brand-primary hover:text-white hover:border-brand-primary hover:shadow-lg hover:shadow-brand-primary/20 transition-all duration-300"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 group-hover:text-brand-primary transition-colors">
                              <BookOpen size={16} />
                            </div>
                            <span>{className}</span>
                          </div>
                          <ChevronRight size={16} className="text-slate-300 group-hover:text-white transition-colors" />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50 text-center border-t border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Select your class to continue</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
