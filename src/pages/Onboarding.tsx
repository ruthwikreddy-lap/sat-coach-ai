import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Target, Calendar, BookOpen, ArrowRight, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const ease = [0.22, 1, 0.36, 1] as const;

const SUBJECTS = [
  "Information & Ideas", "Craft & Structure", "Expression of Ideas", "Standard English Conventions",
  "Algebra", "Advanced Math", "Problem-Solving & Data Analysis", "Geometry & Trigonometry",
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [currentScore, setCurrentScore] = useState(1200);
  const [targetScore, setTargetScore] = useState(1500);
  const [examDate, setExamDate] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleSubject = (s: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("user_profiles")
      .update({
        current_score: currentScore,
        target_score: targetScore,
        exam_date: examDate || null,
        preferred_subjects: selectedSubjects,
        onboarding_completed: true,
      })
      .eq("user_id", user.id);

    setLoading(false);
    if (error) {
      toast.error("Failed to save profile");
    } else {
      toast.success("Profile set up! Let's get started.");
      navigate("/dashboard");
    }
  };

  const steps = [
    // Step 0: Scores
    <motion.div key="scores" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease }} className="space-y-6">
      <div className="text-center border-b border-white/10 pb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
          className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 border border-white/20 text-white"
        >
          <Target className="h-6 w-6" />
        </motion.div>
        <h2 className="font-display text-4xl font-black tracking-tighter uppercase gradient-text">Your Goals</h2>
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">What is your current score and your target?</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Current Score</label>
          <input
            type="number"
            min={400}
            max={1600}
            step={10}
            value={currentScore}
            onChange={(e) => setCurrentScore(Number(e.target.value))}
            className="w-full border border-white/10 bg-white/5 px-4 py-4 text-white font-black uppercase focus:bg-white/10 focus:border-white/20 outline-none transition-all rounded-xl"
          />
          <input
            type="range"
            min={400}
            max={1600}
            step={10}
            value={currentScore}
            onChange={(e) => setCurrentScore(Number(e.target.value))}
            className="mt-4 w-full accent-white"
          />
        </div>
        <div>
          <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Target Score</label>
          <input
            type="number"
            min={400}
            max={1600}
            step={10}
            value={targetScore}
            onChange={(e) => setTargetScore(Number(e.target.value))}
            className="w-full border border-white/10 bg-white/5 px-4 py-4 text-white font-black uppercase focus:bg-white/10 focus:border-white/20 outline-none transition-all rounded-xl"
          />
          <input
            type="range"
            min={400}
            max={1600}
            step={10}
            value={targetScore}
            onChange={(e) => setTargetScore(Number(e.target.value))}
            className="mt-4 w-full accent-white"
          />
        </div>
      </div>
    </motion.div>,

    // Step 1: Exam date
    <motion.div key="date" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease }} className="space-y-6">
      <div className="text-center border-b border-white/10 pb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
          className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 border border-white/20 text-white"
        >
          <Calendar className="h-6 w-6" />
        </motion.div>
        <h2 className="font-display text-4xl font-black tracking-tighter uppercase gradient-text">Exam Date</h2>
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">When are you taking the SAT?</p>
      </div>
      <input
        type="date"
        value={examDate}
        onChange={(e) => setExamDate(e.target.value)}
        className="w-full border border-white/10 bg-white/5 px-4 py-4 text-white font-black uppercase focus:bg-white/10 focus:border-white/20 outline-none transition-all rounded-xl"
      />
      <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-4 text-white/40">We'll help you prepare by this date.</p>
    </motion.div>,

    // Step 2: Subjects
    <motion.div key="subjects" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease }} className="space-y-6">
      <div className="text-center border-b border-white/10 pb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
          className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 border border-white/20 text-white"
        >
          <BookOpen className="h-6 w-6" />
        </motion.div>
        <h2 className="font-display text-4xl font-black tracking-tighter uppercase gradient-text">Topics</h2>
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Select what you want to study</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {SUBJECTS.map((s) => (
          <button
            key={s}
            onClick={() => toggleSubject(s)}
            className={`border px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${selectedSubjects.includes(s)
              ? "border-white/20 bg-white/10 text-white"
              : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
          >
            {s}
          </button>
        ))}
      </div>
    </motion.div>,
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 bg-black particle-bg">
      <div className="w-full max-w-lg">
        <div className="glass-card-depth rounded-3xl p-8 md:p-12 border-glow">
          {/* Progress */}
          <div className="mb-12 flex gap-4">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-all ${i <= step ? "bg-white" : "bg-white/10"
                  }`}
              />
            ))}
          </div>

          {steps[step]}

          <div className="mt-12 flex justify-between gap-6">
            {step > 0 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="glass-button px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white rounded-xl"
              >
                BACK
              </button>
            ) : (
              <div />
            )}
            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="bg-white text-black flex items-center gap-3 px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] rounded-xl hover:bg-white/90 glow-soft"
              >
                NEXT <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="bg-white text-black flex items-center gap-3 px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] rounded-xl hover:bg-white/90 glow-soft"
              >
                {loading ? "SAVING..." : "FINISH"} <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
