import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import { TEACHERS } from '@/src/constants';
import { UserCheck, Building2, BookOpen, Trophy, Send, Loader2, Sparkles, Heart, Phone, MapPin, ArrowRight, PlayCircle, FileText, Award, Bell, Instagram, Facebook, X } from 'lucide-react';
import { SuccessModal } from './SuccessModal';
import { firebaseService } from '../services/firebaseService';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/src/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

export const Home: React.FC = () => {
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notices, setNotices] = useState<any[]>([]);
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const [successStories, setSuccessStories] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Always show install button if not in standalone mode
    if (!window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallButton(false);
      }
      setDeferredPrompt(null);
    } else {
      setShowInstallGuide(true);
    }
  };

  useEffect(() => {
    let unsubscribeNotices: (() => void) | undefined;
    let unsubscribeSettings: (() => void) | undefined;
    let unsubscribeStories: (() => void) | undefined;
    let unsubscribeTeachers: (() => void) | undefined;
    let unsubscribeSocial: (() => void) | undefined;

    const setupSubscriptions = () => {
      setLoadingNotices(true);

      // Notices
      unsubscribeNotices = firebaseService.subscribeToCollection('NoticeBoard', (data) => {
        setNotices(data.slice(0, 5));
        setLoadingNotices(false);
      });

      // Settings
      unsubscribeSettings = firebaseService.subscribeToCollection('AppBasicSettings', (data) => {
        const generalSettings = data.find((s: any) => s.id === 'general');
        if (generalSettings) {
          if (typeof generalSettings.home_images === 'string') {
            try {
              generalSettings.homeImages = JSON.parse(generalSettings.home_images);
            } catch (e) {
              generalSettings.homeImages = [];
            }
          }
          
          // Map snake_case to camelCase for easier use in component
          const mappedSettings = {
            ...generalSettings,
            contactPhone: generalSettings.contact_phone,
            contactAddress: generalSettings.contact_address,
            contactEmail: generalSettings.contact_email,
            aboutText: generalSettings.about_text,
            commitmentImage: generalSettings.commitment_image,
            commitmentText: generalSettings.commitment_text,
            aboutImage: generalSettings.about_image,
            contactImage: generalSettings.contact_image,
            infoImage: generalSettings.info_image,
            topperBanner: generalSettings.topper_banner,
            supportQR: generalSettings.support_qr,
            supportUPI: generalSettings.support_upi,
            youtubeUrl: generalSettings.youtube_url,
            instagramUrl: generalSettings.instagram_url,
            facebookUrl: generalSettings.facebook_url,
            whatsappNumber: generalSettings.whatsapp_number
          };
          setSettings(mappedSettings);
        } else {
          setSettings(null);
        }
      });

      // Success Stories
      unsubscribeStories = firebaseService.subscribeToCollection('SuccessStories', (data) => {
        setSuccessStories(data);
      });

      // Teachers
      unsubscribeTeachers = firebaseService.subscribeToCollection('Teachers', (data) => {
        setTeachers(data);
      });

      // Social Links
      unsubscribeSocial = firebaseService.subscribeToCollection('SocialLinks', (data) => {
        setSocialLinks(data);
      });
    };

    setupSubscriptions();

    return () => {
      if (unsubscribeNotices) unsubscribeNotices();
      if (unsubscribeSettings) unsubscribeSettings();
      if (unsubscribeStories) unsubscribeStories();
      if (unsubscribeTeachers) unsubscribeTeachers();
      if (unsubscribeSocial) unsubscribeSocial();
    };
  }, []);

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Youtube: PlayCircle,
      Instagram: Instagram,
      Facebook: Facebook,
      Whatsapp: Phone,
    };
    return icons[iconName] || Send;
  };

  const getImg = (key: string, fallback: string) => {
    if (!settings) return fallback;
    return settings[key] || fallback;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch("https://formsubmit.co/ajax/sgsworkvikas@gmail.com", {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        setIsSuccessModalOpen(true);
        (e.target as HTMLFormElement).reset();
        setTimeout(() => setIsSuccessModalOpen(false), 4000);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 space-y-8 pb-24 pt-6"
    >
      {/* Install App Banner */}
      <AnimatePresence>
        {showInstallButton && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-brand-primary/10 border border-brand-primary/20 p-4 rounded-2xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shrink-0">
                <Sparkles size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-slate-800">Download Our App</p>
                <p className="text-[10px] text-slate-500 font-medium">Get faster access and offline support</p>
              </div>
            </div>
            <button 
              onClick={handleInstallClick}
              className="bg-brand-primary text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              Download
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Install Guide Modal */}
      <AnimatePresence>
        {showInstallGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900">How to Install</h3>
                  <p className="text-xs text-slate-500 font-medium">Follow these steps to add to your phone</p>
                </div>
                <button 
                  onClick={() => setShowInstallGuide(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center font-black shrink-0">1</div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">Android (Chrome)</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Tap the <span className="font-bold text-slate-700">3 dots</span> in the top right corner and select <span className="font-bold text-emerald-600">"Install App"</span> or "Add to Home Screen".</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-black shrink-0">2</div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">iPhone (Safari)</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Tap the <span className="font-bold text-slate-700">Share button</span> (square with arrow) at the bottom and select <span className="font-bold text-blue-600">"Add to Home Screen"</span>.</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowInstallGuide(false)}
                className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black hover:bg-black transition-all shadow-lg"
              >
                Got it!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Hero Section / Banner Slider */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl shadow-md h-48 md:h-64">
        <Swiper
          modules={[Autoplay, EffectFade, Pagination]}
          loop={true}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          effect="fade"
          pagination={{ clickable: true }}
          className="h-full w-full"
        >
          {settings?.homeImages?.length > 0 ? settings.homeImages.map((url: string, i: number) => (
            <SwiperSlide key={i}>
              <img src={url} alt={`Banner ${i+1}`} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            </SwiperSlide>
          )) : (
            <SwiperSlide>
              <div className="relative h-full w-full bg-brand-primary p-6 text-white flex items-center gap-5">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
                <div className="relative z-10 flex items-center gap-5">
                  <div className="relative">
                    <img
                      src={getImg('commitmentImage', 'https://picsum.photos/seed/director/200/200')}
                      alt="Coaching Director"
                      className="h-20 w-20 rounded-full object-cover border-2 border-white/20 shadow-sm aspect-square"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-brand-secondary p-1.5 rounded-lg shadow-sm">
                      <Sparkles size={14} className="text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-hindi text-lg font-bold leading-tight">Our Commitment</h3>
                    <p className="font-hindi text-xs text-white/80 leading-relaxed">
                      {settings?.commitmentText || "Providing the best education and right guidance for every student's bright future."}
                    </p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          )}
        </Swiper>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
        {[
          { icon: PlayCircle, label: "Video Lectures", color: "text-blue-500", bg: "bg-blue-50" },
          { icon: FileText, label: "Study Material", color: "text-emerald-500", bg: "bg-emerald-50" },
          { icon: Trophy, label: "Test Series", color: "text-amber-500", bg: "bg-amber-50" },
        ].map((action, i) => (
          <motion.button 
            key={i}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${action.bg} ${action.color}`}>
              <action.icon size={20} />
            </div>
            <span className="text-[10px] font-bold text-slate-600 text-center leading-tight">{action.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Notice Board */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-accent animate-pulse shadow-[0_0_8px_rgba(242,125,38,0.5)]"></span>
            Notice Board
          </h3>
          <Bell size={16} className="text-slate-300" />
        </div>
        <div className="space-y-3">
          {loadingNotices ? (
            <div className="py-4 space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-10 bg-slate-50 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : notices.length > 0 ? (
            notices.map((notice, i) => (
              <div key={i} className="flex gap-3 items-start border-b border-slate-50 pb-3 last:border-0 last:pb-0 group">
                <div className="bg-brand-primary/10 text-brand-primary text-[10px] font-black px-2 py-1 rounded-lg whitespace-nowrap group-hover:bg-brand-primary group-hover:text-white transition-colors">
                  {(() => {
                    const d = notice.date || 'New';
                    if (typeof d === 'string' && d.includes('T') && !isNaN(Date.parse(d))) {
                      return new Date(d).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      });
                    }
                    return d;
                  })()}
                </div>
                <p className="text-xs text-slate-600 font-bold leading-relaxed group-hover:text-slate-900 transition-colors">{notice.text}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic text-center py-2">No active notices</p>
          )}
        </div>
      </motion.div>

      {/* About Section */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
        <div className="relative h-48">
          <img
            src={getImg('aboutImage', 'https://picsum.photos/seed/about/800/400')}
            alt="Happy students"
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4">
            <span className="bg-brand-secondary text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">About Us</span>
            <h2 className="font-hindi text-white font-bold text-lg mt-2">Promoting Education with Excellence</h2>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <p className="font-hindi text-sm text-slate-600 leading-relaxed">
            {settings?.aboutText || "SGS Coaching was founded on the belief that every student has the potential to succeed. We are committed to providing a supportive and motivating learning environment."}
          </p>
          <div className="flex items-center gap-2 text-brand-primary font-medium text-xs bg-brand-primary/5 p-3 rounded-xl">
            <Heart size={14} className="fill-brand-primary" />
            <span>Students' Trust, Our Identity</span>
          </div>
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        {[
          { icon: UserCheck, text: "Experienced Teachers", color: "bg-blue-50 text-blue-600 border-blue-100" },
          { icon: Building2, text: "Modern Facilities", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
          { icon: BookOpen, text: "Comprehensive Curriculum", color: "bg-amber-50 text-amber-600 border-amber-100" },
          { icon: Trophy, text: "Focus on Sports", color: "bg-rose-50 text-rose-600 border-rose-100" },
        ].map((feature, i) => (
          <div key={i} className={`flex flex-col gap-3 p-4 rounded-xl border ${feature.color} bg-white shadow-sm hover:shadow-md transition-shadow`}>
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center shadow-sm ${feature.color.split(' ')[0]}`}>
              <feature.icon size={20} />
            </div>
            <span className="font-hindi text-xs font-bold text-slate-800">{feature.text}</span>
          </div>
        ))}
      </motion.div>

      {/* Teachers Slider */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-hindi text-lg font-bold text-slate-800">Our Teachers</h3>
          <button className="text-[10px] text-brand-primary font-bold uppercase tracking-wider flex items-center gap-1">
            View All <ArrowRight size={12} />
          </button>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-100">
          <Swiper
            modules={[Autoplay, Pagination]}
            loop={teachers.length > 1}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            spaceBetween={12}
            slidesPerView={1.2}
            breakpoints={{
              640: { slidesPerView: 2.2 },
              1024: { slidesPerView: 3.2 }
            }}
            className="pb-8"
          >
            {teachers.length > 0 ? teachers.map((teacher, i) => (
              <SwiperSlide key={i} className="h-64">
                <div className="relative h-full w-full rounded-2xl overflow-hidden group">
                  <img src={teacher.imageurl} alt={teacher.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                    <p className="text-white font-bold text-base leading-tight">{teacher.name}</p>
                    <p className="text-white/90 text-xs font-medium mt-1">{teacher.subject}</p>
                    <p className="text-white/70 text-[10px] uppercase tracking-wider mt-0.5">{teacher.designation}</p>
                  </div>
                </div>
              </SwiperSlide>
            )) : (
              <SwiperSlide>
                <div className="h-full w-full flex items-center justify-center bg-slate-50 text-slate-400 text-xs italic">
                  No teachers added yet
                </div>
              </SwiperSlide>
            )}
          </Swiper>
        </div>
      </motion.div>

      {/* Success Stories */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-hindi text-lg font-bold text-slate-800">Success Stories</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {successStories.length > 0 ? successStories.map((story, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-accent/40" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-accent/10 rounded-full flex items-center justify-center text-brand-accent">
                  <Award size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{story.name}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{story.exam} • {story.score}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 italic">"{story.text}"</p>
            </div>
          )) : (
            <p className="text-xs text-slate-400 italic text-center py-4">No success stories yet</p>
          )}
        </div>
      </motion.div>

      {/* Donate Card */}
      <motion.div variants={itemVariants} className="relative pt-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 bg-brand-accent text-white px-6 py-1.5 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-widest">
          Support Us
        </div>
        <div className="bg-white rounded-2xl p-6 text-center space-y-5 border border-slate-100 shadow-sm">
          <div className="space-y-1">
            <h3 className="font-hindi font-bold text-slate-800 text-base">Contribute to SGS Coaching</h3>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Scan to Support Education</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl w-fit mx-auto border border-slate-100 shadow-inner">
            <img
              src={settings?.supportQR || 'https://picsum.photos/seed/qr/300/300'}
              alt="QR Code"
              className="h-44 w-44 rounded-lg shadow-sm"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 bg-slate-50 py-2 px-4 rounded-xl border border-slate-100">
              <span className="text-[10px] font-mono font-bold text-slate-400">UPI:</span>
              <span className="text-xs font-mono font-bold text-slate-700">{settings?.supportUPI || '8953208909@axl'}</span>
            </div>
            <p className="font-hindi text-[10px] text-slate-500 italic">Your every small contribution means a lot to us</p>
          </div>
        </div>
      </motion.div>

      {/* Contact Form */}
      <motion.div variants={itemVariants} className="relative pt-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 bg-brand-primary text-white px-6 py-1.5 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-widest">
          Get In Touch
        </div>
        <div className="bg-white rounded-2xl p-6 space-y-6 border border-slate-100 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
              <input name="name" type="text" required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all" placeholder="Enter your name..." />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Mobile Number</label>
              <input name="mobile" type="tel" pattern="[0-9]{10}" required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all" placeholder="10-digit mobile number..." />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Your Message</label>
              <textarea name="message" rows={4} required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all resize-none" placeholder="How can we help you?"></textarea>
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-brand-primary text-white py-4 rounded-xl text-base font-bold font-hindi shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? <><Loader2 className="animate-spin" /> Sending...</> : <><Send size={18} /> Send Message</>}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-slate-500">
              <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                <Phone size={14} />
              </div>
              <span className="text-[10px] font-bold">{settings?.contactPhone || '+91 8953208909'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                <MapPin size={14} />
              </div>
              <span className="text-[10px] font-bold">{settings?.contactAddress || 'Ayodhya, UP'}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Follow Our Journey */}
      {(socialLinks.length > 0 || settings?.youtubeUrl || settings?.instagramUrl || settings?.facebookUrl || settings?.whatsappNumber) && (
        <motion.div variants={itemVariants} className="space-y-4 pt-4">
          <div className="flex items-center gap-4">
            <div className="h-px bg-slate-100 flex-1"></div>
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Follow Our Journey</p>
            <div className="h-px bg-slate-100 flex-1"></div>
          </div>
          <div className="flex justify-center gap-4 flex-wrap">
            {/* New Settings Social Links */}
            {settings?.youtubeUrl && (
              <motion.a 
                whileTap={{ scale: 0.9 }}
                href={settings.youtubeUrl} 
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-slate-100 text-slate-600 hover:text-brand-primary transition-all duration-300"
                title="YouTube"
              >
                <PlayCircle size={22} />
              </motion.a>
            )}
            {settings?.instagramUrl && (
              <motion.a 
                whileTap={{ scale: 0.9 }}
                href={settings.instagramUrl} 
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-slate-100 text-slate-600 hover:text-brand-primary transition-all duration-300"
                title="Instagram"
              >
                <Instagram size={22} />
              </motion.a>
            )}
            {settings?.facebookUrl && (
              <motion.a 
                whileTap={{ scale: 0.9 }}
                href={settings.facebookUrl} 
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-slate-100 text-slate-600 hover:text-brand-primary transition-all duration-300"
                title="Facebook"
              >
                <Facebook size={22} />
              </motion.a>
            )}
            {settings?.whatsappNumber && (
              <motion.a 
                whileTap={{ scale: 0.9 }}
                href={`https://wa.me/${settings.whatsappNumber}`} 
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-slate-100 text-slate-600 hover:text-brand-primary transition-all duration-300"
                title="WhatsApp"
              >
                <Phone size={22} />
              </motion.a>
            )}

            {/* Legacy Social Links */}
            {socialLinks.map((social, i) => {
              const Icon = getIcon(social.platform);
              return (
                <motion.a 
                  key={`legacy-${i}`}
                  whileTap={{ scale: 0.9 }}
                  href={social.url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-slate-100 text-slate-600 hover:text-brand-primary transition-all duration-300"
                  title={social.platform}
                >
                  <Icon size={22} />
                </motion.a>
              );
            })}
          </div>
        </motion.div>
      )}

      <SuccessModal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} />
    </motion.div>
  );
};
