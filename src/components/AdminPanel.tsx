import React, { useState, useEffect } from 'react';
import { cn } from '@/src/lib/utils';
import { Send, Image as ImageIcon, Video, HelpCircle, BookOpen, Bell, Loader2, User, Users, Trash2, Edit, X, Database, Settings, ShieldCheck, Sparkles, Plus, Award, Phone, Mail, MapPin, QrCode, CreditCard, Trophy, CheckCircle, XCircle, Key } from 'lucide-react';
import { SUBJECTS, TOPPERS_DATA } from '../constants';
import { ConfirmModal } from './ConfirmModal';
import { firebaseService, AppData } from '../services/firebaseService';
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
  const [noticeBoard, setNoticeBoard] = useState<any[]>([]);
  const [prePrimaryContent, setPrePrimaryContent] = useState<any[]>([]);
  const [kahanis, setKahanis] = useState<any[]>([]);
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
  const [studyLevel, setStudyLevel] = useState('Primary (1st–5th)');
  const [studyClass, setStudyClass] = useState('1st');
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
  const [searchTerm, setSearchTerm] = useState('');
  const [kahaniAudioUrl, setKahaniAudioUrl] = useState('');
  const [kahaniMoral, setKahaniMoral] = useState('');
  const [kahaniContent, setKahaniContent] = useState([{ type: 'paragraph', value: '' }]);
  const [kahaniCategory, setKahaniCategory] = useState('Popular Stories');
  
  // App Settings Form
  const [homeImages, setHomeImages] = useState<string[]>(['']);
  const [successStories, setSuccessStories] = useState<any[]>([]);
  const [storyName, setStoryName] = useState('');
  const [storyExam, setStoryExam] = useState('');
  const [storyScore, setStoryScore] = useState('');
  const [storyText, setStoryText] = useState('');
  const [supportQR, setSupportQR] = useState('');
  const [supportUPI, setSupportUPI] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [aboutText, setAboutText] = useState('');
  const [commitmentImage, setCommitmentImage] = useState('');
  const [commitmentText, setCommitmentText] = useState('');
  const [aboutImage, setAboutImage] = useState('');
  const [contactImage, setContactImage] = useState('');
  const [infoImage, setInfoImage] = useState('');
  const [topperBanner, setTopperBanner] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [appSettings, setAppSettings] = useState<any[]>([]);
  
  // Teachers Form
  const [teacherName, setTeacherName] = useState('');
  const [teacherSubject, setTeacherSubject] = useState('');
  const [teacherDesignation, setTeacherDesignation] = useState('');
  const [teacherImageUrl, setTeacherImageUrl] = useState('');
  const [teachers, setTeachers] = useState<any[]>([]);
 
  const [toppers, setToppers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const currentUser = { 
    email: localStorage.getItem('username') || 'Admin',
    role: localStorage.getItem('userRole') || 'student'
  };

  const tabs = [
    { id: 'users', label: 'Users', icon: User, color: 'text-indigo-600', bgColor: 'bg-indigo-50', roles: ['admin'] },
    { id: 'notification', label: 'Alerts', icon: Bell, color: 'text-brand-primary', bgColor: 'bg-brand-primary/10', roles: ['admin', 'teacher'] },
    { id: 'media', label: 'Gallery', icon: ImageIcon, color: 'text-purple-600', bgColor: 'bg-purple-50', roles: ['admin', 'teacher'] },
    { id: 'test_series', label: 'Test Series', icon: Sparkles, color: 'text-cyan-600', bgColor: 'bg-cyan-50', roles: ['admin', 'teacher'] },
    { id: 'study', label: 'Study', icon: BookOpen, color: 'text-blue-600', bgColor: 'bg-blue-50', roles: ['admin', 'teacher'] },
    { id: 'topper', label: 'Toppers', icon: Award, color: 'text-rose-600', bgColor: 'bg-rose-50', roles: ['admin', 'teacher'] },
    { id: 'teachers', label: 'Teachers', icon: Users, color: 'text-emerald-600', bgColor: 'bg-emerald-50', roles: ['admin'] },
    { id: 'pre_primary', label: 'Pre-Primary', icon: Sparkles, color: 'text-pink-600', bgColor: 'bg-pink-50', roles: ['admin', 'teacher'] },
    { id: 'kahani', label: 'Kahani', icon: BookOpen, color: 'text-fuchsia-600', bgColor: 'bg-fuchsia-50', roles: ['admin', 'teacher'] },
    { id: 'notice', label: 'Notice', icon: Bell, color: 'text-orange-600', bgColor: 'bg-orange-50', roles: ['admin'] },
    { id: 'app_settings', label: 'App Settings', icon: Settings, color: 'text-slate-600', bgColor: 'bg-slate-100', roles: ['admin'] },
  ].filter(tab => tab.roles.includes(currentUser.role));

  useEffect(() => {
    if (initialEdit) {
      handleEdit(initialEdit.item, initialEdit.type);
      if (onClearInitialEdit) onClearInitialEdit();
    }
  }, [initialEdit]);

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const result = await firebaseService.updateUserStatus(userId, !currentStatus);
      if (result.success) {
        setSuccess(result.message);
        fetchAllData();
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeUserRole = async (userId: string, newRole: string) => {
    setLoading(true);
    try {
      const result = await firebaseService.updateUserStatus(userId, true, newRole);
      if (result.success) {
        setSuccess(result.message);
        fetchAllData();
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    if (!activeTab) return;
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const usersData = await firebaseService.fetchCollection('Users');
        setUsers(usersData.map((item: any) => ({
          id: item.id,
          username: item.username || item.name || '',
          name: item.name || '',
          fatherName: item.fatherName || '',
          mobile: item.mobile || '',
          email: item.email || '',
          role: item.role || 'student',
          active: item.active || false,
          className: item.className || '',
          subject: item.subject || '',
          createdAt: item.createdat ? { toDate: () => new Date(item.createdat) } : { toDate: () => new Date() },
          isFromSheet: false
        })).sort((a: any, b: any) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()));
      } else if (activeTab === 'test_series') {
        const [testsData, testQuestionsData] = await Promise.all([
          firebaseService.fetchCollection('Tests'),
          firebaseService.fetchCollection('TestQuestions')
        ]);
        setTests(testsData.map((item: any) => ({
          id: item.id,
          title: item.title,
          className: item.classname || item.className,
          subject: item.subject,
          duration: item.duration,
          status: item.status || 'Draft',
          marksperquestion: item.marksperquestion || 1,
          negativemarks: item.negativemarks || 0,
          createdAt: item.createdat ? { toDate: () => new Date(item.createdat) } : { toDate: () => new Date() },
          isFromSheet: false
        })).sort((a: any, b: any) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()));
        
        setTestQuestions(testQuestionsData.map((item: any) => ({
          id: item.id,
          testId: item.testid || item.testId,
          question: item.question,
          imageUrl: item.imageurl || '',
          options: [item.option1, item.option2, item.option3, item.option4].filter(Boolean),
          answer: item.answer,
          explanation: item.explanation || '',
          createdAt: item.createdat ? { toDate: () => new Date(item.createdat) } : { toDate: () => new Date() },
          isFromSheet: false
        })).sort((a: any, b: any) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()));
      } else if (activeTab === 'notification') {
        const notificationsData = await firebaseService.fetchCollection('Notifications');
        setNotifications(notificationsData.map((item: any) => ({
          id: item.id,
          title: item.title,
          message: item.message,
          imageUrl: item.imageurl || '',
          author: item.author || 'Admin',
          type: item.type || 'Announcement',
          createdAt: item.createdat ? { toDate: () => new Date(item.createdat) } : { toDate: () => new Date() },
          isFromSheet: false
        })).sort((a: any, b: any) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()));
      } else if (activeTab === 'media') {
        const galleryData = await firebaseService.fetchCollection('Gallery');
        const sheetPhotos = galleryData.filter((m: any) => (m.type || '').toLowerCase() === 'photo');
        const sheetVideos = galleryData.filter((m: any) => (m.type || '').toLowerCase() === 'video');
        
        setPhotos(sheetPhotos.map((item: any) => ({
          id: item.id,
          title: item.title,
          url: item.url,
          description: item.description || '',
          createdAt: item.createdat ? { toDate: () => new Date(item.createdat) } : { toDate: () => new Date() },
          isFromSheet: false
        })).sort((a: any, b: any) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()));

        setVideos(sheetVideos.map((item: any) => ({
          id: item.id,
          title: item.title,
          url: item.url,
          description: item.description || '',
          createdAt: item.createdat ? { toDate: () => new Date(item.createdat) } : { toDate: () => new Date() },
          isFromSheet: false
        })).sort((a: any, b: any) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()));
      } else if (activeTab === 'study') {
        const studyMaterialsData = await firebaseService.fetchCollection('StudyMaterials');
        setMaterials(studyMaterialsData.map((item: any) => ({
          id: item.id,
          title: item.title,
          videos: item.videos ? (typeof item.videos === 'string' ? JSON.parse(item.videos) : item.videos) : [],
          notesUrl: item.notesurl || '',
          readUrl: item.readurl || '',
          homeworkUrls: item.homeworkurls ? (typeof item.homeworkurls === 'string' ? JSON.parse(item.homeworkurls) : item.homeworkurls) : [],
          level: item.level,
          className: item.classname,
          subject: item.subject,
          createdAt: item.createdat ? { toDate: () => new Date(item.createdat) } : { toDate: () => new Date() },
          isFromSheet: false
        })).sort((a: any, b: any) => a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime()));
      } else if (activeTab === 'topper') {
        const toppersData = await firebaseService.fetchCollection('Toppers');
        setToppers(toppersData.map((item: any) => ({
          id: item.id,
          name: item.name,
          className: item.classname,
          imageUrl: item.imageurl,
          description: item.description,
          date: item.date,
          createdAt: item.createdat ? { toDate: () => new Date(item.createdat) } : { toDate: () => new Date() },
          isFromSheet: false
        })).sort((a: any, b: any) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()));
      } else if (activeTab === 'teachers') {
        const teachersData = await firebaseService.fetchCollection('Teachers');
        setTeachers(teachersData.map((item: any) => ({
          id: item.id,
          name: item.name,
          subject: item.subject,
          designation: item.designation,
          imageurl: item.imageurl,
          createdAt: item.createdat ? { toDate: () => new Date(item.createdat) } : { toDate: () => new Date() },
          isFromSheet: false
        })).sort((a: any, b: any) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()));
      } else if (activeTab === 'pre_primary') {
        const prePrimaryContentData = await firebaseService.fetchCollection('prePrimaryContent');
        setPrePrimaryContent(prePrimaryContentData.map((item: any) => ({
          id: item.id,
          className: item.classname,
          subject: item.subject,
          images: item.images ? (typeof item.images === 'string' ? JSON.parse(item.images) : item.images) : [],
          createdAt: item.createdat ? { toDate: () => new Date(item.createdat) } : { toDate: () => new Date() },
          isFromSheet: false
        })));
      } else if (activeTab === 'kahani') {
        const kahanisData = await firebaseService.fetchCollection('Kahanis');
        setKahanis(kahanisData.map((item: any) => ({
          id: item.id,
          title: item.title,
          coverImage: item.coverimage,
          audioUrl: item.audiourl,
          moral: item.moral,
          content: item.content ? (typeof item.content === 'string' ? JSON.parse(item.content) : item.content) : [],
          category: item.category || 'Popular Stories',
          createdAt: item.createdat ? { toDate: () => new Date(item.createdat) } : { toDate: () => new Date() },
          isFromSheet: false
        })).sort((a: any, b: any) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()));
      } else if (activeTab === 'notice') {
        const noticeBoardData = await firebaseService.fetchCollection('NoticeBoard');
        setNoticeBoard(noticeBoardData.map((item: any) => ({
          id: item.id,
          text: item.text,
          date: item.date,
          createdAt: item.createdat ? { toDate: () => new Date(item.createdat) } : { toDate: () => new Date() },
          isFromSheet: false
        })).sort((a: any, b: any) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()))      } else if (activeTab === 'app_settings') {
        const [appSettingsData, successStoriesData] = await Promise.all([
          firebaseService.fetchCollection('AppBasicSettings'),
          firebaseService.fetchCollection('SuccessStories')
        ]);
        setAppSettings(appSettingsData);
        
        const general = appSettingsData.find((s: any) => s.id === 'general');
        if (general) {
          try {
            setHomeImages(JSON.parse(general.home_images || '[""]'));
          } catch (e) {
            setHomeImages(['']);
          }
          setSupportQR(general.support_qr || '');
          setSupportUPI(general.support_upi || '');
          setContactPhone(general.contact_phone || '');
          setContactAddress(general.contact_address || '');
          setContactEmail(general.contact_email || '');
          setAboutText(general.about_text || '');
          setCommitmentImage(general.commitment_image || '');
          setCommitmentText(general.commitment_text || '');
          setAboutImage(general.about_image || '');
          setContactImage(general.contact_image || '');
          setInfoImage(general.info_image || '');
          setTopperBanner(general.topper_banner || '');
          setYoutubeUrl(general.youtube_url || '');
          setInstagramUrl(general.instagram_url || '');
          setFacebookUrl(general.facebook_url || '');
          setWhatsappNumber(general.whatsapp_number || '');
        } else {
          // Fallback to individual keys if 'general' doc doesn't exist yet
          const homeImgs = firebaseService.getSetting(appSettingsData, 'home_images', '[]');
          try {
            setHomeImages(JSON.parse(homeImgs));
          } catch (e) {
            setHomeImages(['']);
          }
          setSupportQR(firebaseService.getSetting(appSettingsData, 'support_qr', ''));
          setSupportUPI(firebaseService.getSetting(appSettingsData, 'support_upi', ''));
          setContactPhone(firebaseService.getSetting(appSettingsData, 'contact_phone', ''));
          setContactAddress(firebaseService.getSetting(appSettingsData, 'contact_address', ''));
          setContactEmail(firebaseService.getSetting(appSettingsData, 'contact_email', ''));
          setAboutText(firebaseService.getSetting(appSettingsData, 'about_text', ''));
          setCommitmentImage(firebaseService.getSetting(appSettingsData, 'commitment_image', ''));
          setCommitmentText(firebaseService.getSetting(appSettingsData, 'commitment_text', ''));
          setAboutImage(firebaseService.getSetting(appSettingsData, 'about_image', ''));
          setContactImage(firebaseService.getSetting(appSettingsData, 'contact_image', ''));
          setInfoImage(firebaseService.getSetting(appSettingsData, 'info_image', ''));
          setTopperBanner(firebaseService.getSetting(appSettingsData, 'topper_banner', ''));
        }

        setSuccessStories(successStoriesData.map((item: any) => ({
          id: item.id,
          name: item.name,
          exam: item.exam,
          score: item.score,
          text: item.text,
          createdAt: item.createdat ? { toDate: () => new Date(item.createdat) } : { toDate: () => new Date() },
          isFromSheet: false
        })).sort((a: any, b: any) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data from Database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab) {
      fetchAllData();
    }
  }, [activeTab]);

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
      } else if (type === 'teacher') {
        data = {
          ...data,
          name: teacherName,
          subject: teacherSubject,
          designation: teacherDesignation,
          imageurl: teacherImageUrl
        };
        colName = 'teachers';
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
        'pre_primary_content': 'prePrimaryContent',
        'kahanis': 'Kahanis'
      };
      const tabName = tabMap[colName] || colName;
      
      // Normalize keys (lowercase, no spaces) for consistency
      let normalizedData: any = {};
      Object.keys(data).forEach(key => {
        if (key !== 'createdAt') {
          const normalizedKey = key.toLowerCase().replace(/\s+/g, '');
          let value = data[key];
          if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
            value = JSON.stringify(value);
          }
          normalizedData[normalizedKey] = value;
        }
      });

      if (type === 'media') normalizedData.type = mediaType === 'photos' ? 'Photo' : 'Video';

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
        
        if (item && item.id) normalizedData.id = item.id;

        const result = await firebaseService.writeToCollection('update', tabName, normalizedData);
        if (result.success) {
          setSuccess(result.message);
          setEditingId(null);
          setEditingType(null);
          fetchAllData();
        } else {
          throw new Error(result.message);
        }
      } else {
        const result = await firebaseService.writeToCollection('add', tabName, normalizedData);
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
      } else if (type === 'teacher') {
        setTeacherName('');
        setTeacherSubject('');
        setTeacherDesignation('');
        setTeacherImageUrl('');
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
      setActiveTab('study');
      setStudyLevel(item.level);
      setStudyClass(item.className);
      setStudySubject(item.subject);
      setStudyTitle(item.title);
      setStudyVideos(item.videos || [{ title: '', url: '' }]);
      setStudyNotesUrl(item.notesUrl || '');
      setStudyReadUrl(item.readUrl || '');
      setStudyHomeworkUrls(item.homeworkUrls || ['']);
    } else if (type === 'notification') {
      setActiveTab('notification');
      setNotifTitle(item.title);
      setNotifMsg(item.message);
      setNotifImageUrl(item.imageUrl || '');
      setNotifAuthor(item.author || '');
      setNotifType(item.type || 'Announcement');
    } else if (type === 'media') {
      setActiveTab('media');
      setMediaTitle(item.title);
      setMediaUrl(item.url);
      setMediaDescription(item.description || '');
      setMediaType(photos.some(p => p.id === item.id) ? 'photos' : 'videos');
    } else if (type === 'topper') {
      setActiveTab('topper');
      setTopperName(item.name);
      setTopperClass(item.className);
      setTopperImageUrl(item.imageUrl);
      setTopperDescription(item.description);
      setTopperDate(item.date);
    } else if (type === 'test') {
      setActiveTab('test_series');
      setTestTitle(item.title);
      setTestClass(item.className);
      setTestSubject(item.subject);
      setTestDuration(item.duration);
      setTestStatus(item.status || 'Draft');
      setTestMarksPerQuestion(item.marksperquestion || '1');
      setTestNegativeMarks(item.negativemarks || '0');
    } else if (type === 'test_question') {
      setActiveTab('test_series');
      setTestQuestion(item.question);
      setTestQuestionImage(item.imageUrl || '');
      setTestOptions(item.options);
      setTestAnswer(item.answer);
      setTestExplanation(item.explanation || '');
    } else if (type === 'notice') {
      setActiveTab('notice');
      setNoticeText(item.text);
      setNoticeDate(item.date);
    } else if (type === 'pre_primary') {
      setActiveTab('pre_primary');
      setPrePrimaryClass(item.className);
      setPrePrimarySubject(item.subject);
      setPrePrimaryImages(item.images || ['']);
    } else if (type === 'kahani') {
      setActiveTab('kahani');
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
      
      // Find the item to get id
      let item: any = null;
      if (deleteTarget.col === 'notifications') item = notifications.find(n => n.id === deleteTarget.id);
      else if (deleteTarget.col === 'photos') item = photos.find(p => p.id === deleteTarget.id);
      else if (deleteTarget.col === 'videos') item = videos.find(v => v.id === deleteTarget.id);
      else if (deleteTarget.col === 'study_materials') item = materials.find(m => m.id === deleteTarget.id);
      else if (deleteTarget.col === 'toppers') item = toppers.find(t => t.id === deleteTarget.id);
      else if (deleteTarget.col === 'users') item = users.find(u => u.id === deleteTarget.id);
      else if (deleteTarget.col === 'tests') item = tests.find(t => t.id === deleteTarget.id);
      else if (deleteTarget.col === 'test_questions') item = testQuestions.find(tq => tq.id === deleteTarget.id);
      else if (deleteTarget.col === 'notice') item = noticeBoard.find(n => n.id === deleteTarget.id);
      else if (deleteTarget.col === 'pre_primary_content') item = prePrimaryContent.find(p => p.id === deleteTarget.id);
      else if (deleteTarget.col === 'kahanis') item = kahanis.find(k => k.id === deleteTarget.id);

      if (item && item.id) {
        const result = await firebaseService.writeToCollection('delete', tabName, { id: item.id });
        if (result.success) {
          // Cascading delete for tests
          if (deleteTarget.col === 'tests') {
            const relatedQuestions = testQuestions.filter(q => q.testId === item.id);
            
            for (const q of relatedQuestions) {
              await firebaseService.writeToCollection('delete', 'TestQuestions', { id: q.id });
            }
          }

          setSuccess(result.message);
          fetchAllData();
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Could not find item for deletion.');
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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const settingsData = {
        id: 'general',
        home_images: JSON.stringify(homeImages.filter(img => img.trim() !== '')),
        support_qr: supportQR,
        support_upi: supportUPI,
        contact_phone: contactPhone,
        contact_address: contactAddress,
        contact_email: contactEmail,
        about_text: aboutText,
        commitment_image: commitmentImage,
        commitment_text: commitmentText,
        about_image: aboutImage,
        contact_image: contactImage,
        info_image: infoImage,
        topper_banner: topperBanner,
        youtube_url: youtubeUrl,
        instagram_url: instagramUrl,
        facebook_url: facebookUrl,
        whatsapp_number: whatsappNumber
      };

      await firebaseService.writeToCollection('set', 'AppBasicSettings', settingsData);

      setSuccess('App settings updated successfully!');
      fetchAllData();
    } catch (err: any) {
      setError(`Failed to save settings: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSuccessStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const storyData = {
        name: storyName,
        exam: storyExam,
        score: storyScore,
        text: storyText
      };

      if (editingId && editingType === 'successStory') {
        await firebaseService.writeToCollection('update', 'SuccessStories', { id: editingId, ...storyData });
      } else {
        await firebaseService.writeToCollection('add', 'SuccessStories', storyData);
      }

      setSuccess(`Success story ${editingId ? 'updated' : 'added'} successfully!`);
      setStoryName('');
      setStoryExam('');
      setStoryScore('');
      setStoryText('');
      setEditingId(null);
      setEditingType(null);
      fetchAllData();
    } catch (err: any) {
      setError(`Failed to save story: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const teacherData = {
        name: teacherName,
        subject: teacherSubject,
        designation: teacherDesignation,
        imageurl: teacherImageUrl,
        createdat: new Date().toISOString()
      };

      if (editingId && editingType === 'teacher') {
        await firebaseService.writeToCollection('update', 'Teachers', { id: editingId, ...teacherData });
      } else {
        await firebaseService.writeToCollection('add', 'Teachers', teacherData);
      }

      setSuccess(`Teacher ${editingId ? 'updated' : 'added'} successfully!`);
      setTeacherName('');
      setTeacherSubject('');
      setTeacherDesignation('');
      setTeacherImageUrl('');
      setEditingId(null);
      setEditingType(null);
      fetchAllData();
    } catch (err: any) {
      setError(`Failed to save teacher: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestSeriesConnection = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      setSuccess('Connected successfully to Firebase Test Series!');
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

        <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
          <p className="text-xs text-indigo-700 font-medium leading-relaxed">
            <span className="font-bold">Admin Control:</span> New students can register themselves. They will appear here as "Pending Approval". You must approve them before they can access any study content.
          </p>
        </div>

        <div className="relative">
          <input 
            type="text"
            placeholder="Search users by name or email..."
            className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        </div>

        <div className="mt-8 space-y-4">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Users</h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
            {users
              .filter(u => 
                (u.username || u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((u, index) => (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                key={u.id} 
                className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-white hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    u.active ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"
                  )}>
                    <User size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-900 truncate text-sm">{u.name || u.username || u.email}</p>
                    <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={`text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md ${
                        u.role === 'admin' ? 'bg-rose-100 text-rose-600' : 
                        u.role === 'teacher' ? 'bg-amber-100 text-amber-600' : 
                        'bg-blue-100 text-blue-600'
                      }`}>{u.role}</span>
                      <span className={`text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md ${
                        u.active ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {u.active ? 'Active' : 'Pending Approval'}
                      </span>
                      {u.className && <span className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-600">Class: {u.className}</span>}
                      {u.subject && <span className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-600">Sub: {u.subject}</span>}
                      {u.mobile && <span className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-600">Ph: {u.mobile}</span>}
                      {u.fatherName && <span className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-600">Father: {u.fatherName}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  <select 
                    value={u.role} 
                    onChange={(e) => handleChangeUserRole(u.id, e.target.value)}
                    className="text-[10px] font-bold p-2 bg-white border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                  
                  <motion.button 
                    whileTap={{ scale: 0.9 }} 
                    onClick={() => handleToggleUserStatus(u.id, u.active)} 
                    className={cn(
                      "p-2 rounded-xl transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider",
                      u.active ? "text-amber-600 bg-amber-50 hover:bg-amber-100" : "text-green-600 bg-green-50 hover:bg-green-100"
                    )}
                  >
                    {u.active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                    {u.active ? 'Deactivate' : 'Approve'}
                  </motion.button>

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

      {activeTab === 'teachers' && (
      <motion.section 
        key="teachers"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-emerald-600">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <Users size={24} />
            </div>
            <h2 className="text-xl font-black tracking-tight">Manage Teachers</h2>
          </div>
          <button 
            onClick={() => setActiveTab(null)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSaveTeacher} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teacher Name</label>
              <input 
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                required
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
              <input 
                value={teacherSubject}
                onChange={(e) => setTeacherSubject(e.target.value)}
                required
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Designation</label>
              <input 
                value={teacherDesignation}
                onChange={(e) => setTeacherDesignation(e.target.value)}
                required
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Image URL</label>
              <input 
                value={teacherImageUrl}
                onChange={(e) => setTeacherImageUrl(e.target.value)}
                required
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white p-4 rounded-xl font-black text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : (editingType === 'teacher' ? 'Update Teacher' : 'Add Teacher')}
          </button>
        </form>

        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Teacher List</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map((item) => (
              <motion.div 
                key={item.id}
                layout
                className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {item.imageurl && (
                    <img src={item.imageurl} alt={item.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  )}
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-slate-900 truncate text-sm">{item.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{item.subject} • {item.designation}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleEdit(item, 'teacher')} className="p-2 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"><Edit size={16} /></motion.button>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleDelete(item.id, 'Teachers')} className="p-2 text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"><Trash2 size={16} /></motion.button>
                </div>
              </motion.div>
            ))}
            {teachers.length === 0 && (
              <div className="col-span-full text-center py-8 text-slate-400 text-sm font-medium italic">No teachers yet</div>
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

      {activeTab === 'app_settings' && (
      <motion.section 
        key="app_settings"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-slate-600">
            <div className="p-2 bg-slate-50 rounded-xl">
              <Settings size={24} />
            </div>
            <h2 className="text-xl font-black tracking-tight">App Settings</h2>
          </div>
          <button 
            onClick={() => setActiveTab(null)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="space-y-10">
          {/* Home Page Images */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon size={18} className="text-blue-500" /> Home Page Images
              </h3>
              <button 
                onClick={() => setHomeImages([...homeImages, ''])}
                className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
              >
                <Plus size={12} /> Add Image
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {homeImages.map((url, idx) => (
                <div key={idx} className="flex gap-2">
                  <input 
                    type="url"
                    value={url}
                    onChange={(e) => {
                      const newImgs = [...homeImages];
                      newImgs[idx] = e.target.value;
                      setHomeImages(newImgs);
                    }}
                    placeholder="https://example.com/banner.jpg"
                    className="flex-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                  {homeImages.length > 1 && (
                    <button 
                      onClick={() => setHomeImages(homeImages.filter((_, i) => i !== idx))}
                      className="p-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Success Stories */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Award size={18} className="text-amber-500" /> Success Stories
            </h3>
            <form onSubmit={handleSaveSuccessStory} className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Student Name</label>
                  <input 
                    value={storyName}
                    onChange={(e) => setStoryName(e.target.value)}
                    required
                    className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Exam / Achievement</label>
                  <input 
                    value={storyExam}
                    onChange={(e) => setStoryExam(e.target.value)}
                    required
                    className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Score / Rank</label>
                  <input 
                    value={storyScore}
                    onChange={(e) => setStoryScore(e.target.value)}
                    className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Story / Testimonial</label>
                  <textarea 
                    value={storyText}
                    onChange={(e) => setStoryText(e.target.value)}
                    required
                    rows={3}
                    className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all resize-none"
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 text-white p-3.5 rounded-xl font-black text-sm shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : (editingType === 'successStory' ? 'Update Story' : 'Add Story')}
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 no-scrollbar">
              {successStories.map((story) => (
                <div key={story.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-800 truncate text-sm">{story.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{story.exam}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => {
                      setStoryName(story.name);
                      setStoryExam(story.exam);
                      setStoryScore(story.score || '');
                      setStoryText(story.text);
                      setEditingId(story.id);
                      setEditingType('successStory');
                    }} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"><Edit size={14} /></button>
                    <button onClick={() => handleDelete(story.id, 'SuccessStories')} className="p-2 text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Home Page Sections */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={18} className="text-brand-primary" /> Home Page Sections
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Our Commitment Image URL</label>
                <input 
                  value={commitmentImage}
                  onChange={(e) => setCommitmentImage(e.target.value)}
                  placeholder="https://example.com/commitment.jpg"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Our Commitment Text</label>
                <input 
                  value={commitmentText}
                  onChange={(e) => setCommitmentText(e.target.value)}
                  placeholder="Providing the best education..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">About Us Image URL</label>
                <input 
                  value={aboutImage}
                  onChange={(e) => setAboutImage(e.target.value)}
                  placeholder="https://example.com/about.jpg"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Page Banners */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon size={18} className="text-purple-500" /> Page Banners
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Page Banner URL</label>
                <input 
                  value={contactImage}
                  onChange={(e) => setContactImage(e.target.value)}
                  placeholder="https://example.com/contact-banner.jpg"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Info Page Banner URL</label>
                <input 
                  value={infoImage}
                  onChange={(e) => setInfoImage(e.target.value)}
                  placeholder="https://example.com/info-banner.jpg"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Toppers Page Banner URL</label>
                <input 
                  value={topperBanner}
                  onChange={(e) => setTopperBanner(e.target.value)}
                  placeholder="https://example.com/topper-banner.jpg"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Support & QR */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={18} className="text-emerald-500" /> Support & QR Code
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">QR Code Image URL</label>
                <input 
                  value={supportQR}
                  onChange={(e) => setSupportQR(e.target.value)}
                  placeholder="https://example.com/qr.jpg"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">UPI ID</label>
                <input 
                  value={supportUPI}
                  onChange={(e) => setSupportUPI(e.target.value)}
                  placeholder="8953208909@axl"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={18} className="text-rose-500" /> Social Media Links
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">YouTube URL</label>
                <input 
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/@channel"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Instagram URL</label>
                <input 
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/profile"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Facebook URL</label>
                <input 
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/page"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp Number</label>
                <input 
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="918953208909"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Contact & Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Phone size={18} className="text-indigo-500" /> Contact & Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                <input 
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address</label>
                <input 
                  value={contactAddress}
                  onChange={(e) => setContactAddress(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">About Us Text</label>
                <textarea 
                  value={aboutText}
                  onChange={(e) => setAboutText(e.target.value)}
                  rows={4}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>

          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveSettings}
            disabled={loading}
            className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 hover:bg-black transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><Database size={20} /> Save All App Settings</>}
          </motion.button>
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
