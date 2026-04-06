import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, X, Loader2, Edit, Trash2, Plus, Video, HelpCircle } from 'lucide-react';
import { SUBJECTS } from '../../constants';

interface StudyMaterial {
  id: string;
  title: string;
  level: string;
  className: string;
  subject: string;
  videos?: { title: string; url: string }[];
  notesUrl?: string;
  readUrl?: string;
  homeworkUrls?: string[];
  createdAt: { toDate: () => Date };
}

interface AdminStudyProps {
  materials: StudyMaterial[];
  loading: boolean;
  editingId: string | null;
  editingType: string | null;
  studyLevel: string;
  setStudyLevel: (val: string) => void;
  studyClass: string;
  setStudyClass: (val: string) => void;
  studySubject: string;
  setStudySubject: (val: string) => void;
  studyTitle: string;
  setStudyTitle: (val: string) => void;
  studyVideos: { title: string; url: string }[];
  setStudyVideos: (val: { title: string; url: string }[]) => void;
  studyNotesUrl: string;
  setStudyNotesUrl: (val: string) => void;
  studyReadUrl: string;
  setStudyReadUrl: (val: string) => void;
  studyHomeworkUrls: string[];
  setStudyHomeworkUrls: (val: string[]) => void;
  onSubmit: (e: React.FormEvent, type: string) => void;
  onEdit: (item: any, type: string) => void;
  onDelete: (id: string, col: string) => void;
  onCancelEdit: () => void;
  onClose: () => void;
}

