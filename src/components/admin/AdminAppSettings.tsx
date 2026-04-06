import React from 'react';
import { motion } from 'motion/react';
import { Settings, X, Loader2, Plus, Trash2, Edit, Trophy, Phone, Mail, MapPin, QrCode, CreditCard, ImageIcon } from 'lucide-react';

interface SuccessStoryData {
  id: string;
  name: string;
  exam: string;
  score: string;
  text: string;
}

interface AdminAppSettingsProps {
  loading: boolean;
  editingId: string | null;
  editingType: string | null;
  homeImages: string[];
  setHomeImages: (val: string[]) => void;
  supportQR: string;
  setSupportQR: (val: string) => void;
  supportUPI: string;
  setSupportUPI: (val: string) => void;
  contactPhone: string;
  setContactPhone: (val: string) => void;
  contactAddress: string;
  setContactAddress: (val: string) => void;
  contactEmail: string;
  setContactEmail: (val: string) => void;
  aboutText: string;
  setAboutText: (val: string) => void;
  commitmentImage: string;
  setCommitmentImage: (val: string) => void;
  commitmentText: string;
  setCommitmentText: (val: string) => void;
  aboutImage: string;
  setAboutImage: (val: string) => void;
  contactImage: string;
  setContactImage: (val: string) => void;
  infoImage: string;
  setInfoImage: (val: string) => void;
  successStories: SuccessStoryData[];
  storyName: string;
  setStoryName: (val: string) => void;
  storyExam: string;
  setStoryExam: (val: string) => void;
  storyScore: string;
  setStoryScore: (val: string) => void;
  storyText: string;
  setStoryText: (val: string) => void;
  onSaveSettings: (e: React.FormEvent) => void;
  onSaveSuccessStory: (e: React.FormEvent) => void;
  onEdit: (item: any, type: string) => void;
  onDelete: (id: string, col: string) => void;
  onCancelEdit: () => void;
  onClose: () => void;
}

