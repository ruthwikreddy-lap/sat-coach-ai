import { motion } from "framer-motion";
import TopicCard from "@/components/TopicCard";
import { mockTopicPerformance } from "@/data/mockData";
import { useNavigate } from "react-router-dom";

export default function WeakAreas() {
  const navigate = useNavigate();
  const sorted = [...mockTopicPerformance].sort((a, b) => a.accuracy - b.accuracy);
  const weak = sorted.filter((t) => t.accuracy < 70);
  const strong = sorted.filter((t) => t.accuracy >= 70);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-foreground">Topic Analysis</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Identify your weaknesses and focus your practice where it matters most
        </p>
      </motion.div>

      {weak.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-danger">
            <span className="h-2 w-2 rounded-full bg-danger" /> Needs Improvement
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {weak.map((t) => (
              <TopicCard key={t.topic} topic={t} onPractice={() => navigate("/practice")} />
            ))}
          </div>
        </div>
      )}

      {strong.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-success">
            <span className="h-2 w-2 rounded-full bg-success" /> Strong Areas
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {strong.map((t) => (
              <TopicCard key={t.topic} topic={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
