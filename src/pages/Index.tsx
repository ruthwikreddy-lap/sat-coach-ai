import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Trophy, Target, BookOpen, Clock, Brain, ArrowRight, Flame, BarChart3, TrendingUp, AlertCircle, Sparkles } from "lucide-react";
import StatCard from "@/components/StatCard";
import ScoreRing from "@/components/ScoreRing";
import TopicCard from "@/components/TopicCard";
import { TopicPerformance } from "@/data/mockData";
import { ResponsiveContainer, CartesianGrid, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";

interface TestResultRow {
  score: number;
  reading_score: number;
  math_score: number;
  test_date: string;
  weak_topics: string[] | null;
  time_spent: number | null;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [testResults, setTestResults] = useState<TestResultRow[]>([]);
  const [performances, setPerformances] = useState<TopicPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.onboarding_completed && profile && !profileLoading) {
      navigate("/onboarding");
    }
  }, [profile, profileLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: results } = await supabase
        .from("test_results")
        .select("score, reading_score, math_score, test_date, weak_topics, time_spent")
        .eq("user_id", user.id)
        .order("test_date", { ascending: true })
        .limit(20);
      if (results) setTestResults(results);

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

  const hasResults = testResults.length > 0;
  const latestResult = hasResults ? testResults[testResults.length - 1] : null;
  const currentScore = latestResult?.score ?? profile?.current_score ?? 0;
  const targetScore = profile?.target_score ?? 1500;

  const chartData = hasResults
    ? testResults.map((r) => ({ date: r.test_date.slice(5, 10), score: r.score }))
    : [];

  const weakTopics = performances.filter((t) => t.accuracy < 70).sort((a, b) => a.accuracy - b.accuracy);
  const streak = 4; // Mock

  if (profileLoading || loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  const getLevel = (score: number) => {
    if (score < 800) return "NOOB";
    if (score < 1000) return "ROOKIE";
    if (score < 1200) return "PRODIGY";
    if (score < 1400) return "ADVANCED";
    if (score < 1550) return "ELITE";
    return "MASTER";
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="mx-auto max-w-6xl space-y-12 px-6 py-16">
      {/* Premium Compact Hero */}
      <motion.div variants={item} className="grid lg:grid-cols-2 gap-8 items-stretch">
        <div className="bg-foreground text-background p-12 flex flex-col justify-between border-8 border-foreground">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-background text-foreground px-4 py-1 text-xs font-black uppercase tracking-widest">Active Streak</div>
              <div className="flex items-center gap-2 group">
                <Flame className="h-6 w-6 text-background group-hover:scale-110 transition-transform" fill="white" />
                <span className="text-3xl font-black">{streak} DAYS</span>
              </div>
            </div>
            <h1 className="font-display text-7xl font-black uppercase tracking-tighter leading-[0.85]">
              MASTER<br />THE DIGITAL SAT
            </h1>
          </div>

          <div className="mt-12 flex flex-wrap gap-4">
            <Link to="/practice" className="bg-background text-foreground hover:invert px-8 py-5 text-sm font-black uppercase tracking-widest transition-all flex items-center gap-3">
              START FULL EXAM <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="border-8 border-foreground p-10 flex flex-col items-center justify-center bg-background relative overflow-hidden group">
          <Sparkles className="absolute top-10 right-10 h-10 w-10 opacity-10 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-8 md:gap-16">
            <div className="text-center">
              <ScoreRing score={latestResult?.reading_score ?? 0} maxScore={800} label="R&W" size={140} />
            </div>
            <div className="h-32 w-2 bg-foreground" />
            <div className="text-center">
              <ScoreRing score={latestResult?.math_score ?? 0} maxScore={800} label="MATH" size={140} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Metrics Row */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Current" value={currentScore} subtitle="Last Score" icon={<Trophy className="h-5 w-5" />} />
        <StatCard title="Target" value={targetScore} subtitle="My Goal" icon={<Target className="h-5 w-5" />} />
        <StatCard title="Sessions" value={testResults.length} subtitle="Tests Done" icon={<BookOpen className="h-5 w-5" />} />
        <StatCard title="Status" value={getLevel(currentScore)} subtitle="Level" icon={<Brain className="h-5 w-5" />} />
      </motion.div>

      {/* Simplified History & Review */}
      <div className="grid lg:grid-cols-3 gap-12">
        <motion.div variants={item} className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between border-b-8 border-foreground pb-4">
            <h2 className="font-display text-3xl font-black uppercase tracking-tighter">Score Trends</h2>
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="h-[300px] w-full border-4 border-foreground p-6">
            {hasResults ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                  <XAxis dataKey="date" hide />
                  <YAxis hide domain={[0, 1600]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="score" stroke="black" strokeWidth={6} fill="black" fillOpacity={0.05} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs font-black uppercase opacity-20">Data pending...</div>
            )}
          </div>
        </motion.div>

        <motion.div variants={item} className="space-y-8">
          <div className="flex items-center justify-between border-b-8 border-foreground pb-4">
            <h2 className="font-display text-3xl font-black uppercase tracking-tighter">Focus Areas</h2>
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-4">
            {weakTopics.slice(0, 3).map((t) => (
              <div key={t.topic} className="border-4 border-foreground p-6 hover:bg-foreground hover:text-background transition-colors group cursor-pointer" onClick={() => navigate("/practice")}>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{t.section}</p>
                <div className="flex items-center justify-between">
                  <span className="font-black uppercase tracking-tight">{t.topic}</span>
                  <span className="font-black">{t.accuracy}%</span>
                </div>
              </div>
            ))}
            {weakTopics.length === 0 && (
              <div className="text-center p-12 border-4 border-dashed border-foreground opacity-20 font-black uppercase text-xs">Awaiting Analysis</div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

const Loader2 = ({ className }: { className?: string }) => (
  <div className={`h-12 w-12 border-4 border-foreground border-t-transparent animate-spin ${className}`} />
);