export const AdminAppSettings: React.FC<AdminAppSettingsProps> = ({
  loading,
  editingId,
  editingType,
  homeImages,
  setHomeImages,
  supportQR,
  setSupportQR,
  supportUPI,
  setSupportUPI,
  contactPhone,
  setContactPhone,
  contactAddress,
  setContactAddress,
  contactEmail,
  setContactEmail,
  aboutText,
  setAboutText,
  commitmentImage,
  setCommitmentImage,
  commitmentText,
  setCommitmentText,
  aboutImage,
  setAboutImage,
  contactImage,
  setContactImage,
  infoImage,
  setInfoImage,
  successStories,
  storyName,
  setStoryName,
  storyExam,
  setStoryExam,
  storyScore,
  setStoryScore,
  storyText,
  setStoryText,
  onSaveSettings,
  onSaveSuccessStory,
  onEdit,
  onDelete,
  onCancelEdit,
  onClose
}) => {
  return (
    <motion.section 
      key="app_settings"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-slate-600">
          <div className="p-2 bg-slate-100 rounded-xl">
            <Settings size={24} />
          </div>
          <h2 className="text-xl font-black tracking-tight">App Settings</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={20} className="text-slate-400" />
        </button>
      </div>

      {/* Home Slider Images */}
      <div className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Home Slider Images</h3>
          <button 
            onClick={() => setHomeImages([...homeImages, ''])}
            className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1 hover:underline"
          >
            <Plus size={12} /> Add Image
          </button>
        </div>
        <div className="space-y-3">
          {homeImages.map((img, idx) => (
            <div key={idx} className="flex gap-2 p-3 bg-white border border-slate-200 rounded-2xl">
              <input 
                value={img} 
                onChange={(e) => {
                  const newImgs = [...homeImages];
                  newImgs[idx] = e.target.value;
                  setHomeImages(newImgs);
                }} 
                placeholder="https://..." 
                className="flex-1 p-2 text-sm font-medium outline-none"
              />
              {homeImages.length > 1 && (
                <button 
                  onClick={() => setHomeImages(homeImages.filter((_, i) => i !== idx))}
                  className="text-rose-500 hover:bg-rose-50 p-1 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Success Stories */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 text-amber-600">
          <Trophy size={20} />
          <h3 className="text-sm font-black uppercase tracking-widest">Success Stories</h3>
        </div>
        
        <form onSubmit={onSaveSuccessStory} className="space-y-4 p-6 bg-amber-50/50 rounded-3xl border border-amber-100">
          <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest">{editingType === 'successStory' ? 'Update Story' : 'Add New Story'}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Student Name</label>
              <input value={storyName} onChange={(e) => setStoryName(e.target.value)} placeholder="e.g. Aman Gupta" required className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Exam Name</label>
              <input value={storyExam} onChange={(e) => setStoryExam(e.target.value)} placeholder="e.g. IIT JEE 2023" required className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Score/Rank</label>
              <input value={storyScore} onChange={(e) => setStoryScore(e.target.value)} placeholder="e.g. AIR 452" required className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Story/Testimonial</label>
            <textarea value={storyText} onChange={(e) => setStoryText(e.target.value)} placeholder="Write the success story here..." required rows={3} className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium resize-none" />
          </div>
          <div className="flex gap-4">
            {editingType === 'successStory' && (
              <button type="button" onClick={onCancelEdit} className="flex-1 py-4 bg-slate-200 text-slate-700 font-black rounded-2xl hover:bg-slate-300 transition-all">Cancel</button>
            )}
            <button disabled={loading} className="flex-[2] bg-amber-600 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-200 hover:bg-amber-700 transition-all">
              {loading ? <Loader2 className="animate-spin" /> : (editingType === 'successStory' ? 'Update Story' : 'Add Story')}
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {successStories.map((story) => (
            <div key={story.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-start group">
              <div>
                <p className="font-bold text-slate-900 text-sm">{story.name}</p>
                <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest">{story.exam} • {story.score}</p>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{story.text}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => onEdit(story, 'successStory')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><Edit size={14} /></button>
                <button onClick={() => onDelete(story.id, 'SuccessStories')} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Basic Info Settings */}
      <form onSubmit={onSaveSettings} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Support & Contact */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-blue-600">
              <CreditCard size={20} />
              <h3 className="text-sm font-black uppercase tracking-widest">Support & Contact</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><QrCode size={12} /> Support QR URL</label>
                <input value={supportQR} onChange={(e) => setSupportQR(e.target.value)} placeholder="https://..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><CreditCard size={12} /> Support UPI ID</label>
                <input value={supportUPI} onChange={(e) => setSupportUPI(e.target.value)} placeholder="e.g. school@upi" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Phone size={12} /> Contact Phone</label>
                <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+91 1234567890" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Mail size={12} /> Contact Email</label>
                <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="info@school.com" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><MapPin size={12} /> Contact Address</label>
                <textarea value={contactAddress} onChange={(e) => setContactAddress(e.target.value)} placeholder="Full school address..." rows={2} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium resize-none" />
              </div>
            </div>
          </div>

          {/* About & Content */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-indigo-600">
              <BookOpen size={20} />
              <h3 className="text-sm font-black uppercase tracking-widest">About & Content</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">About Us Text</label>
                <textarea value={aboutText} onChange={(e) => setAboutText(e.target.value)} placeholder="About the institution..." rows={4} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Our Commitment Text</label>
                <textarea value={commitmentText} onChange={(e) => setCommitmentText(e.target.value)} placeholder="Institution's commitment..." rows={3} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><ImageIcon size={12} /> Commitment Image URL</label>
                <input value={commitmentImage} onChange={(e) => setCommitmentImage(e.target.value)} placeholder="https://..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium" />
              </div>
            </div>
          </div>
        </div>

        {/* Page Header Images */}
        <div className="space-y-6 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3 text-rose-600">
            <ImageIcon size={20} />
            <h3 className="text-sm font-black uppercase tracking-widest">Page Header Images</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">About Page</label>
              <input value={aboutImage} onChange={(e) => setAboutImage(e.target.value)} placeholder="https://..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Page</label>
              <input value={contactImage} onChange={(e) => setContactImage(e.target.value)} placeholder="https://..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Info Page</label>
              <input value={infoImage} onChange={(e) => setInfoImage(e.target.value)} placeholder="https://..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
            </div>
          </div>
        </div>

        <motion.button 
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          className="w-full bg-slate-900 text-white p-5 rounded-3xl font-black flex items-center justify-center gap-3 shadow-xl shadow-slate-200 hover:bg-black transition-all"
        >
          {loading ? <Loader2 className="animate-spin" /> : <><Settings size={20} /> Save All App Settings</>}
        </motion.button>
      </form>
    </motion.section>
  );
};
