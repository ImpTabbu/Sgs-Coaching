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
  User as UserIcon,
  Medal,
  Zap,
  Star,
  Crown,
  Shield,
  Target,
  X
} from 'lucide-react';
import { firebaseService } from '../services/firebaseService';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';

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
  isRetake?: boolean;
  userAnswers?: Record<string, string>;
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

  // Filters
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedGlobalClass, setSelectedGlobalClass] = useState<string>('All');
  const [selectedGlobalTest, setSelectedGlobalTest] = useState<string>('All');

  // Test Taking State
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [activeTestQuestions, setActiveTestQuestions] = useState<Question[]>([]);
  const [warnings, setWarnings] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testStatus, setTestStatus] = useState<'idle' | 'taking' | 'completed'>('idle');
  const [testResult, setTestResult] = useState<{ score: number; total: number; percentage: number; correctCount: number; incorrectCount: number; skippedCount: number } | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showGlobalLeaderboard, setShowGlobalLeaderboard] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showRetakeConfirm, setShowRetakeConfirm] = useState<Test | null>(null);

  useEffect(() => {
    let unsubscribeTests: (() => void) | undefined;
    let unsubscribeResults: (() => void) | undefined;

    const setupSubscriptions = () => {
      setLoading(true);
      
      // Subscribe to Tests
      unsubscribeTests = firebaseService.subscribeToCollection('Tests', (data) => {
        const mappedTests = data.map((t: any, i: number) => ({
          ...t,
          id: t.id || `test-${i}`,
          className: t.classname || t.className,
          status: t.status,
          marksperquestion: t.marksperquestion,
          negativemarks: t.negativemarks,
          createdAt: t.createdat || t.createdAt
        }));
        setTests(mappedTests);
        setLoading(false);
      });

      // Subscribe to TestResults (filtered by user if not admin, or just all for now)
      // For 1000+ students, we should ideally filter by user.name
      const resultFilters = isAdmin ? undefined : [{ field: 'username', value: user?.name }];
      
      unsubscribeResults = firebaseService.subscribeToCollection('TestResults', (data) => {
        const mappedResults = data.map((r: any, i: number) => ({
          ...r,
          id: r.id || `res-${i}`,
          testId: r.testid || r.testId,
          username: r.username || r.userName || r.name || 'Unknown User',
          score: r.score,
          total: r.total,
          percentage: r.percentage,
          timeTaken: r.timetaken || r.timeTaken,
          completedAt: r.completedat || r.completedAt,
          isRetake: r.isRetake || r.isretake || false,
          userAnswers: r.userAnswers || r.useranswers || {}
        }));
        setResults(mappedResults);
      }, resultFilters);
    };

    setupSubscriptions();

    return () => {
      if (unsubscribeTests) unsubscribeTests();
      if (unsubscribeResults) unsubscribeResults();
    };
  }, [isAdmin, user?.name]);

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

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && testStatus === 'taking') {
        setWarnings(prev => {
          const newWarnings = prev + 1;
          if (newWarnings >= 3) {
            alert('Test auto-submitted due to multiple tab switches.');
            // We can't call submitTest directly here because it might have stale state in this closure,
            // but we can set timeLeft to 0 to trigger auto-submit via the timer effect.
            setTimeLeft(0);
          } else {
            alert(`Warning ${newWarnings}/3: Please do not switch tabs or minimize the app during the test!`);
          }
          return newWarnings;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [testStatus]);

  const getProgressKey = (testId: string) => `testProgress_${user?.name}_${testId}`;

  // Auto-save progress
  useEffect(() => {
    if (testStatus === 'taking' && activeTest && user) {
      const progress = {
        activeTestQuestions,
        currentQuestionIdx,
        userAnswers,
        timeLeft,
        warnings
      };
      localStorage.setItem(getProgressKey(activeTest.id), JSON.stringify(progress));
    }
  }, [testStatus, activeTest, activeTestQuestions, currentQuestionIdx, userAnswers, timeLeft, warnings, user]);

  const startTest = async (test: Test, forceRetake: boolean = false) => {
    if (user && !forceRetake) {
      const hasTaken = results.some(r => r.testId === test.id && r.username === user.name);
      if (hasTaken) {
        setShowRetakeConfirm(test);
        return;
      }
    }

    setLoading(true);
    try {
      // Fetch questions only for THIS test to save massive reads
      const testQuestionsData = await firebaseService.fetchCollection('TestQuestions', [
        { field: 'testid', value: test.id }
      ]);

      const testQuestions = testQuestionsData.map((q: any, i: number) => ({
        ...q,
        id: q.id || `q-${i}`,
        testId: q.testid || q.testId,
        options: [q.option1, q.option2, q.option3, q.option4].filter(Boolean),
      }));

      if (testQuestions.length === 0) {
        alert('This test has no questions yet.');
        setLoading(false);
        return;
      }

      // Shuffle questions and their options
      const shuffledQuestions = [...testQuestions].sort(() => Math.random() - 0.5).map(q => {
        const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
        return { ...q, options: shuffledOptions };
      });

      setActiveTestQuestions(shuffledQuestions);
      setActiveTest(test);
      setCurrentQuestionIdx(0);
      setUserAnswers({});
      setTimeLeft(parseInt(test.duration) * 60);
      setTestStatus('taking');
      setTestResult(null);
      setWarnings(0);
      setShowReview(false);
    } catch (err) {
      console.error('Error starting test:', err);
      alert('Failed to load test questions.');
    } finally {
      setLoading(false);
    }
  };

  const reviewPastTest = async (test: Test) => {
    if (!user) return;
    // Get the most recent result for this test
    const pastResults = results.filter(r => r.testId === test.id && r.username === user.name);
    if (pastResults.length === 0) return;
    
    setLoading(true);
    try {
      // Fetch questions only for THIS test
      const testQuestionsData = await firebaseService.fetchCollection('TestQuestions', [
        { field: 'testid', value: test.id }
      ]);

      const testQuestions = testQuestionsData.map((q: any, i: number) => ({
        ...q,
        id: q.id || `q-${i}`,
        testId: q.testid || q.testId,
        options: [q.option1, q.option2, q.option3, q.option4].filter(Boolean),
      }));

      // Sort to get the latest if there are multiple
      const pastResult = pastResults.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];
      
      let correctCount = 0;
      let incorrectCount = 0;
      const answers = pastResult.userAnswers || {};

      testQuestions.forEach(q => {
        if (answers[q.id]) {
          if (answers[q.id] === q.answer) {
            correctCount++;
          } else {
            incorrectCount++;
          }
        }
      });

      const skippedCount = testQuestions.length - correctCount - incorrectCount;

      setActiveTest(test);
      setActiveTestQuestions(testQuestions);
      setUserAnswers(answers);
      setTestResult({
        score: parseFloat(pastResult.score),
        total: parseFloat(pastResult.total),
        percentage: parseFloat(pastResult.percentage),
        correctCount,
        incorrectCount,
        skippedCount
      });
      setTestStatus('completed');
      setShowReview(true);
    } catch (err) {
      console.error('Error reviewing test:', err);
    } finally {
      setLoading(false);
    }
  };

  const submitTest = async () => {
    if (!activeTest || !user) return;

    // Clear saved progress
    localStorage.removeItem(getProgressKey(activeTest.id));

    const marksPerQuestion = parseFloat(activeTest.marksperquestion || '1');
    const negativeMarks = parseFloat(activeTest.negativemarks || '0');
    
    let score = 0;
    let correctCount = 0;
    let incorrectCount = 0;

    activeTestQuestions.forEach(q => {
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

    const totalMarks = activeTestQuestions.length * marksPerQuestion;
    const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
    const skippedCount = activeTestQuestions.length - correctCount - incorrectCount;

    setTestResult({ score, total: totalMarks, percentage, correctCount, incorrectCount, skippedCount });
    setTestStatus('completed');

    if (percentage >= 80) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    // Save result to Firebase
    try {
      const timeTaken = (parseInt(activeTest.duration) * 60) - timeLeft;
      const existingResult = results.find(r => r.testId === activeTest.id && r.username === user.name);

      const resultData = {
        testid: activeTest.id,
        username: user.name,
        score: score.toString(),
        total: totalMarks.toString(),
        percentage: percentage.toFixed(2),
        timetaken: timeTaken.toString(),
        completedat: new Date().toISOString(),
        isretake: existingResult ? true : false
      };

      if (existingResult) {
        await firebaseService.writeToCollection('update', 'TestResults', {
          id: existingResult.id,
          ...resultData
        });
      } else {
        await firebaseService.writeToCollection('add', 'TestResults', {
          id: Date.now().toString(),
          ...resultData
        });
      }
      // Real-time subscription handles result update
    } catch (err) {
      console.error('Error saving test result:', err);
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
      .sort((a, b) => {
        const diff = parseFloat(b.percentage) - parseFloat(a.percentage);
        if (diff !== 0) return diff;
        // If percentages are equal, sort by completedAt ascending (earlier is better)
        const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return dateA - dateB;
      })
      .slice(0, 10);
  };

  const getGlobalRankings = (filterClass: string, filterTestId: string) => {
    // Aggregate results per user
    const userStats: Record<string, { totalPercentage: number; testsTaken: number; avgPercentage: number; isRetake: boolean }> = {};
    
    results.forEach(r => {
      const test = tests.find(t => t.id === r.testId);
      if (!test) return;
      
      if (filterClass !== 'All' && test.className !== filterClass) return;
      if (filterTestId !== 'All' && test.id !== filterTestId) return;

      if (!userStats[r.username]) {
        userStats[r.username] = { totalPercentage: 0, testsTaken: 0, avgPercentage: 0, isRetake: false };
      }
      userStats[r.username].totalPercentage += parseFloat(r.percentage);
      userStats[r.username].testsTaken += 1;
      if (r.isRetake) {
        userStats[r.username].isRetake = true;
      }
    });

    return Object.entries(userStats)
      .map(([username, stats]) => ({
        username,
        avgPercentage: stats.totalPercentage / stats.testsTaken,
        testsTaken: stats.testsTaken,
        isRetake: stats.isRetake
      }))
      .sort((a, b) => b.avgPercentage - a.avgPercentage)
      .slice(0, 50); // Top 50
  };

  const getUserBadges = (username: string) => {
    const userResults = results.filter(r => r.username === username);
    const badges = [];

    if (userResults.length === 0) return badges;

    // 1. Scholar Badge (Perfect Score)
    if (userResults.some(r => parseFloat(r.percentage) === 100)) {
      badges.push({
        id: 'scholar',
        name: 'Scholar',
        description: 'Achieved a perfect 100% score on a test',
        icon: Crown,
        color: 'text-amber-500',
        bg: 'bg-amber-100'
      });
    }

    // 2. Consistent Performer (Completed 5+ tests)
    if (userResults.length >= 5) {
      badges.push({
        id: 'consistent',
        name: 'Consistent',
        description: 'Completed 5 or more tests',
        icon: Shield,
        color: 'text-emerald-500',
        bg: 'bg-emerald-100'
      });
    }

    // 3. Fast Learner (Completed a test in less than 50% time with > 80% score)
    const hasFastLearner = userResults.some(r => {
      const test = tests.find(t => t.id === r.testId);
      if (!test || !r.timeTaken) return false;
      const totalTimeSeconds = parseInt(test.duration) * 60;
      const timeTakenSeconds = parseInt(r.timeTaken);
      return timeTakenSeconds < (totalTimeSeconds / 2) && parseFloat(r.percentage) >= 80;
    });

    if (hasFastLearner) {
      badges.push({
        id: 'fast-learner',
        name: 'Fast Learner',
        description: 'Scored 80%+ in less than half the time',
        icon: Zap,
        color: 'text-blue-500',
        bg: 'bg-blue-100'
      });
    }

    // 4. Top Ranker (Ranked #1 in any test)
    let isTopRanker = false;
    const uniqueTestIds = Array.from(new Set(userResults.map(r => r.testId)));
    for (const testId of uniqueTestIds) {
      const rankings = getRankings(testId as string);
      if (rankings.length > 0 && rankings[0].username === username) {
        isTopRanker = true;
        break;
      }
    }

    if (isTopRanker) {
      badges.push({
        id: 'top-ranker',
        name: 'Top Ranker',
        description: 'Ranked #1 in a test',
        icon: Medal,
        color: 'text-purple-500',
        bg: 'bg-purple-100'
      });
    }

    return badges;
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
    const currentQuestion = activeTestQuestions[currentQuestionIdx];

    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Test Header */}
        <div className="flex items-center justify-between bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-100 sticky top-0 z-20">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-600 shrink-0">
              <Timer size={18} />
            </div>
            <div>
              <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Left</p>
              <p className={cn(
                "text-sm sm:text-lg font-black tabular-nums",
                timeLeft < 60 ? "text-rose-600 animate-pulse" : "text-slate-900"
              )}>
                {formatTime(timeLeft)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</p>
            <p className="text-sm sm:text-lg font-black text-slate-900">
              {currentQuestionIdx + 1} / {activeTestQuestions.length}
            </p>
          </div>
        </div>

        {/* Question Card */}
        <motion.div 
          key={currentQuestionIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-5 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6 sm:space-y-8"
        >
          <div className="space-y-3 sm:space-y-4">
            <span className="text-[9px] sm:text-[10px] font-black text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full uppercase tracking-widest">
              Question {currentQuestionIdx + 1}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed">
              {currentQuestion.question}
            </h2>
            {currentQuestion.imageUrl && (
              <div className="mt-4 rounded-2xl overflow-hidden border border-slate-100">
                <img 
                  src={currentQuestion.imageUrl} 
                  alt="Question" 
                  className="w-full h-auto max-h-[300px] sm:max-h-[400px] object-contain bg-slate-50"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
            {currentQuestion.options.map((option, idx) => (
              <motion.button
                whileTap={{ scale: 0.98 }}
                key={idx}
                onClick={() => setUserAnswers({ ...userAnswers, [currentQuestion.id]: option })}
                className={cn(
                  "p-4 sm:p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between group",
                  userAnswers[currentQuestion.id] === option
                    ? "border-cyan-500 bg-cyan-50/50 text-cyan-700"
                    : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200 hover:bg-white"
                )}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={cn(
                    "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shrink-0",
                    userAnswers[currentQuestion.id] === option
                      ? "bg-cyan-500 text-white"
                      : "bg-white text-slate-400 border border-slate-200"
                  )}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="font-bold text-sm sm:text-base">{option}</span>
                </div>
                {userAnswers[currentQuestion.id] === option && (
                  <CheckCircle2 size={18} className="text-cyan-500 shrink-0" />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3 sm:gap-4 sticky bottom-4 z-20">
          <button
            disabled={currentQuestionIdx === 0}
            onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
            className="flex-1 p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 text-slate-600 font-black flex items-center justify-center gap-2 disabled:opacity-50 text-sm shadow-lg"
          >
            <ChevronLeft size={18} /> <span className="hidden sm:inline">Previous</span>
          </button>
          {currentQuestionIdx === activeTestQuestions.length - 1 ? (
            <button
              onClick={submitTest}
              className="flex-[2] p-3.5 sm:p-4 rounded-2xl bg-cyan-600 text-white font-black flex items-center justify-center gap-2 shadow-lg shadow-cyan-200 text-sm"
            >
              Submit Test <CheckCircle2 size={18} />
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
              className="flex-[2] p-3.5 sm:p-4 rounded-2xl bg-slate-900 text-white font-black flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 text-sm"
            >
              Next <span className="hidden sm:inline">Question</span> <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (testStatus === 'completed' && testResult) {
    if (showReview) {
      return (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-100 sticky top-0 z-20">
            <h2 className="text-lg sm:text-xl font-black text-slate-900">Review Answers</h2>
            <button 
              onClick={() => setShowReview(false)}
              className="p-2 bg-slate-100 text-slate-600 rounded-xl font-black"
            >
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4 sm:space-y-6">
            {activeTestQuestions.map((q, idx) => {
              const userAnswer = userAnswers[q.id];
              const isCorrect = userAnswer === q.answer;
              const isSkipped = !userAnswer;

              return (
                <div key={q.id} className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={cn(
                      "w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-black shrink-0 text-xs sm:text-sm",
                      isCorrect ? "bg-emerald-100 text-emerald-600" : 
                      isSkipped ? "bg-slate-100 text-slate-500" : "bg-rose-100 text-rose-600"
                    )}>
                      {idx + 1}
                    </div>
                    <div className="space-y-2 flex-1 min-w-0">
                      <p className="text-base sm:text-lg font-bold text-slate-900 leading-tight">{q.question}</p>
                      {q.imageUrl && (
                        <img src={q.imageUrl} alt="Question" className="max-w-full h-auto rounded-xl border border-slate-100" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 pl-10 sm:pl-12">
                    {q.options.map((opt, i) => {
                      const isSelected = userAnswer === opt;
                      const isActualAnswer = q.answer === opt;
                      
                      let optionClass = "p-2.5 sm:p-3 rounded-xl border-2 text-[11px] sm:text-sm font-bold flex items-center justify-between ";
                      if (isActualAnswer) {
                        optionClass += "bg-emerald-50 border-emerald-500 text-emerald-700";
                      } else if (isSelected && !isCorrect) {
                        optionClass += "bg-rose-50 border-rose-500 text-rose-700";
                      } else {
                        optionClass += "bg-slate-50 border-slate-100 text-slate-600";
                      }

                      return (
                        <div key={i} className={optionClass}>
                          <span className="flex-1">{opt}</span>
                          {isActualAnswer && <CheckCircle2 size={14} className="text-emerald-500 shrink-0 ml-2" />}
                          {isSelected && !isCorrect && <X size={14} className="text-rose-500 shrink-0 ml-2" />}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="ml-10 sm:ml-12 mt-4 p-3 sm:p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                      <p className="text-[8px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Explanation</p>
                      <p className="text-xs sm:text-sm text-indigo-900 font-medium">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 text-center space-y-6"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-cyan-50 rounded-full flex items-center justify-center mx-auto text-cyan-600">
            <Trophy size={40} />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Test Completed!</h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">Great job on finishing the {activeTest?.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-slate-50 p-4 sm:p-6 rounded-3xl border border-slate-100">
              <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</p>
              <p className="text-xl sm:text-3xl font-black text-slate-900">{testResult.score} / {testResult.total}</p>
            </div>
            <div className="bg-slate-50 p-4 sm:p-6 rounded-3xl border border-slate-100">
              <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Percentage</p>
              <p className="text-xl sm:text-3xl font-black text-cyan-600">{testResult.percentage.toFixed(1)}%</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-emerald-50 p-3 sm:p-4 rounded-2xl border border-emerald-100">
              <p className="text-[8px] sm:text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Correct</p>
              <p className="text-lg sm:text-2xl font-black text-emerald-700">{testResult.correctCount}</p>
            </div>
            <div className="bg-rose-50 p-3 sm:p-4 rounded-2xl border border-rose-100">
              <p className="text-[8px] sm:text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Incorrect</p>
              <p className="text-lg sm:text-2xl font-black text-rose-700">{testResult.incorrectCount}</p>
            </div>
            <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200">
              <p className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Skipped</p>
              <p className="text-lg sm:text-2xl font-black text-slate-600">{testResult.skippedCount}</p>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <button 
              onClick={() => setShowReview(true)}
              className="w-full p-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black flex items-center justify-center gap-2 border border-indigo-100 text-sm"
            >
              <BookOpen size={18} /> Review Answers
            </button>
            <button 
              onClick={() => { setTestStatus('idle'); setActiveTest(null); }}
              className="w-full p-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 text-sm"
            >
              Back to Test Series
            </button>
            <button 
              onClick={() => setShowLeaderboard(true)}
              className="w-full p-4 bg-cyan-50 text-cyan-600 rounded-2xl font-black flex items-center justify-center gap-2 text-sm"
            >
              View Leaderboard <BarChart3 size={18} />
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600 shadow-sm shrink-0">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Test Series</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Challenge your knowledge</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <button 
              onClick={() => setShowAchievements(true)}
              className="flex-1 sm:flex-none p-3 bg-indigo-50 text-indigo-600 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors text-xs"
            >
              <Target size={18} />
              <span>Achievements</span>
            </button>
          )}
          <button 
            onClick={() => setShowGlobalLeaderboard(true)}
            className="flex-1 sm:flex-none p-3 bg-amber-50 text-amber-600 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-amber-100 transition-colors text-xs"
          >
            <Trophy size={18} />
            <span>Leaderboard</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Class</label>
          <select 
            value={selectedClass} 
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedSubject('All');
            }}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white outline-none transition-all font-bold text-xs text-slate-700"
          >
            <option value="All">All Classes</option>
            {Array.from(new Set(tests.map(t => t.className))).filter(Boolean).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
          <select 
            value={selectedSubject} 
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:bg-white outline-none transition-all font-bold text-xs text-slate-700"
          >
            <option value="All">All Subjects</option>
            {Array.from(new Set(tests.filter(t => selectedClass === 'All' || t.className === selectedClass).map(t => t.subject))).filter(Boolean).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Test List */}
      <div className="grid grid-cols-1 gap-4">
        {tests.filter(t => isAdmin || t.status === 'Active')
              .filter(t => selectedClass === 'All' || t.className === selectedClass)
              .filter(t => selectedSubject === 'All' || t.subject === selectedSubject)
              .length === 0 ? (
          <div className="bg-white p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <BookOpen size={32} />
            </div>
            <p className="text-slate-400 font-bold">No tests available for the selected filters.</p>
          </div>
        ) : (
          tests.filter(t => isAdmin || t.status === 'Active')
               .filter(t => selectedClass === 'All' || t.className === selectedClass)
               .filter(t => selectedSubject === 'All' || t.subject === selectedSubject)
               .map((test, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={test.id}
              className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col gap-5 group hover:border-cyan-200 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600 shrink-0 group-hover:scale-110 transition-transform">
                  <Award size={24} />
                </div>
                <div className="space-y-2 flex-1 min-w-0">
                  <h3 className="text-base font-black text-slate-900 leading-tight">{test.title}</h3>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase bg-cyan-100 text-cyan-600 px-2 py-0.5 rounded-md">Class {test.className}</span>
                    <span className="text-[9px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">{test.subject}</span>
                    <span className="text-[9px] font-black uppercase bg-amber-100 text-amber-600 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Clock size={10} /> {test.duration} Min
                    </span>
                    {test.status && (
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${test.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {test.status}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-md">
                      {test.marksperquestion || '1'} Marks/Q
                    </span>
                    <span className="text-[9px] font-black uppercase bg-rose-100 text-rose-600 px-2 py-0.5 rounded-md">
                      -{test.negativemarks || '0'} Negative
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                <button 
                  onClick={() => { setActiveTest(test); setShowLeaderboard(true); }}
                  className="p-3 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors shrink-0"
                  title="View Leaderboard"
                >
                  <BarChart3 size={18} />
                </button>
                {user && results.some(r => r.testId === test.id && r.username === user.name) ? (
                  <div className="flex gap-2 flex-1">
                    <button 
                      onClick={() => reviewPastTest(test)}
                      className="flex-1 px-3 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[11px] flex items-center justify-center gap-1.5 hover:bg-indigo-100 transition-all border border-indigo-100"
                    >
                      <BookOpen size={14} /> Review
                    </button>
                    <button 
                      onClick={() => startTest(test)}
                      className="flex-1 px-3 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-black text-[11px] flex items-center justify-center gap-1.5 hover:bg-slate-200 transition-all"
                    >
                      <RefreshCw size={14} /> Retake
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => startTest(test)}
                    className="flex-1 px-4 py-3 bg-cyan-600 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-200 hover:bg-cyan-700 transition-all"
                  >
                    Start Test <ArrowRight size={16} />
                  </button>
                )}
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
              className="relative w-full max-w-sm sm:max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-5 sm:p-6 bg-cyan-600 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <Trophy size={20} className="sm:size-6" />
                  <div>
                    <h3 className="font-black text-base sm:text-lg">Leaderboard</h3>
                    <p className="text-[8px] sm:text-[10px] font-bold uppercase opacity-80 tracking-widest truncate max-w-[150px] sm:max-w-none">{activeTest.title}</p>
                  </div>
                </div>
                <button onClick={() => setShowLeaderboard(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} className="sm:size-6" />
                </button>
              </div>
              
              <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-2 sm:space-y-3 no-scrollbar">
                {getRankings(activeTest.id).length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-slate-200 mx-auto" />
                    <p className="text-slate-400 font-bold text-sm">No results yet for this test.</p>
                  </div>
                ) : (
                  getRankings(activeTest.id).map((rank, idx) => {
                    const userBadges = getUserBadges(rank.username);
                    return (
                      <div key={rank.id || `rank-${idx}`} className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                          <div className={cn(
                            "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-[10px] sm:text-xs shrink-0",
                            idx === 0 ? "bg-amber-100 text-amber-600" :
                            idx === 1 ? "bg-slate-200 text-slate-600" :
                            idx === 2 ? "bg-orange-100 text-orange-600" :
                            "bg-white text-slate-400"
                          )}>
                            {idx + 1}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <UserIcon size={12} className="text-slate-400 shrink-0" />
                              <span className="font-bold text-slate-900 truncate text-xs sm:text-sm">{rank.username}</span>
                              {rank.isRetake && (
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" title="Retaken Test"></span>
                              )}
                            </div>
                            {userBadges.length > 0 && (
                              <div className="flex items-center gap-1 mt-0.5">
                                {userBadges.slice(0, 3).map(badge => (
                                  <div key={badge.id} className={cn("w-3.5 h-3.5 rounded-full flex items-center justify-center", badge.bg, badge.color)} title={badge.name}>
                                    <badge.icon size={8} />
                                  </div>
                                ))}
                                {userBadges.length > 3 && (
                                  <span className="text-[7px] font-bold text-slate-400">+{userBadges.length - 3}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <p className="text-xs sm:text-sm font-black text-cyan-600">{rank.percentage}%</p>
                          <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase">{rank.score}/{rank.total}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              
              <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 shrink-0">
                <button 
                  onClick={() => setShowLeaderboard(false)}
                  className="w-full p-3.5 sm:p-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-600 hover:bg-slate-100 transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Global Leaderboard Modal */}
      <AnimatePresence>
        {showGlobalLeaderboard && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGlobalLeaderboard(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 bg-amber-500 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy size={24} />
                  <div>
                    <h3 className="font-black text-lg">Global Leaderboard</h3>
                    <p className="text-[10px] font-bold uppercase opacity-80 tracking-widest">Top Performers</p>
                  </div>
                </div>
                <button onClick={() => setShowGlobalLeaderboard(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col gap-3">
                <select 
                  value={selectedGlobalClass} 
                  onChange={(e) => {
                    setSelectedGlobalClass(e.target.value);
                    setSelectedGlobalTest('All');
                  }}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-bold text-slate-700"
                >
                  <option value="All">All Classes</option>
                  {Array.from(new Set(tests.map(t => t.className))).filter(Boolean).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <select 
                  value={selectedGlobalTest} 
                  onChange={(e) => setSelectedGlobalTest(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-bold text-slate-700"
                >
                  <option value="All">All Tests</option>
                  {tests
                    .filter(t => selectedGlobalClass === 'All' || t.className === selectedGlobalClass)
                    .map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-3 no-scrollbar">
                {getGlobalRankings(selectedGlobalClass, selectedGlobalTest).length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <AlertCircle className="w-12 h-12 text-slate-200 mx-auto" />
                    <p className="text-slate-400 font-bold">No results yet.</p>
                  </div>
                ) : (
                  getGlobalRankings(selectedGlobalClass, selectedGlobalTest).map((rank, idx) => {
                    const userBadges = getUserBadges(rank.username);
                    return (
                      <div key={rank.username} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0",
                            idx === 0 ? "bg-amber-100 text-amber-600" :
                            idx === 1 ? "bg-slate-200 text-slate-600" :
                            idx === 2 ? "bg-orange-100 text-orange-600" :
                            "bg-white text-slate-400"
                          )}>
                            {idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <UserIcon size={14} className="text-slate-400" />
                              <span className="font-bold text-slate-900 truncate max-w-[120px] sm:max-w-[150px]">{rank.username}</span>
                              {rank.isRetake && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" title="Retaken Test"></span>
                              )}
                            </div>
                            {userBadges.length > 0 && (
                              <div className="flex items-center gap-1 mt-1">
                                {userBadges.slice(0, 3).map(badge => (
                                  <div key={badge.id} className={cn("w-4 h-4 rounded-full flex items-center justify-center", badge.bg, badge.color)} title={badge.name}>
                                    <badge.icon size={10} />
                                  </div>
                                ))}
                                {userBadges.length > 3 && (
                                  <span className="text-[8px] font-bold text-slate-400">+{userBadges.length - 3}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-black text-amber-600">{rank.avgPercentage.toFixed(1)}%</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">{rank.testsTaken} Tests</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              
              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <button 
                  onClick={() => setShowGlobalLeaderboard(false)}
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Retake Confirmation Modal */}
      <AnimatePresence>
        {showRetakeConfirm && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRetakeConfirm(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <RefreshCw size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900">Retake Test?</h3>
                <p className="text-slate-500 font-medium">
                  You have already taken this test. Do you want to retake it? Your previous score will be replaced.
                </p>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button 
                  onClick={() => setShowRetakeConfirm(null)}
                  className="flex-1 p-3 bg-white border border-slate-200 rounded-xl font-black text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    const test = showRetakeConfirm;
                    setShowRetakeConfirm(null);
                    startTest(test, true);
                  }}
                  className="flex-1 p-3 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                  Yes, Retake
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Achievements Modal */}
      <AnimatePresence>
        {showAchievements && user && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAchievements(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 bg-indigo-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target size={24} />
                  <div>
                    <h3 className="font-black text-lg">My Achievements</h3>
                    <p className="text-[10px] font-bold uppercase opacity-80 tracking-widest">{user.name}</p>
                  </div>
                </div>
                <button onClick={() => setShowAchievements(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="flex-grow overflow-y-auto p-6 space-y-6 no-scrollbar">
                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tests Taken</p>
                    <p className="text-2xl font-black text-slate-900">
                      {results.filter(r => r.username === user.name).length}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Score</p>
                    <p className="text-2xl font-black text-indigo-600">
                      {results.filter(r => r.username === user.name).length > 0 
                        ? (results.filter(r => r.username === user.name).reduce((acc, r) => acc + parseFloat(r.percentage), 0) / results.filter(r => r.username === user.name).length).toFixed(1)
                        : '0'}%
                    </p>
                  </div>
                </div>

                {/* Badges */}
                <div className="space-y-3">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest ml-1">Earned Badges</h4>
                  {getUserBadges(user.name).length === 0 ? (
                    <div className="text-center py-8 space-y-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <Star className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="text-slate-400 font-bold text-sm">Take tests to earn badges!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {getUserBadges(user.name).map(badge => (
                        <div key={badge.id} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", badge.bg, badge.color)}>
                            <badge.icon size={24} />
                          </div>
                          <div>
                            <p className="font-black text-slate-900">{badge.name}</p>
                            <p className="text-xs font-bold text-slate-500">{badge.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <button 
                  onClick={() => setShowAchievements(false)}
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
