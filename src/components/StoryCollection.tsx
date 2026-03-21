import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Play, Search, Filter, ChevronLeft, Volume2, Pause, SkipBack, SkipForward, ChevronRight, Sparkles } from 'lucide-react';
import { googleSheetsService } from '../services/googleSheetsService';

export const StoryCollection = () => {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStory, setSelectedStory] = useState<any | null>(null);
  const [recentlyWatched, setRecentlyWatched] = useState<any[]>([]);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const data = await googleSheetsService.getAllData();
        const fetchedStories = (data.kahanis || []).map((item: any, index: number) => ({
          id: `sheet-kahani-${index}`,
          title: item.title,
          coverImage: item.coverimage,
          audioUrl: item.audiourl,
          moral: item.moral,
          content: item.content ? (typeof item.content === 'string' ? JSON.parse(item.content) : item.content) : [],
          category: item.category || 'Popular Stories',
          createdAt: item.createdat ? new Date(item.createdat) : new Date(),
        })).sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
        
        setStories(fetchedStories);
      } catch (error) {
        console.error('Failed to fetch stories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
    
    // Load recently watched
    const saved = localStorage.getItem('recentlyWatchedStories');
    if (saved) {
      try {
        setRecentlyWatched(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse recently watched stories');
      }
    }
  }, []);

  const categories = ['All', ...Array.from(new Set(stories.map(s => s.category)))];

  const filteredStories = stories.filter(story => {
    const matchesCategory = activeCategory === 'All' || story.category === activeCategory;
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleStoryClick = (story: any) => {
    setSelectedStory(story);
    
    // Update recently watched
    const updatedRecent = [story, ...recentlyWatched.filter(s => s.id !== story.id)].slice(0, 5);
    setRecentlyWatched(updatedRecent);
    localStorage.setItem('recentlyWatchedStories', JSON.stringify(updatedRecent));
  };

  if (selectedStory) {
    return <StoryReader story={selectedStory} onBack={() => setSelectedStory(null)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white px-6 py-8 rounded-b-[2.5rem] shadow-sm border-b border-slate-100 sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-fuchsia-100 text-fuchsia-600 rounded-2xl">
            <BookOpen size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Kahani Time</h1>
            <p className="text-sm font-medium text-slate-500">Listen and learn with fun stories!</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search stories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-fuchsia-500 focus:bg-white outline-none transition-all font-medium text-slate-700"
          />
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                activeCategory === category
                  ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Recently Watched */}
        {recentlyWatched.length > 0 && activeCategory === 'All' && !searchQuery && (
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Play size={18} className="text-fuchsia-500" /> Recently Watched
            </h2>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
              {recentlyWatched.map(story => (
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  key={`recent-${story.id}`}
                  onClick={() => handleStoryClick(story)}
                  className="w-40 shrink-0 bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer group"
                >
                  <div className="h-40 bg-slate-100 relative overflow-hidden">
                    {story.coverImage ? (
                      <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <BookOpen size={40} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-fuchsia-600 backdrop-blur-sm">
                        <Play size={20} className="ml-1" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-2 leading-tight">{story.title}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Story Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <BookOpen size={18} className="text-fuchsia-500" /> {activeCategory === 'All' ? 'All Stories' : activeCategory}
          </h2>
          
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100 animate-pulse">
                  <div className="h-32 bg-slate-200 rounded-xl mb-3"></div>
                  <div className="h-4 bg-slate-200 rounded-full w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded-full w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredStories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredStories.map(story => (
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  key={story.id}
                  onClick={() => handleStoryClick(story)}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer group hover:shadow-md transition-all"
                >
                  <div className="h-32 sm:h-40 bg-slate-100 relative overflow-hidden">
                    {story.coverImage ? (
                      <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <BookOpen size={32} />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-black text-fuchsia-600 uppercase tracking-wider">
                      {story.category}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-2 leading-tight mb-1">{story.title}</h3>
                    {story.audioUrl && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                        <Volume2 size={12} /> Audio Available
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 border-dashed">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Search size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">No stories found</h3>
              <p className="text-sm text-slate-500">Try adjusting your search or category filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StoryReader = ({ story, onBack }: { story: any, onBack: () => void }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Scroll to top when opening a story
    window.scrollTo(0, 0);
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setProgress((current / total) * 100);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4 flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-black text-slate-800 truncate flex-1">{story.title}</h1>
      </div>

      {/* Cover Image */}
      {story.coverImage && (
        <div className="w-full h-64 sm:h-80 bg-slate-100 relative">
          <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <span className="px-3 py-1 bg-fuchsia-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest mb-2 inline-block shadow-sm">
              {story.category}
            </span>
            <h1 className="text-3xl font-black text-white leading-tight drop-shadow-md">{story.title}</h1>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {!story.coverImage && (
          <div className="mb-8">
            <span className="px-3 py-1 bg-fuchsia-100 text-fuchsia-700 text-[10px] font-black rounded-full uppercase tracking-widest mb-3 inline-block">
              {story.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 leading-tight">{story.title}</h1>
          </div>
        )}

        <div className="prose prose-lg prose-slate max-w-none">
          {story.content && story.content.map((block: any, index: number) => {
            if (block.type === 'paragraph') {
              return <p key={index} className="text-slate-700 leading-relaxed text-lg font-medium">{block.value}</p>;
            } else if (block.type === 'image') {
              return (
                <div key={index} className="my-8 rounded-2xl overflow-hidden shadow-md border border-slate-100">
                  <img src={block.value} alt={`Story illustration ${index}`} className="w-full h-auto" />
                </div>
              );
            }
            return null;
          })}
        </div>

        {story.moral && (
          <div className="mt-12 p-6 bg-emerald-50 border-2 border-emerald-100 rounded-3xl relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-emerald-100 opacity-50">
              <Sparkles size={100} />
            </div>
            <h3 className="text-sm font-black text-emerald-600 uppercase tracking-widest mb-2 relative z-10">Moral of the Story</h3>
            <p className="text-xl font-bold text-emerald-900 relative z-10">{story.moral}</p>
          </div>
        )}
      </div>

      {/* Sticky Audio Player */}
      {story.audioUrl && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-30 pb-safe">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={togglePlay}
                className="w-14 h-14 bg-fuchsia-600 text-white rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-fuchsia-600/30 hover:bg-fuchsia-700 transition-transform active:scale-95"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
              </button>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-800 truncate pr-4">{story.title}</p>
                  <Volume2 size={16} className="text-slate-400 shrink-0" />
                </div>
                
                {/* Progress Bar */}
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-fuchsia-500 transition-all duration-300 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <audio 
            ref={audioRef}
            src={story.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleAudioEnded}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};
