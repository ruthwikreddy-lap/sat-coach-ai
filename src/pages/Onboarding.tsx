import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Target, Calendar, BookOpen, ArrowRight, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const SUBJECTS = [
  "Linear Equations", "Quadratic Equations", "Data Interpretation", "Geometry",
  "Percentages", "Statistics", "Main Idea", "Inference", "Grammar",
  "Punctuation", "Reading Comprehension", "Vocabulary",
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
      navigate("/");
    }
  };

  const steps = [
    // Step 0: Scores
    <motion.div key="scores" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="text-center">
        <Target className="mx-auto mb-3 h-10 w-10 text-accent" />
        <h2 className="font-display text-2xl font-bold text-foreground">Your SAT Goals</h2>
        <p className="mt-1 text-sm text-muted-foreground">Tell us where you are and where you want to be</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Current Score (or estimate)</label>
          <input
            type="number"
            min={400}
            max={1600}
            step={10}
            value={currentScore}
            onChange={(e) => setCurrentScore(Number(e.target.value))}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <input
            type="range"
            min={400}
            max={1600}
            step={10}
            value={currentScore}
            onChange={(e) => setCurrentScore(Number(e.target.value))}
            className="mt-2 w-full accent-accent"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Target Score</label>
          <input
            type="number"
            min={400}
            max={1600}
            step={10}
            value={targetScore}
            onChange={(e) => setTargetScore(Number(e.target.value))}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <input
            type="range"
            min={400}
            max={1600}
            step={10}
            value={targetScore}
            onChange={(e) => setTargetScore(Number(e.target.value))}
            className="mt-2 w-full accent-accent"
          />
        </div>
      </div>
    </motion.div>,

    // Step 1: Exam date
    <motion.div key="date" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="text-center">
        <Calendar className="mx-auto mb-3 h-10 w-10 text-accent" />
        <h2 className="font-display text-2xl font-bold text-foreground">Exam Date</h2>
        <p className="mt-1 text-sm text-muted-foreground">When is your SAT exam? (optional)</p>
      </div>
      <input
        type="date"
        value={examDate}
        onChange={(e) => setExamDate(e.target.value)}
        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
      <p className="text-xs text-muted-foreground">This helps us create a timeline for your study plan</p>
    </motion.div>,

    // Step 2: Subjects
    <motion.div key="subjects" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="text-center">
        <BookOpen className="mx-auto mb-3 h-10 w-10 text-accent" />
        <h2 className="font-display text-2xl font-bold text-foreground">Focus Areas</h2>
        <p className="mt-1 text-sm text-muted-foreground">Select topics you want to focus on</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {SUBJECTS.map((s) => (
          <button
            key={s}
            onClick={() => toggleSubject(s)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
              selectedSubjects.includes(s)
                ? "border-accent bg-teal-light text-accent"
                : "border-border bg-card text-muted-foreground hover:border-accent/50"
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
        <div className="mb-8 flex gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i <= step ? "gradient-accent" : "bg-secondary"
              }`}
            />
          ))}
        </div>

        {steps[step]}

        <div className="mt-8 flex justify-between">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-secondary"
            >
              Back
            </button>
          ) : (
            <div />
          )}
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-2 rounded-xl gradient-accent px-6 py-3 text-sm font-semibold text-accent-foreground"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl gradient-accent px-6 py-3 text-sm font-semibold text-accent-foreground disabled:opacity-50"
            >
              {loading ? "Saving..." : "Get Started"} <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
