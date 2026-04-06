import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, X, Loader2, Edit, Trash2, Plus } from 'lucide-react';

interface KahaniContent {
  type: string;
  value: string;
}

interface KahaniData {
  id: string;
  title: string;
  coverImage: string;
  audioUrl: string;
  moral: string;
  content: KahaniContent[];
  category: string;
  createdAt: { toDate: () => Date };
}

interface AdminKahaniProps {
  kahanis: KahaniData[];
  loading: boolean;
  editingId: string | null;
  editingType: string | null;
  kahaniTitle: string;
  setKahaniTitle: (val: string) => void;
  kahaniCoverImage: string;
  setKahaniCoverImage: (val: string) => void;
  kahaniAudioUrl: string;
  setKahaniAudioUrl: (val: string) => void;
  kahaniMoral: string;
  setKahaniMoral: (val: string) => void;
  kahaniContent: KahaniContent[];
  setKahaniContent: (val: KahaniContent[]) => void;
  kahaniCategory: string;
  setKahaniCategory: (val: string) => void;
  onSubmit: (e: React.FormEvent, type: string) => void;
  onEdit: (item: any, type: string) => void;
  onDelete: (id: string, col: string) => void;
  onCancelEdit: () => void;
  onClose: () => void;
}

export const AdminKahani: React.FC<AdminKahaniProps> = ({
  kahanis,
  loading,
  editingId,
  editingType,
  kahaniTitle,
  setKahaniTitle,
  kahaniCoverImage,
  setKahaniCoverImage,
  kahaniAudioUrl,
  setKahaniAudioUrl,
  kahaniMoral,
  setKahaniMoral,
  kahaniContent,
  setKahaniContent,
  kahaniCategory,
  setKahaniCategory,
  onSubmit,
  onEdit,
  onDelete,
  onCancelEdit,
  onClose
}) => {
  return (
    <motion.section 
      key="kahani"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-fuchsia-600">
          <div className="p-2 bg-fuchsia-50 rounded-xl">
            <BookOpen size={24} />
          </div>
          <h2 className="text-xl font-black tracking-tight">Kahani Collection</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={20} className="text-slate-400" />
        </button>
      </div>

      <form onSubmit={(e) => onSubmit(e, 'kahani')} className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
          {editingType === 'kahani' ? 'Update Kahani' : 'Add New Kahani'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Story Title</label>
            <input 
              value={kahaniTitle} 
              onChange={(e) => setKahaniTitle(e.target.value)} 
              placeholder="e.g. The Lion and the Mouse" 
              required 
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all font-medium" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
            <select 
              value={kahaniCategory} 
              onChange={(e) => setKahaniCategory(e.target.value)} 
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all font-medium"
            >
              <option value="Popular Stories">Popular Stories</option>
              <option value="Moral Stories">Moral Stories</option>
              <option value="Fairy Tales">Fairy Tales</option>
              <option value="Animal Stories">Animal Stories</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cover Image URL</label>
            <input 
              value={kahaniCoverImage} 
              onChange={(e) => setKahaniCoverImage(e.target.value)} 
              placeholder="https://..." 
              required 
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all font-medium" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Audio URL (Optional)</label>
            <input 
              value={kahaniAudioUrl} 
              onChange={(e) => setKahaniAudioUrl(e.target.value)} 
              placeholder="https://..." 
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all font-medium" 
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Story Content</label>
            <button 
              type="button"
              onClick={() => setKahaniContent([...kahaniContent, { type: 'paragraph', value: '' }])}
              className="text-[10px] font-black text-fuchsia-600 uppercase tracking-widest flex items-center gap-1 hover:underline"
            >
              <Plus size={12} /> Add Paragraph
            </button>
          </div>
          {kahaniContent.map((item, idx) => (
            <div key={idx} className="flex gap-2 p-3 bg-white border border-slate-200 rounded-2xl">
              <textarea 
                value={item.value} 
                onChange={(e) => {
                  const newContent = [...kahaniContent];
                  newContent[idx].value = e.target.value;
                  setKahaniContent(newContent);
                }} 
                placeholder="Write paragraph content..." 
                rows={3}
                className="flex-1 p-2 text-sm font-medium outline-none resize-none"
              />
              {kahaniContent.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => setKahaniContent(kahaniContent.filter((_, i) => i !== idx))}
                  className="text-rose-500 hover:bg-rose-50 p-1 rounded-lg self-start"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Moral of the Story</label>
          <input 
            value={kahaniMoral} 
            onChange={(e) => setKahaniMoral(e.target.value)} 
            placeholder="e.g. Slow and steady wins the race" 
            className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all font-medium" 
          />
        </div>

        <div className="flex gap-4 pt-4">
          {editingType === 'kahani' && (
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
            className="flex-[2] bg-fuchsia-600 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-200 hover:bg-fuchsia-700 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : (editingType === 'kahani' ? 'Update Kahani' : 'Publish Kahani')}
          </motion.button>
        </div>
      </form>

      <div className="space-y-4">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Stories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kahanis.map((item) => (
            <motion.div 
              key={item.id} 
              className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-3 hover:bg-white hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <img src={item.coverImage} alt="" className="w-16 h-16 rounded-xl object-cover border border-slate-200" referrerPolicy="no-referrer" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md bg-fuchsia-100 text-fuchsia-600">{item.category}</span>
                      <span className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-600">{item.content?.length || 0} Paras</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => onEdit(item, 'kahani')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><Edit size={14} /></button>
                  <button onClick={() => onDelete(item.id, 'kahanis')} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};
