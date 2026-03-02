import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Save, User } from "lucide-react";
import { toast } from "sonner";

const SUBJECTS = [
  "Linear Equations", "Quadratic Equations", "Data Interpretation", "Geometry",
  "Percentages", "Statistics", "Main Idea", "Inference", "Grammar",
  "Punctuation", "Reading Comprehension", "Vocabulary",
];

export default function Profile() {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [currentScore, setCurrentScore] = useState(profile?.current_score || 1200);
  const [targetScore, setTargetScore] = useState(profile?.target_score || 1500);
  const [examDate, setExamDate] = useState(profile?.exam_date || "");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(profile?.preferred_subjects || []);
  const [loading, setLoading] = useState(false);

  // Sync state when profile loads
  if (profile && !displayName && profile.display_name) {
    setDisplayName(profile.display_name);
    setCurrentScore(profile.current_score);
    setTargetScore(profile.target_score);
    setExamDate(profile.exam_date || "");
    setSelectedSubjects(profile.preferred_subjects || []);
  }

  const toggleSubject = (s: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    const error = await updateProfile({
      display_name: displayName,
      current_score: currentScore,
      target_score: targetScore,
      exam_date: examDate || null,
      preferred_subjects: selectedSubjects,
    });
    setLoading(false);
    if (error) toast.error("Failed to save");
    else toast.success("Profile saved!");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-accent">
            <User className="h-6 w-6 text-accent-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Profile</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Current Score</label>
              <input
                type="number"
                min={400}
                max={1600}
                value={currentScore}
                onChange={(e) => setCurrentScore(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Target Score</label>
              <input
                type="number"
                min={400}
                max={1600}
                value={targetScore}
                onChange={(e) => setTargetScore(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Exam Date</label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Focus Areas</label>
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
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl gradient-accent py-3 text-sm font-semibold text-accent-foreground disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
