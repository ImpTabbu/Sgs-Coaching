import React, { useState, useEffect } from 'react';
import { firebaseService } from '../services/firebaseService';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, GraduationCap, ChevronRight, Award, X, Calendar, Loader2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface ToppersProps {
  selectedClass: string;
  onOpenModal: () => void;
  sheetConfig?: { enabled: boolean; id: string };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring', damping: 20, stiffness: 100 }
  }
};

export const Toppers: React.FC<ToppersProps> = ({ selectedClass, onOpenModal, sheetConfig }) => {
  const [toppers, setToppers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopper, setSelectedTopper] = useState<any | null>(null);
  const [topperBanner, setTopperBanner] = useState<string>('');

  useEffect(() => {
    let unsubscribeToppers: (() => void) | undefined;
    let unsubscribeSettings: (() => void) | undefined;

    const setupSubscriptions = () => {
      setLoading(true);
      
      // Subscribe to app settings for the banner
      unsubscribeSettings = firebaseService.subscribeToCollection('AppBasicSettings', (data) => {
        const generalSettings = data.find((s: any) => s.id === 'general');
        if (generalSettings?.topperBanner) {
          setTopperBanner(generalSettings.topperBanner);
        }
      });

      // Subscribe to toppers filtered by class
      const filters = [{ field: 'classname', value: selectedClass }];
      unsubscribeToppers = firebaseService.subscribeToCollection('Toppers', (data) => {
        const mappedData = data.map((item) => ({
          id: item.id,
          name: item.name || 'Unknown',
          className: item.classname || '',
          imageUrl: item.imageurl || '',
          description: item.description || '',
          date: item.date || '',
          createdAt: item.createdat ? { toDate: () => new Date(item.createdat) } : { toDate: () => new Date() },
          isFromSheet: false,
        }));
        setToppers(mappedData);
        setLoading(false);
      }, filters);
    };

    setupSubscriptions();

    return () => {
      if (unsubscribeToppers) unsubscribeToppers();
      if (unsubscribeSettings) unsubscribeSettings();
    };
  }, [selectedClass]);

  return (
    <div className="p-6 space-y-8 bg-background min-h-screen pb-24 pt-6">
      {/* Hero Section */}
      <div className="space-y-6">
        {topperBanner && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full h-40 md:h-56 rounded-3xl overflow-hidden shadow-lg border border-slate-100"
          >
            <img src={topperBanner} alt="Topper Banner" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </motion.div>
        )}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-bold text-slate-900">Our Toppers</h1>
            <p className="text-sm text-slate-500 font-medium">Celebrating Academic Excellence</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-100">
            <Trophy size={24} />
          </div>
        </div>

        <button 
          onClick={onOpenModal}
          className="w-full bg-white text-slate-900 p-5 rounded-2xl flex items-center justify-between group active:scale-95 transition-all shadow-sm border border-slate-100 hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
              <GraduationCap size={20} />
            </div>
            <div className="text-left">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Selected Class</p>
              <p className="text-lg font-bold text-slate-800">Class {selectedClass}</p>
            </div>
          </div>
          <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-slate-100 transition-colors">
            <ChevronRight size={20} />
          </div>
        </button>
      </div>

      {/* Toppers Podium/Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-amber-500 mb-4" size={32} />
          <p className="text-slate-500 font-medium animate-pulse">Loading toppers...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {toppers.length > 0 ? (
            <motion.div 
              key={selectedClass}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-12"
            >
              {/* Podium for Top 3 */}
              <div className="flex items-end justify-center gap-2 sm:gap-4 pt-8 pb-4">
                {/* 2nd Place */}
                {toppers[1] && (
                  <motion.div 
                    variants={itemVariants}
                    onClick={() => setSelectedTopper(toppers[1])}
                    className="flex flex-col items-center gap-3 cursor-pointer group"
                  >
                    <div className="relative">
                      <div className="w-24 sm:w-28 rounded-2xl overflow-hidden border-4 border-slate-200 shadow-lg bg-white">
                        <img 
                          src={toppers[1].imageUrl} 
                          alt={toppers[1].name} 
                          className="w-full h-auto object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-200 text-slate-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
                        2
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-slate-800 text-xs sm:text-sm truncate w-24 sm:w-28">{toppers[1].name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Silver Medalist</p>
                    </div>
                  </motion.div>
                )}

                {/* 1st Place */}
                {toppers[0] && (
                  <motion.div 
                    variants={itemVariants}
                    onClick={() => setSelectedTopper(toppers[0])}
                    className="flex flex-col items-center gap-3 cursor-pointer group -translate-y-6"
                  >
                    <div className="relative">
                      <div className="w-28 sm:w-32 rounded-2xl overflow-hidden border-4 border-amber-400 shadow-xl bg-white">
                        <img 
                          src={toppers[0].imageUrl} 
                          alt={toppers[0].name} 
                          className="w-full h-auto object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-500 drop-shadow-md">
                        <Trophy size={32} fill="currentColor" />
                      </div>
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-400 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 border-white shadow-md">
                        1
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-slate-900 text-sm sm:text-base truncate w-28 sm:w-32">{toppers[0].name}</p>
                      <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Gold Medalist</p>
                    </div>
                  </motion.div>
                )}

                {/* 3rd Place */}
                {toppers[2] && (
                  <motion.div 
                    variants={itemVariants}
                    onClick={() => setSelectedTopper(toppers[2])}
                    className="flex flex-col items-center gap-3 cursor-pointer group"
                  >
                    <div className="relative">
                      <div className="w-20 sm:w-24 rounded-2xl overflow-hidden border-4 border-orange-200 shadow-lg bg-white">
                        <img 
                          src={toppers[2].imageUrl} 
                          alt={toppers[2].name} 
                          className="w-full h-auto object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-200 text-orange-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
                        3
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-slate-800 text-xs sm:text-sm truncate w-20 sm:w-24">{toppers[2].name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Bronze Medalist</p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Other Achievers */}
              {toppers.length > 3 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <div className="h-px flex-1 bg-slate-100"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Other Achievers</span>
                    <div className="h-px flex-1 bg-slate-100"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {toppers.slice(3).map((topper, i) => (
                      <motion.div 
                        key={topper.id || i + 3}
                        variants={itemVariants}
                        onClick={() => setSelectedTopper(topper)}
                        className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                          <img 
                            src={topper.imageUrl} 
                            alt={topper.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-800 truncate">{topper.name}</h4>
                          <p className="text-xs text-slate-500">Rank #{i + 4} Achiever</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                          <ChevronRight size={16} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-slate-50 rounded-3xl border border-slate-100"
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-300 shadow-sm border border-slate-100">
                <Trophy size={40} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800">Results Pending</h3>
                <p className="text-slate-500 text-sm max-w-[240px]">Toppers for Class {selectedClass} will be announced soon. Stay tuned!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Motivational Quote */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-brand-primary/5 p-6 rounded-2xl border border-brand-primary/10 text-center"
      >
        <p className="text-brand-primary font-serif italic text-sm">"Success is the sum of small efforts, repeated day in and day out."</p>
      </motion.div>
      {/* Topper Detail Modal */}
      <AnimatePresence>
        {selectedTopper && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedTopper(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedTopper(null)}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/40 transition-colors"
              >
                <X size={18} />
              </button>
              
              <div className="relative aspect-square w-full bg-slate-100 shrink-0">
                {selectedTopper.imageUrl ? (
                  <img 
                    src={selectedTopper.imageUrl} 
                    alt={selectedTopper.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Award size={64} />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 to-transparent p-6 pt-12">
                  <h2 className="text-2xl font-display font-bold text-white mb-1">{selectedTopper.name}</h2>
                  <p className="text-white/80 text-sm font-medium">Class {selectedTopper.className}</p>
                </div>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="space-y-4">
                  {selectedTopper.date && (
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                      <Calendar size={16} className="text-brand-primary" />
                      <span>{selectedTopper.date}</span>
                    </div>
                  )}
                  
                  {selectedTopper.description ? (
                    <div className="prose prose-sm prose-slate">
                      <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedTopper.description}</p>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic text-sm">No description available.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
