import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Clock, ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import { useTimer } from "@/hooks/useTimer";
import { mockQuestions } from "@/data/mockData";

export default function FocusTest() {
  const navigate = useNavigate();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const timer = useTimer(35 * 60);
  const questions = mockQuestions;
  const question = questions[currentQ];

  useEffect(() => {
    timer.start();
  }, []);

  useEffect(() => {
    if (timer.isExpired && !submitted) handleSubmit();
  }, [timer.isExpired]);

  const handleSubmit = useCallback(() => {
    timer.pause();
    setSubmitted(true);
  }, [timer]);

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
      {/* Minimal header */}
      <div className="flex items-center justify-between border-b border-primary-foreground/10 px-6 py-3">
        <div className={`font-display text-lg font-bold ${
          timer.seconds < 300 ? "text-danger animate-pulse-glow" : "text-primary-foreground"
        }`}>
          <Clock className="mr-2 inline h-4 w-4" />
          {timer.formatted}
        </div>
        <span className="text-sm text-primary-foreground/60">
          {currentQ + 1} / {questions.length}
        </span>
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
          <motion.div
            key={question.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
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
          <button
            onClick={handleSubmit}
            className="rounded-lg gradient-accent px-6 py-2 text-sm font-semibold text-accent-foreground"
          >
            Submit
          </button>
        ) : (
          <div className="text-center">
            <span className="font-display text-xl font-bold text-primary-foreground">{score}/{questions.length}</span>
            <button
              onClick={() => navigate("/")}
              className="ml-4 rounded-lg border border-primary-foreground/20 px-4 py-2 text-sm text-primary-foreground"
            >
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
