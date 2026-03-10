import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Clock, ChevronLeft, ChevronRight, CheckCircle, XCircle, Maximize2, Sparkles, Loader2, Brain, History, Target, ArrowRight, BarChart3, AlertCircle, ShieldCheck, Hash } from "lucide-react";
import { useTimer } from "@/hooks/useTimer";
import { SATQuestion, mockQuestions } from "@/data/mockData";
import { generateSATQuestions } from "@/services/aiQuestions";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import StatCard from "@/components/StatCard";
import Calculator from "@/components/Calculator";

type ViewState = "lobby" | "testing" | "review" | "break";
type TestType = "full" | "reading" | "math";
type SectionType = "reading-writing" | "math";

interface TestState {
  type: TestType;
  section: SectionType;
  module: 1 | 2;
  module1Performance: number; // Percentage
  difficulty: "easy" | "medium" | "hard";
}

interface PastTest {
  id: string;
  test_date: string;
  score: number;
  reading_score: number;
  math_score: number;
  correct_answers: number;
  total_questions: number;
  time_spent: number;
  weak_topics: string[];
  accuracy: number;
}

const SAT_TIPS = [
  "New SAT: Short passages only. Exactly 1 question per passage for RW.",
  "Math: Calculator allowed for the entire section. Use Desmos when helpful.",
  "Adaptive Rule: Doing well on Module 1 moves you to a harder, higher-scoring Module 2.",
  "Score Range: Each section is 200–800, for a total possible score of 1600.",
  "English: Standard English Conventions (Grammar/Punctuation) is 26% of your RW score.",
  "Math: Algebra and Advanced Math make up 70% of the Math section.",
  "Strategy: There is no negative marking. Never leave a question blank!",
  "RW: Information & Ideas covers Main Idea, Inference, and Evidence.",
];

