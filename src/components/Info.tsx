import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Info as InfoIcon, Calendar, Smartphone, Globe, ShieldCheck, RefreshCw, Star, Heart } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { firebaseService } from '../services/firebaseService';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

export const Info: React.FC = () => {
  const [infoImage, setInfoImage] = useState('https://picsum.photos/seed/info/800/400');
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const appSettings = await firebaseService.fetchCollection('AppBasicSettings');
        const generalSettings = appSettings?.find((s: any) => s.id === 'general');
        setSettings(generalSettings || null);
        
        if (generalSettings?.info_image) {
          setInfoImage(generalSettings.info_image);
        }
      } catch (err) {
        console.error("Failed to fetch info image:", err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-8 bg-background min-h-screen pb-24 pt-6"
    >
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-display font-bold text-slate-900">App Information</h1>
        <p className="text-sm text-slate-500 font-medium">Everything you need to know about SGS App</p>
      </div>

      {/* Main Info Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="relative h-48 overflow-hidden">
          <img
            src={infoImage}
            alt="Info Banner"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
        </div>

        <div className="p-6 -mt-12 relative space-y-8">
          {/* Details List */}
          <div className="space-y-3">
            {[
              { label: "Version", value: "1.0.0", icon: InfoIcon, color: "text-blue-500", bg: "bg-blue-50" },
              { label: "Released on", value: "Oct 2025", icon: Calendar, color: "text-emerald-500", bg: "bg-emerald-50" },
              { label: "Updated on", value: "Jan 2026", icon: RefreshCw, color: "text-orange-500", bg: "bg-orange-50" },
              { label: "Compatibility", value: "All Devices", icon: Smartphone, color: "text-purple-500", bg: "bg-purple-50" },
              { label: "Required OS", value: "Web Browser", icon: Globe, color: "text-indigo-500", bg: "bg-indigo-50" },
            ].map((row, i) => (
              <motion.div 
                key={i} 
                variants={itemVariants}
                className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", row.bg, row.color)}>
                    <row.icon size={20} />
                  </div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{row.label}</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{row.value}</span>
              </motion.div>
            ))}
          </div>

          {/* Security & Trust */}
          <motion.div 
            variants={itemVariants}
            className="bg-brand-primary/5 p-6 rounded-2xl border border-brand-primary/10 space-y-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-primary shadow-sm border border-brand-primary/10">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-900">Secure & Reliable</p>
                <p className="text-xs text-slate-500">Your data is safe with us</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              SGS Coaching App uses advanced encryption and secure cloud storage to ensure your learning progress and personal information are always protected.
            </p>
          </motion.div>

          {/* Our Mission */}
          <motion.div 
            variants={itemVariants}
            className="bg-brand-secondary/5 p-6 rounded-2xl border border-brand-secondary/10 space-y-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-secondary shadow-sm border border-brand-secondary/10">
                <Star size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-900">Our Mission</p>
                <p className="text-xs text-slate-500">Empowering every student</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {settings?.aboutText || "We aim to provide accessible, high-quality education to students everywhere, combining traditional teaching values with modern technology to foster academic excellence."}
            </p>
          </motion.div>

          {/* Rate Us Placeholder */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col items-center justify-center space-y-4 pt-4 pb-2"
          >
            <div className="flex items-center gap-2 bg-rose-50 text-rose-500 px-4 py-1.5 rounded-full">
              <Heart size={14} className="fill-rose-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Love the app?</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button 
                  key={star}
                  whileTap={{ scale: 0.8 }}
                  className="text-amber-400 hover:scale-110 transition-transform"
                >
                  <Star size={28} fill={star <= 4 ? "currentColor" : "none"} />
                </motion.button>
              ))}
            </div>
            <p className="text-xs text-slate-500 font-medium italic">"Empowering students through technology"</p>
          </motion.div>
        </div>
      </div>

      {/* Footer Info */}
      <motion.div 
        variants={itemVariants}
        className="text-center space-y-3"
      >
        <p className="text-xs text-slate-400 font-medium">© {new Date().getFullYear()} SGS Coaching. All rights reserved.</p>
        <div className="flex justify-center gap-4 text-[10px] text-brand-primary font-bold uppercase tracking-widest">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <span className="text-slate-300">•</span>
          <a href="#" className="hover:underline">Terms of Service</a>
        </div>
      </motion.div>
    </motion.div>
  );
};
