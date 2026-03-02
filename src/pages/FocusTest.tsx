import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Clock, ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useTimer } from "@/hooks/useTimer";
import { mockQuestions } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function FocusTest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const timer = useTimer(35 * 60);
  const questions = mockQuestions;
  const question = questions[currentQ];

  useEffect(() => {
    timer.start();
  }, []);

  // Tab-switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !submitted) {
        setTabSwitchCount((c) => c + 1);
        setShowWarning(true);
      }
    };

    const handleBlur = () => {
      if (!submitted) {
        setTabSwitchCount((c) => c + 1);
        setShowWarning(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [submitted]);

  useEffect(() => {
    if (timer.isExpired && !submitted) handleSubmit();
  }, [timer.isExpired]);

  const handleSubmit = useCallback(async () => {
    timer.pause();
    setSubmitted(true);

    // Save results to database
    if (user) {
      const correct = questions.reduce(
        (acc, q) => acc + (answers[q.id] === q.correctAnswer ? 1 : 0),
        0
      );
      const mathQs = questions.filter((q) => q.section.includes("math"));
      const readQs = questions.filter((q) => !q.section.includes("math"));
      const mathCorrect = mathQs.filter((q) => answers[q.id] === q.correctAnswer).length;
      const readCorrect = readQs.filter((q) => answers[q.id] === q.correctAnswer).length;

      const weakTopics = getWeakTopics();

      const { data: testResult } = await supabase.from("test_results").insert({
        user_id: user.id,
        score: Math.round((correct / questions.length) * 1600),
        reading_score: readQs.length > 0 ? Math.round((readCorrect / readQs.length) * 800) : 0,
        math_score: mathQs.length > 0 ? Math.round((mathCorrect / mathQs.length) * 800) : 0,
        weak_topics: weakTopics,
        time_spent: Math.round((35 * 60 - timer.seconds) / 60),
        total_questions: questions.length,
        correct_answers: correct,
      }).select("id").single();

      // Save individual responses
      if (testResult) {
        const responses = questions.map((q) => ({
          user_id: user.id,
          test_result_id: testResult.id,
          question_id: q.id,
          section: q.section,
          topic: q.topic,
          difficulty: q.difficulty,
          user_answer: answers[q.id] ?? null,
          correct_answer: q.correctAnswer,
          is_correct: answers[q.id] === q.correctAnswer,
        }));
        await supabase.from("question_responses").insert(responses);
      }

      // Update profile weaknesses
      if (weakTopics.length > 0) {
        await supabase.from("user_profiles").update({ weaknesses: weakTopics }).eq("user_id", user.id);
      }
    }
  }, [timer, answers, user, questions]);

  const getWeakTopics = () => {
    const topicResults: Record<string, { correct: number; total: number }> = {};
    questions.forEach((q) => {
      if (!topicResults[q.topic]) topicResults[q.topic] = { correct: 0, total: 0 };
      topicResults[q.topic].total++;
      if (answers[q.id] === q.correctAnswer) topicResults[q.topic].correct++;
    });
    return Object.entries(topicResults)
      .filter(([, v]) => v.total > 0 && v.correct / v.total < 0.7)
      .map(([k]) => k);
  };

  const handleAnswer = (idx: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [question.id]: idx }));
  };

  const score = questions.reduce(
    (acc, q) => acc + (answers[q.id] === q.correctAnswer ? 1 : 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-foreground">
      {/* Tab switch warning overlay */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/90"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl border border-danger/30 bg-card p-8 text-center shadow-elevated"
            >
              <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-danger" />
              <h2 className="font-display text-xl font-bold text-foreground">Tab Switch Detected!</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                You left the test window. In a real exam, this would be flagged.
              </p>
              <p className="mt-2 text-xs font-semibold text-danger">
                Warning #{tabSwitchCount} — Stay focused!
              </p>
              <button
                onClick={() => setShowWarning(false)}
                className="mt-6 w-full rounded-xl gradient-accent py-3 text-sm font-semibold text-accent-foreground"
              >
                Return to Test
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimal header */}
      <div className="flex items-center justify-between border-b border-primary-foreground/10 px-6 py-3">
        <div className={`font-display text-lg font-bold ${
          timer.seconds < 300 ? "text-danger animate-pulse-glow" : "text-primary-foreground"
        }`}>
          <Clock className="mr-2 inline h-4 w-4" />
          {timer.formatted}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-primary-foreground/60">
            {currentQ + 1} / {questions.length}
          </span>
          {tabSwitchCount > 0 && (
            <span className="flex items-center gap-1 rounded-lg bg-danger/20 px-2 py-1 text-xs font-semibold text-danger">
              <AlertTriangle className="h-3 w-3" /> {tabSwitchCount} tab switch{tabSwitchCount > 1 ? "es" : ""}
            </span>
          )}
        </div>
        <button
          onClick={() => navigate("/practice")}
          className="rounded-lg p-2 text-primary-foreground/60 transition-colors hover:text-primary-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Question area */}
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-2xl">
          <motion.div key={question.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="font-display text-2xl font-bold text-primary-foreground">
              {question.question}
            </h2>
            <div className="space-y-3">
              {question.options.map((opt, idx) => {
                const isSelected = answers[question.id] === idx;
                const isCorrect = question.correctAnswer === idx;
                let style = "border-primary-foreground/15 hover:border-primary-foreground/30";
                if (submitted) {
                  if (isCorrect) style = "border-success bg-success/10";
                  else if (isSelected) style = "border-danger bg-danger/10";
                } else if (isSelected) {
                  style = "border-accent bg-accent/10";
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={submitted}
                    className={`flex w-full items-center gap-4 rounded-xl border p-5 text-left transition-all ${style}`}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-primary-foreground/20 text-sm font-bold text-primary-foreground/60">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-base font-medium text-primary-foreground">{opt}</span>
                    {submitted && isCorrect && <CheckCircle className="ml-auto h-5 w-5 text-success" />}
                    {submitted && isSelected && !isCorrect && <XCircle className="ml-auto h-5 w-5 text-danger" />}
                  </button>
                );
              })}
            </div>
            {submitted && (
              <div className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-4">
                <p className="text-sm text-primary-foreground/60">{question.explanation}</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer nav */}
      <div className="flex items-center justify-between border-t border-primary-foreground/10 px-6 py-4">
        <button
          onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
          disabled={currentQ === 0}
          className="flex items-center gap-1 text-sm text-primary-foreground/60 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </button>
        {!submitted ? (
          <button onClick={handleSubmit} className="rounded-lg gradient-accent px-6 py-2 text-sm font-semibold text-accent-foreground">
            Submit
          </button>
        ) : (
          <div className="text-center">
            <span className="font-display text-xl font-bold text-primary-foreground">{score}/{questions.length}</span>
            <button onClick={() => navigate("/")} className="ml-4 rounded-lg border border-primary-foreground/20 px-4 py-2 text-sm text-primary-foreground">
              Back to Dashboard
            </button>
          </div>
        )}
        <button
          onClick={() => setCurrentQ((q) => Math.min(questions.length - 1, q + 1))}
          disabled={currentQ === questions.length - 1}
          className="flex items-center gap-1 text-sm text-primary-foreground/60 disabled:opacity-30"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
