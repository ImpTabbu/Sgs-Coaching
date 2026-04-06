import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Tab = 'home' | 'study' | 'toppers' | 'contact' | 'info' | 'admin' | 'notifications' | 'gallery' | 'study_content' | 'test_series' | 'pre_primary_viewer' | 'story_collection' | 'game_viewer';

interface AppContextType {
  activeTab: Tab;
  handleTabChange: (tab: Tab, pushState?: boolean) => void;
  isSideMenuOpen: boolean;
  toggleSideMenu: (open: boolean) => void;
  isGameMenuOpen: boolean;
  toggleGameMenu: (open: boolean) => void;
  isClassModalOpen: boolean;
  setIsClassModalOpen: (open: boolean) => void;
  modalMode: 'study' | 'toppers';
  openClassModal: (mode: 'study' | 'toppers') => void;
  selectedLevel: string;
  selectedClass: string;
  handleClassSelect: (level: string, className: string) => void;
  selectedSubject: string;
  handleSubjectSelect: (subjectName: string) => void;
  selectedGame: { name: string; url: string } | null;
  handleGameSelect: (name: string, url: string) => void;
  isOnline: boolean;
  initialEdit: { item: any; type: string } | null;
  handleEditFromViewer: (item: any, type: string) => void;
  clearInitialEdit: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isGameMenuOpen, setIsGameMenuOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'study' | 'toppers'>('study');
  const [selectedLevel, setSelectedLevel] = useState('Pre-Primary');
  const [selectedClass, setSelectedClass] = useState('L.K.G');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGame, setSelectedGame] = useState<{ name: string; url: string } | null>(null);
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);
  const [initialEdit, setInitialEdit] = useState<{ item: any; type: string } | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const savedTab = sessionStorage.getItem('lastActiveTab') as Tab;
    if (savedTab) setActiveTab(savedTab);

    const savedLevel = localStorage.getItem('selectedClassLevel');
    const savedClass = localStorage.getItem('selectedClassName');
    if (savedLevel) setSelectedLevel(savedLevel);
    if (savedClass) setSelectedClass(savedClass);

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      setIsSideMenuOpen(false);
      setIsGameMenuOpen(false);
      setIsClassModalOpen(false);

      if (state) {
        if (state.type === 'tab') {
          setActiveTab(state.tab);
          if (state.tab !== 'game_viewer') {
            setSelectedGame(null);
          }
        }
      } else {
        setActiveTab('home');
        setSelectedGame(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    if (!window.history.state) {
      window.history.replaceState({ type: 'tab', tab: activeTab }, '', '');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleTabChange = (tab: Tab, pushState = true) => {
    setActiveTab(tab);
    sessionStorage.setItem('lastActiveTab', tab);
    if (pushState) {
      window.history.pushState({ type: 'tab', tab }, '', '');
    }
    setIsSideMenuOpen(false);
    setIsGameMenuOpen(false);
  };

  const toggleSideMenu = (open: boolean) => {
    setIsSideMenuOpen(open);
    if (open) {
      window.history.pushState({ type: 'menu', menu: 'side' }, '', '');
    }
  };

  const toggleGameMenu = (open: boolean) => {
    setIsGameMenuOpen(open);
    if (open) {
      window.history.pushState({ type: 'menu', menu: 'game' }, '', '');
    }
  };

  const openClassModal = (mode: 'study' | 'toppers') => {
    setModalMode(mode);
    setIsClassModalOpen(true);
    window.history.pushState({ type: 'modal', modal: 'class' }, '', '');
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

  const handleGameSelect = (name: string, url: string) => {
    setSelectedGame({ name, url });
    handleTabChange('game_viewer');
    setIsGameMenuOpen(false);
  };

  const handleEditFromViewer = (item: any, type: string) => {
    setInitialEdit({ item, type });
    handleTabChange('admin');
  };

  const clearInitialEdit = () => setInitialEdit(null);

  return (
    <AppContext.Provider value={{
      activeTab, handleTabChange,
      isSideMenuOpen, toggleSideMenu,
      isGameMenuOpen, toggleGameMenu,
      isClassModalOpen, setIsClassModalOpen,
      modalMode, openClassModal,
      selectedLevel, selectedClass, handleClassSelect,
      selectedSubject, handleSubjectSelect,
      selectedGame, handleGameSelect,
      isOnline,
      initialEdit, handleEditFromViewer, clearInitialEdit
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
