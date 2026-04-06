import React from 'react';
import { motion } from 'motion/react';
import { User, X, XCircle, CheckCircle, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface UserData {
  id: string;
  username: string;
  name: string;
  fatherName: string;
  mobile: string;
  email: string;
  role: string;
  active: boolean;
  className: string;
  subject: string;
  createdAt: { toDate: () => Date };
}

interface AdminUsersProps {
  users: UserData[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onToggleStatus: (userId: string, currentStatus: boolean) => void;
  onChangeRole: (userId: string, newRole: string) => void;
  onDelete: (id: string, col: string) => void;
  onClose: () => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({
  users,
  searchTerm,
  setSearchTerm,
  onToggleStatus,
  onChangeRole,
  onDelete,
  onClose
}) => {
  return (
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
          onClick={onClose}
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
                  onChange={(e) => onChangeRole(u.id, e.target.value)}
                  className="text-[10px] font-bold p-2 bg-white border border-slate-200 rounded-xl outline-none"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
                
                <motion.button 
                  whileTap={{ scale: 0.9 }} 
                  onClick={() => onToggleStatus(u.id, u.active)} 
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
                  onClick={() => onDelete(u.id, 'users')} 
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
  );
};
