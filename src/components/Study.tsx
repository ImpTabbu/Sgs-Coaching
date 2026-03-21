import React from 'react';
import { SUBJECTS, CARD_COLORS } from '@/src/constants';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';

interface StudyProps {
  selectedLevel: string;
  selectedClass: string;
  onOpenModal: () => void;
  onSelectSubject: (subjectName: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
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

export const Study: React.FC<StudyProps> = ({ selectedLevel, selectedClass, onOpenModal, onSelectSubject }) => {
  const classSubjects = SUBJECTS[selectedLevel]?.[selectedClass] || [];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="px-6 pb-24 space-y-8 pt-6"
    >
      <motion.div variants={itemVariants} className="space-y-1">
        <h1 className="text-3xl font-display font-bold text-slate-800">Hello Children! 🥰</h1>
        <p className="text-sm text-slate-500 font-medium">What would you like to learn today?</p>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="space-y-0.5">
            <p className="text-[10px] text-brand-primary font-bold uppercase tracking-wider">Current Class</p>
            <h2 className="text-xl font-display font-bold text-slate-800">Class {selectedClass}</h2>
          </div>
          <button 
            onClick={onOpenModal}
            className="bg-slate-50 text-brand-primary border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 active:scale-95 transition-all"
          >
            Change Class
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 pb-4 no-scrollbar overflow-y-auto">
          {classSubjects.map((subject, index) => {
            const IconComponent = (Icons as any)[subject.icon] || Icons.BookOpen;
            const cardColor = CARD_COLORS[index % CARD_COLORS.length];
            
            return (
              <motion.button 
                key={index}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectSubject(subject.name)}
                className="relative overflow-hidden rounded-2xl p-5 text-white flex flex-col justify-between h-[160px] shadow-sm hover:shadow-md transition-shadow text-left group"
                style={{ backgroundColor: cardColor }}
              >
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10 text-lg font-display font-bold leading-tight drop-shadow-sm">{subject.name}</div>
                <div className="relative z-10 flex justify-end opacity-90 group-hover:scale-110 transition-transform duration-300">
                  <IconComponent size={44} strokeWidth={1.5} />
                </div>
              </motion.button>
            );
          })}
          {classSubjects.length === 0 && (
            <div className="col-span-2 text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
              <Icons.Inbox className="mx-auto text-slate-300 mb-3" size={32} />
              <p className="text-sm text-slate-500 font-medium">
                Subjects for this class will be added soon.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
