import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Download, ExternalLink } from 'lucide-react';
import { PdfViewer } from './PdfViewer';

interface MediaViewerProps {
  urls: string[];
  title: string;
  onClose: () => void;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({ urls, title, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!urls || urls.length === 0) {
    return (
      <div className="fixed inset-0 z-[2000] bg-black/90 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl max-w-sm w-full text-center space-y-4">
          <h3 className="text-xl font-bold text-slate-800">No Files Found</h3>
          <p className="text-slate-500">There are no files available for this section yet.</p>
          <button onClick={onClose} className="w-full py-3 bg-brand-primary text-white rounded-xl font-bold">
            Close
          </button>
        </div>
      </div>
    );
  }

  const currentUrl = urls[currentIndex];
  const isImage = currentUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null || currentUrl.includes('drive.google.com/uc?id=');
  const isPdf = currentUrl.match(/\.(pdf)$/i) != null || currentUrl.includes('drive.google.com/file/d/');

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % urls.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + urls.length) % urls.length);
  };

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
            <h2 className="font-bold text-white truncate text-sm sm:text-base">{title}</h2>
            <p className="text-[10px] text-slate-400 truncate">
              File {currentIndex + 1} of {urls.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a 
            href={currentUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 text-brand-primary hover:bg-brand-primary/20 rounded-lg flex items-center gap-1 text-xs font-bold"
          >
            <ExternalLink size={16} /> <span className="hidden sm:inline">Open Full</span>
          </a>
          <a 
            href={currentUrl} 
            download
            className="p-2 text-slate-300 hover:bg-slate-800 rounded-lg"
          >
            <Download size={20} />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-slate-900">
        {isImage ? (
          <img 
            src={currentUrl} 
            alt={`File ${currentIndex + 1}`} 
            className="max-w-full max-h-full object-contain"
            referrerPolicy="no-referrer"
          />
        ) : isPdf ? (
          <div className="w-full h-full relative">
             <iframe 
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(currentUrl)}&embedded=true`}
                className="w-full h-full border-none"
                title={title}
              />
          </div>
        ) : (
          <div className="text-white text-center p-4">
            <p className="mb-4">This file type cannot be previewed directly.</p>
            <a 
              href={currentUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-brand-primary text-white px-6 py-3 rounded-xl font-bold"
            >
              Open File
            </a>
          </div>
        )}

        {/* Navigation Arrows */}
        {urls.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-all"
            >
              <ChevronLeft size={32} />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-all"
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {urls.length > 1 && (
        <div className="bg-slate-900 p-4 shrink-0 border-t border-slate-800 flex justify-center gap-2 overflow-x-auto no-scrollbar">
          {urls.map((url, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                currentIndex === index ? 'border-brand-primary scale-110' : 'border-transparent opacity-50 hover:opacity-100'
              }`}
            >
              <div className="w-full h-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                {index + 1}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
