import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, X, Loader2, Edit, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import { SUBJECTS } from '../../constants';

interface TestData {
  id: string;
  title: string;
  className: string;
  subject: string;
  duration: string;
  status: string;
  marksperquestion: string | number;
  negativemarks: string | number;
  createdAt: { toDate: () => Date };
}

interface TestQuestionData {
  id: string;
  testId: string;
  question: string;
  imageUrl: string;
  options: string[];
  answer: string;
  explanation: string;
  createdAt: { toDate: () => Date };
}

interface AdminTestSeriesProps {
  tests: TestData[];
  testQuestions: TestQuestionData[];
  loading: boolean;
  editingId: string | null;
  editingType: string | null;
  activeTestId: string | null;
  setActiveTestId: (id: string | null) => void;
  testTitle: string;
  setTestTitle: (val: string) => void;
  testClass: string;
  setTestClass: (val: string) => void;
  testSubject: string;
  setTestSubject: (val: string) => void;
  testDuration: string;
  setTestDuration: (val: string) => void;
  testStatus: string;
  setTestStatus: (val: string) => void;
  testMarksPerQuestion: string;
  setTestMarksPerQuestion: (val: string) => void;
  testNegativeMarks: string;
  setTestNegativeMarks: (val: string) => void;
  testQuestion: string;
  setTestQuestion: (val: string) => void;
  testQuestionImage: string;
  setTestQuestionImage: (val: string) => void;
  testOptions: string[];
  setTestOptions: (val: string[]) => void;
  testAnswer: string;
  setTestAnswer: (val: string) => void;
  testExplanation: string;
  setTestExplanation: (val: string) => void;
  onSubmit: (e: React.FormEvent, type: string) => void;
  onEdit: (item: any, type: string) => void;
  onDelete: (id: string, col: string) => void;
  onCancelEdit: () => void;
  onClose: () => void;
}

