import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Trophy, Target, BookOpen, Clock, Brain, ArrowRight, Flame, BarChart3, TrendingUp, AlertCircle } from "lucide-react";
import StatCard from "@/components/StatCard";
import ScoreRing from "@/components/ScoreRing";
import TopicCard from "@/components/TopicCard";
import { mockTopicPerformance, mockStudyPlan } from "@/data/mockData";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from "recharts";
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
  hidden: { opacity: 0, y: 0 },
  show: { opacity: 1, y: 0 },
};

import { TopicPerformance } from "@/data/mockData";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [testResults, setTestResults] = useState<TestResultRow[]>([]);
  const [performances, setPerformances] = useState<TopicPerformance[]>([]);
  const [todayTasks, setTodayTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.onboarding_completed && profile && !profileLoading) {
      navigate("/onboarding");
    }
  }, [profile, profileLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      // Fetch results for chart
      const { data: results } = await supabase
        .from("test_results")
        .select("score, reading_score, math_score, test_date, weak_topics, time_spent")
        .eq("user_id", user.id)
        .order("test_date", { ascending: true })
        .limit(20);
      if (results) setTestResults(results);

      // Fetch performance for weak areas
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

      // Fetch today's study tasks
      const dayOfWeek = (new Date().getDay() + 6) % 7;
      const { data: tasks } = await supabase
        .from("study_plan_tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("day_of_week", dayOfWeek)
        .limit(4);
      if (tasks) setTodayTasks(tasks);

      setLoading(false);
    };
    fetchData();
  }, [user]);

  const hasResults = testResults.length > 0;
  const latestResult = hasResults ? testResults[testResults.length - 1] : null;
  const prevResult = testResults.length > 1 ? testResults[testResults.length - 2] : null;
  const improvement = latestResult && prevResult ? latestResult.score - prevResult.score : 0;

  const currentScore = latestResult?.score ?? profile?.current_score ?? 0;
  const targetScore = profile?.target_score ?? 1500;
  const readingScore = latestResult?.reading_score ?? (currentScore / 2);
  const mathScore = latestResult?.math_score ?? (currentScore / 2);

  const chartData = hasResults
    ? testResults.map((r) => ({ date: r.test_date.slice(5, 10), score: r.score }))
    : [];

  const weakTopics = performances.filter((t) => t.accuracy < 70).sort((a, b) => a.accuracy - b.accuracy);

  const streak = 4; // Mock streak value

  const avgTime = hasResults
    ? Math.round(testResults.reduce((a, r) => a + (r.time_spent ?? 0), 0) / testResults.length)
    : 0;

  if (profileLoading || loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="mx-auto max-w-7xl space-y-10 px-6 py-12">
      {/* Hero Section */}
      <motion.div variants={item} className="relative overflow-hidden border-8 border-foreground bg-foreground px-8 py-16 text-background md:px-14 md:py-24">
        <div className="relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-10">
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center border-4 border-background bg-background px-6 py-2 text-foreground">
                <Flame className="h-8 w-8 mb-1" />
                <span className="text-2xl font-black">{streak}</span>
                <span className="text-[8px] font-black uppercase tracking-widest">Day Streak</span>
              </div>
              <div className="space-y-2">
                <h1 className="font-display text-6xl font-black leading-[0.8] tracking-tight sm:text-7xl md:text-8xl uppercase">
                  READY FOR<br />THE SAT?
                </h1>
                <p className="max-w-md text-sm font-black uppercase tracking-widest opacity-80">
                  Welcome back, {profile?.display_name?.split(' ')[0] || "Learner"}.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <Link to="/practice" className="bg-background text-foreground hover:bg-foreground hover:text-background hover:border-background border-4 border-transparent px-10 py-5 font-black uppercase tracking-widest text-base flex items-center gap-4 transition-all">
                <Target className="h-6 w-6" /> Take a Test
              </Link>
              <button onClick={() => navigate("/practice")} className="border-4 border-background text-background hover:bg-background hover:text-foreground px-10 py-5 flex items-center gap-4 font-black uppercase tracking-widest text-base transition-all">
                Practice More <ArrowRight className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="flex items-center gap-12 border-8 border-background p-10 bg-black">
              <ScoreRing score={readingScore} maxScore={800} label="Reading" size={140} />
              <div className="h-24 w-2 bg-white" />
              <ScoreRing score={mathScore} maxScore={800} label="Math" size={140} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Metrics Row */}
      <motion.div variants={item} className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Latest Score" value={currentScore} subtitle="Final Simulation" icon={<Trophy className="h-6 w-6" />} trend={improvement > 0 ? "up" : improvement < 0 ? "down" : "stable"} trendValue={`${improvement > 0 ? "+" : ""}${improvement}`} />
        <StatCard title="Target Score" value={targetScore} subtitle="Goal" icon={<Target className="h-6 w-6" />} />
        <StatCard title="Tests Taken" value={testResults.length} subtitle="Complete" icon={<BookOpen className="h-6 w-6" />} />
        <StatCard title="Avg. Time" value={hasResults ? `${avgTime}m` : "—"} subtitle="Per Test" icon={<Clock className="h-6 w-6" />} />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Progress Chart */}
        <motion.div variants={item} className="col-span-1 border-4 border-foreground p-8 lg:col-span-12">
          <div className="mb-10 flex items-center justify-between underline decoration-8 underline-offset-[16px]">
            <div>
              <h2 className="font-display text-4xl font-black uppercase tracking-tighter">Score History</h2>
              <p className="text-xs font-black uppercase tracking-widest mt-2">Historical Performance Data</p>
            </div>
            <TrendingUp className="h-10 w-10 text-foreground" />
          </div>

          <div className="h-[400px] w-full mt-12">
            {hasResults ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <pattern id="diagonal-stripe" patternUnits="userSpaceOnUse" width="10" height="10">
                      <line x1="0" y1="10" x2="10" y2="0" stroke="black" strokeWidth="2" />
                    </pattern>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: "black" }} dy={15} />
                  <YAxis domain={[0, 1600]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: "black" }} />
                  <Tooltip
                    cursor={{ stroke: 'black', strokeWidth: 2 }}
                    contentStyle={{ backgroundColor: "black", border: "none", color: "white", padding: "12px", borderLeft: "8px solid white" }}
                    labelStyle={{ display: 'none' }}
                  />
                  <Area
                    type="step"
                    dataKey="score"
                    stroke="black"
                    strokeWidth={8}
                    fill="url(#diagonal-stripe)"
                    fillOpacity={0.1}
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center border-8 border-dashed border-foreground p-20">
                <BarChart3 className="mb-8 h-24 w-24 opacity-20" />
                <p className="text-xl font-black uppercase tracking-widest">No Tests Completed Yet</p>
                <button onClick={() => navigate("/practice")} className="mt-8 bg-foreground text-background px-10 py-4 font-black uppercase tracking-tighter">Initialize first test</button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Weak Areas Section */}
      <motion.div variants={item} className="space-y-6">
        <div className="flex items-center justify-between border-b-8 border-foreground pb-6">
          <div className="flex items-center gap-5">
            <AlertCircle className="h-10 w-10 text-foreground" />
            <h2 className="font-display text-4xl font-black uppercase tracking-tighter">Weak Topics</h2>
          </div>
          <Link to="/weak-areas" className="text-[10px] font-black uppercase tracking-widest bg-foreground text-background px-6 py-2">Full Report →</Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {weakTopics.slice(0, 3).map((t) => (
            <TopicCard key={t.topic} topic={t} onPractice={() => navigate("/practice")} />
          ))}
          {weakTopics.length === 0 && (
            <div className="col-span-full border-8 border-dashed border-foreground p-24 text-center">
              <p className="text-xl font-black uppercase tracking-widest opacity-30">Everything looks good!</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}



