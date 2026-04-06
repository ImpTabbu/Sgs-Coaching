import React from 'react';
import { motion } from 'motion/react';
import { Bell, X, Loader2, Edit, Trash2 } from 'lucide-react';

interface NoticeData {
  id: string;
  text: string;
  date: string;
  createdAt: { toDate: () => Date };
}

interface AdminNoticeProps {
  noticeBoard: NoticeData[];
  loading: boolean;
  editingId: string | null;
  editingType: string | null;
  noticeText: string;
  setNoticeText: (val: string) => void;
  noticeDate: string;
  setNoticeDate: (val: string) => void;
  onSubmit: (e: React.FormEvent, type: string) => void;
  onEdit: (item: any, type: string) => void;
  onDelete: (id: string, col: string) => void;
  onCancelEdit: () => void;
  onClose: () => void;
}

export const AdminNotice: React.FC<AdminNoticeProps> = ({
  noticeBoard,
  loading,
  editingId,
  editingType,
  noticeText,
  setNoticeText,
  noticeDate,
  setNoticeDate,
  onSubmit,
  onEdit,
  onDelete,
  onCancelEdit,
  onClose
}) => {
  return (
    <motion.section 
      key="notice"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-orange-600">
          <div className="p-2 bg-orange-50 rounded-xl">
            <Bell size={24} />
          </div>
          <h2 className="text-xl font-black tracking-tight">Notice Board</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={20} className="text-slate-400" />
        </button>
      </div>

      <form onSubmit={(e) => onSubmit(e, 'notice')} className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
          {editingType === 'notice' ? 'Update Notice' : 'Post New Notice'}
        </h3>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notice Content</label>
          <textarea 
            value={noticeText} 
            onChange={(e) => setNoticeText(e.target.value)} 
            placeholder="Write the notice content here..." 
            required 
            rows={4}
            className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all font-medium resize-none" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notice Date (Optional)</label>
          <input 
            type="date"
            value={noticeDate} 
            onChange={(e) => setNoticeDate(e.target.value)} 
            className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all font-medium" 
          />
          <p className="text-[9px] text-slate-400 font-medium ml-1 italic">Leave blank to use current date</p>
        </div>
        <div className="flex gap-4 pt-4">
          {editingType === 'notice' && (
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
            className="flex-[2] bg-orange-600 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : (editingType === 'notice' ? 'Update Notice' : 'Post Notice')}
          </motion.button>
        </div>
      </form>

      <div className="space-y-4">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Recent Notices</h3>
        <div className="space-y-3">
          {noticeBoard.map((notice) => (
            <motion.div 
              key={notice.id} 
              className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white hover:shadow-md transition-all group"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md bg-orange-100 text-orange-600">Notice</span>
                  <span className="text-[9px] font-bold text-slate-400">{notice.date}</span>
                </div>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">{notice.text}</p>
              </div>
              <div className="flex gap-1 shrink-0 justify-end">
                <button onClick={() => onEdit(notice, 'notice')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><Edit size={16} /></button>
                <button onClick={() => onDelete(notice.id, 'notice')} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"><Trash2 size={16} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};
