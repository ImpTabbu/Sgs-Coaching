import React, { useState } from 'react';
import { X, PlayCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Video {
  title: string;
  url: string;
}

interface VideoPlayerProps {
  videos: Video[];
  chapterTitle: string;
  onClose: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videos, chapterTitle, onClose }) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  if (!videos || videos.length === 0) {
    return (
      <div className="fixed inset-0 z-[2000] bg-black/90 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl max-w-sm w-full text-center space-y-4">
          <h3 className="text-xl font-bold text-slate-800">No Videos Found</h3>
          <p className="text-slate-500">There are no videos available for this chapter yet.</p>
          <button onClick={onClose} className="w-full py-3 bg-brand-primary text-white rounded-xl font-bold">
            Close
          </button>
        </div>
      </div>
    );
  }

  const currentVideo = videos[currentVideoIndex];

  // Extract YouTube video ID
  const getYouTubeId = (url: string) => {
    if (!url) return null;
    
    // If it's an iframe embed code, extract the src URL first
    const iframeMatch = url.match(/src=["']([^"']+)["']/);
    const actualUrl = iframeMatch ? iframeMatch[1] : url;

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = actualUrl.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeId(currentVideo.url);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : currentVideo.url;

  return (
    <div className="fixed inset-0 z-[2000] bg-black/95 flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <header className="bg-slate-900 p-4 flex items-center justify-between shadow-md shrink-0 border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:bg-slate-800 transition-all"
          >
            <X size={24} />
          </button>
          <div className="overflow-hidden">
            <h2 className="font-bold text-white truncate text-sm sm:text-base">{chapterTitle}</h2>
            <p className="text-[10px] text-slate-400 truncate">Video Player</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 bg-black relative flex flex-col">
          <div className="relative w-full aspect-video md:h-full md:aspect-auto">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
                <Loader2 className="animate-spin text-brand-primary" size={48} />
              </div>
            )}
            {videoId ? (
              <iframe
                src={embedUrl}
                className="absolute inset-0 w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setLoading(false)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-white p-4 text-center">
                <p>Invalid video URL. Please check the link.</p>
              </div>
            )}
          </div>
          <div className="p-4 bg-slate-900 shrink-0">
            <h3 className="text-lg font-bold text-white">{currentVideo.title || `Video ${currentVideoIndex + 1}`}</h3>
          </div>
        </div>

        {/* Playlist Area */}
        {videos.length > 1 && (
          <div className="w-full md:w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 h-64 md:h-auto overflow-hidden">
            <div className="p-4 border-b border-slate-800 shrink-0">
              <h3 className="font-bold text-white">Playlist ({videos.length})</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2 no-scrollbar">
              {videos.map((video, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentVideoIndex(index);
                    setLoading(true);
                  }}
                  className={`w-full text-left p-3 rounded-xl flex items-start gap-3 transition-all ${
                    currentVideoIndex === index 
                      ? 'bg-brand-primary/20 border border-brand-primary/50' 
                      : 'hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  <div className={`mt-0.5 ${currentVideoIndex === index ? 'text-brand-primary' : 'text-slate-500'}`}>
                    <PlayCircle size={18} />
                  </div>
                  <div>
                    <p className={`text-sm font-medium line-clamp-2 ${currentVideoIndex === index ? 'text-white' : 'text-slate-300'}`}>
                      {video.title || `Video ${index + 1}`}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
