import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Trash2, Edit, Database, RefreshCw, ChevronRight, User, Image as ImageIcon, X, Clock, Info, Sparkles } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { firebaseService } from '../services/firebaseService';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface NotificationsProps {
  isAdmin?: boolean;
  onEdit?: (item: any) => void;
  sheetConfig?: { enabled: boolean; id: string; scriptUrl?: string };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export const Notifications: React.FC<NotificationsProps> = ({ isAdmin, onEdit, sheetConfig }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedNotif, setSelectedNotif] = useState<any | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupSubscription = () => {
      setLoading(true);
      unsubscribe = firebaseService.subscribeToCollection('Notifications', (data) => {
        const mappedData = data.map((item) => ({
          id: item.id,
          title: item.title || item.notificationtitle || 'No Title',
          message: item.message || item.notificationmessage || '',
          imageUrl: item.imageurl || '',
          author: item.author || 'Admin',
          type: item.type || 'Announcement',
          createdAt: item.createdat ? { toDate: () => new Date(item.createdat) } : { toDate: () => new Date() },
          isFromSheet: false
        }));
        setNotifications(mappedData);
        setLoading(false);
      });
    };

    setupSubscription();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const item = notifications.find(n => n.id === deleteId);
      if (item && item.id) {
        const result = await firebaseService.writeToCollection('delete', 'Notifications', { id: item.id });
        if (result.success) {
          // No need to fetch, subscription handles it
        } else {
          alert(result.message);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteId(null);
      setIsConfirmOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw size={32} className="text-brand-primary" />
        </motion.div>
        <p className="text-slate-500 font-medium animate-pulse">Checking for updates...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-background min-h-screen pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Notifications</h1>
          <p className="text-xs text-slate-500 font-medium">Stay updated with the latest news</p>
        </div>
        {/* Refresh button removed as it's now real-time */}
      </div>
      
      {notifications.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center space-y-4"
        >
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
            <Bell size={40} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800">All Caught Up!</h3>
            <p className="text-slate-500 text-sm max-w-[200px]">You have no new notifications at this time.</p>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-4"
        >
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              variants={itemVariants}
              onClick={() => setSelectedNotif(notif)}
              className={cn(
                "group relative bg-white rounded-3xl border p-4 md:p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden",
                notif.type === 'Urgent' ? 'border-rose-200 shadow-rose-100/50 bg-rose-50/50 ring-2 ring-rose-500/10' : 
                notif.type === 'Update' ? 'border-blue-100 bg-blue-50/30' :
                notif.type === 'Event' ? 'border-amber-100 bg-amber-50/30' : 'border-slate-100 shadow-slate-200/50'
              )}
            >
              {/* Background Accent */}
              <div className={cn(
                "absolute top-0 left-0 w-1.5 h-full transition-all duration-300 group-hover:w-2",
                notif.type === 'Urgent' ? 'bg-rose-600 animate-pulse shadow-[2px_0_10px_rgba(225,29,72,0.4)]' : 
                notif.type === 'Update' ? 'bg-blue-500' : 
                notif.type === 'Event' ? 'bg-amber-500' : 'bg-brand-primary'
              )} />

              <div className="flex gap-4">
                {/* Image/Icon Section */}
                <div className="shrink-0">
                  {notif.imageUrl ? (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border border-slate-100 shadow-inner">
                      <img 
                        src={notif.imageUrl} 
                        alt={notif.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                        onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000&auto=format&fit=crop')}
                      />
                    </div>
                  ) : (
                    <div className={cn(
                      "w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center border shadow-inner transition-transform group-hover:scale-105",
                      notif.type === 'Urgent' ? 'bg-rose-100 border-rose-200 text-rose-600 shadow-rose-100' : 
                      notif.type === 'Update' ? 'bg-blue-50 border-blue-100 text-blue-500' : 
                      notif.type === 'Event' ? 'bg-amber-50 border-amber-100 text-amber-500' : 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary'
                    )}>
                      {notif.type === 'Urgent' ? (
                        <Bell size={28} className="animate-[bounce_2s_infinite] drop-shadow-sm" />
                      ) : (
                        <Bell size={28} className="group-hover:rotate-12 transition-transform" />
                      )}
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 shadow-sm",
                        notif.type === 'Urgent' ? 'bg-rose-600 text-white border-rose-500 animate-pulse' : 
                        notif.type === 'Update' ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                        notif.type === 'Event' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
                      )}>
                        {notif.type === 'Urgent' && <Sparkles size={10} className="animate-spin" />}
                        {notif.type || 'Announcement'}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <Clock size={10} />
                        {notif.createdAt?.toDate ? notif.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Just now'}
                      </span>
                    </div>
                    
                    {isAdmin && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.(notif);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notif.id);
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-base md:text-lg font-black text-slate-900 leading-tight group-hover:text-brand-primary transition-colors truncate">
                    {notif.title}
                  </h3>
                  
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                        <User size={10} className="text-slate-500" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-500">{notif.author || 'Admin'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-brand-primary font-black text-[11px] uppercase tracking-wider group-hover:gap-2 transition-all">
                      Read More <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedNotif && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNotif(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              {/* Modal Header/Image */}
              <div className="relative h-48 md:h-64 bg-slate-100">
                {selectedNotif.imageUrl ? (
                  <img 
                    src={selectedNotif.imageUrl} 
                    alt={selectedNotif.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000&auto=format&fit=crop')}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-brand-primary/5">
                    <Bell size={64} className="text-brand-primary/20" />
                  </div>
                )}
                <button
                  onClick={() => setSelectedNotif(null)}
                  className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white rounded-full transition-all"
                >
                  <X size={20} />
                </button>
                <div className="absolute bottom-4 left-6">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md",
                    selectedNotif.type === 'Urgent' ? 'bg-rose-500/80 text-white border-rose-400' : 
                    selectedNotif.type === 'Update' ? 'bg-blue-500/80 text-white border-blue-400' : 
                    selectedNotif.type === 'Event' ? 'bg-amber-500/80 text-white border-amber-400' : 'bg-brand-primary/80 text-white border-brand-primary/40'
                  )}>
                    {selectedNotif.type || 'Announcement'}
                  </span>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    <Calendar size={12} />
                    {selectedNotif.createdAt?.toDate ? selectedNotif.createdAt.toDate().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Just now'}
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">
                    {selectedNotif.title}
                  </h2>
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {selectedNotif.message}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-top border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
                      <User size={20} className="text-brand-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Posted By</p>
                      <p className="text-sm font-black text-slate-900">{selectedNotif.author || 'Admin'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedNotif(null)}
                    className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Notification"
        message="Are you sure you want to delete this notification?"
      />
    </div>
  );
};
