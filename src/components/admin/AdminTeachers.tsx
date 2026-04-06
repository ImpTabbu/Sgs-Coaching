import React from 'react';
import { motion } from 'motion/react';
import { Users, X, Loader2, Edit, Trash2 } from 'lucide-react';

interface TeacherData {
  id: string;
  name: string;
  subject: string;
  designation: string;
  imageurl: string;
  createdat: string;
}

interface AdminTeachersProps {
  teachers: TeacherData[];
  loading: boolean;
  editingId: string | null;
  editingType: string | null;
  teacherName: string;
  setTeacherName: (val: string) => void;
  teacherSubject: string;
  setTeacherSubject: (val: string) => void;
  teacherDesignation: string;
  setTeacherDesignation: (val: string) => void;
  teacherImageUrl: string;
  setTeacherImageUrl: (val: string) => void;
  onSave: (e: React.FormEvent) => void;
  onEdit: (item: any, type: string) => void;
  onDelete: (id: string, col: string) => void;
  onCancelEdit: () => void;
  onClose: () => void;
}

export const AdminTeachers: React.FC<AdminTeachersProps> = ({
  teachers,
  loading,
  editingId,
  editingType,
  teacherName,
  setTeacherName,
  teacherSubject,
  setTeacherSubject,
  teacherDesignation,
  setTeacherDesignation,
  teacherImageUrl,
  setTeacherImageUrl,
  onSave,
  onEdit,
  onDelete,
  onCancelEdit,
  onClose
}) => {
  return (
    <motion.section 
      key="teachers"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-emerald-600">
          <div className="p-2 bg-emerald-50 rounded-xl">
            <Users size={24} />
          </div>
          <h2 className="text-xl font-black tracking-tight">Teachers Management</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={20} className="text-slate-400" />
        </button>
      </div>

      <form onSubmit={onSave} className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
          {editingType === 'teacher' ? 'Update Teacher' : 'Add New Teacher'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teacher Name</label>
            <input 
              value={teacherName} 
              onChange={(e) => setTeacherName(e.target.value)} 
              placeholder="e.g. Dr. S.K. Sharma" 
              required 
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
            <input 
              value={teacherSubject} 
              onChange={(e) => setTeacherSubject(e.target.value)} 
              placeholder="e.g. Physics" 
              required 
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Designation</label>
            <input 
              value={teacherDesignation} 
              onChange={(e) => setTeacherDesignation(e.target.value)} 
              placeholder="e.g. HOD Physics" 
              required 
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Image URL</label>
            <input 
              value={teacherImageUrl} 
              onChange={(e) => setTeacherImageUrl(e.target.value)} 
              placeholder="https://..." 
              required 
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium" 
            />
          </div>
        </div>
        <div className="flex gap-4">
          {editingType === 'teacher' && (
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
            className="flex-[2] bg-emerald-600 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : (editingType === 'teacher' ? 'Update Teacher' : 'Add Teacher')}
          </motion.button>
        </div>
      </form>

      <div className="space-y-4">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Faculty List</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {teachers.map((teacher) => (
            <motion.div 
              key={teacher.id} 
              className="bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden hover:shadow-md transition-all group"
            >
              <div className="relative aspect-square bg-slate-200">
                <img src={teacher.imageurl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEdit(teacher, 'teacher')} className="p-2 bg-white/90 text-blue-600 rounded-xl shadow-sm hover:bg-white"><Edit size={14} /></button>
                  <button onClick={() => onDelete(teacher.id, 'teachers')} className="p-2 bg-white/90 text-rose-600 rounded-xl shadow-sm hover:bg-white"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="p-4 text-center">
                <h4 className="font-bold text-slate-900 text-sm">{teacher.name}</h4>
                <p className="text-emerald-600 text-[10px] font-black uppercase tracking-wider mt-1">{teacher.subject}</p>
                <p className="text-slate-500 text-[9px] font-medium mt-0.5">{teacher.designation}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};
