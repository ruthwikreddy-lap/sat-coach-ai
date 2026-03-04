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
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-foreground opacity-20" />
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
      className="mx-auto max-w-6xl px-6 py-12 md:py-16"
      style={{ background: "inherit", color: "inherit" }}
    >
      {/* Header */}
      <motion.div variants={item} className="mb-16">
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-foreground transition-colors border-4 border-foreground px-4 py-2 hover:bg-foreground hover:text-background"
          >
            <ArrowLeft className="h-4 w-4" /> DASHBOARD
          </button>

          {results.length > 0 && (
            <button
              onClick={() => toPDF()}
              className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] bg-foreground text-background transition-colors border-4 border-foreground px-4 py-2 hover:bg-background hover:text-foreground"
            >
              EXPORT PDF <Download className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-8">
          <div className="flex h-20 w-20 items-center justify-center border-8 border-foreground bg-foreground text-background">
            <Activity className="h-10 w-10" />
          </div>
          <div>
            <h1 className="font-display text-7xl font-black tracking-tighter uppercase text-foreground leading-[0.8]">ANALYTICS</h1>
            <p className="font-black uppercase tracking-[0.4em] text-[10px] mt-4 opacity-50">Your Detailed Progress Report</p>
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
            className="border-4 border-foreground p-8 bg-background relative overflow-hidden"
          >
            <div className="mb-6 flex items-center justify-between border-b-2 border-foreground pb-4">
              <s.icon className="h-5 w-5" />
              {i === 0 && improvement > 0 && <span className="bg-foreground text-background px-2 py-0.5 text-[8px] font-black uppercase tracking-widest">Improving</span>}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest">{s.label}</p>
            <p className="mt-1 font-display text-4xl font-black tracking-tighter uppercase">{s.value}</p>
            <p className="mt-2 text-[10px] font-black uppercase tracking-widest bg-foreground text-background inline-block px-1">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {results.length > 0 ? (
        <div className="space-y-12">
          {/* Main Chart Section */}
          <motion.div
            variants={item}
            className="border-4 border-foreground p-10 bg-background"
          >
            <div className="mb-12 flex items-center justify-between border-b-8 border-foreground pb-8">
              <div>
                <h3 className="font-display text-4xl font-black uppercase tracking-tighter">My Scores</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-3 opacity-50">Total score over time</p>
              </div>
              <BarChart3 className="h-10 w-10" />
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoreData}>
                  <defs>
                    <pattern id="diagonal-stripe" patternUnits="userSpaceOnUse" width="10" height="10">
                      <line x1="0" y1="10" x2="10" y2="0" stroke="black" strokeWidth="2" />
                    </pattern>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: "black" }} dy={15} />
                  <YAxis domain={[0, 1600]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: "black" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "black", color: "white", border: "none", padding: '16px', fontWeight: 'bold' }}
                    itemStyle={{ color: "white" }}
                  />
                  <Area
                    type="step"
                    dataKey="total"
                    stroke="black"
                    strokeWidth={8}
                    fill="url(#diagonal-stripe)"
                    fillOpacity={0.1}
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
              className="border-8 border-foreground p-12 bg-background"
            >
              <h3 className="mb-12 font-display text-3xl font-black uppercase tracking-tighter border-b-8 border-foreground pb-6">Breakdown</h3>
              <div className="space-y-12">
                {[
                  { label: "Reading & Writing", score: latest.reading_score, total: 800 },
                  { label: "Mathematics", score: latest.math_score, total: 800 }
                ].map((comp) => (
                  <div key={comp.label}>
                    <div className="mb-3 flex items-end justify-between uppercase">
                      <div>
                        <p className="text-[10px] font-black tracking-widest">{comp.label}</p>
                        <p className="text-3xl font-black tracking-tighter mt-1">{comp.score}</p>
                      </div>
                      <p className="text-[10px] font-black tracking-widest">Proficiency: {Math.round((comp.score / comp.total) * 100)}%</p>
                    </div>
                    <div className="h-4 w-full border-4 border-foreground bg-background">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(comp.score / comp.total) * 100}%` }}
                        className="h-full bg-foreground"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Domain Accuracy */}
            <motion.div
              variants={item}
              className="border-8 border-foreground p-12 bg-background"
            >
              <div className="mb-12 flex items-center justify-between border-b-8 border-foreground pb-6">
                <h3 className="font-display text-3xl font-black uppercase tracking-tighter">Topics</h3>
                <ShieldCheck className="h-10 w-10 text-foreground" />
              </div>
              <div className="h-[250px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topicData.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="0" stroke="black" />
                    <XAxis hide dataKey="name" />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip contentStyle={{ border: 'none', backgroundColor: 'black', color: 'white', fontWeight: 'bold' }} />
                    <Bar dataKey="accuracy" barSize={40}>
                      {topicData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="black" stroke="black" strokeWidth={2} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {topicData.slice(0, 4).map((t, i) => (
                  <span key={t.name} className={`border-2 border-foreground px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] ${i === 0 ? 'bg-foreground text-background' : 'bg-background text-foreground'}`}>
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
          className="border-8 border-dashed border-foreground flex flex-col items-center justify-center p-32 text-center"
        >
          <BookOpen className="mb-10 h-24 w-24 opacity-20" />
          <h2 className="font-display text-5xl font-black uppercase tracking-tighter">No Data Yet</h2>
          <p className="mt-4 max-w-sm font-black uppercase tracking-[0.2em] text-[10px] opacity-40">Complete a test to unlock analytics.</p>
          <button onClick={() => navigate("/practice")} className="mt-12 border-8 border-foreground bg-foreground px-16 py-6 text-base font-black uppercase tracking-widest text-background hover:bg-background hover:text-foreground transition-all">TAKE A TEST</button>
        </motion.div>
      )}
    </motion.div>
  );
}