export const AdminStudy: React.FC<AdminStudyProps> = ({
  materials,
  loading,
  editingId,
  editingType,
  studyLevel,
  setStudyLevel,
  studyClass,
  setStudyClass,
  studySubject,
  setStudySubject,
  studyTitle,
  setStudyTitle,
  studyVideos,
  setStudyVideos,
  studyNotesUrl,
  setStudyNotesUrl,
  studyReadUrl,
  setStudyReadUrl,
  studyHomeworkUrls,
  setStudyHomeworkUrls,
  onSubmit,
  onEdit,
  onDelete,
  onCancelEdit,
  onClose
}) => {
  const currentClasses = Object.keys(SUBJECTS[studyLevel as keyof typeof SUBJECTS] || {});
  const currentSubjects = SUBJECTS[studyLevel as keyof typeof SUBJECTS]?.[studyClass as any] || [];

  return (
    <motion.section 
      key="study"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-blue-600">
          <div className="p-2 bg-blue-50 rounded-xl">
            <BookOpen size={24} />
          </div>
          <h2 className="text-xl font-black tracking-tight">Study Materials</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={20} className="text-slate-400" />
        </button>
      </div>

      <form onSubmit={(e) => onSubmit(e, 'study')} className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
          {editingType === 'study' ? 'Update Material' : 'Add New Study Material'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Level</label>
            <select 
              value={studyLevel} 
              onChange={(e) => {
                setStudyLevel(e.target.value);
                const firstClass = Object.keys(SUBJECTS[e.target.value as keyof typeof SUBJECTS])[0];
                setStudyClass(firstClass);
                setStudySubject(SUBJECTS[e.target.value as keyof typeof SUBJECTS][firstClass as any][0].name);
              }}
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
            >
              <option value="Primary">Primary (1-5)</option>
              <option value="Junior">Junior (6-8)</option>
              <option value="Secondary">Secondary (9-12)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Class</label>
            <select 
              value={studyClass} 
              onChange={(e) => {
                setStudyClass(e.target.value);
                setStudySubject(SUBJECTS[studyLevel as keyof typeof SUBJECTS][e.target.value as any][0].name);
              }}
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
            >
              {currentClasses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
            <select 
              value={studySubject} 
              onChange={(e) => setStudySubject(e.target.value)}
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
            >
              {currentSubjects.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Topic Title</label>
          <input 
            value={studyTitle} 
            onChange={(e) => setStudyTitle(e.target.value)} 
            placeholder="e.g. Introduction to Algebra" 
            required 
            className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" 
          />
        </div>

        <div className="space-y-4 border-t border-slate-200 pt-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Content Links</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes URL (PDF/Doc)</label>
              <input 
                value={studyNotesUrl} 
                onChange={(e) => setStudyNotesUrl(e.target.value)} 
                placeholder="https://..." 
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Read Online URL</label>
              <input 
                value={studyReadUrl} 
                onChange={(e) => setStudyReadUrl(e.target.value)} 
                placeholder="https://..." 
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" 
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Video Lectures</label>
              <button 
                type="button"
                onClick={() => setStudyVideos([...studyVideos, { title: '', url: '' }])}
                className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:underline"
              >
                <Plus size={12} /> Add Video
              </button>
            </div>
            {studyVideos.map((video, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 bg-white border border-slate-200 rounded-2xl">
                <input 
                  value={video.title} 
                  onChange={(e) => {
                    const newVids = [...studyVideos];
                    newVids[idx].title = e.target.value;
                    setStudyVideos(newVids);
                  }} 
                  placeholder="Video Title" 
                  className="p-2 text-sm font-medium outline-none"
                />
                <div className="flex gap-2">
                  <input 
                    value={video.url} 
                    onChange={(e) => {
                      const newVids = [...studyVideos];
                      newVids[idx].url = e.target.value;
                      setStudyVideos(newVids);
                    }} 
                    placeholder="YouTube URL" 
                    className="flex-1 p-2 text-sm font-medium outline-none"
                  />
                  {studyVideos.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => setStudyVideos(studyVideos.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:bg-rose-50 p-1 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Homework/Assignments</label>
              <button 
                type="button"
                onClick={() => setStudyHomeworkUrls([...studyHomeworkUrls, ''])}
                className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:underline"
              >
                <Plus size={12} /> Add Homework
              </button>
            </div>
            {studyHomeworkUrls.map((url, idx) => (
              <div key={idx} className="flex gap-2 p-3 bg-white border border-slate-200 rounded-2xl">
                <input 
                  value={url} 
                  onChange={(e) => {
                    const newUrls = [...studyHomeworkUrls];
                    newUrls[idx] = e.target.value;
                    setStudyHomeworkUrls(newUrls);
                  }} 
                  placeholder="Homework URL (PDF/Doc)" 
                  className="flex-1 p-2 text-sm font-medium outline-none"
                />
                {studyHomeworkUrls.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => setStudyHomeworkUrls(studyHomeworkUrls.filter((_, i) => i !== idx))}
                    className="text-rose-500 hover:bg-rose-50 p-1 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          {editingType === 'study' && (
            <button 
              type="button"
              onClick={onCancelEdit}
              className="flex-1 py-4 bg-slate-200 text-slate-700 font-black rounded-2xl hover:bg-slate-300 transition-all"
            >
              Cancel
            </button>
          )}
          <motion.button 
            whileTap={{ scale: 0.98 }}
            disabled={loading} 
            className="flex-[2] bg-blue-600 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : (editingType === 'study' ? 'Update Material' : 'Publish Material')}
          </motion.button>
        </div>
      </form>

      <div className="space-y-4">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Materials</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {materials.map((item) => (
            <motion.div 
              key={item.id} 
              className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-3 hover:bg-white hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-600">{item.className}</span>
                    <span className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-600">{item.subject}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => onEdit(item, 'study')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><Edit size={14} /></button>
                  <button onClick={() => onDelete(item.id, 'study_materials')} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.notesUrl && <span className="text-[8px] font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg border border-emerald-100">Notes</span>}
                {item.readUrl && <span className="text-[8px] font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg border border-indigo-100">Read Online</span>}
                {item.videos && item.videos.length > 0 && <span className="text-[8px] font-bold bg-amber-50 text-amber-600 px-2 py-1 rounded-lg border border-amber-100">{item.videos.length} Videos</span>}
                {item.homeworkUrls && item.homeworkUrls.length > 0 && <span className="text-[8px] font-bold bg-rose-50 text-rose-600 px-2 py-1 rounded-lg border border-rose-100">{item.homeworkUrls.length} Homework</span>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};
