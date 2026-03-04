import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Brain,
  Loader2,
  Trophy,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { generateSATQuestions } from "@/services/aiQuestions";
import { SATQuestion } from "@/data/mockData";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const DRILL_DURATION = 5 * 60; // 5 minutes

interface WeakTopic {
  topic: string;
  section: string;
  accuracy: number;
  attempted: number;
}

type DrillView = "select" | "drilling" | "results";

export default function TimedDrill() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [view, setView] = useState<DrillView>("select");
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<WeakTopic | null>(null);

  // Drill state
  const [questions, setQuestions] = useState<SATQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(DRILL_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (user) fetchWeakTopics();
  }, [user]);

  // Timer
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && view === "drilling") finishDrill();
  }, [timeLeft, view]);

  const fetchWeakTopics = async () => {
    setLoading(true);
    const { data: responses } = await supabase
      .from("question_responses")
      .select("topic, section, is_correct")
      .eq("user_id", user!.id);

    if (responses && responses.length > 0) {
      const stats = responses.reduce<Record<string, { t: number; c: number; s: string }>>(
        (acc, r) => {
          if (!acc[r.topic]) acc[r.topic] = { t: 0, c: 0, s: r.section };
          acc[r.topic].t++;
          if (r.is_correct) acc[r.topic].c++;
          return acc;
        },
        {}
      );

      const topics: WeakTopic[] = Object.entries(stats)
        .map(([topic, stat]) => ({
          topic,
          section: stat.s,
          accuracy: Math.round((stat.c / stat.t) * 100),
          attempted: stat.t,
        }))
        .filter((t) => t.accuracy < 80)
        .sort((a, b) => a.accuracy - b.accuracy);

      setWeakTopics(topics);
    }
    setLoading(false);
  };

  const startDrill = async (topic: WeakTopic) => {
    setSelectedTopic(topic);
    setGenerating(true);
    try {
      const section = topic.section.includes("math") ? "math" : "reading-writing";
      const difficulty = topic.accuracy < 40 ? "easy" : topic.accuracy < 60 ? "medium" : "hard";
      const qs = await generateSATQuestions(section as "reading-writing" | "math", 1, difficulty, 8);
      setQuestions(qs);
      setAnswers({});
      setCurrentQ(0);
      setTimeLeft(DRILL_DURATION);
      setIsRunning(true);
      setView("drilling");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate drill questions. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const selectAnswer = (qId: string, ansIdx: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: ansIdx }));
  };

  const finishDrill = useCallback(async () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (user && questions.length > 0) {
      const responses = questions.map((q) => ({
        user_id: user.id,
        question_id: q.id,
        section: q.section,
        topic: q.topic,
        difficulty: q.difficulty,
        user_answer: answers[q.id] ?? null,
        correct_answer: typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
        is_correct: answers[q.id] === q.correctAnswer,
        time_taken: Math.round((DRILL_DURATION - timeLeft) / questions.length),
      }));
      await (supabase.from("question_responses").insert as any)(responses);
    }
    setView("results");
  }, [user, questions, answers, timeLeft]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const correctCount = questions.filter((q) => answers[q.id] === q.correctAnswer).length;
  const timePercent = (timeLeft / DRILL_DURATION) * 100;
  const isUrgent = timeLeft < 60;

  // ─── Loading overlay ───
  const GeneratingOverlay = () => (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background px-10">
      <div className="w-full max-w-3xl space-y-16 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="h-36 w-36 border-[10px] border-foreground border-t-transparent mx-auto"
        />
        <div className="space-y-4">
          <h2 className="font-display text-6xl font-black uppercase tracking-tighter">
            GENERATING DRILL
          </h2>
          <div className="h-4 w-full bg-foreground/10 overflow-hidden border-4 border-foreground">
            <motion.div
              className="h-full bg-foreground"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
          <p className="text-sm font-black uppercase tracking-[0.3em] opacity-40">
            Preparing targeted questions for{" "}
            <span className="opacity-100">{selectedTopic?.topic}</span>
          </p>
        </div>
      </div>
    </div>
  );

  // ─── SELECT VIEW ───
  if (view === "select") {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16">
        {generating && <GeneratingOverlay />}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-16">

          {/* Header — mirrors Practice lobby */}
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between border-b-[12px] border-foreground pb-12">
            <div>
              <button
                onClick={() => navigate("/dashboard")}
                className="mb-6 flex items-center gap-2 font-black uppercase text-xs opacity-40 hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="h-4 w-4" /> Dashboard
              </button>
              <h1 className="font-display text-8xl font-black tracking-tighter uppercase leading-[0.8]">
                TIMED<br />DRILL
              </h1>
            </div>
            <p className="text-[12px] font-black uppercase tracking-[0.4em] opacity-40">
              5-Minute Targeted Sessions
            </p>
          </div>

          {/* Info bar */}
          <div className="border-4 border-foreground p-6 flex items-center gap-4 bg-foreground/[0.02]">
            <div className="flex items-center gap-3 bg-foreground text-background px-5 py-3">
              <Clock className="h-5 w-5" />
              <span className="font-black uppercase text-sm">5 Minutes</span>
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest opacity-40">
              8 targeted questions · instant feedback · saves to your stats
            </span>
          </div>

          {/* Topic list */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-foreground/30" />
            </div>
          ) : weakTopics.length === 0 ? (
            <div className="p-20 border-8 border-dashed border-foreground text-center">
              <Brain className="h-16 w-16 mx-auto opacity-10 mb-6" />
              <h3 className="font-display text-4xl font-black uppercase tracking-tighter mb-4 opacity-20">
                No Weak Topics Yet
              </h3>
              <p className="text-[11px] font-black uppercase tracking-widest opacity-30 mb-10">
                Take a practice test first to identify areas to drill.
              </p>
              <button
                onClick={() => navigate("/practice")}
                className="bg-foreground text-background px-10 py-5 font-black uppercase tracking-widest text-sm hover:opacity-90 transition-opacity"
              >
                Go to Practice
              </button>
            </div>
          ) : (
            <div className="space-y-0 border-8 border-foreground">
              {weakTopics.map((t, idx) => (
                <button
                  key={t.topic}
                  onClick={() => startDrill(t)}
                  className={`group w-full flex items-center justify-between p-8 text-left hover:bg-foreground hover:text-background transition-all ${idx !== weakTopics.length - 1 ? "border-b-4 border-foreground" : ""
                    }`}
                >
                  <div className="flex items-center gap-6">
                    <div
                      className={`w-16 h-16 flex items-center justify-center border-4 font-black text-sm flex-shrink-0 ${t.accuracy < 40
                          ? "border-foreground bg-foreground text-background group-hover:bg-background group-hover:text-foreground"
                          : t.accuracy < 60
                            ? "border-foreground/50"
                            : "border-foreground/20"
                        }`}
                    >
                      {t.accuracy}%
                    </div>
                    <div>
                      <div className="font-black uppercase tracking-tight text-lg">
                        {t.topic}
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-[0.25em] opacity-40 mt-1">
                        {t.section} · {t.attempted} attempted
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // ─── DRILLING VIEW ───
  if (view === "drilling") {
    const q = questions[currentQ];
    if (!q)
      return (
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );

    return (
      <div className="min-h-screen bg-background">
        {/* Sticky top bar — matches PracticeTest header style */}
        <div className="sticky top-0 z-50 bg-background border-b-8 border-foreground">
          {/* Progress bar */}
          <div className="h-2 bg-foreground/10">
            <motion.div
              className={`h-full ${isUrgent ? "bg-red-600" : "bg-foreground"}`}
              style={{ width: `${timePercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-foreground text-background px-5 py-3 font-display text-xl font-black uppercase">
                <Clock className="h-5 w-5" />
                <span className={`tabular-nums ${isUrgent ? "text-red-400" : ""}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="font-black uppercase tracking-[0.2em] text-xs opacity-40">
                {selectedTopic?.topic} — {currentQ + 1}/{questions.length}
              </div>
            </div>

            <button
              onClick={finishDrill}
              className="border-4 border-foreground bg-foreground text-background px-6 py-3 text-[10px] font-black uppercase hover:invert transition-all"
            >
              Finish Drill
            </button>
          </div>
        </div>

        {/* Question area */}
        <div className="mx-auto max-w-3xl px-6 py-12">
          {/* Question grid nav */}
          <div className="flex flex-wrap gap-3 mb-12 pb-8 border-b-8 border-foreground">
            {questions.map((_, idx) => {
              const isAnswered = answers[questions[idx]?.id] !== undefined;
              const isCurrent = currentQ === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentQ(idx)}
                  className={`h-12 w-12 flex items-center justify-center border-4 font-black text-xs transition-all relative ${isCurrent
                      ? "bg-foreground text-background scale-110 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                      : isAnswered
                        ? "bg-foreground/10 border-foreground text-foreground"
                        : "border-foreground/20 text-foreground/40 hover:border-foreground/60"
                    }`}
                >
                  {idx + 1}
                  {isAnswered && !isCurrent && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-foreground rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={q.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.15 }}
              className="space-y-12"
            >
              {/* Passage */}
              {q.passage && (
                <div className="border-8 border-foreground p-8 bg-black text-white text-base leading-relaxed font-medium">
                  <ReactMarkdown>{q.passage}</ReactMarkdown>
                </div>
              )}

              {/* Question */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <span className="inline-block bg-foreground/10 text-foreground px-3 py-1 text-xs tracking-wider border border-foreground/20">
                    Single choice question — Select one option
                  </span>
                  <h2 className="text-3xl font-semibold leading-relaxed">
                    <ReactMarkdown>{q.question}</ReactMarkdown>
                  </h2>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 gap-4">
                  {q.options.map((opt, idx) => {
                    const selected = answers[q.id] === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => selectAnswer(q.id, idx)}
                        className={`flex items-center gap-6 border-4 p-6 text-left transition-all ${selected
                            ? "bg-foreground text-background border-foreground"
                            : "border-foreground/20 hover:border-foreground hover:bg-foreground hover:text-background bg-background"
                          }`}
                      >
                        <div
                          className={`h-10 w-10 shrink-0 flex items-center justify-center border-4 font-bold text-sm ${selected
                              ? "bg-background text-foreground border-background"
                              : "border-foreground/30"
                            }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="text-base font-medium">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-8 border-t-8 border-foreground">
                <button
                  onClick={() => setCurrentQ((p) => Math.max(0, p - 1))}
                  disabled={currentQ === 0}
                  className="flex items-center gap-3 border-4 border-foreground px-8 py-4 font-black uppercase text-xs hover:bg-foreground hover:text-background transition-all disabled:opacity-20"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>

                <div className="font-display text-xl font-black uppercase tracking-tighter text-center hidden sm:block">
                  Question {currentQ + 1} of {questions.length}
                </div>

                {currentQ < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQ((p) => Math.min(questions.length - 1, p + 1))}
                    className="flex items-center gap-3 border-4 border-foreground bg-foreground text-background px-8 py-4 font-black uppercase text-xs hover:bg-background hover:text-foreground transition-all"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={finishDrill}
                    className="flex items-center gap-3 border-4 border-foreground bg-foreground text-background px-8 py-4 font-black uppercase text-xs hover:invert transition-all"
                  >
                    Finish Drill <CheckCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ─── RESULTS VIEW ───
  const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  const timeUsed = DRILL_DURATION - timeLeft;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-5xl px-6 py-16 pb-40"
    >
      {/* Header — mirrors review page style */}
      <div className="mb-20 flex flex-col gap-10 md:flex-row md:items-end md:justify-between border-b-[16px] border-foreground pb-12">
        <div>
          <button
            onClick={() => { setView("select"); setQuestions([]); setAnswers({}); }}
            className="mb-8 flex items-center gap-2 font-black uppercase text-xs opacity-40 hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Topics
          </button>
          <h1 className="font-display text-8xl font-black tracking-tighter uppercase leading-[0.8]">
            DRILL<br />RESULTS
          </h1>
        </div>
        <div className="bg-foreground text-background p-10 border-8 border-foreground text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-3 opacity-40">
            Accuracy
          </p>
          <div className="text-8xl font-black leading-none">{accuracy}%</div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-3">
            {selectedTopic?.topic}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-0 border-8 border-foreground mb-20">
        {[
          { label: "Correct", value: `${correctCount}/${questions.length}` },
          { label: "Time Used", value: formatTime(timeUsed) },
          { label: "Topic", value: selectedTopic?.section?.includes("math") ? "Math" : "Reading & Writing" },
        ].map((s, i) => (
          <div
            key={s.label}
            className={`p-10 text-center ${i !== 2 ? "border-r-4 border-foreground" : ""}`}
          >
            <div className="text-4xl font-black tracking-tighter">{s.value}</div>
            <div className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 mt-2">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Question review — mirrors PracticeTest review */}
      <div className="space-y-16">
        <h3 className="font-display text-5xl font-black uppercase tracking-tighter border-l-[12px] border-foreground pl-8">
          REVIEW QUESTIONS ({questions.length})
        </h3>

        <div className="space-y-8">
          {questions.map((q, i) => {
            const userAns = answers[q.id];
            const isCorrect = userAns === q.correctAnswer;
            const wasAnswered = userAns !== undefined;

            return (
              <div key={q.id} className="border-8 border-foreground">
                {/* Question header */}
                <div className="bg-foreground text-background px-8 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isCorrect
                      ? <CheckCircle className="h-5 w-5" />
                      : <XCircle className="h-5 w-5" />}
                    <span className="text-sm font-black uppercase tracking-widest">
                      Q{i + 1} — {q.topic}
                    </span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">
                    {q.difficulty}
                  </span>
                </div>

                <div className="p-10 space-y-8">
                  <p className="text-xl font-black uppercase tracking-tight leading-snug">
                    {q.question}
                  </p>

                  {/* Answer comparison */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 border-4 border-foreground">
                      <p className="text-[10px] font-black uppercase opacity-40 mb-2">Your Answer</p>
                      <p className="font-black uppercase">
                        {!wasAnswered
                          ? "NOT ANSWERED"
                          : q.options[userAns]}
                      </p>
                    </div>
                    <div className="p-6 border-4 border-foreground bg-foreground text-background">
                      <p className="text-[10px] font-black uppercase opacity-40 mb-2">Correct Answer</p>
                      <p className="font-black uppercase">{q.options[q.correctAnswer as number]}</p>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="p-8 bg-foreground/5 border-t-8 border-foreground">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 underline">
                      <Sparkles className="h-4 w-4" /> Explanation
                    </p>
                    <p className="text-base font-black uppercase tracking-tighter leading-snug opacity-80">
                      {q.explanation}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-0 border-8 border-foreground mt-20">
        <button
          onClick={() => { setView("select"); setQuestions([]); setAnswers({}); }}
          className="flex-1 flex items-center justify-center gap-3 p-8 font-black uppercase text-sm hover:bg-foreground hover:text-background transition-all border-r-4 border-foreground"
        >
          <RotateCcw className="h-4 w-4" /> Drill Again
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="flex-1 bg-foreground text-background p-8 font-black uppercase text-sm hover:invert transition-all"
        >
          Back to Dashboard
        </button>
      </div>
    </motion.div>
  );
}
