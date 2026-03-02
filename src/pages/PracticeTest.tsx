import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Clock, ChevronLeft, ChevronRight, CheckCircle, XCircle, Maximize2 } from "lucide-react";
import { useTimer } from "@/hooks/useTimer";
import { mockQuestions, SATQuestion } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function PracticeTest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const timer = useTimer(35 * 60); // 35 minutes
  const questions = mockQuestions;
  const question = questions[currentQ];

  useEffect(() => {
    if (timer.isExpired && started && !submitted) {
      handleSubmit();
    }
  }, [timer.isExpired]);

  const handleAnswer = (idx: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [question.id]: idx }));
  };

  const handleSubmit = useCallback(async () => {
    timer.pause();
    setSubmitted(true);

    if (user) {
      const correct = questions.reduce((a, q) => a + (answers[q.id] === q.correctAnswer ? 1 : 0), 0);
      const mathQs = questions.filter((q) => q.section.includes("math"));
      const readQs = questions.filter((q) => !q.section.includes("math"));
      const mathCorrect = mathQs.filter((q) => answers[q.id] === q.correctAnswer).length;
      const readCorrect = readQs.filter((q) => answers[q.id] === q.correctAnswer).length;
      const weakTopics = Object.entries(
        questions.reduce<Record<string, { c: number; t: number }>>((acc, q) => {
          if (!acc[q.topic]) acc[q.topic] = { c: 0, t: 0 };
          acc[q.topic].t++;
          if (answers[q.id] === q.correctAnswer) acc[q.topic].c++;
          return acc;
        }, {})
      ).filter(([, v]) => v.t > 0 && v.c / v.t < 0.7).map(([k]) => k);

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

      if (weakTopics.length > 0) {
        await supabase.from("user_profiles").update({ weaknesses: weakTopics }).eq("user_id", user.id);
      }
    }
  }, [timer, answers, user, questions]);

  const score = questions.reduce(
    (acc, q) => acc + (answers[q.id] === q.correctAnswer ? 1 : 0),
    0
  );

  if (!started) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl gradient-accent">
            <Clock className="h-8 w-8 text-accent-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Practice Test</h1>
          <p className="mt-3 text-muted-foreground">
            {questions.length} questions · 35 minutes · Timed simulation
          </p>
          <div className="mt-8 rounded-xl border border-border bg-card p-6 text-left shadow-card">
            <h3 className="font-display font-bold text-foreground">Before you begin:</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
                Timer starts immediately—no pausing allowed
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
                Auto-submits when time expires
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
                Review answers after submission
              </li>
            </ul>
          </div>
          <div className="mt-8 flex justify-center gap-3">
            <button
              onClick={() => { setStarted(true); timer.start(); }}
              className="rounded-lg gradient-accent px-8 py-3 font-semibold text-accent-foreground transition-transform hover:scale-105"
            >
              Start Test
            </button>
            <button
              onClick={() => { setStarted(true); timer.start(); navigate("/focus-test"); }}
              className="flex items-center gap-2 rounded-lg border border-border px-6 py-3 font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              <Maximize2 className="h-4 w-4" /> Focus Mode
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Timer & Progress */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-display text-sm font-bold ${
            timer.seconds < 300 ? "bg-danger-light text-danger animate-pulse-glow" : "bg-secondary text-foreground"
          }`}>
            <Clock className="h-4 w-4" />
            {timer.formatted}
          </div>
          <span className="text-sm text-muted-foreground">
            Q{currentQ + 1}/{questions.length}
          </span>
        </div>
        {!submitted && (
          <button
            onClick={handleSubmit}
            className="rounded-lg bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground"
          >
            Submit Test
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-6 h-1.5 w-full rounded-full bg-secondary">
        <motion.div
          className="h-full rounded-full gradient-accent"
          animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="rounded-xl border border-border bg-card p-6 shadow-card"
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {question.section}
            </span>
            <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {question.topic}
            </span>
            <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
              question.difficulty === "easy" ? "bg-success-light text-success" :
              question.difficulty === "medium" ? "bg-amber-light text-amber-foreground" :
              "bg-danger-light text-danger"
            }`}>
              {question.difficulty}
            </span>
          </div>

          <h2 className="mt-4 font-display text-xl font-bold text-foreground">{question.question}</h2>

          <div className="mt-6 space-y-3">
            {question.options.map((opt, idx) => {
              const isSelected = answers[question.id] === idx;
              const isCorrect = question.correctAnswer === idx;
              let optionStyle = "border-border bg-background hover:border-accent/50";

              if (submitted) {
                if (isCorrect) optionStyle = "border-success bg-success-light";
                else if (isSelected && !isCorrect) optionStyle = "border-danger bg-danger-light";
              } else if (isSelected) {
                optionStyle = "border-accent bg-teal-light";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={submitted}
                  className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-all ${optionStyle}`}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-xs font-bold text-muted-foreground">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-sm font-medium text-foreground">{opt}</span>
                  {submitted && isCorrect && <CheckCircle className="ml-auto h-5 w-5 text-success" />}
                  {submitted && isSelected && !isCorrect && <XCircle className="ml-auto h-5 w-5 text-danger" />}
                </button>
              );
            })}
          </div>

          {submitted && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 rounded-lg bg-secondary p-4"
            >
              <p className="text-sm font-semibold text-foreground">Explanation:</p>
              <p className="mt-1 text-sm text-muted-foreground">{question.explanation}</p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
          disabled={currentQ === 0}
          className="flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>

        {submitted && (
          <div className="text-center">
            <p className="font-display text-2xl font-bold text-foreground">{score}/{questions.length}</p>
            <p className="text-xs text-muted-foreground">correct answers</p>
          </div>
        )}

        <button
          onClick={() => setCurrentQ((q) => Math.min(questions.length - 1, q + 1))}
          disabled={currentQ === questions.length - 1}
          className="flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Question navigator */}
      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        {questions.map((q, i) => {
          let dotStyle = "bg-secondary text-muted-foreground";
          if (submitted) {
            if (answers[q.id] === q.correctAnswer) dotStyle = "bg-success text-success-light";
            else if (answers[q.id] !== undefined) dotStyle = "bg-danger text-danger-light";
          } else if (answers[q.id] !== undefined) {
            dotStyle = "bg-accent text-accent-foreground";
          }
          if (i === currentQ) dotStyle += " ring-2 ring-accent ring-offset-2 ring-offset-card";

          return (
            <button
              key={q.id}
              onClick={() => setCurrentQ(i)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all ${dotStyle}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
