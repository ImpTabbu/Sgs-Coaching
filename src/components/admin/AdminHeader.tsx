import React from 'react';
import { motion } from 'motion/react';
import { Settings, ShieldCheck } from 'lucide-react';

interface AdminHeaderProps {
  userEmail: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ userEmail }) => {
  return (
    <div className="flex flex-col items-center gap-4 mb-10">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-16 h-16 bg-brand-primary rounded-3xl flex items-center justify-center shadow-lg shadow-brand-primary/20"
      >
        <Settings className="text-white" size={32} />
      </motion.div>
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Control</h1>
        <p className="text-gray-500 text-sm font-medium">Manage your institution's digital presence</p>
      </div>
      
      {userEmail && (
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-2 text-xs font-bold text-brand-primary bg-white px-4 py-2 rounded-2xl shadow-sm border border-brand-primary/10"
        >
          <ShieldCheck size={14} />
          <span>{userEmail}</span>
        </motion.div>
      )}
    </div>
  );
};
