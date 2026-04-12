import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Save, User } from "lucide-react";
import { toast } from "sonner";

const ease = [0.22, 1, 0.36, 1] as const;

const SUBJECTS = [
  "Information & Ideas", "Craft & Structure", "Expression of Ideas", "Standard English Conventions",
  "Algebra", "Advanced Math", "Problem-Solving & Data Analysis", "Geometry & Trigonometry",
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
    <div className="mx-auto max-w-2xl px-4 py-8 bg-black min-h-screen">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }}>
        <div className="glass-card-depth rounded-3xl p-8 md:p-12">
          <div className="mb-12 flex items-center gap-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-white"
            >
              <User className="h-8 w-8" />
            </motion.div>
            <div>
              <h1 className="font-display text-4xl font-black tracking-tighter uppercase gradient-text">My Profile</h1>
              <p className="font-black uppercase tracking-[0.2em] text-[10px] text-white/40">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full border border-white/10 bg-white/5 px-4 py-4 text-white font-black uppercase focus:bg-white/10 focus:border-white/20 outline-none transition-all rounded-xl"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="grid grid-cols-2 gap-8"
            >
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Current Score</label>
                <input
                  type="number"
                  min={400}
                  max={1600}
                  value={currentScore}
                  onChange={(e) => setCurrentScore(Number(e.target.value))}
                  className="w-full border border-white/10 bg-white/5 px-4 py-4 text-white font-black uppercase focus:bg-white/10 focus:border-white/20 outline-none transition-all rounded-xl"
                />
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Target Score</label>
                <input
                  type="number"
                  min={400}
                  max={1600}
                  value={targetScore}
                  onChange={(e) => setTargetScore(Number(e.target.value))}
                  className="w-full border border-white/10 bg-white/5 px-4 py-4 text-white font-black uppercase focus:bg-white/10 focus:border-white/20 outline-none transition-all rounded-xl"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Exam Date</label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full border border-white/10 bg-white/5 px-4 py-4 text-white font-black uppercase focus:bg-white/10 focus:border-white/20 outline-none transition-all rounded-xl"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
            >
              <label className="mb-4 block text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Topics to Focus On</label>
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
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              onClick={handleSave}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 bg-white text-black py-6 text-sm font-black uppercase tracking-[0.3em] hover:bg-white/90 hover:scale-105 active:scale-95 transition-all rounded-xl shadow-lg shadow-white/10 glow-soft mt-12"
            >
              <Save className="h-5 w-5" />
              {loading ? "Saving..." : "Save Changes"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
