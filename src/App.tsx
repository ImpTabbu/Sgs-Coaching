import React, { useEffect, useRef, useState } from 'react';
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
import { Header } from './components/layout/Header';
import { SideMenu } from './components/layout/SideMenu';
import { GameMenu } from './components/layout/GameMenu';
import { BottomNav } from './components/layout/BottomNav';
import { useAuth } from './contexts/AuthContext';
import { useAppContext } from './contexts/AppContext';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const { user, isLoggedIn, isPending, authLoading, isAuthReady, logout } = useAuth();
  const { 
    activeTab, 
    isClassModalOpen, 
    setIsClassModalOpen, 
    modalMode, 
    selectedLevel, 
    selectedClass, 
    handleClassSelect, 
    selectedSubject, 
    handleSubjectSelect, 
    selectedGame, 
    initialEdit, 
    clearInitialEdit,
    openClassModal,
    handleEditFromViewer
  } = useAppContext();

  const savedDrawingsRef = useRef<Record<string, string>>({});
  const [sheetConfig, setSheetConfig] = useState<{ 
    enabled: boolean; 
    id: string; 
    scriptUrl?: string;
    testSheetId?: string;
    testScriptUrl?: string;
  }>({ enabled: false, id: '' });

  useEffect(() => {
    // Configuration (Now using Firebase, keeping state for compatibility if needed)
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
  }, []);

  if (!isAuthReady || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-600"></div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Pending Approval</h2>
          <p className="text-slate-500">
            Your account registration has been received and is currently waiting for admin approval. 
            Please check back later or contact the administrator.
          </p>
          <button 
            onClick={logout}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login onLogin={() => {}} />;
  }

  const canAccessAdmin = user?.role === 'admin' || user?.role === 'teacher';

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-100">
      <div className="w-full max-w-[420px] h-screen md:h-[850px] md:rounded-[2.5rem] md:border-[12px] md:border-slate-900 bg-background shadow-2xl relative overflow-hidden flex flex-col">
        
        <Header />
        <SideMenu />
        <GameMenu />

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
                className={`min-h-full relative ${activeTab === 'game_viewer' ? "h-full" : ""}`}
              >
                {activeTab === 'home' && <Home />}
                {activeTab === 'study' && (
                  <Study 
                    selectedLevel={selectedLevel} 
                    selectedClass={selectedClass} 
                    onOpenModal={() => openClassModal('study')} 
                    onSelectSubject={handleSubjectSelect}
                  />
                )}
                {activeTab === 'toppers' && (
                  <Toppers 
                    selectedClass={selectedClass} 
                    onOpenModal={() => openClassModal('toppers')} 
                    sheetConfig={sheetConfig}
                  />
                )}
                {activeTab === 'contact' && <Contact />}
                {activeTab === 'info' && <Info />}
                {activeTab === 'admin' && (
                  <AdminPanel 
                    initialEdit={initialEdit} 
                    onClearInitialEdit={clearInitialEdit} 
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
                    onBack={() => window.history.back()}
                    isAdmin={canAccessAdmin}
                    sheetConfig={sheetConfig}
                  />
                )}
                {activeTab === 'pre_primary_viewer' && (
                  <PrePrimaryViewer 
                    classname={selectedClass} 
                    subject={selectedSubject}
                    onClose={() => window.history.back()}
                    savedDrawingsRef={savedDrawingsRef}
                    sheetConfig={sheetConfig}
                  />
                )}
                {activeTab === 'story_collection' && (
                  <StoryCollection 
                    selectedClass={selectedClass} 
                    onBack={() => window.history.back()}
                    isAdmin={canAccessAdmin}
                    sheetConfig={sheetConfig}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        <BottomNav />

        {isClassModalOpen && (
          <ClassModal 
            isOpen={isClassModalOpen} 
            onClose={() => setIsClassModalOpen(false)} 
            onSelect={handleClassSelect}
            mode={modalMode}
          />
        )}
      </div>
    </div>
  );
}