export default function PracticeTest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [view, setView] = useState<ViewState>("lobby");
  const [pastTests, setPastTests] = useState<PastTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<PastTest | null>(null);
  const [testResponses, setTestResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);

  // Testing state
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [questions, setQuestions] = useState<SATQuestion[]>([]);
  const [testState, setTestState] = useState<TestState>({
    type: "full",
    section: "reading-writing",
    module: 1,
    module1Performance: 0,
    difficulty: "medium"
  });
  const [showCalculator, setShowCalculator] = useState(false);

  const timer = useTimer(32 * 60);

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setCurrentTip(prev => (prev + 1) % SAT_TIPS.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  useEffect(() => {
    if (user) {
      fetchPastTests();
    }
  }, [user]);

  const fetchPastTests = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("test_results")
      .select("*")
      .eq("user_id", user.id)
      .order("test_date", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      const transformed = (data || []).map(t => ({
        ...t,
        accuracy: t.total_questions > 0 ? Math.round((t.correct_answers / t.total_questions) * 100) : 0
      }));
      setPastTests(transformed);
    }
    setLoading(false);
  };

  const fetchTestDetail = async (testId: string) => {
    const { data: responses } = await supabase
      .from("question_responses")
      .select("*")
      .eq("test_result_id", testId);

    setTestResponses(responses || []);
  };

  const startNewTest = async (type: TestType) => {
    setIsGenerating(true);
    try {
      const initialSection: SectionType = type === "math" ? "math" : "reading-writing";
      const totalCount = initialSection === "reading-writing" ? 27 : 22;

      // Load 3 questions immediately to provide a better start experience
      const initialBatch = await generateSATQuestions(initialSection, 1, "medium", 3);

      setTestState({
        type,
        section: initialSection,
        module: 1,
        module1Performance: 0,
        difficulty: "medium"
      });

      setQuestions(initialBatch);
      setAnswers({});
      setCurrentQ(0);
      setView("testing");
      setShowCalculator(initialSection === "math");
      const testDuration = initialSection === "reading-writing" ? 32 : 35;
      timer.reset(testDuration * 60);
      timer.start();

      toast.info("Starting test! Remaining questions are loading in the background...", { duration: 3000 });

      // Background load the rest in batches
      const batchSize = 6;
      const remaining = totalCount - initialBatch.length;
      const batches = Math.ceil(remaining / batchSize);

      for (let i = 0; i < batches; i++) {
        const countToFetch = Math.min(batchSize, remaining - (i * batchSize));
        if (countToFetch <= 0) continue;

        generateSATQuestions(initialSection, 1, "medium", countToFetch).then(newQs => {
          if (newQs && newQs.length > 0) {
            setQuestions(prev => [...prev, ...newQs]);
          }
        }).catch(e => console.error("Batch failure:", e));
      }

    } catch (e) {
      console.error(e);
      toast.error("Failed to generate test. Check your internet or API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNextModule = async () => {
    const correctCount = questions.reduce((acc, q) =>
      acc + (answers[q.id] === q.correctAnswer ? 1 : 0), 0
    );
    const performance = (correctCount / questions.length) * 100;
    const nextDiff: "easy" | "hard" = performance >= 70 ? "hard" : "easy";

    if (testState.module === 1) {
      setIsGenerating(true);
      try {
        const totalCount = testState.section === "reading-writing" ? 27 : 22;

        // Load initial batch for module 2
        const initialBatch2 = await generateSATQuestions(testState.section, 2, nextDiff, 3);

        setTestState(prev => ({
          ...prev,
          module: 2,
          module1Performance: performance,
          difficulty: nextDiff
        }));
        setQuestions(initialBatch2);
        setCurrentQ(0);
        timer.reset((testState.section === "reading-writing" ? 32 : 35) * 60);
        timer.start();

        toast.info("Module 2 started! Background loading rest...", { duration: 2000 });

        // Background batch loading for module 2
        const batchSize = 6;
        const remaining = totalCount - initialBatch2.length;
        const batches = Math.ceil(remaining / batchSize);

        for (let i = 0; i < batches; i++) {
          const countToFetch = Math.min(batchSize, remaining - (i * batchSize));
          if (countToFetch <= 0) continue;

          generateSATQuestions(testState.section, 2, nextDiff, countToFetch).then(newQs => {
            if (newQs && newQs.length > 0) {
              setQuestions(prev => [...prev, ...newQs]);
            }
          }).catch(e => console.error("M2 Batch failure:", e));
        }

      } catch (e) {
        toast.error("Failed to generate next module.");
      } finally {
        setIsGenerating(false);
      }
    } else if (testState.type === "full" && testState.section === "reading-writing") {
      setView("break");
      timer.pause();
    } else {
      handleSubmit();
    }
  };

  const startMathSection = async () => {
    setIsGenerating(true);
    try {
      const initialMathBatch = await generateSATQuestions("math", 1, "medium", 3);
      setTestState(prev => ({
        ...prev,
        section: "math",
        module: 1,
        difficulty: "medium"
      }));
      setQuestions(initialMathBatch);
      setCurrentQ(0);
      setView("testing");
      setShowCalculator(true);
      timer.reset(35 * 60);
      timer.start();

      // Background rest for math module 1
      const totalMathCount = 22;
      const remainingPrev = totalMathCount - initialMathBatch.length;
      const batchSize = 6;
      const batchesPrev = Math.ceil(remainingPrev / batchSize);

      for (let i = 0; i < batchesPrev; i++) {
        const countToFetch = Math.min(batchSize, remainingPrev - (i * batchSize));
        if (countToFetch <= 0) continue;

        generateSATQuestions("math", 1, "medium", countToFetch).then(newQs => {
          if (newQs && newQs.length > 0) {
            setQuestions(prev => [...prev, ...newQs]);
          }
        }).catch(e => console.error("Math batch failure:", e));
      }

    } catch (e) {
      toast.error("Failed to generate Math section.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReviewTest = async (test: PastTest) => {
    setSelectedTest(test);
    await fetchTestDetail(test.id);
    setView("review");
  };

  const handleSubmit = useCallback(async () => {
    timer.pause();
    if (user) {
      const correct = questions.reduce((a, q) => a + (answers[q.id] === q.correctAnswer ? 1 : 0), 0);
      const mathQs = questions.filter((q) => q.section.includes("math"));
      const readQs = questions.filter((q) => !q.section.includes("math"));
      const mathCorrect = mathQs.filter((q) => answers[q.id] === q.correctAnswer).length;
      const readCorrect = readQs.filter((q) => answers[q.id] === q.correctAnswer).length;

      const topicStats = questions.reduce<Record<string, { c: number; t: number }>>((acc, q) => {
        if (!acc[q.topic]) acc[q.topic] = { c: 0, t: 0 };
        acc[q.topic].t++;
        if (answers[q.id] === q.correctAnswer) acc[q.topic].c++;
        return acc;
      }, {});

      const weakTopics = Object.entries(topicStats)
        .filter(([, v]) => v.t > 0 && v.c / v.t < 0.7)
        .map(([k]) => k);

      const { data: testResult } = await supabase.from("test_results").insert({
        user_id: user.id,
        score: Math.round((correct / questions.length) * 1600),
        reading_score: readCorrect * 20,
        math_score: mathCorrect * 20,
        weak_topics: weakTopics,
        time_spent: Math.round(timer.seconds / 60),
        total_questions: questions.length,
        correct_answers: correct,
      }).select("*").single();

      if (testResult) {
        const responses = questions.map((q) => ({
          user_id: user.id,
          test_result_id: testResult.id,
          question_id: q.id,
          section: q.section,
          topic: q.topic as string, // Ensure it fits the generic type
          difficulty: q.difficulty,
          user_answer: typeof answers[q.id] === 'number' ? answers[q.id] : 0,
          correct_answer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
          is_correct: answers[q.id] === q.correctAnswer,
        }));
        await (supabase.from("question_responses").insert as any)(responses);

        const sessionCache = JSON.parse(sessionStorage.getItem('sat_questions_cache') || '{}');
        questions.forEach(q => { sessionCache[q.id] = q; });
        sessionStorage.setItem('sat_questions_cache', JSON.stringify(sessionCache));

        await fetchPastTests();
        const testWithAccuracy: PastTest = {
          ...testResult,
          accuracy: testResult.total_questions > 0 ? Math.round((testResult.correct_answers / testResult.total_questions) * 100) : 0
        };
        setSelectedTest(testWithAccuracy);
        setTestResponses(responses);
        setView("review");
      }
    }
  }, [timer, answers, user, questions]);

  const LoadingOverlay = () => (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background px-10">
      <div className="w-full max-w-4xl space-y-24">
        <div className="flex flex-col items-center gap-10">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="h-48 w-48 border-[12px] border-foreground border-t-transparent"
            />
            <Brain className="absolute inset-0 m-auto h-16 w-16 text-foreground" />
          </div>
          <div className="text-center space-y-4">
            <h2 className="font-display text-7xl font-black uppercase tracking-tighter">PREPARING YOUR TEST</h2>
            <div className="h-4 w-full bg-foreground/10 overflow-hidden border-4 border-foreground">
              <motion.div
                className="h-full bg-foreground"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentTip}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="border-8 border-foreground p-12 bg-black text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="h-20 w-20" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] mb-6 opacity-40">SAT Prep Tip</p>
            <p className="text-4xl font-black uppercase tracking-tight leading-[0.9] italic">"{SAT_TIPS[currentTip]}"</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );

  if (view === "lobby") {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        {isGenerating && <LoadingOverlay />}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-16">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between border-b-[12px] border-foreground pb-12">
            <h1 className="font-display text-8xl font-black tracking-tighter uppercase leading-[0.8]">PRACTICE<br />CENTER</h1>
            <p className="text-[12px] font-black uppercase tracking-[0.4em] opacity-40">Personalized Practice Tests</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-8 border-foreground">
            {[
              { id: 'full', title: 'FULL TEST', icon: Target, desc: 'Complete 2 hour 14 min simulation' },
              { id: 'reading', title: 'READING & WRITING', icon: Brain, desc: 'Practice your English skills' },
              { id: 'math', title: 'MATH', icon: BarChart3, desc: 'Practice your Math skills' },
            ].map((opt, idx) => (
              <button
                key={opt.id}
                onClick={() => startNewTest(opt.id as any)}
                className={`group p-12 text-left hover:bg-foreground hover:text-background transition-all border-foreground ${idx !== 2 ? 'md:border-r-4' : ''}`}
              >
                <opt.icon className="h-10 w-10 mb-8" />
                <h3 className="text-4xl font-black uppercase tracking-tighter mb-4">{opt.title}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-50 leading-relaxed">{opt.desc}</p>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-16 border-t-8 border-foreground">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <History className="h-8 w-8 text-foreground" />
                <h2 className="font-display text-4xl font-black uppercase tracking-tighter">Recent Scores</h2>
              </div>
              {loading ? <Loader2 className="animate-spin" /> : pastTests.length > 0 ? (
                <div className="space-y-4">
                  {pastTests.map(t => (
                    <div key={t.id} className="border-4 border-foreground p-8 flex items-center justify-between hover:bg-black hover:text-white transition-colors cursor-pointer group" onClick={() => handleReviewTest(t)}>
                      <div className="flex items-center gap-6">
                        <div className="text-5xl font-black">{t.score}</div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-50">{new Date(t.test_date).toLocaleDateString()}</p>
                          <p className="font-black uppercase">{t.accuracy}% Accuracy</p>
                        </div>
                      </div>
                      <ArrowRight className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              ) : <div className="p-12 border-4 border-dashed border-foreground opacity-20 font-black uppercase text-center">No Data Available</div>}
            </div>

            <div className="border-8 border-foreground bg-black text-white p-12">
              <ShieldCheck className="h-12 w-12 mb-8" />
              <h3 className="text-5xl font-black uppercase tracking-tighter mb-6 leading-tight">PREMIUM<br />SIMULATION</h3>
              <p className="text-sm font-black uppercase tracking-widest leading-relaxed opacity-60">
                Our AI matches the College Board's blueprint exactly. Each session is unique, adaptive, and calibrated to the latest 2024 digital standards.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (view === "testing") {
    const question = questions[currentQ];
    const isMath = testState.section === "math";

    return (
      <div className={`mx-auto px-4 py-8 ${isMath ? 'max-w-[1400px]' : 'max-w-4xl'}`}>
        {isGenerating && <LoadingOverlay />}

        {/* Header */}
        <div className="mb-8 flex items-center justify-between border-b-8 border-foreground pb-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-foreground text-background px-6 py-3 font-display text-2xl font-black uppercase">
              <Clock className="h-6 w-6" /> {timer.formatted}
            </div>
            <div className="font-black uppercase tracking-[0.2em] text-xs opacity-50">
              {testState.section === 'reading-writing' ? 'Reading & Writing' : 'Math'} — Module {testState.module}
            </div>
          </div>
          <div className="flex gap-4">
            {isMath && (
              <button
                onClick={() => setShowCalculator(!showCalculator)}
                className={`flex items-center gap-3 border-4 px-6 py-4 text-[10px] font-black uppercase transition-all ${showCalculator ? 'bg-foreground text-background shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] scale-105' : 'border-foreground hover:bg-foreground/10'}`}
              >
                <Hash className="h-4 w-4" /> Calculator
              </button>
            )}
            <button onClick={testState.module === 1 ? handleNextModule : handleSubmit} className="border-4 border-foreground bg-foreground px-6 py-4 text-[10px] font-black uppercase text-background hover:invert transition-all">
              {testState.module === 1 ? "Next Module" : "Submit Test"}
            </button>
          </div>
        </div>

        {isMath && showCalculator && (
          <div className="relative">
            <Calculator />
          </div>
        )}

        <div className="flex flex-col gap-8 items-start">
          <div className="flex-1 w-full space-y-12">
            {/* Progress Bar & Navigation Grid */}
            <div className="mb-8 space-y-6">
              <div className="h-6 w-full border-4 border-foreground bg-background">
                <motion.div className="h-full bg-foreground" initial={{ width: 0 }} animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} transition={{ duration: 0.3 }} />
              </div>

              <div className="flex flex-wrap gap-3 py-6 border-t-8 border-foreground">
                {questions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isCurrent = currentQ === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentQ(idx)}
                      className={`h-12 w-12 flex items-center justify-center border-4 font-black transition-all text-xs relative
                        ${isCurrent ? 'bg-foreground text-background scale-110 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]' :
                          isAnswered ? 'bg-foreground/10 border-foreground text-foreground' : 'border-foreground/20 text-foreground/40 hover:border-foreground/60'}`}
                    >
                      {idx + 1}
                      {isAnswered && !isCurrent && (
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-foreground rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={question?.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                {/* Question Content */}
                {question?.passage && (
                  <div className="border-8 border-foreground p-8 bg-black text-white text-lg leading-relaxed font-medium">
                    {question.passage}
                  </div>
                )}

                <div className="space-y-10">
                  <div className="space-y-4">
                    <span className="inline-block bg-foreground/10 text-foreground px-3 py-1 text-xs tracking-wider rounded border border-foreground/20">Single choice question — Select one option</span>
                    <h2 className="text-3xl font-semibold leading-relaxed">{question?.question}</h2>
                  </div>

                  {question?.type === "grid-in" ? (
                    <div className="space-y-4">
                      <p className="text-sm font-medium opacity-60">Student-Produced Response (Type your answer below)</p>
                      <input
                        type="text"
                        value={answers[question.id] || ''}
                        onChange={(e) => setAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
                        placeholder="Type answer here..."
                        className="w-full border-8 border-foreground p-10 font-semibold text-3xl outline-none focus:bg-foreground focus:text-background transition-all"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {question?.options.map((opt, idx) => (
                        <button key={idx} onClick={() => setAnswers(prev => ({ ...prev, [question.id]: idx }))}
                          className={`flex items-center gap-8 border-4 p-6 text-left transition-all ${answers[question.id] === idx ? "bg-foreground text-background" : "hover:bg-foreground hover:text-background border-foreground bg-background"}`}>
                          <div className={`h-10 w-10 shrink-0 flex items-center justify-center border-4 font-bold ${answers[question.id] === idx ? "bg-background text-foreground border-background" : "border-foreground"}`}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span className="text-lg font-medium">{opt}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Question Navigation */}
                <div className="flex items-center justify-between pt-12 border-t-8 border-foreground">
                  <button
                    onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))}
                    disabled={currentQ === 0}
                    className="flex items-center gap-4 border-4 border-foreground px-8 py-4 font-black uppercase text-xs hover:bg-foreground hover:text-background transition-all disabled:opacity-20"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </button>

                  <div className="hidden sm:block font-display text-2xl font-black uppercase tracking-tighter text-center">
                    Question {currentQ + 1} of {questions.length}
                    <div className="text-[8px] opacity-40">Section {testState.section}</div>
                  </div>

                  {currentQ < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQ(prev => Math.min(questions.length - 1, prev + 1))}
                      className="flex items-center gap-4 border-4 border-foreground bg-foreground px-10 py-4 font-black uppercase text-xs text-background hover:bg-background hover:text-foreground transition-all"
                    >
                      Next Question <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={testState.module === 1 ? handleNextModule : handleSubmit}
                      className="flex items-center gap-4 border-4 border-foreground bg-red-600 px-10 py-4 font-black uppercase text-xs text-white hover:bg-background hover:text-foreground transition-all"
                    >
                      {testState.module === 1 ? "Next Module" : "Submit Test"} <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  if (view === "review" && selectedTest) {
    const wrongAnswers = testResponses.filter(r => !r.is_correct);
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-7xl px-8 py-20 pb-40">
        <div className="mb-24 flex flex-col gap-10 md:flex-row md:items-end md:justify-between border-b-[16px] border-foreground pb-12">
          <div>
            <button onClick={() => setView("lobby")} className="mb-8 flex items-center gap-2 font-black uppercase text-xs hover:gap-4 transition-all">
              <ChevronLeft className="h-4 w-4" /> Back to Practice
            </button>
            <h1 className="font-display text-9xl font-black tracking-tighter uppercase leading-[0.75]">TEST<br />RESULTS</h1>
          </div>
          <div className="bg-foreground text-background p-12 border-8 border-foreground">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-40 text-center">Final Score</p>
            <div className="text-9xl font-black leading-none">{selectedTest.score}</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-20">
          <div className="lg:col-span-2 space-y-16">
            <h3 className="font-display text-5xl font-black uppercase tracking-tighter border-l-[12px] border-foreground pl-8">REVIEW MISTAKES ({wrongAnswers.length})</h3>
            <div className="space-y-12">
              {wrongAnswers.length > 0 ? wrongAnswers.map((resp, i) => {
                const sessionCache = JSON.parse(sessionStorage.getItem('sat_questions_cache') || '{}');
                const q = sessionCache[resp.question_id] || mockQuestions.find(m => m.id === resp.question_id);
                if (!q) return <div key={i} className="p-8 border-4 border-dashed border-foreground opacity-20 font-black">Question data expired.</div>;
                return (
                  <div key={resp.id} className="border-8 border-foreground">
                    <div className="bg-foreground text-background px-8 py-4 flex items-center justify-between">
                      <span className="text-sm font-black uppercase tracking-widest">{q.topic}</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{q.section}</span>
                    </div>
                    <div className="p-12 space-y-8">
                      {q.passage && <div className="p-8 bg-black text-white text-sm font-black uppercase italic mb-8 border-l-[12px] border-white">{q.passage}</div>}
                      <p className="text-3xl font-black uppercase tracking-tight leading-none">{q.question}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 border-4 border-foreground">
                          <p className="text-[10px] font-black uppercase opacity-40 mb-2">Your Answer</p>
                          <p className="font-black uppercase">{resp.user_answer !== null ? q.options[resp.user_answer] : "VOID"}</p>
                        </div>
                        <div className="relative p-6 border-4 border-foreground bg-foreground text-background glowing-border-correct">
                          <p className="text-[10px] font-black uppercase opacity-40 mb-2 relative z-10">Correct Answer</p>
                          <p className="font-black uppercase relative z-10">{q.options[q.correctAnswer]}</p>
                        </div>
                      </div>
                      <div className="p-8 bg-foreground/5 border-t-8 border-foreground">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 underline"><Sparkles className="h-4 w-4" /> Explanation</p>
                        <p className="text-lg font-black uppercase tracking-tighter leading-snug">{q.explanation}</p>
                      </div>
                    </div>
                  </div>
                );
              }) : <div className="p-20 border-8 border-dashed border-foreground text-center font-black uppercase text-4xl opacity-10">PERFECT PERFORMANCE</div>}
            </div>
          </div>

          <div className="border-8 border-foreground p-12 bg-black text-white">
            <h3 className="font-display text-4xl font-black uppercase tracking-tighter mb-10 underline decoration-8 underline-offset-8 text-white">Focus Areas</h3>
            <div className="space-y-8">
              <div className="space-y-4">
                {selectedTest.weak_topics?.map(t => (
                  <div key={t} className="border-2 border-white/20 p-6 hover:bg-white hover:text-black transition-colors group cursor-default">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Topic Priority</span>
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <p className="font-black uppercase tracking-tight text-xl">{t}</p>
                  </div>
                ))}
                {(!selectedTest.weak_topics || selectedTest.weak_topics.length === 0) && <p className="font-black text-xs opacity-50 uppercase tracking-widest text-center py-10 border-2 border-dashed border-white/20">Great Job! No weak areas.</p>}
              </div>
              <div className="pt-10 space-y-4 border-t border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Overall Accuracy</p>
                <div className="flex justify-between items-center">
                  <span className="font-black uppercase">Accuracy</span>
                  <span className="text-4xl font-black">{selectedTest.accuracy}%</span>
                </div>
                <div className="h-4 w-full bg-white/10 border-2 border-white">
                  <div className="h-full bg-white" style={{ width: `${selectedTest.accuracy}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (view === "break") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-10 space-y-12">
        <div className="text-center space-y-6">
          <h2 className="text-7xl font-display font-black uppercase tracking-tighter">TAKE A BREAK</h2>
          <p className="text-xl font-black uppercase opacity-60">You have completed the Reading & Writing section.</p>
        </div>
        <div className="bg-foreground text-background p-12 border-8 border-foreground text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-4">Break Timer</p>
          <div className="text-9xl font-black leading-none">{timer.formatted}</div>
        </div>
        <button
          onClick={startMathSection}
          className="bg-foreground text-background px-16 py-8 text-2xl font-black uppercase border-8 border-foreground hover:bg-background hover:text-foreground transition-all"
        >
          START MATH SECTION
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-[100vh] items-center justify-center bg-background">
      <Loader2 className="h-16 w-16 animate-spin text-foreground" />
    </div>
  );
}
