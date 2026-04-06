import React from 'react';
import { BookOpen, Trophy, Home as HomeIcon, PhoneCall, Info as InfoIcon } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useAppContext, Tab } from '../../contexts/AppContext';
import { motion } from 'motion/react';

export const BottomNav: React.FC = () => {
  const { activeTab, handleTabChange } = useAppContext();

  const navItems = [
    { id: 'study', icon: BookOpen, label: 'Study' },
    { id: 'toppers', icon: Trophy, label: 'Toppers' },
    { id: 'home', icon: HomeIcon, label: 'Home' },
    { id: 'contact', icon: PhoneCall, label: 'Contact' },
    { id: 'info', icon: InfoIcon, label: 'Info' },
  ];

  return (
    <nav className="bg-white border-t border-slate-100 h-16 sticky bottom-0 z-50 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <ul className="flex justify-around items-center h-full max-w-lg mx-auto relative px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <li key={item.id} className="flex-1 h-full">
              <button 
                onClick={() => handleTabChange(item.id as Tab)}
                className="relative flex flex-col items-center justify-center w-full h-full group outline-none"
              >
                {/* Floating Circle Background */}
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute -top-6 w-14 h-14 bg-brand-primary rounded-full shadow-lg shadow-brand-primary/40 border-4 border-white flex items-center justify-center"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <item.icon size={24} className="text-white" strokeWidth={2.5} />
                  </motion.div>
                )}

                {/* Static Icon (Hidden when active) */}
                <div className={cn(
                  "transition-all duration-300 flex flex-col items-center gap-0.5",
                  isActive ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
                )}>
                  <item.icon size={22} className="text-slate-400 group-hover:text-brand-primary" strokeWidth={2} />
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-brand-primary">
                    {item.label}
                  </span>
                </div>

                {/* Label for Active State (Shown below the floating circle) */}
                {isActive && (
                  <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 18 }}
                    className="text-[10px] font-bold text-brand-primary absolute"
                  >
                    {item.label}
                  </motion.span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
