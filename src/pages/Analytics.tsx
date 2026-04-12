import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TopicPerformance } from "@/data/mockData";
import {
  Loader2,
  TrendingUp,
  Award,
  Target,
  BookOpen,
  ArrowLeft,
  Zap,
  Activity,
  BarChart3,
  ShieldCheck,
  Download
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePDF } from 'react-to-pdf';

const ease = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Analytics() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [performances, setPerformances] = useState<TopicPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const { toPDF, targetRef } = usePDF({ filename: 'sat_progress_report.pdf' });

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: testData } = await supabase
        .from("test_results")
        .select("*")
        .eq("user_id", user.id)
        .order("test_date", { ascending: true });
      if (testData) setResults(testData);

      const { data: responses } = await supabase
        .from("question_responses")
        .select("topic, section, is_correct")
        .eq("user_id", user.id);

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
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-white/20" />
      </div>
    );
  }

  const scoreData = results.map((r) => ({
    date: new Date(r.test_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    total: r.score,
    reading: r.reading_score,
    math: r.math_score,
  }));

  const topicData = performances.map((t) => ({
    name: t.topic,
    accuracy: t.accuracy,
  })).sort((a, b) => b.accuracy - a.accuracy);

  const latest = results[results.length - 1] || { score: 0 };
  const prev = results[results.length - 2];
  const improvement = prev ? latest.score - prev.score : 0;
  const bestScore = results.length > 0 ? Math.max(...results.map(r => r.score)) : 0;
  const avgAccuracy = performances.length > 0
    ? Math.round(performances.reduce((a, t) => a + t.accuracy, 0) / performances.length)
    : 0;
  const totalQuestions = performances.reduce((a, t) => a + t.questionsAttempted, 0);

  return (
    <motion.div
      ref={targetRef}
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-6xl px-6 py-12 md:py-16 bg-black particle-bg min-h-screen"
      style={{ background: "inherit", color: "inherit" }}
    >
      {/* Header */}
      <motion.div variants={item} className="mb-16">
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="glass-button flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white px-4 py-2 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4" /> DASHBOARD
          </button>

          {results.length > 0 && (
            <button
              onClick={() => toPDF()}
              className="bg-white text-black flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-xl hover:bg-white/90 glow-soft"
            >
              EXPORT PDF <Download className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-white"
          >
            <Activity className="h-10 w-10" />
          </motion.div>
          <div>
            <h1 className="font-display text-7xl font-black tracking-tighter uppercase gradient-text leading-[0.8]">ANALYTICS</h1>
            <p className="font-black uppercase tracking-[0.4em] text-[10px] mt-4 text-white/40">Your Detailed Progress Report</p>
          </div>
        </div>
      </motion.div>

      {/* Hero Stats */}
      <div className="mb-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Latest Score", value: latest.score || "—", sub: prev ? `${improvement >= 0 ? "+" : ""}${improvement} Points` : "First Test", icon: TrendingUp },
          { label: "Best Score", value: bestScore || "—", sub: "Personal Best", icon: Award },
          { label: "Accuracy", value: `${avgAccuracy}%`, sub: `${performances.length} Topics`, icon: Target },
          { label: "Questions", value: totalQuestions, sub: "Total Solved", icon: Zap },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            variants={item}
            className="glass-card-depth rounded-2xl p-8 border-glow relative overflow-hidden"
          >
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
              <s.icon className="h-5 w-5 text-white" />
              {i === 0 && improvement > 0 && <span className="bg-white/10 text-white px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-lg border border-white/20">Improving</span>}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{s.label}</p>
            <p className="mt-1 font-display text-4xl font-black tracking-tighter uppercase text-white">{s.value}</p>
            <p className="mt-2 text-[10px] font-black uppercase tracking-widest bg-white/10 text-white inline-block px-2 rounded-lg">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {results.length > 0 ? (
        <div className="space-y-12">
          {/* Main Chart Section */}
          <motion.div
            variants={item}
            className="glass-card-depth rounded-3xl p-10 border-glow"
          >
            <div className="mb-12 flex items-center justify-between border-b border-white/10 pb-8">
              <div>
                <h3 className="font-display text-4xl font-black uppercase tracking-tighter gradient-text">My Scores</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-3 text-white/40">Total score over time</p>
              </div>
              <BarChart3 className="h-10 w-10 text-white" />
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoreData}>
                  <defs>
                    <pattern id="diagonal-stripe" patternUnits="userSpaceOnUse" width="10" height="10">
                      <line x1="0" y1="10" x2="10" y2="0" stroke="white" strokeWidth="2" />
                    </pattern>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: "white" }} dy={15} />
                  <YAxis domain={[0, 1600]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: "white" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(0,0,0,0.9)", color: "white", border: "1px solid rgba(255,255,255,0.2)", padding: '16px', fontWeight: 'bold' }}
                    itemStyle={{ color: "white" }}
                  />
                  <Area
                    type="step"
                    dataKey="total"
                    stroke="white"
                    strokeWidth={4}
                    fill="url(#diagonal-stripe)"
                    fillOpacity={0.2}
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Component Segments */}
            <motion.div
              variants={item}
              className="glass-card-depth rounded-3xl p-12 border-glow"
            >
              <h3 className="mb-12 font-display text-3xl font-black uppercase tracking-tighter border-b border-white/10 pb-6 gradient-text">Breakdown</h3>
              <div className="space-y-12">
                {[
                  { label: "Reading & Writing", score: latest.reading_score, total: 800 },
                  { label: "Mathematics", score: latest.math_score, total: 800 }
                ].map((comp) => (
                  <div key={comp.label}>
                    <div className="mb-3 flex items-end justify-between uppercase">
                      <div>
                        <p className="text-[10px] font-black tracking-widest text-white/40">{comp.label}</p>
                        <p className="text-3xl font-black tracking-tighter mt-1 text-white">{comp.score}</p>
                      </div>
                      <p className="text-[10px] font-black tracking-widest text-white">Proficiency: {Math.round((comp.score / comp.total) * 100)}%</p>
                    </div>
                    <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(comp.score / comp.total) * 100}%` }}
                        className="h-full bg-white rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Domain Accuracy */}
            <motion.div
              variants={item}
              className="glass-card-depth rounded-3xl p-12 border-glow"
            >
              <div className="mb-12 flex items-center justify-between border-b border-white/10 pb-6">
                <h3 className="font-display text-3xl font-black uppercase tracking-tighter gradient-text">Topics</h3>
                <ShieldCheck className="h-10 w-10 text-white" />
              </div>
              <div className="h-[250px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topicData.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.1)" />
                    <XAxis hide dataKey="name" />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip contentStyle={{ border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(0,0,0,0.9)', color: 'white', fontWeight: 'bold' }} />
                    <Bar dataKey="accuracy" barSize={40}>
                      {topicData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="white" stroke="white" strokeWidth={2} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {topicData.slice(0, 4).map((t, i) => (
                  <span key={t.name} className={`border px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] rounded-lg ${i === 0 ? 'bg-white/20 text-white border-white/30' : 'bg-white/5 text-white/60 border-white/10'}`}>
                    {t.name}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      ) : (
        <motion.div
          variants={item}
          className="glass-card-depth rounded-3xl border-dashed border border-white/20 flex flex-col items-center justify-center p-32 text-center"
        >
          <BookOpen className="mb-10 h-24 w-24 text-white/20" />
          <h2 className="font-display text-5xl font-black uppercase tracking-tighter text-white">No Data Yet</h2>
          <p className="mt-4 max-w-sm font-black uppercase tracking-[0.2em] text-[10px] text-white/40">Complete a test to unlock analytics.</p>
          <button onClick={() => navigate("/practice")} className="mt-12 bg-white text-black px-16 py-6 text-base font-black uppercase tracking-widest rounded-xl hover:bg-white/90 glow-soft">TAKE A TEST</button>
        </motion.div>
      )}
    </motion.div>
  );
}