export const AdminTestSeries: React.FC<AdminTestSeriesProps> = ({
  tests,
  testQuestions,
  loading,
  editingId,
  editingType,
  activeTestId,
  setActiveTestId,
  testTitle,
  setTestTitle,
  testClass,
  setTestClass,
  testSubject,
  setTestSubject,
  testDuration,
  setTestDuration,
  testStatus,
  setTestStatus,
  testMarksPerQuestion,
  setTestMarksPerQuestion,
  testNegativeMarks,
  setTestNegativeMarks,
  testQuestion,
  setTestQuestion,
  testQuestionImage,
  setTestQuestionImage,
  testOptions,
  setTestOptions,
  testAnswer,
  setTestAnswer,
  testExplanation,
  setTestExplanation,
  onSubmit,
  onEdit,
  onDelete,
  onCancelEdit,
  onClose
}) => {
  return (
    <motion.section 
      key="test_series"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-cyan-600">
          <div className="p-2 bg-cyan-50 rounded-xl">
            <Sparkles size={24} />
          </div>
          <h2 className="text-xl font-black tracking-tight">
            {activeTestId ? 'Manage Questions' : 'Test Series Manager'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {activeTestId && (
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => { setActiveTestId(null); onCancelEdit(); }} 
              className="text-cyan-600 bg-cyan-50 px-3 py-1.5 rounded-xl flex items-center gap-1 text-xs font-black uppercase tracking-wider"
            >
              <X size={14} /> Back to Tests
            </motion.button>
          )}
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>
      </div>

      {!activeTestId ? (
        <div className="space-y-8">
          {/* Create Test Form */}
          <form onSubmit={(e) => onSubmit(e, 'test')} className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
              {editingType === 'test' ? 'Update Test' : 'Create New Test'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Test Title</label>
                <input 
                  value={testTitle} 
                  onChange={(e) => setTestTitle(e.target.value)} 
                  placeholder="e.g. Mathematics Chapter 1" 
                  required 
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-medium" 
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Class</label>
                  <select 
                    value={testClass} 
                    onChange={(e) => setTestClass(e.target.value)} 
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-medium"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                  <select 
                    value={testSubject} 
                    onChange={(e) => setTestSubject(e.target.value)} 
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-medium"
                  >
                    {Array.from(new Set(
                      Object.values(SUBJECTS).flatMap(level => 
                        Object.values(level).flatMap(classSubjects => 
                          classSubjects.map(s => s.name)
                        )
                      )
                    )).sort().map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time (Min)</label>
                  <input 
                    type="number"
                    value={testDuration} 
                    onChange={(e) => setTestDuration(e.target.value)} 
                    placeholder="30" 
                    required 
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-medium" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                  <select 
                    value={testStatus} 
                    onChange={(e) => setTestStatus(e.target.value)} 
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-medium"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Marks per Question</label>
                  <input 
                    type="number"
                    value={testMarksPerQuestion} 
                    onChange={(e) => setTestMarksPerQuestion(e.target.value)} 
                    placeholder="1" 
                    required 
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-medium" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Negative Marks</label>
                  <input 
                    type="number"
                    step="0.25"
                    value={testNegativeMarks} 
                    onChange={(e) => setTestNegativeMarks(e.target.value)} 
                    placeholder="0" 
                    required 
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-medium" 
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              {editingType === 'test' && (
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
                className="flex-[2] bg-cyan-600 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-cyan-200 hover:bg-cyan-700 transition-all"
              >
                {loading ? <Loader2 className="animate-spin" /> : (editingType === 'test' ? 'Update Test Info' : 'Create Test')}
              </motion.button>
            </div>
          </form>

          {/* Test List */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Available Tests</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tests.map((test) => {
                const qCount = testQuestions.filter(q => q.testId === test.id).length;
                return (
                  <motion.div 
                    key={test.id} 
                    className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4 hover:bg-white hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900">{test.title}</h4>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-black uppercase bg-cyan-100 text-cyan-600 px-2 py-0.5 rounded-md">Class {test.className}</span>
                          <span className="text-[10px] font-black uppercase bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md">{test.subject}</span>
                          <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-600 px-2 py-0.5 rounded-md">{test.duration} Min</span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                            test.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 
                            test.status === 'Closed' ? 'bg-rose-100 text-rose-600' : 
                            'bg-slate-200 text-slate-600'
                          }`}>{test.status || 'Draft'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 mt-1">
                          <span>+{test.marksperquestion || 1} Marks</span>
                          <span>-{test.negativemarks || 0} Negative</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => onEdit(test, 'test')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><Edit size={16} /></button>
                        <button onClick={() => onDelete(test.id, 'tests')} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <div className="flex flex-col">
                        <p className={`text-[11px] font-bold ${qCount < 10 ? 'text-rose-500' : 'text-slate-400'}`}>
                          {qCount} Questions added
                        </p>
                        {qCount < 10 && <p className="text-[9px] text-rose-400 font-medium italic">Min 10 required</p>}
                      </div>
                      <button 
                        onClick={() => setActiveTestId(test.id)}
                        className="text-xs font-black text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Manage Questions +
                      </button>
                    </div>
                  </motion.div>
                );
              })}
              {tests.length === 0 && (
                <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <p className="text-slate-400 font-medium italic">No tests found. Please create one using the form above.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Add Question Form */}
          <form onSubmit={(e) => onSubmit(e, 'test_question')} className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">
              {editingType === 'test_question' ? 'Update Question' : 'Add New Question'}
            </h3>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Question Text</label>
              <textarea 
                value={testQuestion} 
                onChange={(e) => setTestQuestion(e.target.value)} 
                placeholder="Write your question here..." 
                required 
                rows={3}
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-medium resize-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Question Image URL (Optional)</label>
              <input 
                value={testQuestionImage} 
                onChange={(e) => setTestQuestionImage(e.target.value)} 
                placeholder="https://..." 
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-medium" 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testOptions.map((opt, idx) => (
                <div key={idx} className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Option {idx + 1}</label>
                  <input 
                    value={opt} 
                    onChange={(e) => {
                      const newOpts = [...testOptions];
                      newOpts[idx] = e.target.value;
                      setTestOptions(newOpts);
                    }} 
                    placeholder={`Option ${idx + 1}`} 
                    required 
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-medium" 
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correct Answer</label>
                <select 
                  value={testAnswer} 
                  onChange={(e) => setTestAnswer(e.target.value)} 
                  required
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-medium"
                >
                  <option value="">Select Correct Option</option>
                  {testOptions.map((opt, idx) => opt && (
                    <option key={idx} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Explanation (Optional)</label>
                <input 
                  value={testExplanation} 
                  onChange={(e) => setTestExplanation(e.target.value)} 
                  placeholder="Explain the correct answer..." 
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-medium" 
                />
              </div>
            </div>
            <div className="flex gap-4">
              {editingType === 'test_question' && (
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
                className="flex-[2] bg-cyan-600 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-cyan-200 hover:bg-cyan-700 transition-all"
              >
                {loading ? <Loader2 className="animate-spin" /> : (editingType === 'test_question' ? 'Update Question' : 'Add Question')}
              </motion.button>
            </div>
          </form>

          {/* Questions List */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Test Questions</h3>
            <div className="space-y-4">
              {testQuestions.filter(q => q.testId === activeTestId).map((q, idx) => (
                <motion.div 
                  key={q.id} 
                  className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4 hover:bg-white hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase bg-cyan-100 text-cyan-600 px-2 py-0.5 rounded-md">Question {idx + 1}</span>
                      </div>
                      <p className="font-bold text-slate-900">{q.question}</p>
                      {q.imageUrl && <img src={q.imageUrl} alt="" className="max-h-48 rounded-xl border border-slate-200" referrerPolicy="no-referrer" />}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.options.map((opt, i) => (
                          <div key={i} className={`p-3 rounded-xl text-xs font-medium border ${opt === q.answer ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold' : 'bg-white border-slate-200 text-slate-600'}`}>
                            {String.fromCharCode(65 + i)}. {opt}
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Explanation</p>
                          <p className="text-xs text-blue-700 font-medium">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button onClick={() => onEdit(q, 'test_question')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><Edit size={16} /></button>
                      <button onClick={() => onDelete(q.id, 'test_questions')} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.section>
  );
};
