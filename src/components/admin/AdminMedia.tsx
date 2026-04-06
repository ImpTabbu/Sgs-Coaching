import React from 'react';
import { motion } from 'motion/react';
import { ImageIcon, X, Loader2, Edit, Trash2, PlayCircle, Image as LucideImage } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MediaData {
  id: string;
  title: string;
  url: string;
  description: string;
  createdAt: { toDate: () => Date };
}

interface AdminMediaProps {
  photos: MediaData[];
  videos: MediaData[];
  loading: boolean;
  editingId: string | null;
  editingType: string | null;
  mediaTitle: string;
  setMediaTitle: (val: string) => void;
  mediaUrl: string;
  setMediaUrl: (val: string) => void;
  mediaDescription: string;
  setMediaDescription: (val: string) => void;
  mediaType: 'photos' | 'videos';
  setMediaType: (val: 'photos' | 'videos') => void;
  onSubmit: (e: React.FormEvent, type: string) => void;
  onEdit: (item: any, type: string) => void;
  onDelete: (id: string, col: string) => void;
  onCancelEdit: () => void;
  onClose: () => void;
}

export const AdminMedia: React.FC<AdminMediaProps> = ({
  photos,
  videos,
  loading,
  editingId,
  editingType,
  mediaTitle,
  setMediaTitle,
  mediaUrl,
  setMediaUrl,
  mediaDescription,
  setMediaDescription,
  mediaType,
  setMediaType,
  onSubmit,
  onEdit,
  onDelete,
  onCancelEdit,
  onClose
}) => {
  return (
    <motion.section 
      key="media"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-purple-600">
          <div className="p-2 bg-purple-50 rounded-xl">
            <ImageIcon size={24} />
          </div>
          <h2 className="text-xl font-black tracking-tight">Gallery Management</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={20} className="text-slate-400" />
        </button>
      </div>

      <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
        <button 
          onClick={() => setMediaType('photos')}
          className={cn(
            "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
            mediaType === 'photos' ? "bg-white text-purple-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Photos
        </button>
        <button 
          onClick={() => setMediaType('videos')}
          className={cn(
            "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
            mediaType === 'videos' ? "bg-white text-purple-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Videos
        </button>
      </div>

      <form onSubmit={(e) => onSubmit(e, 'media')} className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
          {editingType === 'media' ? `Update ${mediaType === 'photos' ? 'Photo' : 'Video'}` : `Add New ${mediaType === 'photos' ? 'Photo' : 'Video'}`}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
            <input 
              value={mediaTitle} 
              onChange={(e) => setMediaTitle(e.target.value)} 
              placeholder="e.g. Annual Day 2024" 
              required 
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all font-medium" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              {mediaType === 'photos' ? 'Image URL' : 'Video URL (YouTube/Direct)'}
            </label>
            <input 
              value={mediaUrl} 
              onChange={(e) => setMediaUrl(e.target.value)} 
              placeholder="https://..." 
              required 
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all font-medium" 
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description (Optional)</label>
          <textarea 
            value={mediaDescription} 
            onChange={(e) => setMediaDescription(e.target.value)} 
            placeholder="Brief description of the media..." 
            rows={2}
            className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all font-medium resize-none" 
          />
        </div>
        <div className="flex gap-4">
          {editingType === 'media' && (
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
            className="flex-[2] bg-purple-600 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : (editingType === 'media' ? 'Update Media' : 'Add to Gallery')}
          </motion.button>
        </div>
      </form>

      <div className="space-y-4">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
          Current {mediaType === 'photos' ? 'Photos' : 'Videos'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(mediaType === 'photos' ? photos : videos).map((item) => (
            <motion.div 
              key={item.id} 
              className="bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden hover:shadow-md transition-all group"
            >
              <div className="relative aspect-video bg-slate-200">
                {mediaType === 'photos' ? (
                  <img src={item.url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-900">
                    <PlayCircle className="text-white/50" size={48} />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEdit(item, 'media')} className="p-2 bg-white/90 text-blue-600 rounded-xl shadow-sm hover:bg-white"><Edit size={14} /></button>
                  <button onClick={() => onDelete(item.id, mediaType)} className="p-2 bg-white/90 text-rose-600 rounded-xl shadow-sm hover:bg-white"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="p-4 space-y-1">
                <h4 className="font-bold text-slate-900 text-sm truncate">{item.title}</h4>
                <p className="text-[10px] text-slate-500 line-clamp-1 font-medium">{item.description || 'No description'}</p>
              </div>
            </motion.div>
          ))}
          {(mediaType === 'photos' ? photos : videos).length === 0 && (
            <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-400 font-medium italic">No {mediaType} found.</p>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
};
