import React, { useState, useEffect } from 'react';
import { Send, Image as ImageIcon, Video, HelpCircle, BookOpen, Bell, Loader2, User, Users, Trash2, Edit, X, Database, Settings, ShieldCheck, Sparkles, Plus, Award } from 'lucide-react';
import { SUBJECTS, TOPPERS_DATA } from '../constants';
import { ConfirmModal } from './ConfirmModal';
import { googleSheetsService, SheetData } from '../services/googleSheetsService';
import { motion, AnimatePresence } from 'motion/react';

interface AdminPanelProps {
  initialEdit?: { item: any; type: string } | null;
  onClearInitialEdit?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ initialEdit, onClearInitialEdit }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [materials, setMaterials] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [testQuestions, setTestQuestions] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [noticeBoard, setNoticeBoard] = useState<any[]>([]);
  const [prePrimaryContent, setPrePrimaryContent] = useState<any[]>([]);
  const [kahanis, setKahanis] = useState<any[]>([]);
  const [sheetId, setSheetId] = useState('');
  const [scriptUrl, setScriptUrl] = useState('');
  const [testSheetId, setTestSheetId] = useState('');
  const [testScriptUrl, setTestScriptUrl] = useState('');
  const [isSheetsEnabled, setIsSheetsEnabled] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; col: string } | null>(null);

  // Notification Form
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [notifImageUrl, setNotifImageUrl] = useState('');
  const [notifAuthor, setNotifAuthor] = useState('');
  const [notifType, setNotifType] = useState('Announcement');

  // Photo/Video Form
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaDescription, setMediaDescription] = useState('');
  const [mediaType, setMediaType] = useState<'photos' | 'videos'>('photos');

  // Study Material Form
  const [studyLevel, setStudyLevel] = useState('Pre-Primary');
  const [studyClass, setStudyClass] = useState('L.K.G');
  const [studySubject, setStudySubject] = useState('Hindi');
  const [studyTitle, setStudyTitle] = useState('');
  const [studyUrl, setStudyUrl] = useState('');
  const [studyType, setStudyType] = useState('pdf');
  const [studyVideos, setStudyVideos] = useState([{ title: '', url: '' }]);
  const [studyNotesUrl, setStudyNotesUrl] = useState('');
  const [studyReadUrl, setStudyReadUrl] = useState('');
  const [studyHomeworkUrls, setStudyHomeworkUrls] = useState(['']);

  // Toppers Form
  const [topperName, setTopperName] = useState('');
  const [topperClass, setTopperClass] = useState('');
  const [topperImageUrl, setTopperImageUrl] = useState('');
  const [topperDescription, setTopperDescription] = useState('');
  const [topperDate, setTopperDate] = useState('');

  // Notice Board Form
  const [noticeText, setNoticeText] = useState('');
  const [noticeDate, setNoticeDate] = useState('');

  // Pre-Primary Form
  const [prePrimaryClass, setPrePrimaryClass] = useState('L.K.G');
  const [prePrimarySubject, setPrePrimarySubject] = useState('Hindi Alphabet');
  const [prePrimaryImages, setPrePrimaryImages] = useState(['']);

  // User Management Form
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('student');
  
  // Test Series Form
  const [testTitle, setTestTitle] = useState('');
  const [testClass, setTestClass] = useState('10');
  const [testSubject, setTestSubject] = useState('Maths');
  const [testDuration, setTestDuration] = useState('30');
  const [testStatus, setTestStatus] = useState('Draft');
  const [testMarksPerQuestion, setTestMarksPerQuestion] = useState('1');
  const [testNegativeMarks, setTestNegativeMarks] = useState('0');
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [testQuestion, setTestQuestion] = useState('');
  const [testQuestionImage, setTestQuestionImage] = useState('');
  const [testOptions, setTestOptions] = useState(['', '', '', '']);
  const [testAnswer, setTestAnswer] = useState('');
  const [testExplanation, setTestExplanation] = useState('');

  // Kahani Form
  const [kahaniTitle, setKahaniTitle] = useState('');
  const [kahaniCoverImage, setKahaniCoverImage] = useState('');
  const [kahaniAudioUrl, setKahaniAudioUrl] = useState('');
  const [kahaniMoral, setKahaniMoral] = useState('');
  const [kahaniContent, setKahaniContent] = useState([{ type: 'paragraph', value: '' }]);
  const [kahaniCategory, setKahaniCategory] = useState('Popular Stories');
 
  const [toppers, setToppers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const currentUser = { 
    email: localStorage.getItem('username') || 'Admin',
    role: localStorage.getItem('userRole') || 'student'
  };

  const tabs = [
    { id: 'config', label: 'Sync', icon: Database, color: 'text-emerald-600', bgColor: 'bg-emerald-50', roles: ['admin'] },
    { id: 'users', label: 'Users', icon: User, color: 'text-indigo-600', bgColor: 'bg-indigo-50', roles: ['admin'] },
    { id: 'notification', label: 'Alerts', icon: Bell, color: 'text-brand-primary', bgColor: 'bg-brand-primary/10', roles: ['admin', 'teacher'] },
    { id: 'media', label: 'Gallery', icon: ImageIcon, color: 'text-purple-600', bgColor: 'bg-purple-50', roles: ['admin', 'teacher'] },
    { id: 'test_series', label: 'Test Series', icon: Sparkles, color: 'text-cyan-600', bgColor: 'bg-cyan-50', roles: ['admin', 'teacher'] },
    { id: 'test_results', label: 'Results', icon: Award, color: 'text-indigo-600', bgColor: 'bg-indigo-50', roles: ['admin', 'teacher'] },
    { id: 'study', label: 'Study', icon: BookOpen, color: 'text-blue-600', bgColor: 'bg-blue-50', roles: ['admin', 'teacher'] },
    { id: 'topper', label: 'Toppers', icon: Award, color: 'text-rose-600', bgColor: 'bg-rose-50', roles: ['admin', 'teacher'] },
    { id: 'pre_primary', label: 'Pre-Primary', icon: Sparkles, color: 'text-pink-600', bgColor: 'bg-pink-50', roles: ['admin', 'teacher'] },
    { id: 'kahani', label: 'Kahani', icon: BookOpen, color: 'text-fuchsia-600', bgColor: 'bg-fuchsia-50', roles: ['admin', 'teacher'] },
    { id: 'notice', label: 'Notice', icon: Bell, color: 'text-orange-600', bgColor: 'bg-orange-50', roles: ['admin'] },
  ].filter(tab => tab.roles.includes(currentUser.role));

  useEffect(() => {
    if (initialEdit) {
      handleEdit(initialEdit.item, initialEdit.type);
      if (onClearInitialEdit) onClearInitialEdit();
    }
  }, [initialEdit]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const data = await googleSheetsService.getAllData();
      
      setNotifications((data.notifications || []).map((item, index) => ({
        id: `sheet-notif-${index}`,
        title: item.title,
        message: item.message,
        imageUrl: item.imageurl || '',
        author: item.author || 'Admin',
        type: item.type || 'Announcement',
        createdAt: item.createdat ? { toDate: () => new Date(item.createdat) } : { toDate: () => new Date() },
        isFromSheet: true,
        _rowIndex: item._rowIndex
      })).sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()));

      const sheetPhotos = (data.gallery || []).filter((m: any) => (m.type || '').toLowerCase() === 'photo');
      const sheetVideos = (data.gallery || []).filter((m: any) => (m.type || '').toLowerCase() === 'video');
      
      setPhotos(sheetPhotos.map((item, index) => ({
        id: `sheet-photo-${index}`,
        title: item.title,
        url: item.url,
        description: item.description || '',
        createdAt: item.createdat ? { toDate: () => new Date(item.createdat) } : { toDate: () => new Date() },
        isFromSheet: true,
        _rowIndex: item._rowIndex
      })).sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()));

      setVideos(sheetVideos.map((item, index) => ({
        id: `sheet-video-${index}`,
        title: item.title,
        url: item.url,
        description: item.description || '',
        createdAt: item.createdat ? { toDate: () => new Date(item.createdat) } : { toDate: () => new Date() },
        isFromSheet: true,
        _rowIndex: item._rowIndex
      })).sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()));

      setMaterials((data.studyMaterials || []).map((item, index) => ({
        id: `sheet-study-${index}`,
        title: item.title,
        videos: item.videos ? (typeof item.videos === 'string' ? JSON.parse(item.videos) : item.videos) : [],
        notesUrl: item.notesurl || '',
        readUrl: item.readurl || '',
        homeworkUrls: item.homeworkurls ? (typeof item.homeworkurls === 'string' ? JSON.parse(item.homeworkurls) : item.homeworkurls) : [],
        level: item.level,
        className: item.classname,
        subject: item.subject,
        createdAt: item.createdat ? { toDate: () => new Date(item.createdat) } : { toDate: () => new Date() },
        isFromSheet: true,
        _rowIndex: item._rowIndex
      })).sort((a, b) => a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime()));

      setToppers((data.toppers || []).map((item, index) => ({
        id: `sheet-topper-${index}`,
        name: item.name,
        className: item.classname,
        imageUrl: item.imageurl,
        description: item.description,
        date: item.date,
        createdAt: item.createdat ? { toDate: () => new Date(item.createdat) } : { toDate: () => new Date() },
        isFromSheet: true,
        _rowIndex: item._rowIndex
      })).sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()));

      setUsers((data.users || []).map((item, index) => ({
        id: `sheet-user-${index}`,
        username: item.username,
        password: item.password,
        role: item.role,
        isFromSheet: true,
        _rowIndex: item._rowIndex
      })));

      let testSheetData: Partial<SheetData> = data;
      const currentTestSheetId = testSheetId || localStorage.getItem('testSheetId');
      const currentTestScriptUrl = testScriptUrl || localStorage.getItem('testScriptUrl');

      if (currentTestSheetId) {
        try {
          testSheetData = await googleSheetsService.getTestData({
            sheetId: currentTestSheetId,
            scriptUrl: currentTestScriptUrl || undefined
          });
        } catch (testErr) {
          console.error('Failed to fetch test sheet data:', testErr);
          // Fallback to main sheet data if test sheet fetch fails
          testSheetData = data;
        }
      }

      setTests((testSheetData.tests || []).map((item, index) => ({
        id: item.id || `sheet-test-${index}`,
        title: item.title,
        className: item.classname,
        subject: item.subject,
        duration: item.duration,
        status: item.status,
        marksperquestion: item.marksperquestion,
        negativemarks: item.negativemarks,
        createdAt: item.createdat ? { toDate: () => new Date(item.createdat) } : { toDate: () => new Date() },
        isFromSheet: true,
        _rowIndex: item._rowIndex
      })).sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()));

      setTestQuestions((testSheetData.testQuestions || []).map((item, index) => ({
        id: item.id || `sheet-tq-${index}`,
        testId: item.testid,
        question: item.question,
        imageUrl: item.imageurl || '',
        options: [item.option1, item.option2, item.option3, item.option4].filter(Boolean),
        answer: item.answer,
        explanation: item.explanation,
        createdAt: item.createdat ? { toDate: () => new Date(item.createdat) } : { toDate: () => new Date() },
        isFromSheet: true,
        _rowIndex: item._rowIndex
      })).sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()));

      setTestResults((testSheetData.testResults || []).map((item, index) => ({
        id: item.id || `sheet-tr-${index}`,
        testId: item.testid,
        username: item.username,
        score: item.score,
        total: item.total,
        percentage: item.percentage,
        timeTaken: item.timetaken,
        completedAt: item.completedat ? { toDate: () => new Date(item.completedat) } : { toDate: () => new Date() },
        isFromSheet: true,
        _rowIndex: item._rowIndex
      })).sort((a, b) => b.completedAt.toDate().getTime() - a.completedAt.toDate().getTime()));

      setNoticeBoard((data.noticeBoard || []).map((item, index) => ({
        id: `sheet-notice-${index}`,
        text: item.text,
        date: item.date,
        createdAt: item.createdat ? { toDate: () => new Date(item.createdat) } : { toDate: () => new Date() },
        isFromSheet: true,
        _rowIndex: item._rowIndex
      })).sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()));

      setPrePrimaryContent((data.prePrimaryContent || []).map((item, index) => ({
        id: `sheet-pp-${index}`,
        className: item.classname,
        subject: item.subject,
        images: item.images ? (typeof item.images === 'string' ? JSON.parse(item.images) : item.images) : [],
        createdAt: item.createdat ? { toDate: () => new Date(item.createdat) } : { toDate: () => new Date() },
        isFromSheet: true,
        _rowIndex: item._rowIndex
      })));

      setKahanis((data.kahanis || []).map((item, index) => ({
        id: `sheet-kahani-${index}`,
        title: item.title,
        coverImage: item.coverimage,
        audioUrl: item.audiourl,
        moral: item.moral,
        content: item.content ? (typeof item.content === 'string' ? JSON.parse(item.content) : item.content) : [],
        category: item.category || 'Popular Stories',
        createdAt: item.createdat ? { toDate: () => new Date(item.createdat) } : { toDate: () => new Date() },
        isFromSheet: true,
        _rowIndex: item._rowIndex
      })).sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()));
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data from Google Sheets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedSheetId = localStorage.getItem('sheetId') || '1p4-W7nFbvVapwUX-8QUedWlPoVY0TEkhkS18pywbtd0';
    const savedScriptUrl = localStorage.getItem('scriptUrl') || '';
    const savedTestSheetId = localStorage.getItem('testSheetId') || '';
    const savedTestScriptUrl = localStorage.getItem('testScriptUrl') || '';
    const savedEnabled = localStorage.getItem('isSheetsEnabled') !== 'false';

    setSheetId(savedSheetId);
    setScriptUrl(savedScriptUrl);
    setTestSheetId(savedTestSheetId);
    setTestScriptUrl(savedTestScriptUrl);
    setIsSheetsEnabled(savedEnabled);

    googleSheetsService.setSheetId(savedSheetId);
    if (savedScriptUrl) {
      googleSheetsService.setScriptUrl(savedScriptUrl);
    }

    if (savedEnabled && savedSheetId) {
      fetchAllData();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent, type: string) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      let data: any = { createdAt: new Date().toISOString() };
      let colName = '';

      if (type === 'notification') {
        data = { 
          ...data, 
          title: notifTitle, 
          message: notifMsg,
          imageurl: notifImageUrl,
          author: notifAuthor || 'Admin',
          type: notifType
        };
        colName = 'notifications';
      } else if (type === 'media') {
        data = { 
          ...data, 
          title: mediaTitle, 
          url: mediaUrl, 
          description: mediaDescription || '' 
        };
        colName = mediaType;
      } else if (type === 'study') {
        data = { 
          ...data, 
          level: studyLevel, 
          classname: studyClass, 
          subject: studySubject, 
          title: studyTitle, 
          videos: JSON.stringify(studyVideos.filter(v => v.title && v.url)),
          notesurl: studyNotesUrl,
          readurl: studyReadUrl,
          homeworkurls: JSON.stringify(studyHomeworkUrls.filter(url => url)) 
        };
        colName = 'study_materials';
      } else if (type === 'topper') {
        data = {
          ...data,
          name: topperName,
          classname: topperClass,
          imageurl: topperImageUrl,
          description: topperDescription,
          date: topperDate
        };
        colName = 'toppers';
      } else if (type === 'user') {
        data = {
          ...data,
          username: newUsername,
          password: newPassword,
          role: newUserRole
        };
        colName = 'users';
      } else if (type === 'test') {
        data = {
          ...data,
          id: editingId || `test-${Date.now()}`,
          title: testTitle,
          classname: testClass,
          subject: testSubject,
          duration: testDuration,
          status: testStatus,
          marksperquestion: testMarksPerQuestion,
          negativemarks: testNegativeMarks
        };
        colName = 'tests';
      } else if (type === 'test_question') {
        const currentQuestions = testQuestions.filter(q => q.testId === activeTestId);
        if (!editingId && currentQuestions.length >= 100) {
          throw new Error('Maximum 100 questions allowed per test.');
        }
        data = {
          ...data,
          testid: activeTestId,
          question: testQuestion,
          option1: testOptions[0] || '',
          option2: testOptions[1] || '',
          option3: testOptions[2] || '',
          option4: testOptions[3] || '',
          answer: testAnswer,
          explanation: testExplanation,
          imageurl: testQuestionImage
        };
        colName = 'test_questions';
      } else if (type === 'notice') {
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-GB', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        });
        
        // If noticeDate is an ISO string, format it
        let finalDate = noticeDate || formattedDate;
        if (finalDate.includes('T') && !isNaN(Date.parse(finalDate))) {
          finalDate = new Date(finalDate).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });
        }

        data = {
          ...data,
          text: noticeText,
          date: finalDate
        };
        colName = 'notice_board';
      } else if (type === 'pre_primary') {
        data = {
          ...data,
          classname: prePrimaryClass,
          subject: prePrimarySubject,
          images: JSON.stringify(prePrimaryImages.filter(img => img.trim() !== ''))
        };
        colName = 'pre_primary_content';
      } else if (type === 'kahani') {
        data = {
          ...data,
          title: kahaniTitle,
          coverimage: kahaniCoverImage,
          audiourl: kahaniAudioUrl,
          moral: kahaniMoral,
          content: JSON.stringify(kahaniContent.filter(c => c.value.trim() !== '')),
          category: kahaniCategory
        };
        colName = 'kahanis';
      }
 
      const tabMap: any = {
        'notifications': 'Notifications',
        'photos': 'Gallery',
        'videos': 'Gallery',
        'study_materials': 'StudyMaterials',
        'toppers': 'Toppers',
        'users': 'Users',
        'tests': 'Tests',
        'test_questions': 'TestQuestions',
        'test_results': 'TestResults',
        'notice_board': 'NoticeBoard',
        'pre_primary_content': 'PrePrimaryContent',
        'kahanis': 'Kahanis'
      };
      const tabName = tabMap[colName] || colName;
      
      // Normalize keys for Sheets (lowercase, no spaces) to match GAS normalization
      let sheetData: any = {};
      Object.keys(data).forEach(key => {
        if (key !== 'createdAt') {
          const normalizedKey = key.toLowerCase().replace(/\s+/g, '');
          let value = data[key];
          if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
            value = JSON.stringify(value);
          }
          sheetData[normalizedKey] = value;
        }
      });

      if (type === 'media') sheetData.type = mediaType === 'photos' ? 'Photo' : 'Video';

      const isTestRelated = ['tests', 'test_questions', 'test_results'].includes(colName);
      const writeConfig = isTestRelated && testSheetId ? { sheetId: testSheetId, scriptUrl: testScriptUrl || undefined } : undefined;

      if (editingId && editingType === type) {
        let item: any = null;
        if (type === 'notification') item = notifications.find(n => n.id === editingId);
        else if (type === 'media') item = [...photos, ...videos].find(m => m.id === editingId);
        else if (type === 'study') item = materials.find(m => m.id === editingId);
        else if (type === 'topper') item = toppers.find(t => t.id === editingId);
        else if (type === 'test') item = tests.find(t => t.id === editingId);
        else if (type === 'test_question') item = testQuestions.find(q => q.id === editingId);
        else if (type === 'notice') item = noticeBoard.find(n => n.id === editingId);
        else if (type === 'pre_primary') item = prePrimaryContent.find(p => p.id === editingId);
        else if (type === 'kahani') item = kahanis.find(k => k.id === editingId);
        
        if (item && item._rowIndex) sheetData._rowIndex = item._rowIndex;

        const result = await googleSheetsService.writeToSheet('update', tabName, sheetData, writeConfig);
        if (result.success) {
          setSuccess(result.message);
          setEditingId(null);
          setEditingType(null);
          fetchAllData();
        } else {
          throw new Error(result.message);
        }
      } else {
        const result = await googleSheetsService.writeToSheet('add', tabName, sheetData, writeConfig);
        if (result.success) {
          setSuccess(result.message);
          fetchAllData();
        } else {
          throw new Error(result.message);
        }
      }
      
      // Reset forms
      if (type === 'notification') { 
        setNotifTitle(''); 
        setNotifMsg(''); 
        setNotifImageUrl('');
        setNotifAuthor('');
        setNotifType('Announcement');
      }
      else if (type === 'media') { setMediaTitle(''); setMediaUrl(''); setMediaDescription(''); }
      else if (type === 'study') { 
        setStudySubject(''); 
        setStudyTitle(''); 
        setStudyUrl('');
        setStudyType('pdf');
        setStudyVideos([{ title: '', url: '' }]);
        setStudyNotesUrl('');
        setStudyReadUrl('');
        setStudyHomeworkUrls(['']);
      }
      else if (type === 'topper') {
        setTopperName('');
        setTopperClass('');
        setTopperImageUrl('');
        setTopperDescription('');
        setTopperDate('');
      } else if (type === 'user') {
        setNewUsername('');
        setNewPassword('');
        setNewUserRole('student');
      } else if (type === 'test') {
        setTestTitle('');
        setTestClass('10');
        setTestSubject('Maths');
        setTestDuration('30');
        setTestStatus('Draft');
        setTestMarksPerQuestion('1');
        setTestNegativeMarks('0');
      } else if (type === 'test_question') {
        setTestQuestion('');
        setTestOptions(['', '', '', '']);
        setTestAnswer('');
        setTestExplanation('');
      } else if (type === 'notice') {
        setNoticeText('');
        setNoticeDate('');
      } else if (type === 'pre_primary') {
        setPrePrimaryClass('L.K.G');
        setPrePrimarySubject('Hindi Alphabet');
        setPrePrimaryImages(['']);
      } else if (type === 'kahani') {
        setKahaniTitle('');
        setKahaniCoverImage('');
        setKahaniAudioUrl('');
        setKahaniMoral('');
        setKahaniContent([{ type: 'paragraph', value: '' }]);
        setKahaniCategory('Popular Stories');
      }

    } catch (err: any) {
      console.error(err);
      setError(`Error: ${err.message || 'Something went wrong'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any, type: string) => {
    setEditingId(item.id);
    setEditingType(type);
    
    if (type === 'study') {
      setStudyLevel(item.level);
      setStudyClass(item.className);
      setStudySubject(item.subject);
      setStudyTitle(item.title);
      setStudyVideos(item.videos || [{ title: '', url: '' }]);
      setStudyNotesUrl(item.notesUrl || '');
      setStudyReadUrl(item.readUrl || '');
      setStudyHomeworkUrls(item.homeworkUrls || ['']);
    } else if (type === 'notification') {
      setNotifTitle(item.title);
      setNotifMsg(item.message);
      setNotifImageUrl(item.imageUrl || '');
      setNotifAuthor(item.author || '');
      setNotifType(item.type || 'Announcement');
    } else if (type === 'media') {
      setMediaTitle(item.title);
      setMediaUrl(item.url);
      setMediaDescription(item.description || '');
      setMediaType(photos.some(p => p.id === item.id) ? 'photos' : 'videos');
    } else if (type === 'topper') {
      setTopperName(item.name);
      setTopperClass(item.className);
      setTopperImageUrl(item.imageUrl);
      setTopperDescription(item.description);
      setTopperDate(item.date);
    } else if (type === 'test') {
      setTestTitle(item.title);
      setTestClass(item.className);
      setTestSubject(item.subject);
      setTestDuration(item.duration);
      setTestStatus(item.status || 'Draft');
      setTestMarksPerQuestion(item.marksperquestion || '1');
      setTestNegativeMarks(item.negativemarks || '0');
    } else if (type === 'test_question') {
      setTestQuestion(item.question);
      setTestQuestionImage(item.imageUrl || '');
      setTestOptions(item.options);
      setTestAnswer(item.answer);
      setTestExplanation(item.explanation || '');
    } else if (type === 'notice') {
      setNoticeText(item.text);
      setNoticeDate(item.date);
    } else if (type === 'pre_primary') {
      setPrePrimaryClass(item.className);
      setPrePrimarySubject(item.subject);
      setPrePrimaryImages(item.images || ['']);
    } else if (type === 'kahani') {
      setKahaniTitle(item.title);
      setKahaniCoverImage(item.coverImage);
      setKahaniAudioUrl(item.audioUrl || '');
      setKahaniMoral(item.moral || '');
      setKahaniContent(item.content || [{ type: 'paragraph', value: '' }]);
      setKahaniCategory(item.category || 'Popular Stories');
    }
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string, colName: string) => {
    setDeleteTarget({ id, col: colName });
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      const tabMap: any = {
        'notifications': 'Notifications',
        'photos': 'Gallery',
        'videos': 'Gallery',
        'study_materials': 'StudyMaterials',
        'toppers': 'Toppers',
        'users': 'Users',
        'tests': 'Tests',
        'test_questions': 'TestQuestions',
        'test_results': 'TestResults',
        'notice': 'NoticeBoard',
        'kahanis': 'Kahanis'
      };
      const tabName = tabMap[deleteTarget.col] || deleteTarget.col;
      
      // Find the item to get _rowIndex
      let item: any = null;
      if (deleteTarget.col === 'notifications') item = notifications.find(n => n.id === deleteTarget.id);
      else if (deleteTarget.col === 'photos') item = photos.find(p => p.id === deleteTarget.id);
      else if (deleteTarget.col === 'videos') item = videos.find(v => v.id === deleteTarget.id);
      else if (deleteTarget.col === 'study_materials') item = materials.find(m => m.id === deleteTarget.id);
      else if (deleteTarget.col === 'toppers') item = toppers.find(t => t.id === deleteTarget.id);
      else if (deleteTarget.col === 'users') item = users.find(u => u.id === deleteTarget.id);
      else if (deleteTarget.col === 'tests') item = tests.find(t => t.id === deleteTarget.id);
      else if (deleteTarget.col === 'test_questions') item = testQuestions.find(tq => tq.id === deleteTarget.id);
      else if (deleteTarget.col === 'test_results') item = testResults.find(tr => tr.id === deleteTarget.id);
      else if (deleteTarget.col === 'notice') item = noticeBoard.find(n => n.id === deleteTarget.id);
      else if (deleteTarget.col === 'pre_primary_content') item = prePrimaryContent.find(p => p.id === deleteTarget.id);
      else if (deleteTarget.col === 'kahanis') item = kahanis.find(k => k.id === deleteTarget.id);

      if (item && item._rowIndex) {
        const isTestRelated = deleteTarget.col === 'tests' || deleteTarget.col === 'test_questions' || deleteTarget.col === 'test_results';
        const config = (isTestRelated && testSheetId) ? {
          sheetId: testSheetId,
          scriptUrl: testScriptUrl || scriptUrl
        } : undefined;

        const result = await googleSheetsService.writeToSheet('delete', tabName, { _rowIndex: item._rowIndex }, config);
        if (result.success) {
          setSuccess(result.message);
          fetchAllData();
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Could not find row index for deletion.');
      }
    } catch (err: any) {
      setError(`Delete failed: ${err.message}`);
    } finally {
      setLoading(false);
      setDeleteTarget(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingType(null);
    // Reset forms
    setNotifTitle(''); 
    setNotifMsg('');
    setNotifImageUrl('');
    setNotifAuthor('');
    setNotifType('Announcement');
    setMediaTitle(''); 
    setMediaUrl(''); 
    setMediaDescription('');
    setStudyTitle(''); setStudyUrl(''); setStudyType('pdf');
    setStudyVideos([{ title: '', url: '' }]); setStudyNotesUrl(''); setStudyReadUrl(''); setStudyHomeworkUrls(['']);
    setTopperName(''); setTopperClass(''); setTopperImageUrl(''); setTopperDescription(''); setTopperDate('');
    setNoticeText(''); setNoticeDate('');
    setPrePrimaryClass('L.K.G'); setPrePrimarySubject('Hindi Alphabet'); setPrePrimaryImages(['']);
    setTestTitle(''); setTestClass('10'); setTestSubject('Maths'); setTestDuration('30'); setTestStatus('Draft'); setTestMarksPerQuestion('1'); setTestNegativeMarks('0');
    setTestQuestion(''); setTestQuestionImage(''); setTestOptions(['', '', '', '']); setTestAnswer(''); setTestExplanation('');
    setKahaniTitle(''); setKahaniCoverImage(''); setKahaniAudioUrl(''); setKahaniMoral(''); setKahaniContent([{ type: 'paragraph', value: '' }]); setKahaniCategory('Popular Stories');
  };

  const handleSaveMainConfig = () => {
    setLoading(true);
    try {
      googleSheetsService.setSheetId(sheetId);
      googleSheetsService.setScriptUrl(scriptUrl);
      localStorage.setItem('sheetId', sheetId);
      localStorage.setItem('scriptUrl', scriptUrl);
      localStorage.setItem('isSheetsEnabled', String(isSheetsEnabled));
      setSuccess('Main Configuration saved successfully!');
      if (isSheetsEnabled && sheetId) {
        fetchAllData();
      }
    } catch (err: any) {
      setError(`Failed to save main config: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRunSetup = async () => {
    if (!scriptUrl) {
      setError('Please set the Deployment URL first.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    try {
      const result = await googleSheetsService.runSetup({ sheetId, scriptUrl });
      if (result.success) {
        setSuccess('Google Sheets Setup Successful! All tabs and headers are ready.');
      } else {
        setError(result.message || 'Setup failed.');
      }
    } catch (err) {
      setError('An error occurred during setup.');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
    }
  };

  const handleRunTestSetup = async () => {
    if (!testScriptUrl) {
      setError('Please set the Test Deployment URL first.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    try {
      const result = await googleSheetsService.runSetup({ sheetId: testSheetId, scriptUrl: testScriptUrl });
      if (result.success) {
        setSuccess('Test Series Sheets Setup Successful! All tabs and headers are ready.');
      } else {
        setError(result.message || 'Setup failed.');
      }
    } catch (err) {
      setError('An error occurred during setup.');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
    }
  };

  const handleSaveTestConfig = () => {
    setLoading(true);
    try {
      localStorage.setItem('testSheetId', testSheetId);
      localStorage.setItem('testScriptUrl', testScriptUrl);
      setSuccess('Test Series Configuration saved successfully!');
      if (isSheetsEnabled && testSheetId) {
        fetchAllData();
      }
    } catch (err: any) {
      setError(`Failed to save test config: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestMainConnection = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      googleSheetsService.setSheetId(sheetId);
      googleSheetsService.setScriptUrl(scriptUrl);
      const result = await googleSheetsService.testConnection();
      if (result.success) {
        setSuccess(`Main Sheet: ${result.message}`);
      } else {
        setError(`Main Sheet: ${result.message}`);
      }
    } catch (err: any) {
      setError(`Test failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestSeriesConnection = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (!testSheetId) {
        setError('Please enter a Test Spreadsheet ID to test.');
        setLoading(false);
        return;
      }
      const testResult = await googleSheetsService.testConnection({
        sheetId: testSheetId,
        scriptUrl: testScriptUrl || scriptUrl
      });
      if (testResult.success) {
        setSuccess(`Test Sheet: ${testResult.message}`);
      } else {
        setError(`Test Sheet: ${testResult.message}`);
      }
    } catch (err: any) {
      setError(`Test failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-8 space-y-8 bg-slate-50 min-h-screen pb-32"
    >
      <div className="flex flex-col items-center gap-4 mb-10">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 bg-brand-primary rounded-3xl flex items-center justify-center shadow-lg shadow-brand-primary/20"
        >
          <Settings className="text-white" size={32} />
        </motion.div>
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Control</h1>
          <p className="text-gray-500 text-sm font-medium">Manage your institution's digital presence</p>
        </div>
        
        {currentUser && (
          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-2 text-xs font-bold text-brand-primary bg-white px-4 py-2 rounded-2xl shadow-sm border border-brand-primary/10"
          >
            <ShieldCheck size={14} />
            <span>{currentUser.email}</span>
          </motion.div>
        )}
      </div>
      
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-center font-bold border border-emerald-100 shadow-sm"
          >
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-rose-50 text-rose-700 p-4 rounded-2xl text-center font-bold border border-rose-100 shadow-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Navigation Grid */}
      {!activeTab && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
        >
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all group"
            >
              <div className={`p-4 ${tab.bgColor} ${tab.color} rounded-2xl group-hover:scale-110 transition-transform`}>
                <tab.icon size={28} />
              </div>
              <span className="font-bold text-slate-700 text-sm">{tab.label}</span>
            </motion.button>
          ))}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {/* Google Sheets Configuration */}
        {activeTab === 'config' && (
          <motion.section 
            key="config"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="space-y-6"
          >
            {/* Main App Data Sync Card */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-emerald-600">
                  <div className="p-2 bg-emerald-50 rounded-xl">
                    <Database size={24} />
                  </div>
                  <h2 className="text-xl font-black tracking-tight">Main App Data Sync</h2>
                </div>
                <button 
                  onClick={() => setActiveTab(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-[13px] text-blue-700 leading-relaxed flex gap-3">
                <Sparkles className="shrink-0 text-blue-500" size={18} />
                <p>
                  <strong>Smart Sync:</strong> Connect your Google Sheet to manage app data effortlessly. 
                  Changes here will reflect instantly across the app.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all">
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      id="enableSheets" 
                      checked={isSheetsEnabled} 
                      onChange={(e) => setIsSheetsEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </div>
                  <label htmlFor="enableSheets" className="text-sm font-bold text-slate-700">Enable Google Sheets Integration</label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Spreadsheet ID</label>
                    <input 
                      value={sheetId} 
                      onChange={(e) => setSheetId(e.target.value)} 
                      placeholder="Enter Sheet ID" 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-medium" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Deployment URL</label>
                    <input 
                      value={scriptUrl} 
                      onChange={(e) => setScriptUrl(e.target.value)} 
                      placeholder="https://script.google.com/..." 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-medium" 
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button 
                    whileTap={{ scale: 0.98 }}
                    onClick={handleTestMainConnection} 
                    disabled={loading}
                    className="flex-1 bg-white border-2 border-emerald-600 text-emerald-600 p-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all shadow-sm"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : 'Test Link'}
                  </motion.button>
                  <motion.button 
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRunSetup} 
                    disabled={loading}
                    className="flex-1 bg-white border-2 border-blue-600 text-blue-600 p-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-50 transition-all shadow-sm"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : 'Run Setup'}
                  </motion.button>
                  <motion.button 
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveMainConfig} 
                    disabled={loading}
                    className="flex-1 bg-emerald-600 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : 'Apply Changes'}
                  </motion.button>
                </div>

                {isSheetsEnabled && sheetId && (
                  <motion.a 
                    whileTap={{ scale: 0.98 }}
                    href={`https://docs.google.com/spreadsheets/d/${sheetId}/edit`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full bg-slate-900 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-200"
                  >
                    <Database size={20} className="text-emerald-400" /> 
                    Open Source Spreadsheet
                  </motion.a>
                )}
              </div>

              <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                <h4 className="text-[11px] font-black text-slate-500 mb-3 uppercase tracking-widest">Required Structure:</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {['Notifications', 'Gallery', 'StudyMaterials', 'Toppers', 'PrePrimaryContent'].map(tab => (
                    <div key={tab} className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                      {tab}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Test Series Data Sync Card */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
              <div className="flex items-center gap-3 text-cyan-600">
                <div className="p-2 bg-cyan-50 rounded-xl">
                  <Sparkles size={24} />
                </div>
                <h2 className="text-xl font-black tracking-tight">Test Series Configuration</h2>
              </div>
              
              <p className="text-sm text-slate-500">
                Use a separate sheet for tests to keep your data organized. If left blank, the main sheet will be used.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Test Spreadsheet ID</label>
                  <input 
                    value={testSheetId} 
                    onChange={(e) => setTestSheetId(e.target.value)} 
                    placeholder="Enter Test Sheet ID" 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:bg-white outline-none transition-all font-medium" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Test Deployment URL</label>
                  <input 
                    value={testScriptUrl} 
                    onChange={(e) => setTestScriptUrl(e.target.value)} 
                    placeholder="https://script.google.com/..." 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:bg-white outline-none transition-all font-medium" 
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  onClick={handleTestSeriesConnection} 
                  disabled={loading}
                  className="flex-1 bg-white border-2 border-cyan-600 text-cyan-600 p-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-cyan-50 transition-all shadow-sm"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Test Link'}
                </motion.button>
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRunTestSetup} 
                  disabled={loading}
                  className="flex-1 bg-white border-2 border-cyan-600 text-cyan-600 p-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-cyan-50 transition-all shadow-sm"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Run Setup'}
                </motion.button>
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveTestConfig} 
                  disabled={loading}
                  className="flex-1 bg-cyan-600 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-200"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Apply Changes'}
                </motion.button>
              </div>

              {isSheetsEnabled && testSheetId && (
                <motion.a 
                  whileTap={{ scale: 0.98 }}
                  href={`https://docs.google.com/spreadsheets/d/${testSheetId}/edit`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-slate-900 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-200"
                >
                  <Database size={20} className="text-cyan-400" /> 
                  Open Test Spreadsheet
                </motion.a>
              )}

              <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                <h4 className="text-[11px] font-black text-slate-500 mb-3 uppercase tracking-widest">Required Structure:</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {['Tests', 'TestQuestions', 'TestResults'].map(tab => (
                    <div key={tab} className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                      {tab}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        )}

      {/* User Management Section */}
      {activeTab === 'users' && (
      <motion.section 
        key="users"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-indigo-600">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <User size={24} />
            </div>
            <h2 className="text-xl font-black tracking-tight">User Management</h2>
          </div>
          <button 
            onClick={() => setActiveTab(null)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={(e) => handleSubmit(e, 'user')} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
              <input 
                value={newUsername} 
                onChange={(e) => setNewUsername(e.target.value)} 
                placeholder="Username" 
                required 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <input 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                placeholder="Password" 
                required 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label>
              <select 
                value={newUserRole} 
                onChange={(e) => setNewUserRole(e.target.value)} 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium"
              >
                <option value="student">Student/Parent</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <motion.button 
            whileTap={{ scale: 0.98 }}
            disabled={loading} 
            className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Plus size={18} />} Add User
          </motion.button>
        </form>

        <div className="mt-8 space-y-4">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Users</h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
            {users.map((u, index) => (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                key={u.id} 
                className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 group hover:bg-white hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <User size={20} className="text-indigo-600" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-900 truncate text-sm">{u.username}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md ${
                        u.role === 'admin' ? 'bg-rose-100 text-rose-600' : 
                        u.role === 'teacher' ? 'bg-amber-100 text-amber-600' : 
                        'bg-blue-100 text-blue-600'
                      }`}>{u.role}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <motion.button 
                    whileTap={{ scale: 0.9 }} 
                    onClick={() => handleDelete(u.id, 'users')} 
                    className="p-2 text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
      )}

      {/* Test Series Section */}
      {activeTab === 'test_series' && (
      <motion.section 
        key="test_series"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-cyan-600">
            <div className="p-2 bg-cyan-50 rounded-xl">
              <Sparkles size={24} />
            </div>
            <h2 className="text-xl font-black tracking-tight">
              {activeTestId ? 'Manage Questions' : 'Test Series Manager'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {activeTestId && (
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => { setActiveTestId(null); setEditingId(null); setEditingType(null); }} 
                className="text-cyan-600 bg-cyan-50 px-3 py-1.5 rounded-xl flex items-center gap-1 text-xs font-black uppercase tracking-wider"
              >
                <X size={14} /> Back to Tests
              </motion.button>
            )}
            <button 
              onClick={() => setActiveTab(null)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>
        </div>

        {!activeTestId ? (
          <div className="space-y-8">
            {/* Create Test Form */}
            <form onSubmit={(e) => handleSubmit(e, 'test')} className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
                {editingType === 'test' ? 'Update Test' : 'Create New Test'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Test Title</label>
                  <input 
                    value={testTitle} 
                    onChange={(e) => setTestTitle(e.target.value)} 
                    placeholder="e.g. Mathematics Chapter 1" 
                    required 
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-medium" 
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Class</label>
                    <select 
                      value={testClass} 
                      onChange={(e) => setTestClass(e.target.value)} 
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-medium"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                    <select 
                      value={testSubject} 
                      onChange={(e) => setTestSubject(e.target.value)} 
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-medium"
                    >
                      {Array.from(new Set(
                        Object.values(SUBJECTS).flatMap(level => 
                          Object.values(level).flatMap(classSubjects => 
                            classSubjects.map(s => s.name)
                          )
                        )
                      )).sort().map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time (Min)</label>
                    <input 
                      type="number"
                      value={testDuration} 
                      onChange={(e) => setTestDuration(e.target.value)} 
                      placeholder="30" 
                      required 
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-medium" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                    <select 
                      value={testStatus} 
                      onChange={(e) => setTestStatus(e.target.value)} 
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-medium"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Active">Active</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Marks per Question</label>
                    <input 
                      type="number"
                      value={testMarksPerQuestion} 
                      onChange={(e) => setTestMarksPerQuestion(e.target.value)} 
                      placeholder="1" 
                      required 
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-medium" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Negative Marks</label>
                    <input 
                      type="number"
                      step="0.25"
                      value={testNegativeMarks} 
                      onChange={(e) => setTestNegativeMarks(e.target.value)} 
                      placeholder="0" 
                      required 
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-medium" 
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                {editingType === 'test' && (
                  <button 
                    type="button"
                    onClick={cancelEdit}
                    className="flex-1 py-4 bg-slate-200 text-slate-700 font-black rounded-2xl hover:bg-slate-300 transition-all"
                  >
                    Cancel
                  </button>
                )}
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  disabled={loading} 
                  className="flex-[2] bg-cyan-600 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-cyan-200 hover:bg-cyan-700 transition-all"
                >
                  {loading ? <Loader2 className="animate-spin" /> : (editingType === 'test' ? 'Update Test Info' : 'Create Test')}
                </motion.button>
              </div>
            </form>

            {/* Test List */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Available Tests</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tests.map((test) => {
                  const qCount = testQuestions.filter(q => q.testId === test.id).length;
                  return (
                    <motion.div 
                      key={test.id} 
                      className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4 hover:bg-white hover:shadow-md transition-all group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-900">{test.title}</h4>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-black uppercase bg-cyan-100 text-cyan-600 px-2 py-0.5 rounded-md">Class {test.className}</span>
                            <span className="text-[10px] font-black uppercase bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md">{test.subject}</span>
                            <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-600 px-2 py-0.5 rounded-md">{test.duration} Min</span>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                              test.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 
                              test.status === 'Closed' ? 'bg-rose-100 text-rose-600' : 
                              'bg-slate-200 text-slate-600'
                            }`}>{test.status || 'Draft'}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 mt-1">
                            <span>+{test.marksperquestion || 1} Marks</span>
                            <span>-{test.negativemarks || 0} Negative</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(test, 'test')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><Edit size={16} /></button>
                          <button onClick={() => handleDelete(test.id, 'tests')} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                        <div className="flex flex-col">
                          <p className={`text-[11px] font-bold ${qCount < 10 ? 'text-rose-500' : 'text-slate-400'}`}>
                            {qCount} Questions added
                          </p>
                          {qCount < 10 && <p className="text-[9px] text-rose-400 font-medium italic">Min 10 required</p>}
                        </div>
                        <button 
                          onClick={() => setActiveTestId(test.id)}
                          className="text-xs font-black text-blue-600 hover:underline flex items-center gap-1"
                        >
                          Manage Questions +
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
                {tests.length === 0 && (
                  <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium italic">No tests found. Please create one using the form above.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Add Question Form */}
            <form onSubmit={(e) => handleSubmit(e, 'test_question')} className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
                {editingType === 'test_question' ? 'Update Question' : 'Add New Question'}
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Question Text</label>
                  <textarea 
                    value={testQuestion} 
                    onChange={(e) => setTestQuestion(e.target.value)} 
                    placeholder="Enter the question here..." 
                    required 
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-medium" 
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Question Image URL (Optional)</label>
                  <input 
                    value={testQuestionImage} 
                    onChange={(e) => setTestQuestionImage(e.target.value)} 
                    placeholder="https://example.com/question-image.jpg" 
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-medium" 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {testOptions.map((opt, idx) => (
                    <div key={idx} className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Option {idx + 1}</label>
                      <input 
                        value={opt} 
                        onChange={(e) => {
                          const newOpts = [...testOptions];
                          newOpts[idx] = e.target.value;
                          setTestOptions(newOpts);
                        }} 
                        placeholder={`Option ${idx + 1}`} 
                        required 
                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-medium" 
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correct Answer</label>
                  <select 
                    value={testAnswer} 
                    onChange={(e) => setTestAnswer(e.target.value)} 
                    required
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-medium"
                  >
                    <option value="">Select Correct Option</option>
                    {testOptions.map((opt, idx) => opt && (
                      <option key={idx} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Explanation (Optional)</label>
                  <textarea 
                    value={testExplanation} 
                    onChange={(e) => setTestExplanation(e.target.value)} 
                    placeholder="Explain why this answer is correct..." 
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-medium" 
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                {editingType === 'test_question' && (
                  <button 
                    type="button"
                    onClick={cancelEdit}
                    className="flex-1 py-4 bg-slate-200 text-slate-700 font-black rounded-2xl hover:bg-slate-300 transition-all"
                  >
                    Cancel
                  </button>
                )}
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  disabled={loading} 
                  className="flex-[2] bg-cyan-600 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-cyan-200 hover:bg-cyan-700 transition-all"
                >
                  {loading ? <Loader2 className="animate-spin" /> : (editingType === 'test_question' ? 'Update Question' : 'Add Question')}
                </motion.button>
              </div>
            </form>

            {/* Question List for Active Test */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Questions in this Test</h3>
              <div className="space-y-3">
                {testQuestions.filter(q => q.testId === activeTestId).map((q, idx) => (
                  <motion.div 
                    key={q.id} 
                    className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 group hover:bg-white hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center shrink-0 font-bold text-cyan-600 text-xs">
                        {idx + 1}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-900 truncate text-sm">{q.question}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Ans: {q.answer}</p>
                          {q.explanation && (
                            <p className="text-[10px] text-slate-500 font-medium truncate max-w-[200px] md:max-w-xs">
                              Exp: {q.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => handleEdit(q, 'test_question')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(q.id, 'test_questions')} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.section>
      )}

      {/* Test Results Section */}
      {activeTab === 'test_results' && (
      <motion.section 
        key="test_results"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-indigo-600">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <Award size={24} />
            </div>
            <h2 className="text-xl font-black tracking-tight">Test Performance</h2>
          </div>
          <button 
            onClick={() => setActiveTab(null)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                  <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Test</th>
                  <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</th>
                  <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                  <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {testResults.sort((a, b) => b.completedAt.toDate().getTime() - a.completedAt.toDate().getTime()).map((res) => {
                  const test = tests.find(t => t.id === res.testId);
                  return (
                    <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                            {res.username?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-700 text-sm">{res.username}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-medium text-slate-600">{test?.title || 'Unknown Test'}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-800">{res.score}/{res.total}</span>
                          <span className={`text-[10px] font-bold ${parseFloat(res.percentage) >= 40 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {res.percentage}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs font-medium text-slate-500">{res.timeTaken}s</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs font-medium text-slate-500">{res.completedAt.toDate().toLocaleDateString()}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button 
                          onClick={() => handleDelete(res.id, 'test_results')}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {testResults.length === 0 && (
              <div className="text-center py-12 text-slate-400 italic text-sm">No test results recorded yet.</div>
            )}
          </div>
        </div>
      </motion.section>
      )}

      {/* Notification Section */}
      {activeTab === 'notification' && (
      <motion.section 
        key="notification"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-brand-primary">
            <div className="p-2 bg-brand-primary/10 rounded-xl">
              <Bell size={24} />
            </div>
            <h2 className="text-xl font-black tracking-tight">
              {editingType === 'notification' ? 'Update Alert' : 'Broadcast Alert'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {editingType === 'notification' && (
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={cancelEdit} 
                className="text-rose-500 bg-rose-50 px-3 py-1.5 rounded-xl flex items-center gap-1 text-xs font-black uppercase tracking-wider"
              >
                <X size={14} /> Cancel
              </motion.button>
            )}
            <button 
              onClick={() => setActiveTab(null)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>
        </div>
        
        {isSheetsEnabled && (
          <div className="p-3 bg-blue-50/50 text-blue-700 text-[11px] font-bold rounded-xl border border-blue-100 flex items-center gap-2">
            <Database size={14} /> Syncing with Google Sheets
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, 'notification')} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alert Title</label>
              <input 
                value={notifTitle} 
                onChange={(e) => setNotifTitle(e.target.value)} 
                placeholder="e.g. Important Announcement" 
                required 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:bg-white outline-none transition-all font-medium" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alert Type</label>
              <select 
                value={notifType} 
                onChange={(e) => setNotifType(e.target.value)} 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:bg-white outline-none transition-all font-medium appearance-none"
              >
                <option value="Announcement">Announcement</option>
                <option value="Update">Update</option>
                <option value="Urgent">Urgent</option>
                <option value="Event">Event</option>
                <option value="Holiday">Holiday</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Author Name</label>
              <input 
                value={notifAuthor} 
                onChange={(e) => setNotifAuthor(e.target.value)} 
                placeholder="e.g. Principal / Admin" 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:bg-white outline-none transition-all font-medium" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Image URL (Optional)</label>
              <input 
                value={notifImageUrl} 
                onChange={(e) => setNotifImageUrl(e.target.value)} 
                placeholder="https://example.com/image.jpg" 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:bg-white outline-none transition-all font-medium" 
              />
            </div>
          </div>

          {notifImageUrl && (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
              <img 
                src={notifImageUrl} 
                alt="Preview" 
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000&auto=format&fit=crop')}
              />
              <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">
                Image Preview
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message Content</label>
            <textarea 
              value={notifMsg} 
              onChange={(e) => setNotifMsg(e.target.value)} 
              placeholder="Type your message here..." 
              required 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:bg-white outline-none transition-all font-medium" 
              rows={3} 
            />
          </div>
          <motion.button 
            whileTap={{ scale: 0.98 }}
            disabled={loading} 
            className="w-full bg-brand-primary text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 hover:bg-brand-secondary transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : (editingType === 'notification' ? 'Save Changes' : <Send size={18} />)} 
            {editingType === 'notification' ? '' : ' Send Broadcast'}
          </motion.button>
        </form>

        {/* List of Notifications */}
        <div className="mt-8 space-y-4">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Alert History</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
            {notifications.map((n, index) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                key={n.id} 
                className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 group hover:bg-white hover:shadow-md transition-all"
              >
                <div className="overflow-hidden">
                  <p className="font-bold text-slate-900 truncate text-sm">{n.title}</p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{n.message}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEdit(n, 'notification')} 
                    className="p-2 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <Edit size={16} />
                  </motion.button>
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(n.id, 'notifications')} 
                    className="p-2 text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
            {notifications.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm font-medium italic">No alerts sent yet</div>
            )}
          </div>
        </div>
      </motion.section>
      )}

      {/* Media Section */}
      {activeTab === 'media' && (
      <motion.section 
        key="media"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-brand-primary">
            <div className="p-2 bg-brand-primary/10 rounded-xl">
              <ImageIcon size={24} />
            </div>
            <h2 className="text-xl font-black tracking-tight">
              {editingType === 'media' ? 'Edit Media' : 'Gallery Upload'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {editingType === 'media' && (
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={cancelEdit} 
                className="text-rose-500 bg-rose-50 px-3 py-1.5 rounded-xl flex items-center gap-1 text-xs font-black uppercase tracking-wider"
              >
                <X size={14} /> Cancel
              </motion.button>
            )}
            <button 
              onClick={() => setActiveTab(null)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>
        </div>

        {isSheetsEnabled && (
          <div className="p-3 bg-blue-50/50 text-blue-700 text-[11px] font-bold rounded-xl border border-blue-100 flex items-center gap-2">
            <Database size={14} /> Syncing with Google Sheets
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, 'media')} className="space-y-6">
          <div className="flex p-1.5 bg-slate-100 rounded-2xl gap-1">
            <button 
              type="button" 
              onClick={() => setMediaType('photos')} 
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${mediaType === 'photos' ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Photo
            </button>
            <button 
              type="button" 
              onClick={() => setMediaType('videos')} 
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${mediaType === 'videos' ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Video
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Media Title</label>
              <input 
                value={mediaTitle} 
                onChange={(e) => setMediaTitle(e.target.value)} 
                placeholder="Enter title" 
                required 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:bg-white outline-none transition-all font-medium" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Source URL</label>
              <input 
                value={mediaUrl} 
                onChange={(e) => setMediaUrl(e.target.value)} 
                placeholder={mediaType === 'videos' ? "Paste YouTube URL" : "Paste Image URL"} 
                required 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:bg-white outline-none transition-all font-medium" 
              />
            </div>
          </div>

          {mediaType === 'photos' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description (Optional)</label>
              <textarea 
                value={mediaDescription} 
                onChange={(e) => setMediaDescription(e.target.value)} 
                placeholder="Tell us more about this photo (when, why, how)..." 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:bg-white outline-none transition-all font-medium" 
                rows={2}
              />
            </div>
          )}

          <motion.button 
            whileTap={{ scale: 0.98 }}
            disabled={loading} 
            className="w-full bg-brand-primary text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 hover:bg-brand-secondary transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : (editingType === 'media' ? 'Update Media' : `Publish ${mediaType === 'photos' ? 'Photo' : 'Video'}`)}
          </motion.button>
        </form>

        {/* List of Media */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Photos</h3>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 no-scrollbar">
              {photos.map((p, index) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  key={p.id} 
                  className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 group hover:bg-white hover:shadow-md transition-all"
                >
                  <p className="text-xs font-bold text-slate-700 truncate">{p.title}</p>
                  <div className="flex items-center gap-1 shrink-0">
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleEdit(p, 'media')} className="p-1.5 text-blue-600 bg-blue-50 rounded-lg"><Edit size={14} /></motion.button>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleDelete(p.id, 'photos')} className="p-1.5 text-rose-600 bg-rose-50 rounded-lg"><Trash2 size={14} /></motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Videos</h3>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 no-scrollbar">
              {videos.map((v, index) => {
                const videoId = v.url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)?.[2];
                const thumb = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
                return (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    key={v.id} 
                    className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 group hover:bg-white hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {thumb && (
                        <img src={thumb} alt="" className="w-12 h-8 object-cover rounded-lg shrink-0" />
                      )}
                      <p className="text-xs font-bold text-slate-700 truncate">{v.title}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleEdit(v, 'media')} className="p-1.5 text-blue-600 bg-blue-50 rounded-lg"><Edit size={14} /></motion.button>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleDelete(v.id, 'videos')} className="p-1.5 text-rose-600 bg-rose-50 rounded-lg"><Trash2 size={14} /></motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.section>
      )}


      {/* Study Material Section */}
      {activeTab === 'study' && (
      <motion.section 
        key="study"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-brand-primary">
            <div className="p-2 bg-brand-primary/10 rounded-xl">
              <BookOpen size={24} />
            </div>
            <h2 className="text-xl font-black tracking-tight">
              {editingType === 'study' ? 'Edit Material' : 'Study Resources'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {editingType === 'study' && (
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={cancelEdit} 
                className="text-rose-500 bg-rose-50 px-3 py-1.5 rounded-xl flex items-center gap-1 text-xs font-black uppercase tracking-wider"
              >
                <X size={14} /> Cancel
              </motion.button>
            )}
            <button 
              onClick={() => setActiveTab(null)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>
        </div>

        {isSheetsEnabled && (
          <div className="p-3 bg-blue-50/50 text-blue-700 text-[11px] font-bold rounded-xl border border-blue-100 flex items-center gap-2">
            <Database size={14} /> Syncing with Google Sheets
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, 'study')} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Level</label>
              <select 
                value={studyLevel} 
                onChange={(e) => {
                  const newLevel = e.target.value;
                  setStudyLevel(newLevel);
                  const firstClass = Object.keys(SUBJECTS[newLevel])[0];
                  setStudyClass(firstClass);
                  setStudySubject(SUBJECTS[newLevel][firstClass][0].name);
                }} 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:bg-white outline-none transition-all font-medium"
              >
                <option>Pre-Primary</option>
                <option>Primary (1st–5th)</option>
                <option>Upper Primary (6th–8th)</option>
                <option>High School (9th–10th)</option>
                <option>Intermediate (11th–12th)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Class</label>
              <select 
                value={studyClass} 
                onChange={(e) => {
                  const newClass = e.target.value;
                  setStudyClass(newClass);
                  setStudySubject(SUBJECTS[studyLevel][newClass][0].name);
                }} 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:bg-white outline-none transition-all font-medium"
              >
                {studyLevel === 'Pre-Primary' && <><option>L.K.G</option><option>U.K.G</option></>}
                {studyLevel === 'Primary (1st–5th)' && <><option>1st</option><option>2nd</option><option>3rd</option><option>4th</option><option>5th</option></>}
                {studyLevel === 'Upper Primary (6th–8th)' && <><option>6th</option><option>7th</option><option>8th</option></>}
                {studyLevel === 'High School (9th–10th)' && <><option>9th</option><option>10th</option></>}
                {studyLevel === 'Intermediate (11th–12th)' && <><option>11th</option><option>12th</option></>}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
            <select 
              value={studySubject} 
              onChange={(e) => setStudySubject(e.target.value)} 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:bg-white outline-none transition-all font-medium"
            >
              {SUBJECTS[studyLevel]?.[studyClass]?.map((sub: any) => (
                <option key={sub.name} value={sub.name}>{sub.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Resource Title</label>
              <input 
                value={studyTitle} 
                onChange={(e) => setStudyTitle(e.target.value)} 
                placeholder="e.g. Chapter 1 Resources" 
                required 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:bg-white outline-none transition-all font-medium" 
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-800">Chapter Resources</h4>
            
            {/* Videos */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">YouTube Videos</label>
              {studyVideos.map((video, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Video Title</label>
                    <input 
                      value={video.title}
                      onChange={(e) => {
                        const newVideos = [...studyVideos];
                        newVideos[index].title = e.target.value;
                        setStudyVideos(newVideos);
                      }}
                      placeholder="Enter Video Title"
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">YouTube URL</label>
                    <input 
                      value={video.url}
                      onChange={(e) => {
                        const newVideos = [...studyVideos];
                        newVideos[index].url = e.target.value;
                        setStudyVideos(newVideos);
                      }}
                      placeholder="Paste YouTube URL"
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>
                  <div className="absolute top-2 right-2">
                    {index === studyVideos.length - 1 ? (
                      <button type="button" onClick={() => setStudyVideos([...studyVideos, { title: '', url: '' }])} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"><Plus size={16} /></button>
                    ) : (
                      <button type="button" onClick={() => setStudyVideos(studyVideos.filter((_, i) => i !== index))} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"><X size={16} /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Notes URL */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes PDF URL</label>
              <input 
                value={studyNotesUrl} 
                onChange={(e) => setStudyNotesUrl(e.target.value)} 
                placeholder="Paste Notes PDF URL here" 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:bg-white outline-none transition-all font-medium" 
              />
            </div>

            {/* Read URL */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Read Book PDF URL</label>
              <input 
                value={studyReadUrl} 
                onChange={(e) => setStudyReadUrl(e.target.value)} 
                placeholder="Paste Book PDF URL here" 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:bg-white outline-none transition-all font-medium" 
              />
            </div>

            {/* Homework URLs */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Homework URLs (PDF/Image)</label>
              {studyHomeworkUrls.map((url, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input 
                    value={url}
                    onChange={(e) => {
                      const newUrls = [...studyHomeworkUrls];
                      newUrls[index] = e.target.value;
                      setStudyHomeworkUrls(newUrls);
                    }}
                    placeholder="Homework URL"
                    className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                  />
                  {index === studyHomeworkUrls.length - 1 ? (
                    <button type="button" onClick={() => setStudyHomeworkUrls([...studyHomeworkUrls, ''])} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Plus size={18} /></button>
                  ) : (
                    <button type="button" onClick={() => setStudyHomeworkUrls(studyHomeworkUrls.filter((_, i) => i !== index))} className="p-3 bg-rose-50 text-rose-600 rounded-xl"><X size={18} /></button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <motion.button 
            whileTap={{ scale: 0.98 }}
            disabled={loading} 
            className="w-full bg-brand-primary text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 hover:bg-brand-secondary transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : (editingType === 'study' ? 'Update Resource' : 'Add Resource')}
          </motion.button>
        </form>

        {/* List of Materials */}
        <div className="mt-8 space-y-4">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Resource Library</h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
            {materials.map((m, index) => (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                key={m.id} 
                className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 group hover:bg-white hover:shadow-md transition-all"
              >
                <div className="overflow-hidden">
                  <p className="font-bold text-slate-900 truncate text-sm">{m.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black uppercase tracking-tighter bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md">{m.className}</span>
                    <span className="text-[9px] font-black uppercase tracking-tighter bg-brand-primary/10 text-brand-primary px-1.5 py-0.5 rounded-md">{m.subject}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleEdit(m, 'study')} className="p-2 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"><Edit size={16} /></motion.button>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleDelete(m.id, 'study_materials')} className="p-2 text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"><Trash2 size={16} /></motion.button>
                </div>
              </motion.div>
            ))}
            {materials.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm font-medium italic">No resources added yet</div>
            )}
          </div>
        </div>
      </motion.section>
      )}

      {/* Topper Section */}
      {activeTab === 'topper' && (
      <motion.section 
        key="topper"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-brand-primary">
            <div className="p-2 bg-brand-primary/10 rounded-xl">
              <Award size={24} />
            </div>
            <h2 className="text-xl font-black tracking-tight">
              {editingType === 'topper' ? 'Update Topper' : 'Add Topper'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {editingType === 'topper' && (
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={cancelEdit} 
                className="text-rose-500 bg-rose-50 px-3 py-1.5 rounded-xl flex items-center gap-1 text-xs font-black uppercase tracking-wider"
              >
                <X size={14} /> Cancel
              </motion.button>
            )}
            <button 
              onClick={() => setActiveTab(null)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>
        </div>

        {isSheetsEnabled && (
          <div className="p-3 bg-blue-50/50 text-blue-700 text-[11px] font-bold rounded-xl border border-blue-100 flex items-center gap-2">
            <Database size={14} /> Syncing with Google Sheets
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, 'topper')} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Topper Name</label>
              <input 
                value={topperName} 
                onChange={(e) => setTopperName(e.target.value)} 
                placeholder="e.g. John Doe" 
                required 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:bg-white outline-none transition-all font-medium" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Class</label>
              <select 
                value={topperClass} 
                onChange={(e) => setTopperClass(e.target.value)} 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:bg-white outline-none transition-all font-medium"
              >
                {Object.keys(TOPPERS_DATA).map(cls => (
                  <option key={cls} value={cls}>Class {cls}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Image URL</label>
            <input 
              value={topperImageUrl} 
              onChange={(e) => setTopperImageUrl(e.target.value)} 
              placeholder="Paste image URL here" 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:bg-white outline-none transition-all font-medium" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date/Year</label>
            <input 
              value={topperDate} 
              onChange={(e) => setTopperDate(e.target.value)} 
              placeholder="e.g. 2023-2024 or March 2024" 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:bg-white outline-none transition-all font-medium" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description/Achievement</label>
            <textarea 
              value={topperDescription} 
              onChange={(e) => setTopperDescription(e.target.value)} 
              placeholder="Describe the achievement..." 
              rows={3}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:bg-white outline-none transition-all font-medium resize-none" 
            />
          </div>

          <motion.button 
            whileTap={{ scale: 0.98 }}
            disabled={loading} 
            className="w-full bg-brand-primary text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 hover:bg-brand-secondary transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : (editingType === 'topper' ? 'Update Topper' : 'Add Topper')}
          </motion.button>
        </form>

        {/* List of Toppers */}
        <div className="mt-8 space-y-4">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Toppers List</h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
            {toppers.map((t, index) => (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                key={t.id} 
                className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 group hover:bg-white hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  {t.imageUrl ? (
                    <img src={t.imageUrl} alt={t.name} className="w-10 h-10 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                      <Award size={20} className="text-slate-400" />
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-900 truncate text-sm">{t.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-black uppercase tracking-tighter bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md">Class {t.className}</span>
                      {t.date && <span className="text-[9px] font-black uppercase tracking-tighter bg-brand-primary/10 text-brand-primary px-1.5 py-0.5 rounded-md">{t.date}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleEdit(t, 'topper')} className="p-2 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"><Edit size={16} /></motion.button>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleDelete(t.id, 'toppers')} className="p-2 text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"><Trash2 size={16} /></motion.button>
                </div>
              </motion.div>
            ))}
            {toppers.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm font-medium italic">No toppers added yet</div>
            )}
          </div>
        </div>
      </motion.section>
      )}

      {/* Notice Board Section */}
      {activeTab === 'notice' && (
      <motion.section 
        key="notice"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-orange-600">
            <div className="p-2 bg-orange-50 rounded-xl">
              <Bell size={24} />
            </div>
            <h2 className="text-xl font-black tracking-tight">
              {editingType === 'notice' ? 'Edit Notice' : 'Notice Board Manager'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {editingType === 'notice' && (
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={cancelEdit} 
                className="text-rose-500 bg-rose-50 px-3 py-1.5 rounded-xl flex items-center gap-1 text-xs font-black uppercase tracking-wider"
              >
                <X size={14} /> Cancel
              </motion.button>
            )}
            <button 
              onClick={() => setActiveTab(null)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>
        </div>

        <form onSubmit={(e) => handleSubmit(e, 'notice')} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notice Text</label>
            <textarea 
              value={noticeText} 
              onChange={(e) => setNoticeText(e.target.value)} 
              placeholder="e.g. Diwali Holidays from 20th to 25th Oct." 
              required 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all font-medium" 
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Display Date (Optional)</label>
            <input 
              value={noticeDate} 
              onChange={(e) => setNoticeDate(e.target.value)} 
              placeholder="e.g. 15 Oct (Leave blank for today)" 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all font-medium" 
            />
          </div>
          <motion.button 
            whileTap={{ scale: 0.98 }}
            disabled={loading} 
            className="w-full bg-orange-600 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : (editingType === 'notice' ? 'Update Notice' : 'Add to Notice Board')}
          </motion.button>
        </form>

        <div className="mt-8 space-y-4">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Notices</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
            {noticeBoard.map((n, index) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                key={n.id} 
                className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 group hover:bg-white hover:shadow-md transition-all"
              >
                <div className="flex gap-3 items-start overflow-hidden">
                  <div className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap">
                    {n.date}
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed truncate">{n.text}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleEdit(n, 'notice')} className="p-2 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"><Edit size={16} /></motion.button>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleDelete(n.id, 'notice')} className="p-2 text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"><Trash2 size={16} /></motion.button>
                </div>
              </motion.div>
            ))}
            {noticeBoard.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm font-medium italic">No notices yet</div>
            )}
          </div>
        </div>
      </motion.section>
      )}

      {activeTab === 'pre_primary' && (
      <motion.section 
        key="pre_primary"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-pink-600">
            <div className="p-2 bg-pink-50 rounded-xl">
              <Sparkles size={24} />
            </div>
            <h2 className="text-xl font-black tracking-tight">
              {editingType === 'pre_primary' ? 'Edit Pre-Primary Content' : 'Pre-Primary Content Manager'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {editingType === 'pre_primary' && (
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={cancelEdit} 
                className="text-rose-500 bg-rose-50 px-3 py-1.5 rounded-xl flex items-center gap-1 text-xs font-black uppercase tracking-wider"
              >
                <X size={14} /> Cancel
              </motion.button>
            )}
            <button 
              onClick={() => setActiveTab(null)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>
        </div>

        <form onSubmit={(e) => handleSubmit(e, 'pre_primary')} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Class</label>
              <select 
                value={prePrimaryClass} 
                onChange={(e) => setPrePrimaryClass(e.target.value)} 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
              >
                <option value="L.K.G">L.K.G</option>
                <option value="U.K.G">U.K.G</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
              <select 
                value={prePrimarySubject} 
                onChange={(e) => setPrePrimarySubject(e.target.value)} 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
              >
                {['Hindi Alphabet', 'English Alphabet', 'Counting', 'Color Recognition', 'Shape Recognition', 'Hindi Writing', 'English Writing', 'Number Writing'].map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Image URLs (Sequence)</label>
              <button 
                type="button"
                onClick={() => setPrePrimaryImages([...prePrimaryImages, ''])}
                className="flex items-center gap-1 text-[10px] font-black text-pink-600 uppercase tracking-widest hover:text-pink-700 transition-colors"
              >
                <Plus size={12} /> Add Image
              </button>
            </div>
            <div className="space-y-3">
              {prePrimaryImages.map((img, idx) => (
                <div key={idx} className="flex gap-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 font-bold text-slate-400 text-xs">
                    {idx + 1}
                  </div>
                  <input 
                    type="url" 
                    value={img} 
                    onChange={(e) => {
                      const newImgs = [...prePrimaryImages];
                      newImgs[idx] = e.target.value;
                      setPrePrimaryImages(newImgs);
                    }} 
                    placeholder="https://example.com/image.jpg" 
                    required
                    className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:bg-white outline-none transition-all font-medium text-sm" 
                  />
                  {prePrimaryImages.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => setPrePrimaryImages(prePrimaryImages.filter((_, i) => i !== idx))}
                      className="p-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <motion.button 
            whileTap={{ scale: 0.98 }}
            disabled={loading} 
            className="w-full bg-pink-600 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-pink-600/20 hover:bg-pink-700 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : (editingType === 'pre_primary' ? 'Update Content' : 'Add Pre-Primary Content')}
          </motion.button>
        </form>

        <div className="mt-8 space-y-4">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Existing Content</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
            {prePrimaryContent.map((item, index) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                key={item.id} 
                className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 group hover:bg-white hover:shadow-md transition-all"
              >
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-[9px] font-black rounded-full uppercase tracking-widest">
                      {item.className}
                    </span>
                    <p className="font-bold text-slate-900 truncate text-sm">{item.subject}</p>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                    {item.images?.length || 0} Images
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleEdit(item, 'pre_primary')} className="p-2 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"><Edit size={16} /></motion.button>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleDelete(item.id, 'pre_primary_content')} className="p-2 text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"><Trash2 size={16} /></motion.button>
                </div>
              </motion.div>
            ))}
            {prePrimaryContent.length === 0 && (
              <div className="col-span-full text-center py-8 text-slate-400 text-sm font-medium italic">No pre-primary content yet</div>
            )}
          </div>
        </div>
      </motion.section>
      )}

      {activeTab === 'kahani' && (
      <motion.section 
        key="kahani"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-fuchsia-600">
            <div className="p-2 bg-fuchsia-50 rounded-xl">
              <BookOpen size={24} />
            </div>
            <h2 className="text-xl font-black tracking-tight">
              {editingType === 'kahani' ? 'Edit Kahani' : 'Kahani Manager'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {editingType === 'kahani' && (
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={cancelEdit} 
                className="text-rose-500 bg-rose-50 px-3 py-1.5 rounded-xl flex items-center gap-1 text-xs font-black uppercase tracking-wider"
              >
                <X size={14} /> Cancel
              </motion.button>
            )}
            <button 
              onClick={() => setActiveTab(null)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>
        </div>

        <form onSubmit={(e) => handleSubmit(e, 'kahani')} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
              <input 
                value={kahaniTitle} 
                onChange={(e) => setKahaniTitle(e.target.value)} 
                placeholder="Story Title" 
                required
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-fuchsia-500 focus:bg-white outline-none transition-all font-bold text-slate-700" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
              <select 
                value={kahaniCategory} 
                onChange={(e) => setKahaniCategory(e.target.value)} 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-fuchsia-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
              >
                <option value="Popular Stories">Popular Stories</option>
                <option value="Adventure Stories">Adventure Stories</option>
                <option value="Moral Stories">Moral Stories</option>
                <option value="Bedtime Stories">Bedtime Stories</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cover Image URL</label>
              <input 
                value={kahaniCoverImage} 
                onChange={(e) => setKahaniCoverImage(e.target.value)} 
                placeholder="https://example.com/cover.jpg" 
                required
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-fuchsia-500 focus:bg-white outline-none transition-all font-medium" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Audio URL (Optional)</label>
              <input 
                value={kahaniAudioUrl} 
                onChange={(e) => setKahaniAudioUrl(e.target.value)} 
                placeholder="https://example.com/audio.mp3" 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-fuchsia-500 focus:bg-white outline-none transition-all font-medium" 
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Story Content Builder</label>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setKahaniContent([...kahaniContent, { type: 'paragraph', value: '' }])}
                  className="flex items-center gap-1 text-[10px] font-black text-fuchsia-600 uppercase tracking-widest hover:text-fuchsia-700 transition-colors"
                >
                  <Plus size={12} /> Add Paragraph
                </button>
                <button 
                  type="button"
                  onClick={() => setKahaniContent([...kahaniContent, { type: 'image', value: '' }])}
                  className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
                >
                  <ImageIcon size={12} /> Add Image
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {kahaniContent.map((block, idx) => (
                <div key={idx} className="flex gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shrink-0 font-bold text-slate-400 text-xs shadow-sm">
                    {idx + 1}
                  </div>
                  
                  {block.type === 'paragraph' ? (
                    <textarea 
                      value={block.value} 
                      onChange={(e) => {
                        const newContent = [...kahaniContent];
                        newContent[idx].value = e.target.value;
                        setKahaniContent(newContent);
                      }} 
                      placeholder="Write a paragraph..." 
                      rows={3}
                      className="flex-1 p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all font-medium text-sm resize-none" 
                    />
                  ) : (
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-md">
                        <ImageIcon size={14} /> Image Block
                      </div>
                      <input 
                        type="url"
                        value={block.value} 
                        onChange={(e) => {
                          const newContent = [...kahaniContent];
                          newContent[idx].value = e.target.value;
                          setKahaniContent(newContent);
                        }} 
                        placeholder="https://example.com/image.jpg" 
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm" 
                      />
                    </div>
                  )}
                  
                  {kahaniContent.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => setKahaniContent(kahaniContent.filter((_, i) => i !== idx))}
                      className="p-2 h-fit text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Moral of the Story (Optional)</label>
            <input 
              value={kahaniMoral} 
              onChange={(e) => setKahaniMoral(e.target.value)} 
              placeholder="e.g., Honesty is the best policy." 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-fuchsia-500 focus:bg-white outline-none transition-all font-medium" 
            />
          </div>

          <motion.button 
            whileTap={{ scale: 0.98 }}
            disabled={loading} 
            className="w-full bg-fuchsia-600 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-600/20 hover:bg-fuchsia-700 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : (editingType === 'kahani' ? 'Update Kahani' : 'Add Kahani')}
          </motion.button>
        </form>

        <div className="mt-8 space-y-4">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Existing Kahanis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
            {kahanis.map((item, index) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                key={item.id} 
                className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 group hover:bg-white hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {item.coverImage && (
                    <img src={item.coverImage} alt={item.title} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  )}
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-fuchsia-100 text-fuchsia-700 text-[9px] font-black rounded-full uppercase tracking-widest">
                        {item.category}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 truncate text-sm">{item.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleEdit(item, 'kahani')} className="p-2 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"><Edit size={16} /></motion.button>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleDelete(item.id, 'kahanis')} className="p-2 text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"><Trash2 size={16} /></motion.button>
                </div>
              </motion.div>
            ))}
            {kahanis.length === 0 && (
              <div className="col-span-full text-center py-8 text-slate-400 text-sm font-medium italic">No kahanis yet</div>
            )}
          </div>
        </div>
      </motion.section>
      )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
      />
    </motion.div>
  );
};
