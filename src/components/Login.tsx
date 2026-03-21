import React, { useState } from 'react';
import { User, Lock, Loader2, GraduationCap, ArrowRight } from 'lucide-react';
import { googleSheetsService } from '../services/googleSheetsService';
import { motion, AnimatePresence } from 'motion/react';

interface LoginProps {
  onLogin: (username: string, role: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await googleSheetsService.login(username, password);
      
      if (result.success && result.user) {
        onLogin(result.user.username || username, result.user.role || 'student');
      } else {
        setError(result.message || 'Invalid username or password!');
      }
    } catch (err: any) {
      console.error(err);
      setError('Login failed! ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 p-6 w-full relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-secondary/5 rounded-full blur-3xl animate-pulse" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] space-y-8 relative z-10"
      >
        {/* Logo & Welcome */}
        <div className="text-center space-y-3">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 bg-brand-primary rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-brand-primary/30"
          >
            <GraduationCap size={40} />
          </motion.div>
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">SGS Coaching</h1>
            <p className="text-slate-500 font-medium">Welcome back! Please login to continue.</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white p-8 rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-8">
          <div className="flex items-center gap-4 text-slate-300 text-[10px] font-bold uppercase tracking-widest">
            <div className="h-[1px] bg-slate-100 flex-1"></div>
            <span>User Access</span>
            <div className="h-[1px] bg-slate-100 flex-1"></div>
          </div>

          {/* Student Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-4">Username</label>
                <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl focus-within:border-brand-primary focus-within:bg-white focus-within:shadow-sm transition-all">
                  <span className="pl-4 text-slate-400"><User size={18} /></span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full p-4 bg-transparent outline-none text-sm font-medium text-slate-700"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-4">Password</label>
                <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl focus-within:border-brand-primary focus-within:bg-white focus-within:shadow-sm transition-all">
                  <span className="pl-4 text-slate-400"><Lock size={18} /></span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full p-4 bg-transparent outline-none text-sm font-medium text-slate-700"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-500 text-xs font-bold text-center bg-red-50 py-2 rounded-xl border border-red-100"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              className="w-full bg-brand-primary text-white p-5 rounded-2xl text-lg font-bold shadow-lg shadow-brand-primary/30 hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-3"
            >
              {loading ? (
                <><Loader2 className="animate-spin" /> Logging in...</>
              ) : (
                <>Login <ArrowRight size={20} /></>
              )}
            </motion.button>
          </form>
        </div>

        {/* Footer Info */}
        <p className="text-center text-xs text-slate-400 font-medium">
          Don't have an account? Contact your administrator.
        </p>
      </motion.div>
    </div>
  );
};
