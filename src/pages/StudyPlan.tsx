import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, Calendar, CheckCircle2, Circle, BookOpen, Brain, Clock, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

      // Clear old tasks
      await supabase.from("study_plan_tasks").delete().eq("user_id", user.id);

      // Insert new tasks
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
      toast.success("Study plan generated!");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to generate plan");
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
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">AI Study Plan</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Personalized weekly plan based on your score and weaknesses
            </p>
          </div>
          <button
            onClick={generatePlan}
            disabled={generating}
            className="flex items-center gap-2 rounded-xl gradient-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-transform hover:scale-105 disabled:opacity-50"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? "Generating..." : "Generate Plan"}
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <p className="text-xs font-medium text-muted-foreground">Current Score</p>
          <p className="font-display text-3xl font-bold text-foreground">{profile?.current_score || "—"}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <p className="text-xs font-medium text-muted-foreground">Target Score</p>
          <p className="font-display text-3xl font-bold text-accent">{profile?.target_score || "—"}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <p className="text-xs font-medium text-muted-foreground">Weekly Progress</p>
          <p className="font-display text-3xl font-bold text-foreground">{completedTasks}/{totalTasks}</p>
          {totalTasks > 0 && (
            <div className="mt-2 h-1.5 w-full rounded-full bg-secondary">
              <div className="h-full rounded-full gradient-accent transition-all" style={{ width: `${(completedTasks / totalTasks) * 100}%` }} />
            </div>
          )}
        </div>
      </motion.div>

      {/* Tasks */}
      {tasks.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 rounded-xl border border-border bg-card p-8 text-center shadow-card">
          <Sparkles className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <h2 className="font-display text-xl font-bold text-foreground">No study plan yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Click "Generate Plan" to create an AI-powered study schedule</p>
        </motion.div>
      ) : (
        <div className="mt-8 space-y-4">
          {groupedByDay.map(({ day, tasks: dayTasks }, dayIdx) => (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + dayIdx * 0.05 }}
              className="rounded-xl border border-border bg-card p-5 shadow-card"
            >
              <div className="mb-3 flex items-center gap-3">
                <Calendar className="h-4 w-4 text-accent" />
                <h3 className="font-display font-bold text-foreground">{day}</h3>
                <span className="ml-auto text-xs text-muted-foreground">
                  {dayTasks.filter((t) => t.completed).length}/{dayTasks.length} done
                </span>
              </div>
              <div className="space-y-2">
                {dayTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => toggleTask(task.id, task.completed)}
                    className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                      task.completed ? "border-success/30 bg-success-light" : "border-border bg-background hover:border-accent/30"
                    }`}
                  >
                    {task.completed ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {task.topic}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                        task.task_type === "test" ? "bg-amber-light text-amber-foreground" :
                        task.task_type === "practice" ? "bg-teal-light text-accent" :
                        "bg-secondary text-muted-foreground"
                      }`}>
                        {task.task_type}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> {task.duration}m
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
