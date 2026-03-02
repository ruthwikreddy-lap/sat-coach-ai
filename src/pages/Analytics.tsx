import { motion } from "framer-motion";
import { mockTestResults, mockTopicPerformance } from "@/data/mockData";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";

const scoreData = mockTestResults.map((r) => ({
  date: r.date.slice(5),
  total: r.score,
  reading: r.readingScore,
  math: r.mathScore,
}));

const topicData = mockTopicPerformance.map((t) => ({
  name: t.topic.length > 12 ? t.topic.slice(0, 12) + "…" : t.topic,
  accuracy: t.accuracy,
}));

export default function Analytics() {
  const latest = mockTestResults[mockTestResults.length - 1];
  const prev = mockTestResults[mockTestResults.length - 2];
  const improvement = latest.score - prev.score;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-foreground">Performance Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Deep insights into your SAT preparation journey</p>
      </motion.div>

      {/* Summary cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        {[
          { label: "Latest Score", value: latest.score, sub: `${improvement > 0 ? "+" : ""}${improvement} from last` },
          { label: "Best Score", value: Math.max(...mockTestResults.map((r) => r.score)), sub: "all time" },
          { label: "Avg Accuracy", value: `${Math.round(mockTopicPerformance.reduce((a, t) => a + t.accuracy, 0) / mockTopicPerformance.length)}%`, sub: "across topics" },
          { label: "Total Questions", value: mockTopicPerformance.reduce((a, t) => a + t.questionsAttempted, 0), sub: "attempted" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 shadow-card">
            <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
            <p className="mt-1 font-display text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-5 shadow-card"
        >
          <h2 className="mb-4 font-display text-lg font-bold text-foreground">Score Breakdown</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={scoreData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis domain={[500, 900]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
              <Line type="monotone" dataKey="reading" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 4 }} name="Reading" />
              <Line type="monotone" dataKey="math" stroke="hsl(var(--amber))" strokeWidth={2} dot={{ r: 4 }} name="Math" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl border border-border bg-card p-5 shadow-card"
        >
          <h2 className="mb-4 font-display text-lg font-bold text-foreground">Topic Accuracy</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topicData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} angle={-30} textAnchor="end" height={60} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="accuracy" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
