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
        <div className="mb-12 flex items-center gap-6 border-b-4 border-foreground pb-8">
          <div className="flex h-16 w-16 items-center justify-center border-4 border-foreground bg-foreground text-background">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="font-display text-4xl font-black tracking-tighter uppercase text-foreground">Profile Matrix</h1>
            <p className="font-black uppercase tracking-[0.2em] text-[10px]">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em]">Display Identity</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full border-4 border-foreground bg-background px-4 py-4 text-foreground font-black uppercase focus:bg-foreground focus:text-background outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em]">Baseline Score</label>
              <input
                type="number"
                min={400}
                max={1600}
                value={currentScore}
                onChange={(e) => setCurrentScore(Number(e.target.value))}
                className="w-full border-4 border-foreground bg-background px-4 py-4 text-foreground font-black uppercase focus:bg-foreground focus:text-background outline-none transition-colors"
              />
            </div>
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em]">Target Vector</label>
              <input
                type="number"
                min={400}
                max={1600}
                value={targetScore}
                onChange={(e) => setTargetScore(Number(e.target.value))}
                className="w-full border-4 border-foreground bg-background px-4 py-4 text-foreground font-black uppercase focus:bg-foreground focus:text-background outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em]">Engagement Deadline</label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full border-4 border-foreground bg-background px-4 py-4 text-foreground font-black uppercase focus:bg-foreground focus:text-background outline-none transition-colors"
            />
          </div>

          <div>
            <label className="mb-4 block text-[10px] font-black uppercase tracking-[0.2em]">Prioritized Neural Domains</label>
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
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 border-4 border-foreground bg-foreground py-6 text-sm font-black uppercase tracking-[0.3em] text-background hover:bg-background hover:text-foreground transition-all mt-12"
          >
            <Save className="h-5 w-5" />
            {loading ? "Syncing..." : "Update Identity Matrix"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
