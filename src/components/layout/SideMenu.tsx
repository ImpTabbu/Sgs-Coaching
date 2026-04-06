import React from 'react';
import { X, Bell, Image as ImageIcon, Sparkles, LayoutDashboard, LogOut } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useAppContext, Tab } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export const SideMenu: React.FC = () => {
  const { isSideMenuOpen, toggleSideMenu, activeTab, handleTabChange } = useAppContext();
  const { user, logout } = useAuth();
  
  const canAccessAdmin = user?.role === 'admin' || user?.role === 'teacher';

  return (
    <AnimatePresence>
      {isSideMenuOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => toggleSideMenu(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-[1001]"
          />
          <motion.aside 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 left-0 w-[85%] h-full bg-white z-[1002] p-8 flex flex-col shadow-2xl"
          >
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">S</div>
                <h2 className="text-xl font-display font-bold text-slate-900">SGS Menu</h2>
              </div>
              <button onClick={() => toggleSideMenu(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} className="text-slate-500" />
              </button>
            </div>
            
            <nav className="space-y-2 flex-grow">
              {[
                { id: 'notifications', icon: Bell, label: 'Notifications' },
                { id: 'gallery', icon: ImageIcon, label: 'Photos & Videos' },
                { id: 'test_series', icon: Sparkles, label: 'Test Series' },
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => handleTabChange(item.id as Tab)} 
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl w-full text-left transition-all",
                    activeTab === item.id ? "bg-brand-primary/10 text-brand-primary font-semibold" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <item.icon size={20} /> {item.label}
                </button>
              ))}
              
              {canAccessAdmin && (
                <button 
                  onClick={() => handleTabChange('admin')} 
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl w-full text-left transition-all",
                    activeTab === 'admin' ? "bg-amber-50 text-amber-600 font-semibold" : "text-amber-600 hover:bg-amber-50"
                  )}
                >
                  <LayoutDashboard size={20} /> Admin Panel
                </button>
              )}
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-100">
              <div className="flex items-center gap-3 mb-6 p-2">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-grow overflow-hidden">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  logout();
                  handleTabChange('home');
                }}
                className="flex items-center gap-4 p-4 rounded-2xl w-full text-left text-red-500 hover:bg-red-50 transition-all"
              >
                <LogOut size={20} /> Logout
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
