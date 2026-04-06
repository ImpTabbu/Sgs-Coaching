import React from 'react';
import { motion } from 'motion/react';
import { Bell, X, Loader2, Edit, Trash2 } from 'lucide-react';

interface NotificationData {
  id: string;
  title: string;
  message: string;
  imageUrl: string;
  author: string;
  type: string;
  createdAt: { toDate: () => Date };
}

interface AdminNotificationsProps {
  notifications: NotificationData[];
  loading: boolean;
  editingId: string | null;
  editingType: string | null;
  notifTitle: string;
  setNotifTitle: (val: string) => void;
  notifMsg: string;
  setNotifMsg: (val: string) => void;
  notifImageUrl: string;
  setNotifImageUrl: (val: string) => void;
  notifAuthor: string;
  setNotifAuthor: (val: string) => void;
  notifType: string;
  setNotifType: (val: string) => void;
  onSubmit: (e: React.FormEvent, type: string) => void;
  onEdit: (item: any, type: string) => void;
  onDelete: (id: string, col: string) => void;
  onCancelEdit: () => void;
  onClose: () => void;
}

export const AdminNotifications: React.FC<AdminNotificationsProps> = ({
  notifications,
  loading,
  editingId,
  editingType,
  notifTitle,
  setNotifTitle,
  notifMsg,
  setNotifMsg,
  notifImageUrl,
  setNotifImageUrl,
  notifAuthor,
  setNotifAuthor,
  notifType,
  setNotifType,
  onSubmit,
  onEdit,
  onDelete,
  onCancelEdit,
  onClose
}) => {
  return (
    <motion.section 
      key="notification"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-brand-primary">
          <div className="p-2 bg-brand-primary/10 rounded-xl">
            <Bell size={24} />
          </div>
          <h2 className="text-xl font-black tracking-tight">Alerts & Notifications</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={20} className="text-slate-400" />
        </button>
      </div>

      <form onSubmit={(e) => onSubmit(e, 'notification')} className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
          {editingType === 'notification' ? 'Update Notification' : 'Send New Notification'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
            <input 
              value={notifTitle} 
              onChange={(e) => setNotifTitle(e.target.value)} 
              placeholder="Notification Title" 
              required 
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary outline-none transition-all font-medium" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
            <select 
              value={notifType} 
              onChange={(e) => setNotifType(e.target.value)} 
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary outline-none transition-all font-medium"
            >
              <option value="Announcement">Announcement</option>
              <option value="Event">Event</option>
              <option value="Holiday">Holiday</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Image URL (Optional)</label>
            <input 
              value={notifImageUrl} 
              onChange={(e) => setNotifImageUrl(e.target.value)} 
              placeholder="https://example.com/image.jpg" 
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary outline-none transition-all font-medium" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Author</label>
            <input 
              value={notifAuthor} 
              onChange={(e) => setNotifAuthor(e.target.value)} 
              placeholder="e.g. Principal" 
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary outline-none transition-all font-medium" 
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message</label>
          <textarea 
            value={notifMsg} 
            onChange={(e) => setNotifMsg(e.target.value)} 
            placeholder="Write your message here..." 
            required 
            rows={3}
            className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary outline-none transition-all font-medium resize-none" 
          />
        </div>
        <div className="flex gap-4">
          {editingType === 'notification' && (
            <button 
              type="button"
              onClick={onCancelEdit}
              className="flex-1 py-4 bg-slate-200 text-slate-700 font-black rounded-2xl hover:bg-slate-300 transition-all"
            >
              Cancel
            </button>
          )}
          <motion.button 
            whileTap={{ scale: 0.98 }}
            disabled={loading} 
            className="flex-[2] bg-brand-primary text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : (editingType === 'notification' ? 'Update Notification' : 'Send Notification')}
          </motion.button>
        </div>
      </form>

      <div className="space-y-4">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Recent Notifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notifications.map((notif) => (
            <motion.div 
              key={notif.id} 
              className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col gap-3 hover:bg-white hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md ${
                    notif.type === 'Urgent' ? 'bg-rose-100 text-rose-600' : 'bg-brand-primary/10 text-brand-primary'
                  }`}>{notif.type}</span>
                  <span className="text-[9px] font-bold text-slate-400">{notif.createdAt.toDate().toLocaleDateString()}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => onEdit(notif, 'notification')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><Edit size={14} /></button>
                  <button onClick={() => onDelete(notif.id, 'notifications')} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{notif.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1 font-medium">{notif.message}</p>
              </div>
              {notif.imageUrl && (
                <img src={notif.imageUrl} alt="" className="w-full h-24 object-cover rounded-xl border border-slate-200" referrerPolicy="no-referrer" />
              )}
              <div className="flex items-center gap-2 mt-1">
                <div className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-[8px] font-bold text-slate-500">
                  {notif.author?.charAt(0) || 'A'}
                </div>
                <span className="text-[10px] font-bold text-slate-400">By {notif.author || 'Admin'}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};
