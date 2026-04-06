import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  roles: string[];
}

interface AdminTabGridProps {
  tabs: Tab[];
  onTabClick: (tabId: string) => void;
}

export const AdminTabGrid: React.FC<AdminTabGridProps> = ({ tabs, onTabClick }) => {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="grid grid-cols-2 md:grid-cols-3 gap-4"
    >
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          whileHover={{ scale: 1.02, translateY: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onTabClick(tab.id)}
          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all group"
        >
          <div className={`p-4 ${tab.bgColor} ${tab.color} rounded-2xl group-hover:scale-110 transition-transform`}>
            <tab.icon size={28} />
          </div>
          <span className="font-bold text-slate-700 text-sm">{tab.label}</span>
        </motion.button>
      ))}
    </motion.div>
  );
};
