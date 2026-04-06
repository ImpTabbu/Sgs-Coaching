import React from 'react';
import { motion } from 'motion/react';
import { Award, X, Trash2 } from 'lucide-react';

interface TestResultData {
  id: string;
  testId: string;
  username: string;
  score: string | number;
  total: string | number;
  percentage: string | number;
  timeTaken: string;
  completedAt: { toDate: () => Date };
}

interface TestData {
  id: string;
  title: string;
}

interface AdminTestResultsProps {
  testResults: TestResultData[];
  tests: TestData[];
  onDelete: (id: string, col: string) => void;
  onClose: () => void;
}

export const AdminTestResults: React.FC<AdminTestResultsProps> = ({
  testResults,
  tests,
  onDelete,
  onClose
}) => {
  return (
    <motion.section 
      key="test_results"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-indigo-600">
          <div className="p-2 bg-indigo-50 rounded-xl">
            <Award size={24} />
          </div>
          <h2 className="text-xl font-black tracking-tight">Test Results</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={20} className="text-slate-400" />
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Student Submissions</h3>
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
          {testResults.map((result, index) => {
            const test = tests.find(t => t.id === result.testId);
            return (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                key={result.id} 
                className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <Award size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-900 truncate text-sm">{result.username}</p>
                    <p className="text-[10px] text-slate-500 truncate font-medium">{test?.title || 'Unknown Test'}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-600">Score: {result.score}/{result.total}</span>
                      <span className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-600">{result.percentage}%</span>
                      <span className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-600">{result.timeTaken}</span>
                      <span className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-600">{result.completedAt.toDate().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 justify-end">
                  <motion.button 
                    whileTap={{ scale: 0.9 }} 
                    onClick={() => onDelete(result.id, 'test_results')} 
                    className="p-2 text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
          {testResults.length === 0 && (
            <div className="py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-400 font-medium italic">No test results found.</p>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
};
