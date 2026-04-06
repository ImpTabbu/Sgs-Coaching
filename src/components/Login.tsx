import React, { useState } from 'react';
import { User, Lock, Loader2, GraduationCap, ArrowRight, BookOpen } from 'lucide-react';
import { firebaseService } from '../services/firebaseService';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';

interface LoginProps {
  onLogin: (username: string, role: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'signin' | 'register' | 'pending'>('signin');
  const [googleUser, setGoogleUser] = useState<any>(null);
  
  // Registration Form State
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [mobile, setMobile] = useState('');
  const [classOrSubject, setClassOrSubject] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user exists in our Firestore
      const users = await firebaseService.fetchCollection('Users');
      const existingUser = users.find(u => u.email === user.email);

      if (existingUser) {
        if (existingUser.active) {
          onLogin(existingUser.username || existingUser.name, existingUser.role);
        } else {
          setStep('pending');
        }
      } else {
        // New user, proceed to registration
        setGoogleUser(user);
        setName(user.displayName || '');
        setStep('register');
      }
    } catch (err: any) {
      console.error(err);
      setError('Google Sign-In failed! ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userData = {
        uid: googleUser.uid,
        email: googleUser.email,
        name: name,
        username: name, // Fallback for existing code
        fatherName: fatherName,
        mobile: mobile,
        role: role,
        [role === 'student' ? 'className' : 'subject']: classOrSubject,
        active: false, // Requires admin approval
        createdat: new Date().toISOString()
      };

      const result = await firebaseService.writeToCollection('add', 'Users', userData);
      
      if (result.success) {
        setStep('pending');
      } else {
        setError(result.message || 'Registration failed!');
      }
    } catch (err: any) {
      console.error(err);
      setError('Registration failed! ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 p-6 w-full relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-secondary/5 rounded-full blur-3xl animate-pulse" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] space-y-8 relative z-10"
      >
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
            <p className="text-slate-500 font-medium">
              {step === 'signin' && 'Sign in to access your account'}
              {step === 'register' && 'Complete your profile'}
              {step === 'pending' && 'Account under review'}
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-8">
          
          {step === 'signin' && (
            <div className="space-y-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white border-2 border-slate-200 text-slate-700 p-4 rounded-2xl text-lg font-bold shadow-sm hover:bg-slate-50 transition-all disabled:opacity-70 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
            </div>
          )}

          {step === 'register' && (
            <form onSubmit={handleRegister} className="space-y-5">
              {/* Role Toggle */}
              <div className="flex p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === 'student' ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-500'}`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === 'teacher' ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-500'}`}
                >
                  Teacher
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none text-sm font-medium"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">Father's Name</label>
                  <input
                    type="text"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none text-sm font-medium"
                    placeholder="Enter father's name"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">Mobile Number</label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none text-sm font-medium"
                    placeholder="Enter mobile number"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">
                    {role === 'student' ? 'Class' : 'Subject'}
                  </label>
                  <input
                    type="text"
                    value={classOrSubject}
                    onChange={(e) => setClassOrSubject(e.target.value)}
                    required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none text-sm font-medium"
                    placeholder={role === 'student' ? "e.g., 10th" : "e.g., Mathematics"}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-primary text-white p-4 rounded-xl text-lg font-bold shadow-lg shadow-brand-primary/30 hover:bg-brand-primary/90 transition-all disabled:opacity-70 flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Submit Registration'}
              </button>
            </form>
          )}

          {step === 'pending' && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                <Lock size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Account Locked</h3>
              <p className="text-sm text-slate-500 font-medium">
                Your account is currently pending approval from the administrator. You will be able to access the app once your account is activated.
              </p>
              <button
                onClick={() => setStep('signin')}
                className="text-brand-primary font-bold text-sm hover:underline"
              >
                Back to Login
              </button>
            </div>
          )}

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
        </div>
      </motion.div>
    </div>
  );
};
