import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  Timer,
  BookOpen,
  Loader2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Award,
  BarChart3,
  User as UserIcon
} from 'lucide-react';
import { googleSheetsService } from '../services/googleSheetsService';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Test {
  id: string;
  title: string;
  className: string;
  subject: string;
  duration: string;
  status?: string;
  marksperquestion?: string;
  negativemarks?: string;
}

interface Question {
  id: string;
  testId: string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  imageUrl?: string;
}

interface TestResult {
  id: string;
  testId: string;
  username: string;
  score: string;
  total: string;
  percentage: string;
  timeTaken: string;
  completedAt: string;
}

interface TestSeriesProps {
  isAdmin: boolean;
  sheetConfig: { 
    enabled: boolean; 
    id: string; 
    scriptUrl?: string;
    testSheetId?: string;
    testScriptUrl?: string;
  };
  user: { name: string; role: string } | null;
}

export function TestSeries({ isAdmin, sheetConfig, user }: TestSeriesProps) {
  const [tests, setTests] = useState<Test[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Test Taking State
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testStatus, setTestStatus] = useState<'idle' | 'taking' | 'completed'>('idle');
  const [testResult, setTestResult] = useState<{ score: number; total: number; percentage: number; correctCount: number; incorrectCount: number; skippedCount: number } | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const fetchData = useCallback(async () => {
    // Read directly from localStorage to ensure we have the latest config
    const isEnabled = localStorage.getItem('isSheetsEnabled') !== 'false';
    const mainSheetId = localStorage.getItem('sheetId') || '';
    const testSheetId = localStorage.getItem('testSheetId') || '';
    const testScriptUrl = localStorage.getItem('testScriptUrl') || '';

    if (!isEnabled || (!mainSheetId && !testSheetId)) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Use test-specific config if available, otherwise fallback to main config
      const config = testSheetId ? {
        sheetId: testSheetId,
        scriptUrl: testScriptUrl
      } : undefined;

      const data = await googleSheetsService.getTestData(config);
      console.log("Fetched Test Series data:", data);
      
        const mappedTests = (data.tests || []).map((t: any, i: number) => ({
          ...t,
          id: t.id || `test-${i}`,
          className: t.classname || t.className,
          status: t.status,
          marksperquestion: t.marksperquestion,
          negativemarks: t.negativemarks,
          createdAt: t.createdat || t.createdAt
        })).sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        console.log("Mapped and sorted tests:", mappedTests);
        setTests(mappedTests);
      setQuestions((data.testQuestions || []).map((q: any, i: number) => ({
        ...q,
        id: q.id || `q-${i}`,
        testId: q.testid || q.testId,
        option1: q.option1,
        option2: q.option2,
        option3: q.option3,
        option4: q.option4,
        explanation: q.explanation,
        imageUrl: q.imageurl || q.imageUrl,
        options: [q.option1, q.option2, q.option3, q.option4].filter(Boolean),
        createdAt: q.createdat || q.createdAt
      })).sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }));
      setResults((data.testResults || []).map((r: any, i: number) => ({
        ...r,
        id: r.id || `res-${i}`,
        testId: r.testid || r.testId,
        username: r.username || r.userName,
        score: r.score,
        total: r.total,
        percentage: r.percentage,
        timeTaken: r.timetaken || r.timeTaken,
        completedAt: r.completedat || r.completedAt
      })).sort((a, b) => {
        const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return dateB - dateA;
      }));
      setError(null);
    } catch (err) {
      console.error('Error fetching test data:', err);
      setError('Failed to load tests. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [sheetConfig]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (testStatus === 'taking' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            submitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testStatus, timeLeft]);

  const startTest = (test: Test) => {
    const testQuestions = questions.filter(q => q.testId === test.id);
    if (testQuestions.length === 0) {
      alert('This test has no questions yet.');
      return;
    }
    setActiveTest(test);
    setCurrentQuestionIdx(0);
    setUserAnswers({});
    setTimeLeft(parseInt(test.duration) * 60);
    setTestStatus('taking');
    setTestResult(null);
  };

  const submitTest = async () => {
    if (!activeTest || !user) return;

    const testQuestions = questions.filter(q => q.testId === activeTest.id);
    const marksPerQuestion = parseFloat(activeTest.marksperquestion || '1');
    const negativeMarks = parseFloat(activeTest.negativemarks || '0');
    
    let score = 0;
    let correctCount = 0;
    let incorrectCount = 0;

    testQuestions.forEach(q => {
      if (userAnswers[q.id]) {
        if (userAnswers[q.id] === q.answer) {
          score += marksPerQuestion;
          correctCount++;
        } else {
          score -= negativeMarks;
          incorrectCount++;
        }
      }
    });

    const totalMarks = testQuestions.length * marksPerQuestion;
    const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
    const skippedCount = testQuestions.length - correctCount - incorrectCount;

    setTestResult({ score, total: totalMarks, percentage, correctCount, incorrectCount, skippedCount });
    setTestStatus('completed');

    if (percentage >= 80) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    // Save result to Google Sheets
    try {
      const testSheetId = localStorage.getItem('testSheetId') || '';
      const testScriptUrl = localStorage.getItem('testScriptUrl') || '';
      const config = testSheetId ? {
        sheetId: testSheetId,
        scriptUrl: testScriptUrl
      } : undefined;

      const timeTaken = (parseInt(activeTest.duration) * 60) - timeLeft;

      await googleSheetsService.writeToSheet('add', 'TestResults', {
        id: Date.now().toString(),
        testid: activeTest.id,
        username: user.name,
        score: score.toString(),
        total: totalMarks.toString(),
        percentage: percentage.toFixed(2),
        timetaken: timeTaken.toString(),
        completedat: new Date().toISOString()
      }, config);
      fetchData(); // Refresh results for leaderboard
    } catch (err) {
      console.error('Error saving test result:', err);
    }
  };

  const generateCertificate = async () => {
    if (!activeTest || !testResult || !user) return;
    setGeneratingPDF(true);
    
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [800, 600]
    });

    // Create a temporary div for the certificate
    const certDiv = document.createElement('div');
    certDiv.style.width = '800px';
    certDiv.style.height = '600px';
    certDiv.style.padding = '40px';
    certDiv.style.background = '#fff';
    certDiv.style.border = '20px solid #0891b2'; // cyan-600
    certDiv.style.position = 'absolute';
    certDiv.style.left = '-9999px';
    certDiv.style.display = 'flex';
    certDiv.style.flexDirection = 'column';
    certDiv.style.alignItems = 'center';
    certDiv.style.justifyContent = 'center';
    certDiv.style.textAlign = 'center';
    certDiv.style.fontFamily = 'sans-serif';

    certDiv.innerHTML = `
      <div style="border: 2px solid #0891b2; padding: 40px; width: 100%; height: 100%; box-sizing: border-box; display: flex; flexDirection: column; alignItems: center; justifyContent: center;">
        <h1 style="font-size: 48px; color: #0891b2; margin-bottom: 10px; font-weight: 900; text-transform: uppercase;">Certificate of Achievement</h1>
        <p style="font-size: 18px; color: #64748b; margin-bottom: 40px; font-weight: 600; letter-spacing: 2px;">THIS IS PROUDLY PRESENTED TO</p>
        <h2 style="font-size: 42px; color: #0f172a; margin-bottom: 10px; font-weight: 800; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; min-width: 400px;">${user.name}</h2>
        <p style="font-size: 18px; color: #64748b; margin-bottom: 40px; max-width: 600px; line-height: 1.6;">
          For successfully completing the <strong>${activeTest.title}</strong> Test Series 
          with an outstanding score of <strong>${testResult.percentage.toFixed(1)}%</strong>.
        </p>
        <div style="display: flex; justify-content: space-between; width: 100%; margin-top: 40px;">
          <div style="text-align: center;">
            <div style="border-top: 1px solid #94a3b8; padding-top: 10px; width: 150px;">
              <p style="font-size: 14px; font-weight: 700; color: #0f172a;">SGS COACHING</p>
              <p style="font-size: 10px; color: #94a3b8;">Director</p>
            </div>
          </div>
          <div style="text-align: center;">
            <p style="font-size: 24px; font-weight: 900; color: #0891b2;">${new Date().toLocaleDateString()}</p>
            <p style="font-size: 10px; color: #94a3b8;">Date</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(certDiv);
    
    try {
      const canvas = await html2canvas(certDiv);
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 0, 0, 800, 600);
      doc.save(`${user.name}_Certificate_${activeTest.title}.pdf`);
    } catch (err) {
      console.error('Error generating certificate:', err);
    } finally {
      document.body.removeChild(certDiv);
      setGeneratingPDF(false);
    }
  };

  const generateMarksheet = async () => {
    if (!activeTest || !testResult || !user) return;
    setGeneratingPDF(true);

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [600, 800]
    });

    const marksheetDiv = document.createElement('div');
    marksheetDiv.style.width = '600px';
    marksheetDiv.style.padding = '40px';
    marksheetDiv.style.background = '#fff';
    marksheetDiv.style.position = 'absolute';
    marksheetDiv.style.left = '-9999px';
    marksheetDiv.style.fontFamily = 'sans-serif';

    const testQuestions = questions.filter(q => q.testId === activeTest.id);
    const rows = testQuestions.map((q, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px; text-align: center;">${idx + 1}</td>
        <td style="padding: 10px;">${q.question}</td>
        <td style="padding: 10px; text-align: center; color: ${userAnswers[q.id] === q.answer ? '#10b981' : '#ef4444'}">${userAnswers[q.id] || 'Skipped'}</td>
        <td style="padding: 10px; text-align: center; color: #10b981;">${q.answer}</td>
      </tr>
    `).join('');

    marksheetDiv.innerHTML = `
      <div style="border: 1px solid #e2e8f0; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 24px; color: #0f172a; margin-bottom: 5px;">SGS COACHING</h1>
          <p style="font-size: 14px; color: #64748b;">Test Series Result Marksheet</p>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">
          <div>
            <p style="font-size: 12px; color: #64748b; margin: 0;">Student Name</p>
            <p style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0;">${user.name}</p>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 12px; color: #64748b; margin: 0;">Date</p>
            <p style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0;">${new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <p style="font-size: 14px; font-weight: 700; margin-bottom: 10px;">Test Details:</p>
          <p style="font-size: 13px; margin: 2px 0;"><strong>Title:</strong> ${activeTest.title}</p>
          <p style="font-size: 13px; margin: 2px 0;"><strong>Subject:</strong> ${activeTest.subject}</p>
          <p style="font-size: 13px; margin: 2px 0;"><strong>Class:</strong> ${activeTest.className}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 30px;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
              <th style="padding: 10px; width: 40px;">#</th>
              <th style="padding: 10px; text-align: left;">Question</th>
              <th style="padding: 10px;">Your Ans</th>
              <th style="padding: 10px;">Correct Ans</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div style="background: #f1f5f9; padding: 20px; border-radius: 10px; display: flex; justify-content: space-around; text-align: center;">
          <div>
            <p style="font-size: 10px; color: #64748b; margin: 0;">TOTAL QUESTIONS</p>
            <p style="font-size: 18px; font-weight: 900; color: #0f172a; margin: 0;">${testResult.total}</p>
          </div>
          <div>
            <p style="font-size: 10px; color: #64748b; margin: 0;">CORRECT ANSWERS</p>
            <p style="font-size: 18px; font-weight: 900; color: #10b981; margin: 0;">${testResult.score}</p>
          </div>
          <div>
            <p style="font-size: 10px; color: #64748b; margin: 0;">PERCENTAGE</p>
            <p style="font-size: 18px; font-weight: 900; color: #0891b2; margin: 0;">${testResult.percentage.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(marksheetDiv);

    try {
      const canvas = await html2canvas(marksheetDiv);
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 0, 0, 600, 800);
      doc.save(`${user.name}_Marksheet_${activeTest.title}.pdf`);
    } catch (err) {
      console.error('Error generating marksheet:', err);
    } finally {
      document.body.removeChild(marksheetDiv);
      setGeneratingPDF(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRankings = (testId: string) => {
    return results
      .filter(r => r.testId === testId)
      .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage))
      .slice(0, 10);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="w-10 h-10 text-cyan-600 animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse">Loading Test Series...</p>
      </div>
    );
  }

  if (testStatus === 'taking' && activeTest) {
    const testQuestions = questions.filter(q => q.testId === activeTest.id);
    const currentQuestion = testQuestions[currentQuestionIdx];

    return (
      <div className="p-6 space-y-6">
        {/* Test Header */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-600">
              <Timer size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Remaining</p>
              <p className={cn(
                "text-lg font-black tabular-nums",
                timeLeft < 60 ? "text-rose-600 animate-pulse" : "text-slate-900"
              )}>
                {formatTime(timeLeft)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</p>
            <p className="text-lg font-black text-slate-900">
              {currentQuestionIdx + 1} / {testQuestions.length}
            </p>
          </div>
        </div>

        {/* Question Card */}
        <motion.div 
          key={currentQuestionIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8"
        >
          <div className="space-y-4">
            <span className="text-[10px] font-black text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full uppercase tracking-widest">
              Question {currentQuestionIdx + 1}
            </span>
            <h2 className="text-xl font-bold text-slate-900 leading-relaxed">
              {currentQuestion.question}
            </h2>
            {currentQuestion.imageUrl && (
              <div className="mt-4 rounded-2xl overflow-hidden border border-slate-100">
                <img 
                  src={currentQuestion.imageUrl} 
                  alt="Question" 
                  className="w-full h-auto max-h-[400px] object-contain bg-slate-50"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options.map((option, idx) => (
              <motion.button
                whileTap={{ scale: 0.98 }}
                key={idx}
                onClick={() => setUserAnswers({ ...userAnswers, [currentQuestion.id]: option })}
                className={cn(
                  "p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between group",
                  userAnswers[currentQuestion.id] === option
                    ? "border-cyan-500 bg-cyan-50/50 text-cyan-700"
                    : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200 hover:bg-white"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                    userAnswers[currentQuestion.id] === option
                      ? "bg-cyan-500 text-white"
                      : "bg-white text-slate-400 border border-slate-200"
                  )}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="font-bold">{option}</span>
                </div>
                {userAnswers[currentQuestion.id] === option && (
                  <CheckCircle2 size={20} className="text-cyan-500" />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            disabled={currentQuestionIdx === 0}
            onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
            className="flex-1 p-4 rounded-2xl bg-white border border-slate-200 text-slate-600 font-black flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ChevronLeft size={20} /> Previous
          </button>
          {currentQuestionIdx === testQuestions.length - 1 ? (
            <button
              onClick={submitTest}
              className="flex-[2] p-4 rounded-2xl bg-cyan-600 text-white font-black flex items-center justify-center gap-2 shadow-lg shadow-cyan-200"
            >
              Submit Test <CheckCircle2 size={20} />
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
              className="flex-[2] p-4 rounded-2xl bg-slate-900 text-white font-black flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
            >
              Next Question <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (testStatus === 'completed' && testResult) {
    return (
      <div className="p-6 space-y-8">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 text-center space-y-6"
        >
          <div className="w-24 h-24 bg-cyan-50 rounded-full flex items-center justify-center mx-auto text-cyan-600">
            <Trophy size={48} />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900">Test Completed!</h2>
            <p className="text-slate-500 font-medium">Great job on finishing the {activeTest?.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</p>
              <p className="text-3xl font-black text-slate-900">{testResult.score} / {testResult.total}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Percentage</p>
              <p className="text-3xl font-black text-cyan-600">{testResult.percentage.toFixed(1)}%</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Correct</p>
              <p className="text-2xl font-black text-emerald-700">{testResult.correctCount}</p>
            </div>
            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Incorrect</p>
              <p className="text-2xl font-black text-rose-700">{testResult.incorrectCount}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Skipped</p>
              <p className="text-2xl font-black text-slate-600">{testResult.skippedCount}</p>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <button 
                disabled={generatingPDF}
                onClick={generateCertificate}
                className="p-4 bg-amber-500 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-200 disabled:opacity-50"
              >
                {generatingPDF ? <Loader2 className="animate-spin" size={18} /> : <Award size={18} />} Certificate
              </button>
              <button 
                disabled={generatingPDF}
                onClick={generateMarksheet}
                className="p-4 bg-emerald-500 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 disabled:opacity-50"
              >
                {generatingPDF ? <Loader2 className="animate-spin" size={18} /> : <BarChart3 size={18} />} Marksheet
              </button>
            </div>
            <button 
              onClick={() => { setTestStatus('idle'); setActiveTest(null); }}
              className="w-full p-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
            >
              Back to Test Series
            </button>
            <button 
              onClick={() => setShowLeaderboard(true)}
              className="w-full p-4 bg-cyan-50 text-cyan-600 rounded-2xl font-black flex items-center justify-center gap-2"
            >
              View Leaderboard <BarChart3 size={20} />
            </button>
          </div>
        </motion.div>

        {/* Detailed Review */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest ml-1">Question Review</h3>
          <div className="space-y-3">
            {questions.filter(q => q.testId === activeTest?.id).map((q, idx) => {
              const isCorrect = userAnswers[q.id] === q.answer;
              return (
                <div key={q.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-start gap-4">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                    isCorrect ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                  )}>
                    {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  </div>
                  <div className="space-y-1 w-full">
                    <p className="font-bold text-slate-900 text-sm">{q.question}</p>
                    {q.imageUrl && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-slate-100 max-w-xs">
                        <img 
                          src={q.imageUrl} 
                          alt="Question" 
                          className="w-full h-auto object-contain bg-slate-50"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <p className="text-[11px] font-bold text-slate-500">Your Answer: <span className={isCorrect ? "text-emerald-600" : "text-rose-600"}>{userAnswers[q.id] || 'Skipped'}</span></p>
                      {!isCorrect && <p className="text-[11px] font-bold text-emerald-600">Correct: {q.answer}</p>}
                    </div>
                    {q.explanation && (
                      <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-xs font-bold text-slate-700 mb-1">Explanation:</p>
                        <p className="text-xs text-slate-600">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600 shadow-sm">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Test Series</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Challenge your knowledge</p>
          </div>
        </div>
      </div>

      {/* Test List */}
      <div className="grid grid-cols-1 gap-4">
        {tests.filter(t => isAdmin || t.status === 'Active').length === 0 ? (
          <div className="bg-white p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <BookOpen size={32} />
            </div>
            <p className="text-slate-400 font-bold">No tests available at the moment.</p>
          </div>
        ) : (
          tests.filter(t => isAdmin || t.status === 'Active').map((test, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={test.id}
              className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-cyan-200 transition-all"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600 shrink-0 group-hover:scale-110 transition-transform">
                  <Award size={28} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900">{test.title}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase bg-cyan-100 text-cyan-600 px-2 py-0.5 rounded-md">Class {test.className}</span>
                    <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">{test.subject}</span>
                    <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-600 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Clock size={10} /> {test.duration} Min
                    </span>
                    {test.status && (
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${test.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {test.status}
                      </span>
                    )}
                    <span className="text-[10px] font-black uppercase bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-md">
                      {test.marksperquestion || '1'} Marks/Q
                    </span>
                    <span className="text-[10px] font-black uppercase bg-rose-100 text-rose-600 px-2 py-0.5 rounded-md">
                      -{test.negativemarks || '0'} Negative
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => { setActiveTest(test); setShowLeaderboard(true); }}
                  className="p-4 rounded-2xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
                  title="View Leaderboard"
                >
                  <BarChart3 size={20} />
                </button>
                <button 
                  onClick={() => startTest(test)}
                  className="flex-grow md:flex-none px-8 py-4 bg-cyan-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-cyan-200 hover:bg-cyan-700 transition-all"
                >
                  Start Test <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Leaderboard Modal */}
      <AnimatePresence>
        {showLeaderboard && activeTest && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLeaderboard(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 bg-cyan-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy size={24} />
                  <div>
                    <h3 className="font-black text-lg">Leaderboard</h3>
                    <p className="text-[10px] font-bold uppercase opacity-80 tracking-widest">{activeTest.title}</p>
                  </div>
                </div>
                <button onClick={() => setShowLeaderboard(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="flex-grow overflow-y-auto p-6 space-y-3 no-scrollbar">
                {getRankings(activeTest.id).length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <AlertCircle className="w-12 h-12 text-slate-200 mx-auto" />
                    <p className="text-slate-400 font-bold">No results yet for this test.</p>
                  </div>
                ) : (
                  getRankings(activeTest.id).map((rank, idx) => (
                    <div key={rank.id || `rank-${idx}`} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-black text-xs",
                          idx === 0 ? "bg-amber-100 text-amber-600" :
                          idx === 1 ? "bg-slate-200 text-slate-600" :
                          idx === 2 ? "bg-orange-100 text-orange-600" :
                          "bg-white text-slate-400"
                        )}>
                          {idx + 1}
                        </div>
                        <div className="flex items-center gap-2">
                          <UserIcon size={14} className="text-slate-400" />
                          <span className="font-bold text-slate-900">{rank.username}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-cyan-600">{rank.percentage}%</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">{rank.score}/{rank.total}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <button 
                  onClick={() => setShowLeaderboard(false)}
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Close Leaderboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
