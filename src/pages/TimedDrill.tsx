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
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { generateSATQuestions } from "@/services/aiQuestions";
import { SATQuestion } from "@/data/mockData";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const DRILL_DURATION = 5 * 60; // 5 minutes in seconds

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

  // Fetch weak topics from past responses
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
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && view === "drilling") {
      finishDrill();
    }
  }, [timeLeft, view]);

  const fetchWeakTopics = async () => {
    setLoading(true);
    const { data: responses } = await supabase
      .from("question_responses")
      .select("topic, section, is_correct")
      .eq("user_id", user!.id);

    if (responses && responses.length > 0) {
      const stats = responses.reduce<
        Record<string, { t: number; c: number; s: string }>
      >((acc, r) => {
        if (!acc[r.topic]) acc[r.topic] = { t: 0, c: 0, s: r.section };
        acc[r.topic].t++;
        if (r.is_correct) acc[r.topic].c++;
        return acc;
      }, {});

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
      const section = topic.section.includes("math")
        ? "math"
        : "reading-writing";
      const difficulty =
        topic.accuracy < 40 ? "easy" : topic.accuracy < 60 ? "medium" : "hard";

      const qs = await generateSATQuestions(
        section as "reading-writing" | "math",
        1,
        difficulty,
        8
      );

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

    // Save responses to DB
    if (user && questions.length > 0) {
      const responses = questions.map((q) => ({
        user_id: user.id,
        question_id: q.id,
        section: q.section,
        topic: q.topic,
        difficulty: q.difficulty,
        user_answer: answers[q.id] ?? null,
        correct_answer:
          typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
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

  const correctCount = questions.filter(
    (q) => answers[q.id] === q.correctAnswer
  ).length;
  const answeredCount = Object.keys(answers).length;

  // ─── Select Topic ───
  if (view === "select") {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        {generating && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/95 backdrop-blur-sm">
            <div className="text-center space-y-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="h-16 w-16 mx-auto text-foreground" />
              </motion.div>
              <h2 className="font-display text-3xl font-black tracking-tighter">
                Generating Drill...
              </h2>
              <p className="text-sm text-foreground/50">
                Preparing targeted questions for{" "}
                <strong>{selectedTopic?.topic}</strong>
              </p>
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div>
            <button
              onClick={() => navigate("/dashboard")}
              className="mb-6 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
            </button>
            <div className="flex items-center gap-4 mb-2">
              <div className="h-10 w-10 rounded-xl bg-foreground text-background flex items-center justify-center">
                <Zap className="h-5 w-5" />
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tighter">
                Timed Drill
              </h1>
            </div>
            <p className="text-foreground/50 mt-2">
              5-minute focused sessions on your weakest topics. Pick a topic
              below.
            </p>
          </div>

          {/* Timer info */}
          <div className="flex items-center gap-3 border border-foreground/10 rounded-xl p-4 bg-foreground/[0.02]">
            <Clock className="h-5 w-5 text-foreground/40" />
            <div>
              <span className="text-sm font-semibold">5 minutes</span>
              <span className="text-sm text-foreground/40 ml-2">
                · 8 targeted questions · Instant feedback
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-foreground/30" />
            </div>
          ) : weakTopics.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-foreground/10 rounded-2xl">
              <Brain className="h-12 w-12 mx-auto text-foreground/10 mb-4" />
              <h3 className="font-display text-xl font-bold mb-2">
                No weak topics yet
              </h3>
              <p className="text-sm text-foreground/40 mb-6">
                Take a practice test first to identify areas to drill.
              </p>
              <button
                onClick={() => navigate("/practice")}
                className="bg-foreground text-background px-6 py-3 text-sm font-bold rounded-lg hover:opacity-90 transition-opacity"
              >
                Go to Practice
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              {weakTopics.map((t) => (
                <button
                  key={t.topic}
                  onClick={() => startDrill(t)}
                  className="group flex items-center justify-between border border-foreground/10 rounded-xl p-5 hover:border-foreground/30 hover:bg-foreground/[0.02] transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-black ${
                        t.accuracy < 40
                          ? "bg-red-500/10 text-red-500"
                          : t.accuracy < 60
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-foreground/10 text-foreground/60"
                      }`}
                    >
                      {t.accuracy}%
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {t.topic}
                      </div>
                      <div className="text-[11px] text-foreground/40 uppercase tracking-wider">
                        {t.section} · {t.attempted} attempted
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-foreground/20 group-hover:text-foreground/60 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // ─── Drilling ───
  if (view === "drilling") {
    const q = questions[currentQ];
    if (!q)
      return (
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );

    const timePercent = (timeLeft / DRILL_DURATION) * 100;
    const isUrgent = timeLeft < 60;

    return (
      <div className="min-h-screen bg-background">
        {/* Timer bar */}
        <div className="sticky top-0 z-50 bg-background border-b border-foreground/5">
          <div className="h-1 bg-foreground/5">
            <motion.div
              className={`h-full ${isUrgent ? "bg-red-500" : "bg-foreground"}`}
              style={{ width: `${timePercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="mx-auto max-w-3xl flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-foreground/40" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-foreground/40">
                {selectedTopic?.topic}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-bold uppercase tracking-widest text-foreground/40">
                {currentQ + 1}/{questions.length}
              </span>
              <span
                className={`font-display text-lg font-black tabular-nums ${
                  isUrgent ? "text-red-500" : "text-foreground"
                }`}
              >
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="mx-auto max-w-3xl px-6 py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={q.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {q.passage && (
                <div className="border border-foreground/10 rounded-xl p-6 bg-foreground/[0.02] text-sm leading-relaxed text-foreground/70 max-h-48 overflow-y-auto">
                  <ReactMarkdown>{q.passage}</ReactMarkdown>
                </div>
              )}

              <h2 className="text-lg font-semibold leading-relaxed">
                <ReactMarkdown>{q.question}</ReactMarkdown>
              </h2>

              <div className="grid gap-3">
                {q.options.map((opt, idx) => {
                  const selected = answers[q.id] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => selectAnswer(q.id, idx)}
                      className={`flex items-center gap-4 border rounded-xl p-4 text-left transition-all ${
                        selected
                          ? "border-foreground bg-foreground text-background"
                          : "border-foreground/10 hover:border-foreground/30"
                      }`}
                    >
                      <span
                        className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          selected
                            ? "bg-background text-foreground"
                            : "bg-foreground/5 text-foreground/50"
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-sm">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => setCurrentQ((p) => Math.max(0, p - 1))}
                  disabled={currentQ === 0}
                  className="px-5 py-2.5 text-sm font-semibold border border-foreground/10 rounded-lg disabled:opacity-20 hover:bg-foreground/5 transition-colors"
                >
                  Previous
                </button>

                {currentQ === questions.length - 1 ? (
                  <button
                    onClick={finishDrill}
                    className="bg-foreground text-background px-6 py-2.5 text-sm font-bold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Finish Drill
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      setCurrentQ((p) => Math.min(questions.length - 1, p + 1))
                    }
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border border-foreground/10 rounded-lg hover:bg-foreground/5 transition-colors"
                  >
                    Next <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ─── Results ───
  const accuracy =
    questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  const timeUsed = DRILL_DURATION - timeLeft;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-10"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <div
            className={`h-16 w-16 mx-auto rounded-2xl flex items-center justify-center ${
              accuracy >= 80
                ? "bg-green-500/10 text-green-500"
                : accuracy >= 50
                ? "bg-amber-500/10 text-amber-500"
                : "bg-red-500/10 text-red-500"
            }`}
          >
            <Trophy className="h-8 w-8" />
          </div>
          <h1 className="font-display text-4xl font-black tracking-tighter">
            Drill Complete!
          </h1>
          <p className="text-foreground/50">
            {selectedTopic?.topic} · {formatTime(timeUsed)} used
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Accuracy", value: `${accuracy}%` },
            { label: "Correct", value: `${correctCount}/${questions.length}` },
            { label: "Time", value: formatTime(timeUsed) },
          ].map((s) => (
            <div
              key={s.label}
              className="border border-foreground/10 rounded-xl p-5 text-center"
            >
              <div className="text-2xl font-black tracking-tight">
                {s.value}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Question Review */}
        <div className="space-y-3">
          <h3 className="font-display text-lg font-bold">Question Review</h3>
          {questions.map((q, i) => {
            const userAns = answers[q.id];
            const isCorrect = userAns === q.correctAnswer;
            const wasAnswered = userAns !== undefined;

            return (
              <div
                key={q.id}
                className="border border-foreground/10 rounded-xl p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium">Q{i + 1}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">
                    {q.difficulty}
                  </span>
                </div>
                <p className="text-sm text-foreground/70">{q.question}</p>
                <div className="text-xs space-y-1">
                  {!wasAnswered && (
                    <p className="text-foreground/40 italic">Not answered</p>
                  )}
                  {wasAnswered && !isCorrect && (
                    <p className="text-red-500/70">
                      Your answer: {q.options[userAns]}
                    </p>
                  )}
                  <p className="text-green-600/70">
                    Correct: {q.options[q.correctAnswer as number]}
                  </p>
                </div>
                <p className="text-xs text-foreground/40 leading-relaxed border-t border-foreground/5 pt-3">
                  {q.explanation}
                </p>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              setView("select");
              setQuestions([]);
              setAnswers({});
            }}
            className="flex-1 flex items-center justify-center gap-2 border border-foreground/10 rounded-lg py-3 text-sm font-semibold hover:bg-foreground/5 transition-colors"
          >
            <RotateCcw className="h-4 w-4" /> Drill Again
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 bg-foreground text-background rounded-lg py-3 text-sm font-bold hover:opacity-90 transition-opacity"
          >
            Back to Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
}
