import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Calendar,
  CheckCircle2,
  Circle,
  BookOpen,
  Brain,
  Clock,
  Sparkles,
  Loader2,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ease = [0.22, 1, 0.36, 1] as const;

interface PlanTask {
  id: string;
  topic: string;
  task_type: string;
  duration: number;
  day_of_week: number;
  completed: boolean;
  plan_date: string | null;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function StudyPlan() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [tasks, setTasks] = useState<PlanTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("study_plan_tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("day_of_week")
      .order("created_at");
    if (data) setTasks(data as PlanTask[]);
    setLoading(false);
  };

  const generatePlan = async () => {
    if (!user) return;
    setGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-study-plan", {
        body: {
          current_score: profile?.current_score,
          target_score: profile?.target_score,
          exam_date: profile?.exam_date,
          weak_topics: profile?.weaknesses,
          preferred_subjects: profile?.preferred_subjects,
        },
      });

      if (error) throw error;

      await supabase.from("study_plan_tasks").delete().eq("user_id", user.id);

      const newTasks = (data.tasks || []).map((t: any) => ({
        user_id: user.id,
        topic: t.topic,
        task_type: t.task_type || "practice",
        duration: t.duration || 30,
        day_of_week: t.day_of_week ?? 0,
      }));

      if (newTasks.length > 0) {
        await supabase.from("study_plan_tasks").insert(newTasks);
      }

      await fetchTasks();
      toast.success("Study plan updated.");
    } catch (e: any) {
      console.error(e);
      toast.error("Process interrupted. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !completed } : t))
    );
    await supabase
      .from("study_plan_tasks")
      .update({
        completed: !completed,
        completed_at: !completed ? new Date().toISOString() : null,
      })
      .eq("id", taskId);
  };

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;

  const groupedByDay = DAYS.map((day, i) => ({
    day,
    tasks: tasks.filter((t) => t.day_of_week === i),
  })).filter((g) => g.tasks.length > 0);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-white/20" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 md:py-16 bg-black particle-bg min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease }}
        className="mb-12 flex flex-col gap-8 md:flex-row md:items-center md:justify-between"
      >
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/")}
            className="glass-button flex w-fit items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-white rounded-xl"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> DASHBOARD
          </button>
          <div className="flex items-center gap-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-white"
            >
              <Calendar className="h-7 w-7" />
            </motion.div>
            <div>
              <h1 className="font-display text-4xl font-black tracking-tighter uppercase gradient-text">Study Schedule</h1>
              <p className="font-black uppercase tracking-[0.2em] text-[10px] text-white/40">Your Personalized SAT Roadmap</p>
            </div>
          </div>
        </div>

        <button
          onClick={generatePlan}
          disabled={generating}
          className="bg-white text-black px-10 py-5 text-sm font-black uppercase tracking-widest rounded-xl hover:bg-white/90 glow-soft flex items-center justify-center gap-3"
        >
          {generating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
          <span>{generating ? "Updating..." : "Update Daily Plan"}</span>
        </button>
      </motion.div>

      {/* Overview Cards */}
      <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          { label: "Goal Score", value: profile?.target_score || "1500", icon: Target },
          { label: "Tasks Done", value: `${completedTasks}/${totalTasks}`, icon: Zap },
          { label: "Goal Practice", value: "3.5h / Week", icon: Brain },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1, duration: 0.5, ease }}
            className="glass-card-depth rounded-2xl p-8 border-glow"
          >
            <div className="mb-4 flex items-center gap-3 border-b border-white/10 pb-4">
              <stat.icon className="h-5 w-5 text-white/40" />
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{stat.label}</p>
            </div>
            <p className="font-display text-4xl font-black tracking-tighter uppercase text-white">{stat.value}</p>
            {stat.label === "Tasks Done" && totalTasks > 0 && (
              <div className="mt-6 h-3 w-full border border-white/10 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                  transition={{ duration: 1, ease }}
                  className="h-full bg-white rounded-full"
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Schedule */}
      <div className="space-y-12">
        {tasks.length === 0 ? (
          <div className="glass-card-depth rounded-3xl border-dashed border border-white/20 flex flex-col items-center justify-center p-24 text-center">
            <Sparkles className="mb-6 h-12 w-12 text-white/10" />
            <h2 className="font-display text-2xl font-black uppercase tracking-tighter text-white">No Active Plan</h2>
            <p className="mt-2 max-w-sm font-black uppercase tracking-widest text-xs text-white/40">Generate your personalized schedule to get started.</p>
            <button onClick={generatePlan} className="mt-8 bg-white text-black px-12 py-4 text-sm font-black uppercase tracking-widest rounded-xl hover:bg-white/90 glow-soft">Generate My Plan</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12">
            {groupedByDay.map(({ day, tasks: dayTasks }, dayIdx) => (
              <motion.section
                key={day}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: dayIdx * 0.1, duration: 0.5, ease }}
                className="relative"
              >
                <div className="mb-8 flex items-baseline gap-6 border-b border-white/10 pb-4">
                  <h3 className="font-display text-2xl font-black uppercase tracking-[0.2em] text-white">{day}</h3>
                  <div className="h-px flex-1 bg-white/10" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                    {dayTasks.filter((t) => t.completed).length}/{dayTasks.length} DONE
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {dayTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => toggleTask(task.id, task.completed)}
                      className={`group relative flex flex-col items-start gap-4 border p-8 text-left transition-all rounded-xl ${task.completed
                        ? "border-white/20 bg-white/10 text-white"
                        : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                        }`}
                    >
                      <div className="flex w-full items-center justify-between border-b border-white/10 pb-4">
                        <div className={`flex h-10 w-10 items-center justify-center border border-white/20 rounded-lg`}>
                          {task.completed ? <CheckCircle2 className="h-5 w-5 text-white" /> : <ShieldCheck className="h-5 w-5 text-white/60" />}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-white/40" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{task.duration}M</span>
                        </div>
                      </div>

                      <div className="mt-4 flex-1">
                        <p className={`text-xl font-black uppercase tracking-tight leading-tight text-white ${task.completed ? "line-through opacity-60" : ""}`}>
                          {task.topic}
                        </p>
                        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] bg-white/10 text-white px-2 py-0.5 rounded">{task.task_type}</p>
                      </div>

                      <div className="mt-8 flex w-full items-center justify-between border-t border-white/10 pt-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">TOGGLE STATUS</span>
                        <ChevronRight className="h-4 w-4 text-white/40" />
                      </div>
                    </button>
                  ))}
                </div>
              </motion.section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

