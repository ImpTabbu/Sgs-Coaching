import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, X, Loader2, Edit, Trash2, Plus } from 'lucide-react';

interface PrePrimaryData {
  id: string;
  className: string;
  subject: string;
  images: string[];
  createdAt: { toDate: () => Date };
}

interface AdminPrePrimaryProps {
  prePrimaryContent: PrePrimaryData[];
  loading: boolean;
  editingId: string | null;
  editingType: string | null;
  prePrimaryClass: string;
  setPrePrimaryClass: (val: string) => void;
  prePrimarySubject: string;
  setPrePrimarySubject: (val: string) => void;
  prePrimaryImages: string[];
  setPrePrimaryImages: (val: string[]) => void;
  onSubmit: (e: React.FormEvent, type: string) => void;
  onEdit: (item: any, type: string) => void;
  onDelete: (id: string, col: string) => void;
  onCancelEdit: () => void;
  onClose: () => void;
}

export const AdminPrePrimary: React.FC<AdminPrePrimaryProps> = ({
  prePrimaryContent,
  loading,
  editingId,
  editingType,
  prePrimaryClass,
  setPrePrimaryClass,
  prePrimarySubject,
  setPrePrimarySubject,
  prePrimaryImages,
  setPrePrimaryImages,
  onSubmit,
  onEdit,
  onDelete,
  onCancelEdit,
  onClose
}) => {
  return (
    <motion.section 
      key="pre_primary"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-pink-600">
          <div className="p-2 bg-pink-50 rounded-xl">
            <Sparkles size={24} />
          </div>
          <h2 className="text-xl font-black tracking-tight">Pre-Primary Content</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={20} className="text-slate-400" />
        </button>
      </div>

      <form onSubmit={(e) => onSubmit(e, 'pre_primary')} className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
          {editingType === 'pre_primary' ? 'Update Content' : 'Add New Content'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Class</label>
            <select 
              value={prePrimaryClass} 
              onChange={(e) => setPrePrimaryClass(e.target.value)} 
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none transition-all font-medium"
            >
              <option value="L.K.G">L.K.G</option>
              <option value="U.K.G">U.K.G</option>
              <option value="Nursery">Nursery</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
            <select 
              value={prePrimarySubject} 
              onChange={(e) => setPrePrimarySubject(e.target.value)} 
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none transition-all font-medium"
            >
              <option value="Hindi Alphabet">Hindi Alphabet</option>
              <option value="English Alphabet">English Alphabet</option>
              <option value="Numbers">Numbers</option>
              <option value="Rhymes">Rhymes</option>
              <option value="Colors">Colors</option>
              <option value="Shapes">Shapes</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Image URLs (Sequence of learning)</label>
            <button 
              type="button"
              onClick={() => setPrePrimaryImages([...prePrimaryImages, ''])}
              className="text-[10px] font-black text-pink-600 uppercase tracking-widest flex items-center gap-1 hover:underline"
            >
              <Plus size={12} /> Add Image
            </button>
          </div>
          {prePrimaryImages.map((url, idx) => (
            <div key={idx} className="flex gap-2 p-3 bg-white border border-slate-200 rounded-2xl">
              <input 
                value={url} 
                onChange={(e) => {
                  const newUrls = [...prePrimaryImages];
                  newUrls[idx] = e.target.value;
                  setPrePrimaryImages(newUrls);
                }} 
                placeholder="https://..." 
                className="flex-1 p-2 text-sm font-medium outline-none"
              />
              {prePrimaryImages.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => setPrePrimaryImages(prePrimaryImages.filter((_, i) => i !== idx))}
                  className="text-rose-500 hover:bg-rose-50 p-1 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-4 pt-4">
          {editingType === 'pre_primary' && (
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
            className="flex-[2] bg-pink-600 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-pink-200 hover:bg-pink-700 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : (editingType === 'pre_primary' ? 'Update Content' : 'Publish Content')}
          </motion.button>
        </div>
      </form>

      <div className="space-y-4">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Content</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prePrimaryContent.map((item) => (
            <motion.div 
              key={item.id} 
              className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-3 hover:bg-white hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">{item.subject}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md bg-pink-100 text-pink-600">{item.className}</span>
                    <span className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-600">{item.images?.length || 0} Images</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => onEdit(item, 'pre_primary')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><Edit size={14} /></button>
                  <button onClick={() => onDelete(item.id, 'pre_primary_content')} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};
