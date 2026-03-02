import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Clock, ChevronLeft, ChevronRight, CheckCircle, XCircle, Maximize2, Sparkles, Loader2, Brain, History, Target, ArrowRight, BarChart3, AlertCircle, ShieldCheck } from "lucide-react";
import { useTimer } from "@/hooks/useTimer";
import { mockQuestions, SATQuestion } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import StatCard from "@/components/StatCard";

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

export default function PracticeTest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [view, setView] = useState<ViewState>("lobby");
  const [pastTests, setPastTests] = useState<PastTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<PastTest | null>(null);
  const [testResponses, setTestResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Testing state
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [questions, setQuestions] = useState<SATQuestion[]>([]);
  const [testState, setTestState] = useState<TestState>({
    type: "full",
    section: "reading-writing",
    module: 1,
    module1Performance: 0,
    difficulty: "medium"
  });

  const timer = useTimer(32 * 60); // Starting with module 1 (roughly half of section time)

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
    const initialSection: SectionType = type === "math" ? "math" : "reading-writing";

    // Get Module 1 questions for the initial section
    const module1Qs = mockQuestions.filter(q =>
      q.section === initialSection && q.module === 1
    ).sort(() => Math.random() - 0.5);

    const testDuration = initialSection === "reading-writing" ? 32 : 35; // Minutes per module

    setTestState({
      type,
      section: initialSection,
      module: 1,
      module1Performance: 0,
      difficulty: "medium"
    });

    setQuestions(module1Qs);
    setAnswers({});
    setCurrentQ(0);
    setView("testing");
    timer.reset(testDuration * 60);
    timer.start();
  };

  const handleNextModule = () => {
    const correctCount = questions.reduce((acc, q) =>
      acc + (answers[q.id] === q.correctAnswer ? 1 : 0), 0
    );
    const performance = (correctCount / questions.length) * 100;
    const nextDiff: "easy" | "hard" = performance >= 70 ? "hard" : "easy";

    if (testState.module === 1) {
      // Transition to Module 2
      const module2Qs = mockQuestions.filter(q =>
        q.section === testState.section &&
        q.module === 2 &&
        (nextDiff === "hard" ? q.difficulty !== "easy" : q.difficulty !== "hard")
      ).sort(() => Math.random() - 0.5);

      setTestState(prev => ({
        ...prev,
        module: 2,
        module1Performance: performance,
        difficulty: nextDiff
      }));
      setQuestions(module2Qs);
      setCurrentQ(0);
      timer.reset((testState.section === "reading-writing" ? 32 : 35) * 60);
      timer.start();
      toast.info(`Transitioning to Module 2 (${nextDiff} Level)`);
    } else if (testState.type === "full" && testState.section === "reading-writing") {
      // Transition to Math Section
      setView("break");
      timer.pause();
    } else {
      // Test Complete
      handleSubmit();
    }
  };

  const startMathSection = () => {
    const mathQs = mockQuestions.filter(q =>
      q.section === "math" && q.module === 1
    ).sort(() => Math.random() - 0.5);

    setTestState(prev => ({
      ...prev,
      section: "math",
      module: 1,
      difficulty: "medium"
    }));
    setQuestions(mathQs);
    setCurrentQ(0);
    setView("testing");
    timer.reset(35 * 60);
    timer.start();
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
        score: Math.round((correct / questions.length) * 1600), // Note: Simplified scoring
        reading_score: readCorrect * 20, // Real SAT uses item response theory, but we'll approximate
        math_score: mathCorrect * 20,
        weak_topics: weakTopics,
        time_spent: Math.round(timer.seconds / 60),
        total_questions: questions.length,
        correct_answers: correct,
      }).select("*").single();

      if (testResult) {
        // ... individual responses logic would go here
        await fetchPastTests();
        const testWithAccuracy: PastTest = {
          ...testResult,
          accuracy: testResult.total_questions > 0 ? Math.round((testResult.correct_answers / testResult.total_questions) * 100) : 0
        };
        setSelectedTest(testWithAccuracy);
        setView("review");
      }
    }
  }, [timer, answers, user, questions]);

  useEffect(() => {
    if (timer.isExpired && view === "testing") {
      handleSubmit();
    }
  }, [timer.isExpired, view]);

  // UI Components
  if (view === "lobby") {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
          {/* Header */}
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between border-b-8 border-foreground pb-10">
            <div>
              <h1 className="font-display text-6xl font-black tracking-tighter text-foreground uppercase">Practice</h1>
              <p className="mt-4 text-foreground font-black uppercase tracking-[0.3em] text-xs">Prepare for the SAT with real test patterns.</p>
            </div>
          </div>

          {/* Test Options */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { id: 'full', title: 'FULL TEST', icon: Target, desc: 'Real pattern simulation' },
              { id: 'reading', title: 'ENGLISH', icon: Brain, desc: 'Reading & Writing only' },
              { id: 'math', title: 'MATH', icon: BarChart3, desc: 'Mathematics only' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => startNewTest(opt.id as any)}
                className="group border-8 border-foreground p-10 text-left hover:bg-foreground hover:text-background transition-all"
              >
                <opt.icon className="h-12 w-12 mb-6" />
                <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">{opt.title}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{opt.desc}</p>
              </button>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <StatCard
              title="Recent Avg"
              value={pastTests.length > 0 ? Math.round(pastTests.reduce((a, b) => a + b.score, 0) / pastTests.length) : "—"}
              icon={<BarChart3 className="h-5 w-5" />}
              subtitle="Score across all tests"
            />
            <StatCard
              title="Accuracy"
              value={pastTests.length > 0 ? `${Math.round((pastTests.reduce((a, b) => a + b.correct_answers, 0) / pastTests.reduce((a, b) => a + b.total_questions, 0)) * 100)}%` : "—"}
              icon={<CheckCircle className="h-5 w-5" />}
              subtitle="Correct answer rate"
            />
            <StatCard
              title="Time Spent"
              value={pastTests.length > 0 ? `${pastTests.reduce((a, b) => a + b.time_spent, 0)}m` : "—"}
              icon={<Clock className="h-5 w-5" />}
              subtitle="Total practice time"
            />
          </div>

          {/* Previous Tests List */}
          <div className="space-y-8 pt-10 border-t-8 border-foreground">
            <div className="flex items-center gap-5">
              <History className="h-8 w-8 text-foreground" />
              <h2 className="font-display text-4xl font-black uppercase tracking-tighter">Previous Tests</h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : pastTests.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {pastTests.map((test) => (
                  <motion.div
                    key={test.id}
                    className="border-4 border-foreground flex flex-col gap-4 overflow-hidden p-6 md:flex-row md:items-center md:justify-between bg-background"
                  >
                    <div className="flex items-center gap-6">
                      <div className="flex h-16 w-16 items-center justify-center border-4 border-foreground bg-foreground text-background">
                        <span className="font-display text-xl font-black">{test.score}</span>
                      </div>
                      <div>
                        <p className="font-display text-2xl font-black uppercase tracking-tighter">Practice Test</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                          COMPLETED {new Date(test.test_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-8 border-t-4 border-foreground pt-4 md:border-none md:pt-0">
                      <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest">Reading</p>
                        <p className="font-display font-black text-foreground">{test.reading_score}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest">Math</p>
                        <p className="font-display font-black text-foreground">{test.math_score}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest">Accuracy</p>
                        <p className="font-display font-black text-foreground">{Math.round((test.correct_answers / test.total_questions) * 100)}%</p>
                      </div>
                      <button
                        onClick={() => handleReviewTest(test)}
                        className="flex items-center gap-2 border-4 border-foreground bg-foreground px-6 py-3 text-sm font-black text-background uppercase tracking-widest hover:bg-background hover:text-foreground transition-all"
                      >
                        Analysis <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="border-8 border-dashed border-foreground flex flex-col items-center justify-center p-20 text-center">
                <Target className="h-20 w-20 mb-8 opacity-20" />
                <h3 className="font-display text-2xl font-black uppercase tracking-tighter">No tests yet</h3>
                <p className="mt-2 text-[10px] font-black uppercase tracking-widest opacity-40">Complete your first session to see results.</p>
                <button onClick={() => startNewTest('full')} className="mt-10 border-4 border-foreground bg-foreground text-background px-10 py-4 font-black uppercase tracking-widest hover:bg-background hover:text-foreground transition-all">Take First Test</button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  if (view === "break") {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center space-y-10">
        <h1 className="font-display text-7xl font-black uppercase tracking-tighter">SECTION BREAK</h1>
        <p className="max-w-md text-sm font-black uppercase tracking-widest opacity-60">You have completed the Reading & Writing section. Take a moment before starting Math.</p>
        <button
          onClick={startMathSection}
          className="border-8 border-foreground bg-foreground text-background px-16 py-6 text-xl font-black uppercase tracking-[0.2em] hover:bg-background hover:text-foreground transition-all"
        >
          START MATH SECTION
        </button>
      </div>
    );
  }

  if (view === "testing") {
    const question = questions[currentQ];
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Timer & Progress */}
        <div className="mb-8 flex items-center justify-between border-b-4 border-foreground pb-6">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 border-2 border-foreground bg-foreground text-background px-4 py-2 font-display text-lg font-black uppercase tracking-tighter`}>
              <Clock className="h-5 w-5" />
              {timer.formatted}
            </div>
            <div className="border-2 border-foreground bg-background px-4 py-2 text-xs font-black uppercase tracking-widest">
              {testState.section.replace('-', ' ')} // Module {testState.module} // Q {currentQ + 1}
            </div>
          </div>
          <button
            onClick={handleNextModule}
            className="border-4 border-foreground bg-foreground px-8 py-3 text-sm font-black uppercase tracking-widest text-background hover:bg-background hover:text-foreground transition-all"
          >
            {testState.module === 1 ? "Next Module" : (testState.type === "full" && testState.section === "reading-writing" ? "Finish Section" : "Submit Test")}
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-10 h-4 w-full border-4 border-foreground bg-background">
          <motion.div
            className="h-full bg-foreground"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Question Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border-4 border-foreground space-y-10 p-10 bg-background"
          >
            <div className="flex items-center justify-between border-b-2 border-foreground pb-6">
              <div className="flex items-center gap-3">
                <span className="bg-foreground px-4 py-1 text-xs font-black uppercase tracking-[0.2em] text-background">
                  {question.section}
                </span>
                <span className="text-xs font-black uppercase tracking-widest">{question.topic}</span>
              </div>
              <div className="border-2 border-foreground px-4 py-1 text-xs font-black uppercase tracking-widest">
                Difficulty: {question.difficulty}
              </div>
            </div>

            <div className="space-y-8">
              {question.passage && (
                <div className="border-2 border-foreground p-8 text-sm leading-relaxed font-black uppercase tracking-tighter bg-foreground text-background">
                  {question.passage}
                </div>
              )}
              <h2 className="font-display text-3xl font-black leading-tight text-foreground uppercase tracking-tighter">
                {question.question}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {question.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setAnswers(prev => ({ ...prev, [question.id]: idx }))}
                  className={`group relative flex w-full items-center gap-6 border-4 p-6 text-left transition-all ${answers[question.id] === idx
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground bg-background text-foreground hover:bg-foreground hover:text-background"
                    }`}
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center border-4 font-display text-xl font-black ${answers[question.id] === idx ? "bg-background border-background text-foreground" : "border-foreground bg-background text-foreground"
                    }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-lg font-black uppercase tracking-tight">{opt}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-10 flex items-center justify-between">
          <button
            onClick={() => setCurrentQ(q => Math.max(0, q - 1))}
            disabled={currentQ === 0}
            className="flex items-center gap-2 rounded-xl border border-border px-6 py-3 font-bold transition-all hover:bg-secondary disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" /> Previous
          </button>

          <div className="flex gap-2">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQ(i)}
                className={`h-2.5 w-2.5 rounded-full transition-all ${i === currentQ ? "w-8 bg-foreground" : answers[questions[i].id] !== undefined ? "bg-muted-foreground" : "bg-border"
                  }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentQ(q => Math.min(questions.length - 1, q + 1))}
            disabled={currentQ === questions.length - 1}
            className="flex items-center gap-2 rounded-xl border border-border px-6 py-3 font-bold transition-all hover:bg-secondary disabled:opacity-30"
          >
            Next <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  if (view === "review" && selectedTest) {
    const wrongAnswers = testResponses.filter(r => !r.is_correct);

    // Calculate Topic Intelligence
    const topicStats = testResponses.reduce<Record<string, { c: number; t: number; s: string }>>((acc, r) => {
      if (!acc[r.topic]) acc[r.topic] = { c: 0, t: 0, s: r.section };
      acc[r.topic].t++;
      if (r.is_correct) acc[r.topic].c++;
      return acc;
    }, {});

    const sortedTopics = Object.entries(topicStats).map(([topic, stat]) => ({
      topic,
      section: stat.s,
      accuracy: Math.round((stat.c / stat.t) * 100),
      total: stat.t
    })).sort((a, b) => b.accuracy - a.accuracy);

    const strongAreas = sortedTopics.filter(t => t.accuracy >= 80);
    const weakAreas = sortedTopics.filter(t => t.accuracy < 70);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-6xl px-6 py-12"
      >
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setView("lobby")}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/10 bg-background shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="font-display text-6xl font-black tracking-tighter uppercase">Test Results</h1>
              <p className="font-black opacity-40 uppercase tracking-[0.3em] text-[10px] mt-2">
                COMPLETED {new Date(selectedTest.test_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex bg-foreground text-background px-8 py-6 items-center gap-10 border-8 border-foreground">
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Score</p>
              <p className="text-5xl font-black">{selectedTest.score}</p>
            </div>
            <div className="h-12 w-1 bg-background opacity-20" />
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Accuracy</p>
              <p className="text-5xl font-black">{selectedTest.accuracy}%</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Detailed Performance */}
          <div className="lg:col-span-8 space-y-12">
            {/* Section Breakdown */}
            <section>
              <h3 className="mb-10 font-display text-3xl font-black uppercase tracking-tighter underline decoration-8 underline-offset-8">Mistake Review ({wrongAnswers.length})</h3>
              <div className="space-y-6">
                {wrongAnswers.length > 0 ? wrongAnswers.map((resp, i) => {
                  const q = mockQuestions.find(m => m.id === resp.question_id);
                  if (!q) return null;
                  return (
                    <motion.div
                      key={resp.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card overflow-hidden rounded-[2rem] border-border/10 bg-background/50 shadow-card"
                    >
                      <div className="flex items-center justify-between border-b-4 border-foreground px-8 py-5 bg-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex h-8 w-8 items-center justify-center border-2 border-background bg-background text-foreground text-xs font-black">!</span>
                          <span className="text-sm font-black uppercase tracking-widest text-background">{q.topic}</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-background">{q.section}</span>
                      </div>
                      <div className="p-8 space-y-6">
                        {q.passage && (
                          <div className="border-4 border-foreground p-8 text-sm leading-relaxed font-black uppercase bg-foreground text-background mb-4">
                            {q.passage}
                          </div>
                        )}
                        <p className="text-lg font-black uppercase tracking-tight text-foreground">{q.question}</p>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="border-4 border-foreground p-6 bg-background">
                            <p className="text-[10px] font-black uppercase tracking-widest mb-2 underline">User Input</p>
                            <p className="font-black uppercase">{resp.user_answer !== null ? q.options[resp.user_answer] : "VOID"}</p>
                          </div>
                          <div className="border-4 border-foreground p-6 bg-foreground text-background">
                            <p className="text-[10px] font-black uppercase tracking-widest mb-2 underline">Validated Solution</p>
                            <p className="font-black uppercase">{q.options[q.correctAnswer]}</p>
                          </div>
                        </div>

                        <div className="mt-4 border-4 border-foreground p-6 bg-background">
                          <div className="flex items-center gap-2 mb-3 border-b-2 border-foreground pb-2">
                            <Sparkles className="h-4 w-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Strategic Rationale</p>
                          </div>
                          <p className="text-sm font-black uppercase leading-relaxed text-foreground">{q.explanation}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                }) : (
                  <div className="glass-card py-20 text-center rounded-[3rem] border-dashed border-2">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success opacity-20" />
                    <h4 className="text-2xl font-black uppercase tracking-tighter">Perfect Vector</h4>
                    <p className="text-muted-foreground font-medium">Zero errors detected in this simulation cycle.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Side Panels */}
          <div className="lg:col-span-4 space-y-8">
            {/* Topic Mastery */}
            <div className="border-8 border-foreground p-10 bg-background sticky top-24">
              <h3 className="mb-10 font-display text-2xl font-black uppercase tracking-tighter underline decoration-8 underline-offset-8">Mastery</h3>

              <div className="space-y-8">
                {/* Strong */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-success mb-4 flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3" /> Strong areas
                  </p>
                  <div className="space-y-3">
                    {strongAreas.length > 0 ? strongAreas.map(t => (
                      <div key={t.topic} className="flex items-center justify-between p-3 rounded-xl bg-success/5 border border-success/10">
                        <span className="text-xs font-bold">{t.topic}</span>
                        <span className="text-xs font-black">{t.accuracy}%</span>
                      </div>
                    )) : <p className="text-xs text-muted-foreground opacity-60">No topics currently at 80%+</p>}
                  </div>
                </div>

                {/* Weak */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-danger mb-4 flex items-center gap-2">
                    <AlertCircle className="h-3 w-3" /> Topics to review
                  </p>
                  <div className="space-y-3">
                    {weakAreas.length > 0 ? weakAreas.map(t => (
                      <div key={t.topic} className="flex items-center justify-between p-3 rounded-xl bg-danger/5 border border-danger/10">
                        <span className="text-xs font-bold">{t.topic}</span>
                        <span className="text-xs font-black">{t.accuracy}%</span>
                      </div>
                    )) : <p className="text-xs text-muted-foreground opacity-60">System running at high efficiency levels.</p>}
                  </div>
                </div>

                <div className="pt-6 border-t border-border/10">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Precision Parity</p>
                    <p className="text-xs font-black">78% Match</p>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-foreground" style={{ width: '78%' }} />
                  </div>
                </div>

                <button
                  onClick={() => navigate("/tutor")}
                  className="btn-premium w-full text-xs py-4 flex items-center justify-center gap-2"
                >
                  <Brain className="h-4 w-4" /> Strategic De-brief
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex h-[80vh] items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-foreground opacity-20" />
    </div>
  );
}


