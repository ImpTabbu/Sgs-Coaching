import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, ExternalLink, Calendar, ArrowLeft, Loader2, Trash2, Edit, Database, RefreshCw, ChevronRight, FileDown } from 'lucide-react';
import { PdfViewer } from './PdfViewer';
import { ConfirmModal } from './ConfirmModal';
import { firebaseService } from '../services/firebaseService';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { ChapterPopup } from './ChapterPopup';
import { VideoPlayer } from './VideoPlayer';
import { MediaViewer } from './MediaViewer';

interface StudyContentProps {
  selectedLevel: string;
  selectedClass: string;
  selectedSubject: string;
  onBack: () => void;
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

export const StudyContent: React.FC<StudyContentProps> = ({ selectedLevel, selectedClass, selectedSubject, onBack, isAdmin, onEdit, sheetConfig }) => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState<{ url: string; title: string } | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // New states for chapter popup and viewers
  const [selectedChapter, setSelectedChapter] = useState<any | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaTitle, setMediaTitle] = useState('');

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupSubscription = () => {
      setLoading(true);
      
      // Filter by level, class, and subject to save reads!
      const filters = [
        { field: 'level', value: selectedLevel },
        { field: 'classname', value: selectedClass },
        { field: 'subject', value: selectedSubject }
      ];

      unsubscribe = firebaseService.subscribeToCollection('StudyMaterials', (data) => {
        const mappedData = data.map((item) => {
          let parsedVideos = [];
          let parsedHomework = [];
          try { parsedVideos = item.videos ? (typeof item.videos === 'string' ? JSON.parse(item.videos) : item.videos) : []; } catch (e) { console.error('Error parsing videos', e); }
          try { parsedHomework = item.homeworkurls ? (typeof item.homeworkurls === 'string' ? JSON.parse(item.homeworkurls) : item.homeworkurls) : []; } catch (e) { console.error('Error parsing homework', e); }
          
          return {
            id: item.id,
            title: item.title || 'No Title',
            url: item.url || '',
            type: item.type || 'pdf',
            videos: parsedVideos,
            notesUrl: item.notesurl || '',
            readUrl: item.readurl || '',
            homeworkUrls: parsedHomework,
            createdAt: item.createdat ? { toDate: () => new Date(item.createdat) } : { toDate: () => new Date() },
            isFromSheet: false
          };
        });
        setMaterials(mappedData);
        setLoading(false);
      }, filters);
    };

    setupSubscription();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedLevel, selectedClass, selectedSubject]);

  const handleMaterialClick = (e: React.MouseEvent, material: any) => {
    e.preventDefault();
    setSelectedChapter(material);
    setIsPopupOpen(true);
  };

  const handleActionSelect = (action: 'video' | 'notes' | 'read' | 'homework') => {
    setIsPopupOpen(false);
    
    if (!selectedChapter) return;

    if (action === 'video') {
      setShowVideoPlayer(true);
    } else if (action === 'notes') {
      if (selectedChapter.notesUrl) {
        setSelectedPdf({ url: selectedChapter.notesUrl, title: `${selectedChapter.title} - Notes` });
      } else if (selectedChapter.url && selectedChapter.type === 'pdf') {
        // Fallback to old format
        setSelectedPdf({ url: selectedChapter.url, title: `${selectedChapter.title} - Notes` });
      } else {
        alert('No notes available for this chapter.');
      }
    } else if (action === 'read') {
      if (selectedChapter.readUrl) {
        setSelectedPdf({ url: selectedChapter.readUrl, title: `${selectedChapter.title} - Read` });
      } else {
        alert('No reading material available for this chapter.');
      }
    } else if (action === 'homework') {
      if (selectedChapter.homeworkUrls && selectedChapter.homeworkUrls.length > 0) {
        setMediaUrls(selectedChapter.homeworkUrls);
        setMediaTitle(`${selectedChapter.title} - Home Work`);
        setShowMediaViewer(true);
      } else {
        alert('No homework available for this chapter.');
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const item = materials.find(m => m.id === deleteId);
      if (item && item.id) {
        const result = await firebaseService.writeToCollection('delete', 'StudyMaterials', { id: item.id });
        if (result.success) {
          // Real-time subscription handles update
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

  const handleEditClick = (e: React.MouseEvent, material: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) onEdit(material);
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
        <p className="text-slate-500 font-medium animate-pulse">Loading materials...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-background min-h-screen pb-24">
      {/* Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-600 active:bg-slate-50 transition-all"
          >
            <ArrowLeft size={24} />
          </motion.button>
        {/* Refresh button removed as it's now real-time */}
        </div>

        <div className="space-y-1">
          <p className="text-[10px] text-brand-primary font-bold uppercase tracking-[0.2em]">Class {selectedClass} • {selectedLevel}</p>
          <h1 className="text-3xl font-display font-bold text-slate-900">{selectedSubject}</h1>
        </div>
      </div>
      
      {/* Materials List */}
      {materials.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200"
        >
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-300 shadow-sm">
            <BookOpen size={40} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800">No Materials Yet</h3>
            <p className="text-slate-500 text-sm max-w-[240px]">We're currently preparing the study materials for this subject. Check back soon!</p>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {materials.map((material) => (
            <motion.div 
              key={material.id} 
              variants={itemVariants}
              onClick={(e) => handleMaterialClick(e as any, material)}
              className="w-full text-left bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-brand-primary hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300",
                  "bg-brand-primary/10 text-brand-primary"
                )}>
                  <BookOpen size={28} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 leading-tight group-hover:text-brand-primary transition-colors">{material.title}</h3>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {material.createdAt?.toDate().toLocaleDateString()}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                    <span className="flex items-center gap-1">Chapter</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <div className="flex items-center gap-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => handleEditClick(e, material)}
                      className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, material.id)}
                      className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-brand-primary group-hover:text-white transition-all">
                  <ChevronRight size={20} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {selectedPdf && (
        <PdfViewer 
          url={selectedPdf.url} 
          title={selectedPdf.title} 
          onClose={() => setSelectedPdf(null)} 
        />
      )}

      <ChapterPopup 
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        chapterTitle={selectedChapter?.title || ''}
        onSelectAction={handleActionSelect}
      />

      {showVideoPlayer && selectedChapter && (
        <VideoPlayer 
          videos={selectedChapter.videos || []}
          chapterTitle={selectedChapter.title}
          onClose={() => setShowVideoPlayer(false)}
        />
      )}

      {showMediaViewer && (
        <MediaViewer 
          urls={mediaUrls}
          title={mediaTitle}
          onClose={() => setShowMediaViewer(false)}
        />
      )}

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Material"
        message="Are you sure you want to delete this study material?"
      />
    </div>
  );
};
