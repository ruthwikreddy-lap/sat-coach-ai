import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Clock, ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertTriangle, Hash } from "lucide-react";
import Calculator from "@/components/Calculator";
import { useTimer } from "@/hooks/useTimer";
import { mockQuestions } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function FocusTest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
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
          user_answer: typeof answers[q.id] === 'number' ? answers[q.id] : 0,
          correct_answer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
          is_correct: answers[q.id] === q.correctAnswer,
        }));
        await (supabase.from("question_responses").insert as any)(responses);
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
      {question.section === "math" && showCalculator && (
        <div className="relative">
          <Calculator />
        </div>
      )}
      {/* Tab switch warning overlay */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md border-8 border-white bg-black p-12 text-center"
            >
              <AlertTriangle className="mx-auto mb-6 h-16 w-16 text-white" />
              <h2 className="font-display text-3xl font-black uppercase tracking-tighter text-white">FOCUS REQUIRED</h2>
              <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-white">
                YOU STEPPED AWAY FROM THE TEST WINDOW.
              </p>
              <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] bg-white text-black py-2">
                ATTEMPT #{tabSwitchCount} — PLEASE FOCUS
              </p>
              <button
                onClick={() => setShowWarning(false)}
                className="mt-10 w-full border-4 border-white bg-white py-4 text-xs font-black uppercase tracking-[0.4em] text-black hover:bg-black hover:text-white transition-all"
              >
                CONTINUE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimal header */}
      <div className="flex items-center justify-between border-b-4 border-white px-8 py-4 bg-black">
        <div className={`font-display text-xl font-black uppercase tracking-widest ${timer.seconds < 300 ? "text-white animate-pulse" : "text-white"
          }`}>
          <Clock className="mr-3 inline h-5 w-5" />
          {timer.formatted}
        </div>
        <div className="flex items-center gap-6">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
            QUESTION {currentQ + 1} // {questions.length}
          </span>
          {tabSwitchCount > 0 && (
            <span className="flex items-center gap-2 border-2 border-white px-3 py-1 text-[8px] font-black uppercase tracking-widest text-white">
              <AlertTriangle className="h-3 w-3" /> {tabSwitchCount} SWITCHE{tabSwitchCount > 1 ? "S" : ""}
            </span>
          )}
          {question.section === "math" && (
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className={`flex items-center gap-2 border-2 px-3 py-1 text-[8px] font-black uppercase tracking-widest transition-all ${showCalculator ? 'bg-white text-black' : 'border-white text-white hover:bg-white/10'}`}
            >
              <Hash className="h-3 w-3" /> Calculator
            </button>
          )}
        </div>
        <button
          onClick={() => navigate("/practice")}
          className="border-2 border-white p-2 text-white hover:bg-white hover:text-black transition-all"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Question area */}
      <div className="flex flex-1 items-center justify-center px-6 bg-black">
        <div className="w-full max-w-3xl">
          <motion.div key={question.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
            <h2 className="font-display text-3xl font-black uppercase tracking-tighter leading-tight text-white">
              {question.question}
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {question.options.map((opt, idx) => {
                const isSelected = answers[question.id] === idx;
                const isCorrect = question.correctAnswer === idx;
                let style = "border-white bg-transparent text-white hover:bg-white hover:text-black";
                if (submitted) {
                  if (isCorrect) style = "border-white bg-white text-black";
                  else if (isSelected) style = "border-white bg-transparent text-white line-through";
                } else if (isSelected) {
                  style = "border-white bg-white text-black";
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={submitted}
                    className={`flex items-start gap-6 border-4 p-6 text-left transition-all ${style}`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-current text-sm font-black uppercase">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-lg font-black uppercase tracking-tight pt-1">{opt}</span>
                    {submitted && isCorrect && <CheckCircle className="ml-auto h-6 w-6" />}
                    {submitted && isSelected && !isCorrect && <XCircle className="ml-auto h-6 w-6" />}
                  </button>
                );
              })}
            </div>
            {submitted && (
              <div className="border-4 border-white bg-transparent p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">{question.explanation}</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer nav */}
      <div className="flex items-center justify-between border-t-4 border-white px-8 py-6 bg-black">
        <button
          onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
          disabled={currentQ === 0}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5" /> PREVIOUS
        </button>
        {!submitted ? (
          <button onClick={handleSubmit} className="border-4 border-white bg-white px-12 py-3 text-xs font-black uppercase tracking-[0.4em] text-black hover:bg-black hover:text-white transition-all">
            SUBMIT TEST
          </button>
        ) : (
          <div className="flex items-center gap-8">
            <span className="font-display text-4xl font-black uppercase tracking-tighter text-white">{score} // {questions.length}</span>
            <button onClick={() => navigate("/")} className="border-4 border-white px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-white hover:text-black transition-all">
              DASHBOARD
            </button>
          </div>
        )}
        <button
          onClick={() => setCurrentQ((q) => Math.min(questions.length - 1, q + 1))}
          disabled={currentQ === questions.length - 1}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white disabled:opacity-30"
        >
          NEXT <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
