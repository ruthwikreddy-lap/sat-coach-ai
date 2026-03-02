import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Trophy, Target, BookOpen, Clock, Brain, ArrowRight, Flame } from "lucide-react";
import StatCard from "@/components/StatCard";
import ScoreRing from "@/components/ScoreRing";
import TopicCard from "@/components/TopicCard";
import { mockTopicPerformance, mockStudyPlan } from "@/data/mockData";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
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
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [testResults, setTestResults] = useState<TestResultRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.onboarding_completed && profile && !profileLoading) {
      navigate("/onboarding");
    }
  }, [profile, profileLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchResults = async () => {
      const { data } = await supabase
        .from("test_results")
        .select("score, reading_score, math_score, test_date, weak_topics, time_spent")
        .eq("user_id", user.id)
        .order("test_date", { ascending: true })
        .limit(20);
      if (data && data.length > 0) setTestResults(data);
      setLoading(false);
    };
    fetchResults();
  }, [user]);

  const hasResults = testResults.length > 0;
  const latestResult = hasResults ? testResults[testResults.length - 1] : null;
  const prevResult = testResults.length > 1 ? testResults[testResults.length - 2] : null;
  const improvement = latestResult && prevResult ? latestResult.score - prevResult.score : 0;

  const currentScore = latestResult?.score ?? profile?.current_score ?? 0;
  const targetScore = profile?.target_score ?? 1500;
  const readingScore = latestResult?.reading_score ?? 0;
  const mathScore = latestResult?.math_score ?? 0;

  const chartData = hasResults
    ? testResults.map((r) => ({ date: r.test_date.slice(5, 10), score: r.score }))
    : [];

  const weakTopics = mockTopicPerformance.filter((t) => t.accuracy < 70).sort((a, b) => a.accuracy - b.accuracy);
  const todayPlan = mockStudyPlan[0];

  const avgTime = hasResults
    ? Math.round(testResults.reduce((a, r) => a + (r.time_spent ?? 0), 0) / testResults.length)
    : 0;

  if (profileLoading || loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      {/* Hero */}
      <motion.div variants={item} className="gradient-hero rounded-2xl p-8 text-primary-foreground">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">
              Welcome back, {profile?.display_name || "Learner"}
            </h1>
            <p className="mt-2 max-w-md text-sm opacity-80">
              Your current score is <strong>{currentScore}</strong>. Target: <strong>{targetScore}</strong>.
              {targetScore - currentScore > 0 && (
                <> You need <strong>{targetScore - currentScore}</strong> more points. Let's get there.</>
              )}
            </p>
            <div className="mt-5 flex gap-3">
              <Link to="/practice" className="inline-flex items-center gap-2 rounded-lg gradient-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-transform hover:scale-105">
                Start Practice <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/study-plan" className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/20 px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10">
                View Plan
              </Link>
            </div>
          </div>
          <div className="flex gap-6">
            <ScoreRing score={readingScore} maxScore={800} label="Reading" />
            <ScoreRing score={mathScore} maxScore={800} label="Math" />
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Current Score" value={currentScore} subtitle="out of 1600" icon={<Trophy className="h-5 w-5 text-accent" />} trend={improvement > 0 ? "up" : improvement < 0 ? "down" : "stable"} trendValue={`${improvement > 0 ? "+" : ""}${improvement} pts`} variant="accent" />
        <StatCard title="Target Score" value={targetScore} subtitle={`${Math.max(0, targetScore - currentScore)} pts to go`} icon={<Target className="h-5 w-5 text-amber" />} variant="amber" />
        <StatCard title="Tests Taken" value={testResults.length} subtitle="total" icon={<BookOpen className="h-5 w-5 text-foreground" />} />
        <StatCard title="Avg. Time" value={hasResults ? `${avgTime}m` : "—"} subtitle="per test" icon={<Clock className="h-5 w-5 text-foreground" />} />
      </motion.div>

      {chartData.length > 1 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <motion.div variants={item} className="col-span-1 rounded-xl border border-border bg-card p-5 shadow-card lg:col-span-2">
            <h2 className="font-display text-lg font-bold text-foreground">Score Progress</h2>
            <p className="mb-4 text-xs text-muted-foreground">Your improvement over recent tests</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis domain={[Math.max(0, Math.min(...chartData.map(d => d.score)) - 100), 1600]} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--accent))" strokeWidth={3} dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div variants={item} className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-foreground">Today's Plan</h2>
              <Link to="/study-plan" className="text-xs font-semibold text-accent hover:underline">Full Plan →</Link>
            </div>
            <div className="space-y-3">
              {todayPlan.tasks.map((task, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${task.type === "test" ? "bg-amber/15" : task.type === "practice" ? "bg-accent/15" : "bg-secondary"}`}>
                    {task.type === "test" ? <BookOpen className="h-4 w-4 text-amber" /> : task.type === "practice" ? <Brain className="h-4 w-4 text-accent" /> : <Target className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{task.topic}</p>
                    <p className="text-xs text-muted-foreground">{task.duration} min · {task.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {!hasResults && (
        <motion.div variants={item} className="rounded-xl border border-border bg-card p-8 text-center shadow-card">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <h2 className="font-display text-xl font-bold text-foreground">No tests yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Take your first practice test to see your progress here</p>
          <Link to="/practice" className="mt-4 inline-flex items-center gap-2 rounded-lg gradient-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground">
            Start First Test <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      )}

      {/* Weak Areas */}
      <motion.div variants={item}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">Weak Areas</h2>
            <p className="text-xs text-muted-foreground">Topics below 70% accuracy that need attention</p>
          </div>
          <Link to="/weak-areas" className="text-xs font-semibold text-accent hover:underline">View All →</Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {weakTopics.slice(0, 4).map((t) => (
            <TopicCard key={t.topic} topic={t} onPractice={() => navigate("/practice")} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
