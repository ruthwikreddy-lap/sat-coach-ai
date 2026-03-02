import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TopicCard from "@/components/TopicCard";
import { TopicPerformance } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Brain, ShieldCheck, AlertTriangle, ArrowLeft, BarChart3, Target, Zap, Filter } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function WeakAreas() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [performances, setPerformances] = useState<TopicPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "weak" | "strong">("all");

  useEffect(() => {
    if (user) fetchPerformance();
  }, [user]);

  const fetchPerformance = async () => {
    const { data: responses } = await supabase
      .from("question_responses")
      .select("topic, section, is_correct")
      .eq("user_id", user?.id);

    if (responses) {
      const stats = responses.reduce<Record<string, { t: number; c: number; s: string }>>((acc, r) => {
        if (!acc[r.topic]) acc[r.topic] = { t: 0, c: 0, s: r.section };
        acc[r.topic].t++;
        if (r.is_correct) acc[r.topic].c++;
        return acc;
      }, {});

      const transformed: TopicPerformance[] = Object.entries(stats).map(([topic, stat]) => ({
        topic,
        section: stat.s,
        accuracy: Math.round((stat.c / stat.t) * 100),
        questionsAttempted: stat.t,
        trend: "stable",
      }));
      setPerformances(transformed);
    }
    setLoading(false);
  };

  const sorted = [...performances].sort((a, b) => a.accuracy - b.accuracy);
  const weak = sorted.filter((t) => t.accuracy < 70);
  const strong = sorted.filter((t) => t.accuracy >= 70);

  const displayedTopics = filter === "all" ? sorted : filter === "weak" ? weak : strong;

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-foreground/10 border-t-foreground" />
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-6xl px-6 py-12 md:py-20"
    >
      {/* Header Section */}
      <motion.div variants={item} className="mb-16">
        <button
          onClick={() => navigate("/")}
          className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Core Systems
        </button>

        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <h1 className="font-display text-5xl font-black tracking-tighter uppercase text-foreground md:text-6xl">
              Topic<br />Intelligence.
            </h1>
            <p className="max-w-md text-lg font-medium leading-relaxed text-muted-foreground">
              Deep-layer diagnostic of your cognitive performance across the SAT spectrum.
            </p>
          </div>

          <div className="flex gap-2 rounded-2xl bg-secondary/30 p-1.5 border border-border/5">
            {["all", "weak", "strong"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all ${filter === f ? "bg-foreground text-background shadow-lg" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats Summary */}
      <div className="mb-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Domains", value: performances.length, icon: Brain },
          { label: "Mastery Rate", value: `${Math.round((strong.length / (performances.length || 1)) * 100)}%`, icon: Target },
          { label: "Priority Targets", value: weak.length, icon: AlertTriangle },
          { label: "Audit Accuracy", value: `${Math.round(performances.reduce((a, b) => a + b.accuracy, 0) / (performances.length || 1))}%`, icon: Zap },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            variants={item}
            className="glass-card rounded-3xl p-8 shadow-card border-border/5"
          >
            <div className="mb-4 flex items-center justify-between">
              <s.icon className="h-5 w-5 opacity-30" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{s.label}</p>
            <p className="mt-1 font-display text-3xl font-black tracking-tighter uppercase">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Content Sections */}
      <div className="space-y-24">
        {displayedTopics.length > 0 ? (
          <motion.div variants={item} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayedTopics.map((t) => (
              <TopicCard key={t.topic} topic={t} onPractice={() => navigate("/practice")} />
            ))}
          </motion.div>
        ) : (
          <motion.div variants={item} className="glass-card flex flex-col items-center justify-center rounded-[3rem] py-32 text-center border-dashed border-2">
            <Filter className="mb-6 h-12 w-12 opacity-10" />
            <h2 className="font-display text-2xl font-black uppercase tracking-tighter">No Segments Found</h2>
            <p className="mt-2 max-w-sm font-medium text-muted-foreground">Adjust your filters or complete more simulations to see data.</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}


