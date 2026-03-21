import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Youtube, Instagram, Facebook, MessageCircle, ExternalLink, PhoneCall } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { googleSheetsService } from '../services/googleSheetsService';

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

export const Contact: React.FC = () => {
  const [contactImage, setContactImage] = useState('https://picsum.photos/seed/contact/800/400');
  const [socialLinks, setSocialLinks] = useState<any[]>([]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await googleSheetsService.getAllData();
        const settings = data.appSettings || [];
        const imgSetting = settings.find((s: any) => s.settingkey === 'contact_image' || s.key === 'contact_image');
        if (imgSetting) {
          setContactImage(imgSetting.settingvalue || imgSetting.value);
        }
        setSocialLinks(data.socialLinks || []);
      } catch (err) {
        console.error("Failed to fetch contact data:", err);
      }
    };
    fetchSettings();
  }, []);

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Youtube: Youtube,
      Instagram: Instagram,
      Facebook: Facebook,
      Whatsapp: MessageCircle,
    };
    return icons[iconName] || ExternalLink;
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-8 bg-background min-h-screen pb-24 pt-6"
    >
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-display font-bold text-slate-900">Get in Touch</h1>
        <p className="text-sm text-slate-500 font-medium">We're here to help you succeed</p>
      </div>

      {/* Main Contact Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="relative h-48 overflow-hidden">
          <img
            src={contactImage}
            alt="Coaching Center"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
        </div>

        <div className="p-6 -mt-12 relative space-y-8">
          {/* Contact Details */}
          <div className="space-y-4">
            <motion.div variants={itemVariants} className="flex items-center gap-4 group p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all duration-300">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-primary shrink-0 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                <Phone size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Phone Number</p>
                <p className="text-sm font-bold text-slate-800">+91 8953208909</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-4 group p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all duration-300">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-secondary shrink-0 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                <Mail size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Email Address</p>
                <p className="text-sm font-bold text-slate-800 break-all">sgsworkvikas@gmail.com</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-4 group p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all duration-300">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-accent shrink-0 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                <MapPin size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Location</p>
                <p className="text-xs font-bold text-slate-800 leading-relaxed">
                  In front of Panchayat Bhavan, Sukhariganj, Ambedkarnagar, UP-224168, India
                </p>
              </div>
            </motion.div>
          </div>

          {/* Call Now Button */}
          <motion.a 
            variants={itemVariants}
            whileTap={{ scale: 0.95 }}
            href="tel:+918953208909"
            className="w-full bg-brand-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-shadow"
          >
            <PhoneCall size={20} /> Call Now
          </motion.a>

          {/* Quick Message Form */}
          <motion.div variants={itemVariants} className="space-y-4 pt-4 border-t border-slate-100">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800">Send a Quick Message</h3>
              <p className="text-xs text-slate-500">We'll get back to you shortly.</p>
            </div>
            <form className="space-y-3">
              <input type="text" placeholder="Your Name" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all" />
              <textarea placeholder="Your Message" rows={3} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all resize-none"></textarea>
              <button type="button" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors">Send Message</button>
            </form>
          </motion.div>

          {/* Social Links */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="h-px bg-slate-100 flex-1"></div>
              <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Follow Our Journey</p>
              <div className="h-px bg-slate-100 flex-1"></div>
            </div>
            <div className="flex justify-center gap-4">
              {socialLinks.map((social, i) => {
                const Icon = getIcon(social.platform);
                return (
                  <motion.a 
                    key={i}
                    variants={itemVariants}
                    whileTap={{ scale: 0.9 }}
                    href={social.url} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border border-slate-100 bg-slate-50 text-slate-600 hover:bg-brand-primary hover:text-white"
                    title={social.platform}
                  >
                    <Icon size={22} />
                  </motion.a>
                );
              })}
              {socialLinks.length === 0 && (
                <p className="text-[10px] text-slate-400 italic">No social links added yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Map Placeholder */}
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-3xl p-8 text-center space-y-4 border border-slate-100 shadow-sm"
      >
        <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mx-auto border border-slate-100">
          <MapPin size={24} />
        </div>
        <div className="space-y-1">
          <p className="font-bold text-slate-800">Visit Our Center</p>
          <p className="text-xs text-slate-500">Open Monday - Saturday: 8 AM to 6 PM</p>
        </div>
        <button className="text-brand-primary text-sm font-bold flex items-center gap-1 mx-auto bg-brand-primary/5 px-4 py-2 rounded-xl hover:bg-brand-primary/10 transition-colors">
          Open in Google Maps <ExternalLink size={14} />
        </button>
      </motion.div>
    </motion.div>
  );
};
