import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { TopicPerformance } from "@/data/mockData";

interface TopicCardProps {
  topic: TopicPerformance;
  onPractice?: () => void;
}

export default function TopicCard({ topic, onPractice }: TopicCardProps) {
  const getAccuracyColor = (acc: number) => {
    if (acc >= 75) return "bg-success";
    if (acc >= 60) return "bg-amber";
    return "bg-danger";
  };

  const TrendIcon = topic.trend === "up" ? TrendingUp : topic.trend === "down" ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-card"
    >
      <div className="flex items-center gap-3">
        <div className={`h-2 w-2 rounded-full ${getAccuracyColor(topic.accuracy)}`} />
        <div>
          <p className="font-medium text-foreground">{topic.topic}</p>
          <p className="text-xs text-muted-foreground">{topic.section} · {topic.questionsAttempted} questions</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-display text-lg font-bold text-foreground">{topic.accuracy}%</p>
          <div className="flex items-center gap-1">
            <TrendIcon className={`h-3 w-3 ${
              topic.trend === "up" ? "text-success" : topic.trend === "down" ? "text-danger" : "text-muted-foreground"
            }`} />
            <span className="text-xs text-muted-foreground">{topic.trend}</span>
          </div>
        </div>
        {onPractice && topic.accuracy < 70 && (
          <button
            onClick={onPractice}
            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground transition-transform hover:scale-105"
          >
            Practice
          </button>
        )}
      </div>
    </motion.div>
  );
}
