import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Target, Calendar, BookOpen, ArrowRight, ChevronRight } from "lucide-react";
import { toast } from "sonner";

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
    <motion.div key="scores" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="text-center border-b-4 border-foreground pb-8">
        <Target className="mx-auto mb-6 h-12 w-12" />
        <h2 className="font-display text-4xl font-black tracking-tighter uppercase text-foreground">Your Goals</h2>
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em]">What is your current score and your target?</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em]">Current Score</label>
          <input
            type="number"
            min={400}
            max={1600}
            step={10}
            value={currentScore}
            onChange={(e) => setCurrentScore(Number(e.target.value))}
            className="w-full border-4 border-foreground bg-background px-4 py-4 text-foreground font-black uppercase focus:bg-foreground focus:text-background outline-none transition-colors"
          />
          <input
            type="range"
            min={400}
            max={1600}
            step={10}
            value={currentScore}
            onChange={(e) => setCurrentScore(Number(e.target.value))}
            className="mt-4 w-full accent-black"
          />
        </div>
        <div>
          <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em]">Target Score</label>
          <input
            type="number"
            min={400}
            max={1600}
            step={10}
            value={targetScore}
            onChange={(e) => setTargetScore(Number(e.target.value))}
            className="w-full border-4 border-foreground bg-background px-4 py-4 text-foreground font-black uppercase focus:bg-foreground focus:text-background outline-none transition-colors"
          />
          <input
            type="range"
            min={400}
            max={1600}
            step={10}
            value={targetScore}
            onChange={(e) => setTargetScore(Number(e.target.value))}
            className="mt-4 w-full accent-black"
          />
        </div>
      </div>
    </motion.div>,

    // Step 1: Exam date
    <motion.div key="date" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="text-center border-b-4 border-foreground pb-8">
        <Calendar className="mx-auto mb-6 h-12 w-12" />
        <h2 className="font-display text-4xl font-black tracking-tighter uppercase text-foreground">Exam Date</h2>
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em]">When are you taking the SAT?</p>
      </div>
      <input
        type="date"
        value={examDate}
        onChange={(e) => setExamDate(e.target.value)}
        className="w-full border-4 border-foreground bg-background px-4 py-4 text-foreground font-black uppercase focus:bg-foreground focus:text-background outline-none transition-colors"
      />
      <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-4">We'll help you prepare by this date.</p>
    </motion.div>,

    // Step 2: Subjects
    <motion.div key="subjects" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="text-center border-b-4 border-foreground pb-8">
        <BookOpen className="mx-auto mb-6 h-12 w-12" />
        <h2 className="font-display text-4xl font-black tracking-tighter uppercase text-foreground">Topics</h2>
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em]">Select what you want to study</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {SUBJECTS.map((s) => (
          <button
            key={s}
            onClick={() => toggleSubject(s)}
            className={`border-4 px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${selectedSubjects.includes(s)
              ? "border-foreground bg-foreground text-background"
              : "border-foreground bg-background text-foreground hover:bg-foreground hover:text-background"
              }`}
          >
            {s}
          </button>
        ))}
      </div>
    </motion.div>,
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-12 flex gap-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-4 flex-1 border-2 border-foreground transition-all ${i <= step ? "bg-foreground" : "bg-background"
                }`}
            />
          ))}
        </div>

        {steps[step]}

        <div className="mt-12 flex justify-between gap-6">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="border-4 border-foreground bg-background px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-foreground hover:bg-foreground hover:text-background transition-all"
            >
              BACK
            </button>
          ) : (
            <div />
          )}
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-3 border-4 border-foreground bg-foreground px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-background hover:bg-background hover:text-foreground transition-all"
            >
              NEXT <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="flex items-center gap-3 border-4 border-foreground bg-foreground px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-background hover:bg-background hover:text-foreground transition-all"
            >
              {loading ? "SAVING..." : "FINISH"} <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
