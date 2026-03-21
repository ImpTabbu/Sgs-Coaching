import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/src/lib/utils';
import { Home } from './components/Home';
import { Study } from './components/Study';
import { Toppers } from './components/Toppers';
import { Contact } from './components/Contact';
import { Info } from './components/Info';
import { Login } from './components/Login';
import { ClassModal } from './components/ClassModal';
import { AdminPanel } from './components/AdminPanel';
import { Notifications } from './components/Notifications';
import { Gallery } from './components/Gallery';
import { TestSeries } from './components/TestSeries';
import { StudyContent } from './components/StudyContent';
import { PrePrimaryViewer } from './components/PrePrimaryViewer';
import { StoryCollection } from './components/StoryCollection';
import { googleSheetsService } from './services/googleSheetsService';
import { 
  Menu, 
  Puzzle, 
  Sparkles,
  X, 
  Bell, 
  GraduationCap, 
  HelpCircle, 
  Image as ImageIcon, 
  Video,
  PlusCircle,
  SpellCheck,
  Hash,
  Grid,
  XCircle,
  BookOpen,
  Trophy,
  Home as HomeIcon,
  PhoneCall,
  Info as InfoIcon,
  Settings,
  LayoutDashboard,
  LogOut,
  Gamepad2,
  WifiOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'home' | 'study' | 'toppers' | 'contact' | 'info' | 'admin' | 'notifications' | 'gallery' | 'study_content' | 'test_series' | 'pre_primary_viewer' | 'story_collection';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isGameMenuOpen, setIsGameMenuOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'study' | 'toppers'>('study');
  const [selectedLevel, setSelectedLevel] = useState('Pre-Primary');
  const [selectedClass, setSelectedClass] = useState('L.K.G');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [initialEdit, setInitialEdit] = useState<{ item: any; type: string } | null>(null);
  const savedDrawingsRef = useRef<Record<string, string>>({});
  const [sheetConfig, setSheetConfig] = useState<{ 
    enabled: boolean; 
    id: string; 
    scriptUrl?: string;
    testSheetId?: string;
    testScriptUrl?: string;
  }>({ enabled: false, id: '' });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for existing session
    const savedIsLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const savedUsername = localStorage.getItem('username');
    const savedUserRole = localStorage.getItem('userRole');

    if (savedIsLoggedIn && savedUsername && savedUserRole) {
      setIsLoggedIn(true);
      setUser({ name: savedUsername, role: savedUserRole });
    }
    setIsAuthReady(true);
    
    const savedTab = sessionStorage.getItem('lastActiveTab') as Tab;
    if (savedTab) setActiveTab(savedTab);

    const savedLevel = localStorage.getItem('selectedClassLevel');
    const savedClass = localStorage.getItem('selectedClassName');
    if (savedLevel) setSelectedLevel(savedLevel);
    if (savedClass) setSelectedClass(savedClass);

    // Configuration for Google Sheets
    const savedSheetId = localStorage.getItem('sheetId') || '1p4-W7nFbvVapwUX-8QUedWlPoVY0TEkhkS18pywbtd0';
    const savedScriptUrl = localStorage.getItem('scriptUrl') || import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwCb0KqMStpA5xt0SSNZfdeQWJ58-Ei5y-m9th79m4RlcGNdhrx4XkBpQKeXQCTiiDR/exec';
    const savedTestSheetId = localStorage.getItem('testSheetId') || '';
    const savedTestScriptUrl = localStorage.getItem('testScriptUrl') || '';
    const savedEnabled = localStorage.getItem('isSheetsEnabled') !== 'false'; // Default to true if not explicitly disabled
    
    setSheetConfig({
      enabled: savedEnabled,
      id: savedSheetId,
      scriptUrl: savedScriptUrl,
      testSheetId: savedTestSheetId,
      testScriptUrl: savedTestScriptUrl
    });

    googleSheetsService.setSheetId(savedSheetId);
    if (savedScriptUrl) {
      googleSheetsService.setScriptUrl(savedScriptUrl);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogin = (username: string, role: string) => {
    // Note: Login.tsx already handles the Firebase Auth sign-in
    setIsLoggedIn(true);
    setUser({ name: username, role });
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', username);
    localStorage.setItem('userRole', role);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    setActiveTab('home');
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    sessionStorage.setItem('lastActiveTab', tab);
    setIsSideMenuOpen(false);
    setIsGameMenuOpen(false);
  };

  const handleEditFromViewer = (item: any, type: string) => {
    setInitialEdit({ item, type });
    handleTabChange('admin');
  };

  const handleClassSelect = (level: string, className: string) => {
    setSelectedLevel(level);
    setSelectedClass(className);
    localStorage.setItem('selectedClassLevel', level);
    localStorage.setItem('selectedClassName', className);
    setIsClassModalOpen(false);
    handleTabChange('study');
  };

  const handleSubjectSelect = (subjectName: string) => {
    setSelectedSubject(subjectName);
    
    // Check if it's a Pre-Primary class and not Story Listening
    const isPrePrimary = selectedLevel === 'Pre-Primary';
    const isStoryListening = subjectName === 'Story Listening';
    
    if (isStoryListening) {
      handleTabChange('story_collection');
    } else if (isPrePrimary) {
      handleTabChange('pre_primary_viewer');
    } else {
      handleTabChange('study_content');
    }
  };

  const openModal = (mode: 'study' | 'toppers') => {
    setModalMode(mode);
    setIsClassModalOpen(true);
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const canAccessAdmin = user?.role === 'admin' || user?.role === 'teacher';

  const navItems = [
    { id: 'study', icon: BookOpen, label: 'Study' },
    { id: 'toppers', icon: Trophy, label: 'Toppers' },
    { id: 'home', icon: HomeIcon, label: 'Home' },
    { id: 'contact', icon: PhoneCall, label: 'Contact' },
    { id: 'info', icon: InfoIcon, label: 'Info' },
  ];

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-100">
      <div className="w-full max-w-[420px] h-screen md:h-[850px] md:rounded-[2.5rem] md:border-[12px] md:border-slate-900 bg-background shadow-2xl relative overflow-hidden flex flex-col">
        
        {/* Offline Banner */}
        <AnimatePresence>
          {!isOnline && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-rose-500 text-white text-[10px] font-black uppercase tracking-[0.2em] py-1.5 flex items-center justify-center gap-2 z-[100]"
            >
              <WifiOff size={12} />
              <span>Offline Mode - Using Cached Data</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Side Menu (Left) */}
        <AnimatePresence>
          {isSideMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSideMenuOpen(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-[1001]"
              />
              <motion.aside 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute top-0 left-0 w-[85%] h-full bg-white z-[1002] p-8 flex flex-col shadow-2xl"
              >
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">S</div>
                    <h2 className="text-xl font-display font-bold text-slate-900">SGS Menu</h2>
                  </div>
                  <button onClick={() => setIsSideMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X size={24} className="text-slate-500" />
                  </button>
                </div>
                
                <nav className="space-y-2 flex-grow">
                  {[
                    { id: 'notifications', icon: Bell, label: 'Notifications' },
                    { id: 'gallery', icon: ImageIcon, label: 'Photos & Videos' },
                    { id: 'test_series', icon: Sparkles, label: 'Test Series' },
                  ].map((item) => (
                    <button 
                      key={item.id}
                      onClick={() => handleTabChange(item.id as Tab)} 
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl w-full text-left transition-all",
                        activeTab === item.id ? "bg-brand-primary/10 text-brand-primary font-semibold" : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <item.icon size={20} /> {item.label}
                    </button>
                  ))}
                  
                  {canAccessAdmin && (
                    <button 
                      onClick={() => handleTabChange('admin')} 
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl w-full text-left transition-all",
                        activeTab === 'admin' ? "bg-amber-50 text-amber-600 font-semibold" : "text-amber-600 hover:bg-amber-50"
                      )}
                    >
                      <LayoutDashboard size={20} /> Admin Panel
                    </button>
                  )}
                </nav>

                <div className="mt-auto pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-3 mb-6 p-2">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                      {user?.name.charAt(0)}
                    </div>
                    <div className="flex-grow overflow-hidden">
                      <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-4 p-4 rounded-2xl w-full text-left text-red-500 hover:bg-red-50 transition-all"
                  >
                    <LogOut size={20} /> Logout
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Game Menu (Right) */}
        <AnimatePresence>
          {isGameMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsGameMenuOpen(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-[1001]"
              />
              <motion.aside 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute top-0 right-0 w-[85%] h-full bg-white z-[1002] p-8 flex flex-col shadow-2xl"
              >
                <div className="flex justify-between items-center mb-10">
                  <button onClick={() => setIsGameMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X size={24} className="text-slate-500" />
                  </button>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-display font-bold text-slate-900">Games</h2>
                    <div className="w-10 h-10 bg-brand-secondary rounded-xl flex items-center justify-center text-white font-bold text-xl">G</div>
                  </div>
                </div>
                <div className="flex flex-col h-full overflow-y-auto no-scrollbar pb-10">
                  <div className="grid grid-cols-1 gap-4">
                    <a href="/games/tictactoe.html" target="_blank" className="flex items-center p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 group">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-4 shadow-md group-hover:scale-110 transition-transform">
                        <Gamepad2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-slate-900 font-bold">Tic Tac Toe</h3>
                        <p className="text-slate-500 text-xs">Classic X and O game</p>
                      </div>
                    </a>
                    
                    <a href="/games/tetris.html" target="_blank" className="flex items-center p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 group">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mr-4 shadow-md group-hover:scale-110 transition-transform">
                        <Gamepad2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-slate-900 font-bold">Tetris</h3>
                        <p className="text-slate-500 text-xs">Block puzzle game</p>
                      </div>
                    </a>
                    
                    <a href="/games/maze.html" target="_blank" className="flex items-center p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 group">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mr-4 shadow-md group-hover:scale-110 transition-transform">
                        <Puzzle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-slate-900 font-bold">Maze Puzzle</h3>
                        <p className="text-slate-500 text-xs">Find your way out</p>
                      </div>
                    </a>

                    <a href="/games/connectfour.html" target="_blank" className="flex items-center p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 group">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center mr-4 shadow-md group-hover:scale-110 transition-transform">
                        <Gamepad2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-slate-900 font-bold">Connect Four</h3>
                        <p className="text-slate-500 text-xs">Four in a row wins</p>
                      </div>
                    </a>

                    <a href="/games/2048.html" target="_blank" className="flex items-center p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 group">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center mr-4 shadow-md group-hover:scale-110 transition-transform">
                        <Gamepad2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-slate-900 font-bold">2048 Neon</h3>
                        <p className="text-slate-500 text-xs">Merge to reach 2048</p>
                      </div>
                    </a>

                    <a href="/games/towerblocks.html" target="_blank" className="flex items-center p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 group">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mr-4 shadow-md group-hover:scale-110 transition-transform">
                        <Gamepad2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-slate-900 font-bold">Tower Blocks</h3>
                        <p className="text-slate-500 text-xs">Build the highest tower</p>
                      </div>
                    </a>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 shrink-0 border-b border-slate-100">
          {!isOnline && (
            <div className="absolute top-0 left-0 w-full bg-brand-accent text-white text-[10px] py-0.5 text-center font-medium">
              You are currently offline. Some features may be limited.
            </div>
          )}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSideMenuOpen(true)}
              className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center active:bg-slate-100 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-lg font-display font-bold text-slate-900 leading-tight">SGS Coaching</h1>
              <p className="text-[10px] text-brand-primary font-semibold uppercase tracking-wider">Education for Excellence</p>
            </div>
          </div>
          <button 
            onClick={() => setIsGameMenuOpen(true)}
            className="w-10 h-10 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center active:bg-brand-primary/20 transition-colors"
          >
            <Puzzle size={20} />
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-grow overflow-hidden relative bg-background">
          <div className="absolute inset-0 overflow-y-auto no-scrollbar pb-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="min-h-full"
              >
                {activeTab === 'home' && <Home />}
                {activeTab === 'study' && (
                  <Study 
                    selectedLevel={selectedLevel} 
                    selectedClass={selectedClass} 
                    onOpenModal={() => openModal('study')} 
                    onSelectSubject={handleSubjectSelect}
                  />
                )}
                {activeTab === 'toppers' && (
                  <Toppers 
                    selectedClass={selectedClass} 
                    onOpenModal={() => openModal('toppers')} 
                    sheetConfig={sheetConfig}
                  />
                )}
                {activeTab === 'contact' && <Contact />}
                {activeTab === 'info' && <Info />}
                {activeTab === 'admin' && (
                  <AdminPanel 
                    initialEdit={initialEdit} 
                    onClearInitialEdit={() => setInitialEdit(null)} 
                  />
                )}
                {activeTab === 'notifications' && (
                  <Notifications 
                    isAdmin={canAccessAdmin} 
                    onEdit={(item) => handleEditFromViewer(item, 'notification')} 
                    sheetConfig={sheetConfig}
                  />
                )}
                {activeTab === 'gallery' && (
                  <Gallery 
                    isAdmin={canAccessAdmin} 
                    onEdit={(item) => handleEditFromViewer(item, 'media')} 
                    sheetConfig={sheetConfig}
                  />
                )}
                {activeTab === 'test_series' && (
                  <TestSeries 
                    isAdmin={canAccessAdmin}
                    sheetConfig={sheetConfig}
                    user={user}
                  />
                )}
                {activeTab === 'study_content' && (
                  <StudyContent 
                    selectedLevel={selectedLevel} 
                    selectedClass={selectedClass} 
                    selectedSubject={selectedSubject}
                    onBack={() => handleTabChange('study')}
                    isAdmin={canAccessAdmin}
                    onEdit={(item) => handleEditFromViewer(item, 'study')}
                    sheetConfig={sheetConfig}
                  />
                )}
                {activeTab === 'pre_primary_viewer' && (
                  <div className="h-full flex flex-col">
                    <PrePrimaryViewer 
                      classname={selectedClass}
                      subject={selectedSubject}
                      onClose={() => handleTabChange('study')}
                      sheetConfig={sheetConfig}
                      savedDrawingsRef={savedDrawingsRef}
                    />
                  </div>
                )}
                {activeTab === 'story_collection' && (
                  <div className="h-full flex flex-col">
                    <StoryCollection />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Bottom Navigation */}
        {activeTab !== 'pre_primary_viewer' && activeTab !== 'story_collection' && (
          <div className="absolute bottom-0 w-full pb-6 px-4 z-50">
            <div 
              className="relative w-full h-16 bg-white rounded-2xl flex items-center"
              style={{ filter: 'drop-shadow(0px -4px 20px rgba(0,0,0,0.08))' }}
            >
              {/* Moving Background */}
              <motion.div
                className="absolute top-[-20px] w-14 h-14 bg-white rounded-full z-10"
                initial={false}
                animate={{ 
                  left: `calc(${(navItems.findIndex(t => t.id === activeTab) * 100) / navItems.length}% + ${100 / navItems.length / 2}% - 28px)` 
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
              </motion.div>

              {/* Tab Buttons */}
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id as Tab)}
                    className="relative flex-1 h-full flex flex-col items-center justify-center z-20"
                  >
                    <motion.div
                      animate={{ 
                        y: isActive ? -24 : 0,
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-300",
                        isActive ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/30" : "text-slate-400 bg-transparent"
                      )}
                    >
                      <item.icon size={24} />
                    </motion.div>
                    <AnimatePresence>
                      {isActive && (
                        <motion.span
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-2 text-[10px] font-bold text-brand-primary"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Class Selection Modal */}
        <ClassModal 
          isOpen={isClassModalOpen}
          onClose={() => setIsClassModalOpen(false)}
          onSelect={handleClassSelect}
          title={modalMode === 'study' ? 'Choose Your Class' : 'Choose Class Toppers'}
        />
      </div>
    </div>
  );
}
