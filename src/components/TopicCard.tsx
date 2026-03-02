import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Target } from "lucide-react";
import { TopicPerformance } from "@/data/mockData";

interface TopicCardProps {
  topic: TopicPerformance;
  onPractice?: () => void;
}

export default function TopicCard({ topic, onPractice }: TopicCardProps) {
  const TrendIcon = topic.trend === "up" ? TrendingUp : topic.trend === "down" ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card flex items-center justify-between rounded-2xl p-4 shadow-card hover:shadow-elevated transition-all"
    >
      <div className="flex items-center gap-4">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center border-2 border-foreground bg-background">
          <Target className="h-6 w-6" />
          <div
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center border-2 border-foreground bg-foreground text-background text-[10px] font-black"
          >
            !
          </div>
        </div>
        <div>
          <p className="font-display font-black uppercase text-foreground">{topic.topic}</p>
          <p className="text-[10px] font-black uppercase tracking-widest leading-none mt-1">{topic.section} · {topic.questionsAttempted} AUDITS</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="font-display text-2xl font-black uppercase">{topic.accuracy}%</p>
          <div className="flex items-center justify-end gap-1">
            <TrendIcon className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">{topic.trend}</span>
          </div>
        </div>
        {onPractice && (
          <button
            onClick={onPractice}
            className="flex h-12 items-center justify-center border-4 border-foreground bg-foreground px-6 text-[10px] font-black uppercase tracking-widest text-background hover:bg-background hover:text-foreground transition-all"
          >
            AUDIT
          </button>
        )}
      </div>
    </motion.div>
  );
}

