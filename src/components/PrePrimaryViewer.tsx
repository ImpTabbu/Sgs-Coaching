import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Undo, Redo, Eraser, X, Play } from 'lucide-react';
import { firebaseService } from '../services/firebaseService';

interface PrePrimaryViewerProps {
  classname: string;
  subject: string;
  content?: any;
  onClose: () => void;
  sheetConfig?: { enabled: boolean; id: string; scriptUrl?: string };
  savedDrawingsRef: React.RefObject<Record<string, string>>;
}

export const PrePrimaryViewer: React.FC<PrePrimaryViewerProps> = ({ classname, subject, content: initialContent, onClose, sheetConfig, savedDrawingsRef }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTracing, setIsTracing] = useState(classname === 'U.K.G');
  const [history, setHistory] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const worksheetRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [content, setContent] = useState<any>(initialContent);
  const [loading, setLoading] = useState(!initialContent);
  
  const getDrawingKey = (index: number) => `${classname}-${subject}-${index}`;

  useEffect(() => {
    const fetchContent = async () => {
      if (initialContent) return;
      if (!sheetConfig?.enabled || !sheetConfig.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await firebaseService.fetchCollection('PrePrimaryContent');
        const found = data.find((item: any) => 
          (item.classname || '').toString() === classname.toString() &&
          (item.subject || '').toLowerCase() === subject.toLowerCase()
        );
        
        if (found) {
          // Ensure images is an array
          if (typeof found.images === 'string') {
            try {
              found.images = JSON.parse(found.images);
            } catch (e) {
              console.error('Error parsing images JSON:', e);
              found.images = [];
            }
          }
          setContent(found);
        }
      } catch (error) {
        console.error('Error fetching Pre-Primary content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [classname, subject, initialContent, sheetConfig]);

  // Parse image URLs
  const imageUrls = Array.isArray(content?.images) ? content.images : [];

  useEffect(() => {
    if (!isTracing || imageUrls.length === 0) return;

    const loadAndResizeImage = () => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = imageUrls[currentIndex];
      img.onload = () => {
        if (!containerRef.current || !worksheetRef.current || !canvasRef.current) return;
        
        const containerRect = containerRef.current.getBoundingClientRect();
        if (containerRect.width === 0 || containerRect.height === 0) return;

        const imageAspectRatio = img.naturalWidth / img.naturalHeight;
        
        let newWidth, newHeight;
        // Add some padding
        const availableWidth = Math.max(containerRect.width - 32, 100);
        const availableHeight = Math.max(containerRect.height - 32, 100);

        if (availableWidth / availableHeight > imageAspectRatio) {
          newHeight = availableHeight;
          newWidth = newHeight * imageAspectRatio;
        } else {
          newWidth = availableWidth;
          newHeight = newWidth / imageAspectRatio;
        }

        worksheetRef.current.style.width = `${newWidth}px`;
        worksheetRef.current.style.height = `${newHeight}px`;
        worksheetRef.current.style.backgroundImage = `url(${img.src})`;
        
        canvasRef.current.width = newWidth;
        canvasRef.current.height = newHeight;

        const context = canvasRef.current.getContext('2d', { willReadFrequently: true });
        if (context) {
          context.lineCap = 'round';
          context.lineJoin = 'round';
          context.strokeStyle = '#000000';
          context.lineWidth = 8;
          context.globalAlpha = 1.0;
          contextRef.current = context;
          
          const drawingKey = getDrawingKey(currentIndex);
          if (savedDrawingsRef.current && savedDrawingsRef.current[drawingKey]) {
            const savedImg = new Image();
            savedImg.src = savedDrawingsRef.current[drawingKey];
            savedImg.onload = () => {
              context.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
              context.drawImage(savedImg, 0, 0, canvasRef.current!.width, canvasRef.current!.height);
              const initialState = context.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);
              setHistory([initialState]);
              setRedoStack([]);
            };
          } else {
            // Initial clear
            clearCanvas();
          }
        }
      };
    };

    loadAndResizeImage();

    window.addEventListener('resize', loadAndResizeImage);
    return () => window.removeEventListener('resize', loadAndResizeImage);
  }, [isTracing, currentIndex, imageUrls]);

  const clearCanvas = () => {
    if (contextRef.current && canvasRef.current) {
      contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      const initialState = contextRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      setHistory([initialState]);
      setRedoStack([]);
    }
  };

  const saveState = () => {
    if (contextRef.current && canvasRef.current) {
      const currentState = contextRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      setHistory(prev => [...prev, currentState]);
      setRedoStack([]);
    }
  };

  const undo = () => {
    if (history.length > 1 && contextRef.current) {
      const newHistory = [...history];
      const currentState = newHistory.pop();
      if (currentState) setRedoStack(prev => [...prev, currentState]);
      setHistory(newHistory);
      contextRef.current.putImageData(newHistory[newHistory.length - 1], 0, 0);
    }
  };

  const redo = () => {
    if (redoStack.length > 0 && contextRef.current) {
      const newRedo = [...redoStack];
      const stateToRedo = newRedo.pop();
      if (stateToRedo) {
        setHistory(prev => [...prev, stateToRedo]);
        contextRef.current.putImageData(stateToRedo, 0, 0);
      }
      setRedoStack(newRedo);
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!contextRef.current || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * (canvasRef.current.width / rect.width);
    const y = (clientY - rect.top) * (canvasRef.current.height / rect.height);

    contextRef.current.beginPath();
    contextRef.current.strokeStyle = '#000000';
    contextRef.current.lineWidth = 8;
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * (canvasRef.current.width / rect.width);
    const y = (clientY - rect.top) * (canvasRef.current.height / rect.height);

    contextRef.current.lineWidth = 8;
    contextRef.current.lineCap = 'round';
    contextRef.current.strokeStyle = '#000000';
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const saveCurrentCanvas = () => {
    if (isTracing && canvasRef.current && savedDrawingsRef.current) {
      const drawingKey = getDrawingKey(currentIndex);
      savedDrawingsRef.current[drawingKey] = canvasRef.current.toDataURL();
    }
  };

  const handleNext = () => {
    if (currentIndex < imageUrls.length - 1) {
      saveCurrentCanvas();
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      saveCurrentCanvas();
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary mb-4"></div>
        <p className="text-slate-500 font-medium">Loading content...</p>
      </div>
    );
  }

  if (imageUrls.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full">
          <X size={24} />
        </button>
        <p className="text-slate-500 font-medium">No content available for this subject yet.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-brand-primary text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <ChevronLeft size={28} />
          </button>
          <div>
            <h2 className="text-xl font-display font-bold">{subject}</h2>
            <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Class {classname}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
            {currentIndex + 1} / {imageUrls.length}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative flex flex-col p-4 pb-0">
        {/* Tracing Controls */}
        {isTracing && (
          <div className="absolute top-6 right-6 flex flex-row gap-3 z-20">
            <button 
              onClick={undo}
              disabled={history.length <= 1}
              className="w-11 h-11 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-md disabled:opacity-50 disabled:bg-slate-400 active:scale-110 transition-transform"
              title="Undo"
            >
              <Undo size={18} />
            </button>
            <button 
              onClick={redo}
              disabled={redoStack.length === 0}
              className="w-11 h-11 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-md disabled:opacity-50 disabled:bg-slate-400 active:scale-110 transition-transform"
              title="Redo"
            >
              <Redo size={18} />
            </button>
            <button 
              onClick={clearCanvas}
              className="w-11 h-11 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md active:scale-110 transition-transform"
              title="Erase All"
            >
              <Eraser size={18} />
            </button>
          </div>
        )}

        <div 
          ref={containerRef}
          className="relative w-full flex-1 flex items-center justify-center overflow-hidden bg-white rounded-t-3xl shadow-sm"
        >
          {isTracing ? (
            <div 
              ref={worksheetRef}
              className="relative"
              style={{
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                imageRendering: '-webkit-optimize-contrast'
              }}
            >
              <canvas
                ref={canvasRef}
                className="absolute left-0 top-0 w-full h-full cursor-crosshair touch-none z-10"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={classname === 'L.K.G' ? { opacity: 0, scale: 0.8, y: 50, rotate: -5 } : { opacity: 0 }}
                animate={classname === 'L.K.G' ? { opacity: 1, scale: 1, y: 0, rotate: 0 } : { opacity: 1 }}
                exit={classname === 'L.K.G' ? { opacity: 0, scale: 1.1, y: -50, rotate: 5 } : { opacity: 0 }}
                transition={classname === 'L.K.G' ? { type: "spring", stiffness: 300, damping: 25, mass: 0.8 } : { duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center p-6"
              >
                <img 
                  src={imageUrls[currentIndex]} 
                  alt={`${subject} ${currentIndex + 1}`}
                  className={`max-w-full max-h-full object-contain pointer-events-none select-none ${
                    classname === 'L.K.G' 
                      ? 'rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-white border-4 border-white ring-1 ring-slate-900/5 p-1' 
                      : ''
                  }`}
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.05)] p-4 px-8 flex justify-between items-center shrink-0 z-20">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="w-14 h-14 bg-gradient-to-tr from-purple-600 to-red-500 text-white rounded-full flex items-center justify-center shadow-lg disabled:opacity-30 active:scale-95 transition-all"
          title="Previous"
        >
          <ChevronLeft size={28} />
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex === imageUrls.length - 1}
          className="w-14 h-14 bg-gradient-to-tr from-blue-500 to-green-500 text-white rounded-full flex items-center justify-center shadow-lg disabled:opacity-30 active:scale-95 transition-all"
          title="Next"
        >
          <ChevronRight size={28} />
        </button>
      </div>
    </div>
  );
};
