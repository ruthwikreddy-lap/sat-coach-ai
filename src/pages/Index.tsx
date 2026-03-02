import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Trophy, Target, BookOpen, Clock, Brain, ArrowRight, Flame } from "lucide-react";
import StatCard from "@/components/StatCard";
import ScoreRing from "@/components/ScoreRing";
import TopicCard from "@/components/TopicCard";
import { mockTestResults, mockTopicPerformance, mockStudyPlan } from "@/data/mockData";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const latestResult = mockTestResults[mockTestResults.length - 1];
const weakTopics = mockTopicPerformance.filter((t) => t.accuracy < 70).sort((a, b) => a.accuracy - b.accuracy);
const todayPlan = mockStudyPlan[0];

const chartData = mockTestResults.map((r) => ({
  date: r.date.slice(5),
  score: r.score,
}));

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6"
    >
      {/* Hero */}
      <motion.div variants={item} className="gradient-hero rounded-2xl p-8 text-primary-foreground">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Flame className="h-5 w-5 text-amber" />
              <span className="text-sm font-semibold text-amber">4-day streak</span>
            </div>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">
              Welcome back, Learner
            </h1>
            <p className="mt-2 max-w-md text-sm opacity-80">
              Your current score is <strong>{latestResult.score}</strong>. Target: <strong>1500</strong>.
              You need <strong>{1500 - latestResult.score}</strong> more points. Let's get there.
            </p>
            <div className="mt-5 flex gap-3">
              <Link
                to="/practice"
                className="inline-flex items-center gap-2 rounded-lg gradient-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-transform hover:scale-105"
              >
                Start Practice <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/study-plan"
                className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/20 px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
              >
                View Plan
              </Link>
            </div>
          </div>
          <div className="flex gap-6">
            <ScoreRing score={latestResult.readingScore} maxScore={800} label="Reading" />
            <ScoreRing score={latestResult.mathScore} maxScore={800} label="Math" />
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Current Score"
          value={latestResult.score}
          subtitle="out of 1600"
          icon={<Trophy className="h-5 w-5 text-accent" />}
          trend="up"
          trendValue="+40 pts"
          variant="accent"
        />
        <StatCard
          title="Target Score"
          value="1500"
          subtitle="200 pts to go"
          icon={<Target className="h-5 w-5 text-amber" />}
          variant="amber"
        />
        <StatCard
          title="Tests Taken"
          value={mockTestResults.length}
          subtitle="this month"
          icon={<BookOpen className="h-5 w-5 text-foreground" />}
        />
        <StatCard
          title="Avg. Time"
          value="175m"
          subtitle="per test"
          icon={<Clock className="h-5 w-5 text-foreground" />}
        />
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Progress Chart */}
        <motion.div variants={item} className="col-span-1 rounded-xl border border-border bg-card p-5 shadow-card lg:col-span-2">
          <h2 className="font-display text-lg font-bold text-foreground">Score Progress</h2>
          <p className="mb-4 text-xs text-muted-foreground">Your improvement over recent tests</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis domain={[1100, 1600]} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--accent))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Today's Plan */}
        <motion.div variants={item} className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-foreground">Today's Plan</h2>
            <Link to="/study-plan" className="text-xs font-semibold text-accent hover:underline">
              Full Plan →
            </Link>
          </div>
          <div className="space-y-3">
            {todayPlan.tasks.map((task, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                  task.type === "test" ? "bg-amber/15" : task.type === "practice" ? "bg-accent/15" : "bg-secondary"
                }`}>
                  {task.type === "test" ? (
                    <BookOpen className="h-4 w-4 text-amber" />
                  ) : task.type === "practice" ? (
                    <Brain className="h-4 w-4 text-accent" />
                  ) : (
                    <Target className="h-4 w-4 text-muted-foreground" />
                  )}
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

      {/* Weak Areas */}
      <motion.div variants={item}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">Weak Areas</h2>
            <p className="text-xs text-muted-foreground">Topics below 70% accuracy that need attention</p>
          </div>
          <Link to="/weak-areas" className="text-xs font-semibold text-accent hover:underline">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {weakTopics.slice(0, 4).map((t) => (
            <TopicCard key={t.topic} topic={t} onPractice={() => {}} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
