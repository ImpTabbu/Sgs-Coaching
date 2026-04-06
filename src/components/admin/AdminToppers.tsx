import React from 'react';
import { motion } from 'motion/react';
import { Award, X, Loader2, Edit, Trash2 } from 'lucide-react';

interface TopperData {
  id: string;
  name: string;
  className: string;
  imageUrl: string;
  description: string;
  date: string;
  createdAt: { toDate: () => Date };
}

interface AdminToppersProps {
  toppers: TopperData[];
  loading: boolean;
  editingId: string | null;
  editingType: string | null;
  topperName: string;
  setTopperName: (val: string) => void;
  topperClass: string;
  setTopperClass: (val: string) => void;
  topperImageUrl: string;
  setTopperImageUrl: (val: string) => void;
  topperDescription: string;
  setTopperDescription: (val: string) => void;
  topperDate: string;
  setTopperDate: (val: string) => void;
  onSubmit: (e: React.FormEvent, type: string) => void;
  onEdit: (item: any, type: string) => void;
  onDelete: (id: string, col: string) => void;
  onCancelEdit: () => void;
  onClose: () => void;
}

export const AdminToppers: React.FC<AdminToppersProps> = ({
  toppers,
  loading,
  editingId,
  editingType,
  topperName,
  setTopperName,
  topperClass,
  setTopperClass,
  topperImageUrl,
  setTopperImageUrl,
  topperDescription,
  setTopperDescription,
  topperDate,
  setTopperDate,
  onSubmit,
  onEdit,
  onDelete,
  onCancelEdit,
  onClose
}) => {
  return (
    <motion.section 
      key="topper"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-rose-600">
          <div className="p-2 bg-rose-50 rounded-xl">
            <Award size={24} />
          </div>
          <h2 className="text-xl font-black tracking-tight">Toppers Management</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={20} className="text-slate-400" />
        </button>
      </div>

      <form onSubmit={(e) => onSubmit(e, 'topper')} className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
          {editingType === 'topper' ? 'Update Topper' : 'Add New Topper'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Student Name</label>
            <input 
              value={topperName} 
              onChange={(e) => setTopperName(e.target.value)} 
              placeholder="e.g. Rahul Kumar" 
              required 
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-medium" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Class/Exam</label>
            <input 
              value={topperClass} 
              onChange={(e) => setTopperClass(e.target.value)} 
              placeholder="e.g. Class 10 (2023)" 
              required 
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-medium" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Image URL</label>
            <input 
              value={topperImageUrl} 
              onChange={(e) => setTopperImageUrl(e.target.value)} 
              placeholder="https://..." 
              required 
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-medium" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date/Year</label>
            <input 
              value={topperDate} 
              onChange={(e) => setTopperDate(e.target.value)} 
              placeholder="e.g. March 2024" 
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-medium" 
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Achievement Description</label>
          <textarea 
            value={topperDescription} 
            onChange={(e) => setTopperDescription(e.target.value)} 
            placeholder="e.g. Scored 98% in CBSE Board Exams" 
            rows={2}
            className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-medium resize-none" 
          />
        </div>
        <div className="flex gap-4">
          {editingType === 'topper' && (
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
            className="flex-[2] bg-rose-600 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : (editingType === 'topper' ? 'Update Topper' : 'Add Topper')}
          </motion.button>
        </div>
      </form>

      <div className="space-y-4">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Hall of Fame</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {toppers.map((topper) => (
            <motion.div 
              key={topper.id} 
              className="bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden hover:shadow-md transition-all group"
            >
              <div className="relative aspect-[4/5] bg-slate-200">
                <img src={topper.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEdit(topper, 'topper')} className="p-2 bg-white/90 text-blue-600 rounded-xl shadow-sm hover:bg-white"><Edit size={14} /></button>
                  <button onClick={() => onDelete(topper.id, 'toppers')} className="p-2 bg-white/90 text-rose-600 rounded-xl shadow-sm hover:bg-white"><Trash2 size={14} /></button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white font-black text-sm">{topper.name}</p>
                  <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider">{topper.className}</p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[10px] text-slate-500 line-clamp-2 font-medium leading-relaxed">{topper.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};
