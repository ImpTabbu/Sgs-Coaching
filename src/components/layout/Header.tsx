import React from 'react';
import { Menu, Puzzle, WifiOff } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useAppContext } from '../../contexts/AppContext';
import { motion, AnimatePresence } from 'motion/react';

export const Header: React.FC = () => {
  const { isOnline, toggleSideMenu, toggleGameMenu } = useAppContext();

  return (
    <>
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-rose-500 text-white text-[10px] font-black uppercase tracking-[0.2em] py-1.5 flex items-center justify-center gap-2 z-[100]"
          >
            <WifiOff size={12} />
            <span>Offline Mode - Using Cached Data</span>
          </motion.div>
        )}
      </AnimatePresence>
      <header className="flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 shrink-0 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => toggleSideMenu(true)}
            className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center active:bg-slate-100 transition-colors"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-lg font-display font-bold text-slate-900 leading-tight">SGS Coaching</h1>
            <p className="text-[10px] text-brand-primary font-semibold uppercase tracking-wider">Education for Excellence</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div 
            className={cn(
              "w-2.5 h-2.5 rounded-full shadow-sm transition-colors duration-500",
              isOnline ? "bg-green-500 shadow-green-200" : "bg-yellow-500 shadow-yellow-200"
            )} 
            title={isOnline ? "Online" : "Offline"}
          />
          <button 
            onClick={() => toggleGameMenu(true)}
            className="w-10 h-10 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center active:bg-brand-primary/20 transition-colors"
          >
            <Puzzle size={20} />
          </button>
        </div>
      </header>
    </>
  );
};
