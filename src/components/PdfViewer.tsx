import React, { useState } from 'react';
import { X, ExternalLink, Download, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface PdfViewerProps {
  url: string;
  title: string;
  onClose: () => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ url, title, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Function to handle Google Drive links and other common PDF hosts
  const getEmbedUrl = (originalUrl: string) => {
    if (!originalUrl) return '';
    
    // If it's a Google Drive link, convert it to a preview link
    if (originalUrl.includes('drive.google.com')) {
      return originalUrl.replace(/\/view.*$/, '/preview').replace(/\/edit.*$/, '/preview');
    }
    
    // For other links, we can use Google Docs Viewer as a proxy to bypass CORS
    // This is very reliable for public PDFs
    return `https://docs.google.com/viewer?url=${encodeURIComponent(originalUrl)}&embedded=true`;
  };

  const embedUrl = getEmbedUrl(url);

  return (
    <div className="fixed inset-0 z-[2000] bg-black/90 flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <header className="bg-white p-4 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all"
          >
            <X size={24} />
          </button>
          <div className="overflow-hidden">
            <h2 className="font-bold text-gray-800 truncate text-sm sm:text-base">{title}</h2>
            <p className="text-[10px] text-gray-400 truncate">Direct Viewer</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 text-primary hover:bg-primary-lighter rounded-lg flex items-center gap-1 text-xs font-bold"
          >
            <ExternalLink size={16} /> <span className="hidden sm:inline">Open Full</span>
          </a>
          <a 
            href={url} 
            download
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Download size={20} />
          </a>
        </div>
      </header>

      {/* PDF Content */}
      <main className="flex-grow bg-gray-100 relative overflow-hidden">
        {loading && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10">
            <Loader2 className="animate-spin text-primary mb-4" size={48} />
            <p className="text-gray-500 font-medium">Loading PDF...</p>
          </div>
        )}

        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white">
            <AlertCircle size={64} className="text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Could not load PDF</h3>
            <p className="text-gray-500 mb-6 max-w-xs">
              Due to security reasons or a broken link, the PDF cannot be opened here. Please open it directly using the button below.
            </p>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-primary text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
              >
                <ExternalLink size={20} /> Open directly in browser
              </a>
              <button 
                onClick={() => { setError(false); setLoading(true); }}
                className="text-primary font-bold p-3 flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} /> Try again
              </button>
            </div>
          </div>
        ) : (
          <iframe 
            src={embedUrl}
            className="w-full h-full border-none"
            onLoad={() => setLoading(false)}
            onError={() => setError(true)}
            title={title}
          />
        )}
      </main>

      {/* Mobile Tip */}
      <footer className="bg-primary text-white p-2 text-[10px] text-center shrink-0">
        Tip: If the PDF is not visible, press the 'Open Full' button above.
      </footer>
    </div>
  );
};
