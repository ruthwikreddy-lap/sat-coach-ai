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

const ease = [0.22, 1, 0.36, 1] as const;

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
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black px-10">
      <div className="w-full max-w-3xl space-y-16 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="h-36 w-36 border-[10px] border-white/20 border-t-transparent rounded-full mx-auto"
        />
        <div className="space-y-4">
          <h2 className="font-display text-6xl font-black uppercase tracking-tighter gradient-text">
            GENERATING DRILL
          </h2>
          <div className="h-4 w-full bg-white/10 overflow-hidden rounded-full border border-white/20">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-white/40">
            Preparing targeted questions for{" "}
            <span className="text-white">{selectedTopic?.topic}</span>
          </p>
        </div>
      </div>
    </div>
  );

  // ─── SELECT VIEW ───
  if (view === "select") {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16 bg-black particle-bg min-h-screen">
        {generating && <GeneratingOverlay />}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }} className="space-y-16">

          {/* Header — mirrors Practice lobby */}
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between border-b border-white/10 pb-12">
            <div>
              <button
                onClick={() => navigate("/dashboard")}
                className="mb-6 glass-button flex items-center gap-2 font-black uppercase text-xs text-white rounded-xl"
              >
                <ChevronLeft className="h-4 w-4" /> Dashboard
              </button>
              <h1 className="font-display text-8xl font-black tracking-tighter uppercase leading-[0.8] gradient-text">
                TIMED<br />DRILL
              </h1>
            </div>
            <p className="text-[12px] font-black uppercase tracking-[0.4em] text-white/40">
              5-Minute Targeted Sessions
            </p>
          </div>

          {/* Info bar */}
          <div className="glass-card-depth rounded-2xl p-6 flex items-center gap-4 border-glow">
            <div className="flex items-center gap-3 bg-white/10 text-white px-5 py-3 rounded-xl">
              <Clock className="h-5 w-5" />
              <span className="font-black uppercase text-sm">5 Minutes</span>
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-white/40">
              8 targeted questions · instant feedback · saves to your stats
            </span>
          </div>

          {/* Topic list */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-white/20" />
            </div>
          ) : weakTopics.length === 0 ? (
            <div className="glass-card-depth rounded-3xl p-20 border-dashed border border-white/20 text-center">
              <Brain className="h-16 w-16 mx-auto text-white/10 mb-6" />
              <h3 className="font-display text-4xl font-black uppercase tracking-tighter mb-4 text-white/20">
                No Weak Topics Yet
              </h3>
              <p className="text-[11px] font-black uppercase tracking-widest text-white/30 mb-10">
                Take a practice test first to identify areas to drill.
              </p>
              <button
                onClick={() => navigate("/practice")}
                className="bg-white text-black px-10 py-5 font-black uppercase tracking-widest text-sm rounded-xl hover:bg-white/90 glow-soft"
              >
                Go to Practice
              </button>
            </div>
          ) : (
            <div className="glass-card-depth rounded-3xl border-glow">
              {weakTopics.map((t, idx) => (
                <button
                  key={t.topic}
                  onClick={() => startDrill(t)}
                  className={`group w-full flex items-center justify-between p-8 text-left hover:bg-white/10 transition-all ${idx !== weakTopics.length - 1 ? "border-b border-white/10" : ""
                    }`}
                >
                  <div className="flex items-center gap-6">
                    <div
                      className={`w-16 h-16 flex items-center justify-center border font-black text-sm flex-shrink-0 rounded-xl ${t.accuracy < 40
                          ? "border-white/20 bg-white/10 text-white group-hover:bg-white/20"
                          : t.accuracy < 60
                            ? "border-white/10 bg-white/5 text-white"
                            : "border-white/5 bg-white/5 text-white"
                        }`}
                    >
                      {t.accuracy}%
                    </div>
                    <div>
                      <div className="font-black uppercase tracking-tight text-lg text-white">
                        {t.topic}
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 mt-1">
                        {t.section} · {t.attempted} attempted
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-white" />
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
        <div className="flex min-h-screen items-center justify-center bg-black">
          <Loader2 className="h-8 w-8 animate-spin text-white/20" />
        </div>
      );

    return (
      <div className="min-h-screen bg-black">
        {/* Sticky top bar — matches PracticeTest header style */}
        <div className="sticky top-0 z-50 bg-black border-b border-white/10">
          {/* Progress bar */}
          <div className="h-2 bg-white/10">
            <motion.div
              className={`h-full ${isUrgent ? "bg-red-500" : "bg-white"}`}
              style={{ width: `${timePercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-white/10 text-white px-5 py-3 font-display text-xl font-black uppercase rounded-xl">
                <Clock className="h-5 w-5" />
                <span className={`tabular-nums ${isUrgent ? "text-red-500" : ""}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="font-black uppercase tracking-[0.2em] text-xs text-white/40">
                {selectedTopic?.topic} — {currentQ + 1}/{questions.length}
              </div>
            </div>

            <button
              onClick={finishDrill}
              className="bg-white text-black px-6 py-3 text-[10px] font-black uppercase rounded-xl hover:bg-white/90 glow-soft"
            >
              Finish Drill
            </button>
          </div>
        </div>

        {/* Question area */}
        <div className="mx-auto max-w-3xl px-6 py-12">
          {/* Question grid nav */}
          <div className="flex flex-wrap gap-3 mb-12 pb-8 border-b border-white/10">
            {questions.map((_, idx) => {
              const isAnswered = answers[questions[idx]?.id] !== undefined;
              const isCurrent = currentQ === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentQ(idx)}
                  className={`h-12 w-12 flex items-center justify-center border font-black text-xs transition-all relative rounded-xl ${isCurrent
                      ? "bg-white text-black scale-110"
                      : isAnswered
                        ? "bg-white/10 border-white/20 text-white"
                        : "border-white/10 text-white/40 hover:border-white/30"
                    }`}
                >
                  {idx + 1}
                  {isAnswered && !isCurrent && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-white rounded-full" />
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
              transition={{ duration: 0.15, ease }}
              className="space-y-12"
            >
              {/* Passage */}
              {q.passage && (
                <div className="glass-card-depth rounded-3xl p-8 text-white text-base leading-relaxed font-medium">
                  <ReactMarkdown>{q.passage}</ReactMarkdown>
                </div>
              )}

              {/* Question */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <span className="inline-block bg-white/10 text-white px-3 py-1 text-xs tracking-wider border border-white/20 rounded-lg">
                    Single choice question — Select one option
                  </span>
                  <h2 className="text-3xl font-semibold leading-relaxed text-white">
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
                        className={`flex items-center gap-6 border p-6 text-left transition-all rounded-xl ${selected
                            ? "bg-white text-black border-white"
                            : "border-white/10 hover:border-white/20 hover:bg-white/10 bg-transparent text-white"
                          }`}
                      >
                        <div
                          className={`h-10 w-10 shrink-0 flex items-center justify-center border font-bold text-sm rounded-lg ${selected
                              ? "bg-black text-white border-black"
                              : "border-white/20"
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
              <div className="flex items-center justify-between pt-8 border-t border-white/10">
                <button
                  onClick={() => setCurrentQ((p) => Math.max(0, p - 1))}
                  disabled={currentQ === 0}
                  className="glass-button flex items-center gap-3 px-8 py-4 font-black uppercase text-xs rounded-xl disabled:opacity-20"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>

                <div className="font-display text-xl font-black uppercase tracking-tighter text-center hidden sm:block text-white">
                  Question {currentQ + 1} of {questions.length}
                </div>

                {currentQ < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQ((p) => Math.min(questions.length - 1, p + 1))}
                    className="bg-white text-black flex items-center gap-3 px-8 py-4 font-black uppercase text-xs rounded-xl hover:bg-white/90 glow-soft"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={finishDrill}
                    className="bg-white text-black flex items-center gap-3 px-8 py-4 font-black uppercase text-xs rounded-xl hover:bg-white/90 glow-soft"
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
      transition={{ duration: 0.8, ease }}
      className="mx-auto max-w-5xl px-6 py-16 pb-40 bg-black particle-bg min-h-screen"
    >
      {/* Header — mirrors review page style */}
      <div className="mb-20 flex flex-col gap-10 md:flex-row md:items-end md:justify-between border-b border-white/10 pb-12">
        <div>
          <button
            onClick={() => { setView("select"); setQuestions([]); setAnswers({}); }}
            className="mb-8 glass-button flex items-center gap-2 font-black uppercase text-xs text-white rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Topics
          </button>
          <h1 className="font-display text-8xl font-black tracking-tighter uppercase leading-[0.8] gradient-text">
            DRILL<br />RESULTS
          </h1>
        </div>
        <div className="glass-card-depth rounded-3xl p-10 border-glow text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-3 text-white/40">
            Accuracy
          </p>
          <div className="text-8xl font-black leading-none text-white">{accuracy}%</div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-3">
            {selectedTopic?.topic}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="glass-card-depth rounded-3xl border-glow mb-20">
        <div className="grid grid-cols-3">
          {[
            { label: "Correct", value: `${correctCount}/${questions.length}` },
            { label: "Time Used", value: formatTime(timeUsed) },
            { label: "Topic", value: selectedTopic?.section?.includes("math") ? "Math" : "Reading & Writing" },
          ].map((s, i) => (
            <div
              key={s.label}
              className={`p-10 text-center ${i !== 2 ? "border-r border-white/10" : ""}`}
            >
              <div className="text-4xl font-black tracking-tighter text-white">{s.value}</div>
              <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mt-2">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Question review — mirrors PracticeTest review */}
      <div className="space-y-16">
        <h3 className="font-display text-5xl font-black uppercase tracking-tighter border-l-4 border-white/20 pl-8 text-white">
          REVIEW QUESTIONS ({questions.length})
        </h3>

        <div className="space-y-8">
          {questions.map((q, i) => {
            const userAns = answers[q.id];
            const isCorrect = userAns === q.correctAnswer;
            const wasAnswered = userAns !== undefined;

            return (
              <div key={q.id} className="glass-card-depth rounded-3xl border-glow">
                {/* Question header */}
                <div className="bg-white/10 text-white px-8 py-4 flex items-center justify-between rounded-t-3xl border-b border-white/10">
                  <div className="flex items-center gap-3">
                    {isCorrect
                      ? <CheckCircle className="h-5 w-5" />
                      : <XCircle className="h-5 w-5" />}
                    <span className="text-sm font-black uppercase tracking-widest">
                      Q{i + 1} — {q.topic}
                    </span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                    {q.difficulty}
                  </span>
                </div>

                <div className="p-10 space-y-8">
                  <p className="text-xl font-black uppercase tracking-tight leading-snug text-white">
                    {q.question}
                  </p>

                  {/* Answer comparison */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 border border-white/10 rounded-xl">
                      <p className="text-[10px] font-black uppercase text-white/40 mb-2">Your Answer</p>
                      <p className="font-black uppercase text-white">
                        {!wasAnswered
                          ? "NOT ANSWERED"
                          : q.options[userAns]}
                      </p>
                    </div>
                    <div className="p-6 border border-white/20 bg-white/10 text-white rounded-xl">
                      <p className="text-[10px] font-black uppercase text-white/60 mb-2">Correct Answer</p>
                      <p className="font-black uppercase text-white">{q.options[q.correctAnswer as number]}</p>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="p-8 bg-white/5 border-t border-white/10 rounded-b-3xl">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-white/40">
                      <Sparkles className="h-4 w-4" /> Explanation
                    </p>
                    <p className="text-base font-black uppercase tracking-tighter leading-snug text-white/80">
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
      <div className="glass-card-depth rounded-3xl border-glow mt-20">
        <div className="flex">
          <button
            onClick={() => { setView("select"); setQuestions([]); setAnswers({}); }}
            className="flex-1 flex items-center justify-center gap-3 p-8 font-black uppercase text-sm hover:bg-white/10 transition-all border-r border-white/10 text-white rounded-l-3xl"
          >
            <RotateCcw className="h-4 w-4" /> Drill Again
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 bg-white text-black p-8 font-black uppercase text-sm hover:bg-white/90 glow-soft rounded-r-3xl"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </motion.div>
  );
}
