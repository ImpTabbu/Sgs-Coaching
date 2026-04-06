import React from 'react';
import { BookOpen, Trophy, Home as HomeIcon, PhoneCall, Info as InfoIcon } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useAppContext, Tab } from '../../contexts/AppContext';

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
    <nav className="bg-white/90 backdrop-blur-lg border-t border-slate-100 px-6 py-4 pb-safe sticky bottom-0 z-50 shrink-0">
      <ul className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <li key={item.id}>
              <button 
                onClick={() => handleTabChange(item.id as Tab)}
                className="flex flex-col items-center gap-1.5 relative group"
              >
                <div className={cn(
                  "p-2.5 rounded-xl transition-all duration-300",
                  isActive 
                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/30 scale-110 -translate-y-2" 
                    : "text-slate-400 hover:bg-slate-50 hover:text-brand-primary"
                )}>
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={cn(
                  "text-[10px] font-bold transition-all duration-300 absolute -bottom-4",
                  isActive ? "text-brand-primary opacity-100" : "text-slate-400 opacity-0 group-hover:opacity-100"
                )}>
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
