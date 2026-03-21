import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Video, Calendar, Trash2, Edit, Database, RefreshCw, Play, Info, X } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { googleSheetsService } from '../services/googleSheetsService';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

const getYouTubeId = (url: string) => {
  if (!url) return null;
  
  // If it's an iframe embed code, extract the src URL first
  const iframeMatch = url.match(/src=["']([^"']+)["']/);
  const actualUrl = iframeMatch ? iframeMatch[1] : url;

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = actualUrl.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const getYouTubeThumbnail = (url: string) => {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
};

const getYouTubeEmbedUrl = (url: string) => {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : url;
};

interface GalleryProps {
  isAdmin?: boolean;
  onEdit?: (item: any) => void;
  sheetConfig?: { enabled: boolean; id: string; scriptUrl?: string };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

export const Gallery: React.FC<GalleryProps> = ({ isAdmin, onEdit, sheetConfig }) => {
  const [photos, setPhotos] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; col: string } | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const fetchGallery = async () => {
    setLoading(true);
    
    if (sheetConfig?.enabled && sheetConfig.id) {
      try {
        const sheetData = await googleSheetsService.fetchSheetData('Gallery');
        
        const mappedPhotos = sheetData
          .filter(item => !item.type || item.type.toLowerCase() === 'photo')
          .map((item, index) => ({
            id: `sheet-photo-${index}`,
            title: item.title || 'No Title',
            url: item.url || '',
            description: item.description || '',
            createdAt: item.createdat ? { toDate: () => new Date(item.createdat) } : { toDate: () => new Date() },
            isFromSheet: true,
            _rowIndex: item._rowIndex
          }));

        const mappedVideos = sheetData
          .filter(item => item.type && item.type.toLowerCase() === 'video')
          .map((item, index) => ({
            id: `sheet-video-${index}`,
            title: item.title || 'No Title',
            url: item.url || '',
            description: item.description || '',
            createdAt: item.createdat ? { toDate: () => new Date(item.createdat) } : { toDate: () => new Date() },
            isFromSheet: true,
            _rowIndex: item._rowIndex
          }));
        
        setPhotos(mappedPhotos.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()));
        setVideos(mappedVideos.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()));
      } catch (err) {
        console.error('Error fetching gallery data:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setPhotos([]);
      setVideos([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, [sheetConfig]);

  const handleDelete = async (id: string, col: string) => {
    if (!sheetConfig?.scriptUrl) {
      alert('Google Sheets data cannot be deleted from the app without a Script URL. Please delete it from the spreadsheet.');
      return;
    }
    setDeleteTarget({ id, col });
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const item = [...photos, ...videos].find(m => m.id === deleteTarget.id);
      if (item && item._rowIndex) {
        const result = await googleSheetsService.writeToSheet('delete', 'Gallery', { _rowIndex: item._rowIndex });
        if (result.success) {
          fetchGallery();
        } else {
          alert(result.message);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteTarget(null);
      setIsConfirmOpen(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-brand-primary font-bold animate-pulse">Loading gallery...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-8 pb-24"
    >
      <div className="flex justify-between items-center">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-display font-bold text-slate-800">Gallery</h1>
          <p className="text-[10px] text-brand-primary font-bold uppercase tracking-wider">Memories & Moments</p>
        </div>
        {sheetConfig?.enabled && (
          <button 
            onClick={fetchGallery} 
            className="h-10 w-10 flex items-center justify-center bg-white text-brand-primary border border-slate-200 rounded-xl shadow-sm active:scale-90 transition-transform"
            title="Refresh from Sheets"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        )}
      </div>
      
      <div className="flex p-1 bg-slate-100 rounded-2xl">
        <button 
          onClick={() => setActiveTab('photos')} 
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'photos' ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-500'}`}
        >
          <ImageIcon size={14} /> Photos
        </button>
        <button 
          onClick={() => setActiveTab('videos')} 
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'videos' ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-500'}`}
        >
          <Video size={14} /> Videos
        </button>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={activeTab}
        className="grid grid-cols-1 gap-6"
      >
        <AnimatePresence mode="wait">
          {activeTab === 'photos' ? (
            photos.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-slate-400 py-12 italic text-sm">No photos available.</motion.div>
            ) : (
              photos.map((photo) => (
                <motion.div 
                  key={photo.id} 
                  variants={itemVariants}
                  layout
                  className="glass-card overflow-hidden relative group"
                >
                  {isAdmin && (
                    <div className="absolute top-3 right-3 flex gap-2 z-10">
                      <button onClick={() => onEdit?.(photo)} className="h-8 w-8 bg-white/90 text-blue-600 rounded-lg shadow-md flex items-center justify-center backdrop-blur-sm"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(photo.id, 'photos')} className="h-8 w-8 bg-white/90 text-red-600 rounded-lg shadow-md flex items-center justify-center backdrop-blur-sm"><Trash2 size={14} /></button>
                    </div>
                  )}
                  <div className="relative h-56 overflow-hidden">
                    <img src={photo.url} alt={photo.title} className="w-full h-full object-cover group-active:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                  </div>
                  <div className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-800 text-sm">{photo.title}</h3>
                      {photo.description && (
                        <button 
                          onClick={() => setSelectedItem(photo)}
                          className="text-brand-primary hover:text-brand-accent transition-colors"
                        >
                          <Info size={14} />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                      <Calendar size={12} /> {photo.createdAt?.toDate().toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>
              ))
            )
          ) : (
            videos.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-slate-400 py-12 italic text-sm">No videos available.</motion.div>
            ) : (
              videos.map((video) => (
                <motion.div 
                  key={video.id} 
                  variants={itemVariants}
                  layout
                  className="glass-card overflow-hidden relative group"
                >
                  {isAdmin && (
                    <div className="absolute top-3 right-3 flex gap-2 z-10">
                      <button onClick={() => onEdit?.(video)} className="h-8 w-8 bg-white/90 text-blue-600 rounded-lg shadow-md flex items-center justify-center backdrop-blur-sm"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(video.id, 'videos')} className="h-8 w-8 bg-white/90 text-red-600 rounded-lg shadow-md flex items-center justify-center backdrop-blur-sm"><Trash2 size={14} /></button>
                    </div>
                  )}
                  <div className="aspect-video relative bg-slate-900">
                    {playingVideo === video.id ? (
                      <iframe 
                        src={`${getYouTubeEmbedUrl(video.url)}?autoplay=1`} 
                        title={video.title} 
                        className="w-full h-full" 
                        frameBorder="0" 
                        allow="autoplay; encrypted-media" 
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <div 
                        className="w-full h-full relative cursor-pointer group/video"
                        onClick={() => setPlayingVideo(video.id)}
                      >
                        <img 
                          src={getYouTubeThumbnail(video.url) || video.url} 
                          alt={video.title} 
                          className="w-full h-full object-cover opacity-60 group-hover/video:opacity-80 transition-opacity" 
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-14 w-14 bg-brand-primary/90 text-white rounded-full flex items-center justify-center shadow-xl group-hover/video:scale-110 transition-transform">
                            <Play size={24} fill="currentColor" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-brand-accent/90 text-white p-1.5 rounded-lg shadow-lg pointer-events-none">
                      <Play size={12} fill="currentColor" />
                    </div>
                  </div>
                  <div className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-800 text-sm">{video.title}</h3>
                      {video.description && (
                        <button 
                          onClick={() => setSelectedItem(video)}
                          className="text-brand-primary hover:text-brand-accent transition-colors"
                        >
                          <Info size={14} />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                      <Calendar size={12} /> {video.createdAt?.toDate().toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>
              ))
            )
          )}
        </AnimatePresence>
      </motion.div>

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Media"
        message="Are you sure you want to delete this item?"
      />

      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h2 className="text-xl font-display font-bold text-slate-800">{selectedItem.title}</h2>
                    <p className="text-[10px] text-brand-primary font-bold uppercase tracking-wider">Media Details</p>
                  </div>
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="h-8 w-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100">
                  {activeTab === 'photos' ? (
                    <img src={selectedItem.url} alt={selectedItem.title} className="w-full h-full object-cover" />
                  ) : (
                    <img src={getYouTubeThumbnail(selectedItem.url) || selectedItem.url} alt={selectedItem.title} className="w-full h-full object-cover" />
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                    <Calendar size={14} /> Added on {selectedItem.createdAt?.toDate().toLocaleDateString()}
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-slate-600 text-sm leading-relaxed italic">
                      "{selectedItem.description}"
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedItem(null)}
                  className="w-full py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/20 active:scale-95 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
