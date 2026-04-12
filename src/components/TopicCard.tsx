import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Target } from "lucide-react";
import { TopicPerformance } from "@/data/mockData";

const ease = [0.22, 1, 0.36, 1] as const;

interface TopicCardProps {
  topic: TopicPerformance;
  onPractice?: () => void;
}

export default function TopicCard({ topic, onPractice }: TopicCardProps) {
  const TrendIcon = topic.trend === "up" ? TrendingUp : topic.trend === "down" ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileHover={{ y: -4, transition: { duration: 0.2, ease } }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="glass-card-depth rounded-3xl p-8 border-glow flex flex-col gap-8"
    >
      <div className="flex items-start justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center border border-white/20 bg-white/10 text-white rounded-xl">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <p className="font-display text-xl font-black uppercase tracking-tight text-white">{topic.topic}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mt-1">{topic.section} · {topic.questionsAttempted} {topic.questionsAttempted === 1 ? 'Test' : 'Tests'}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl font-black uppercase tracking-tighter text-white">{topic.accuracy}%</p>
          <div className="flex items-center justify-end gap-1 text-white/40">
            <TrendIcon className="h-3 w-3" />
            <span className="text-[8px] font-black uppercase tracking-widest">{topic.trend}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <span className={`px-2 py-1 text-[8px] font-black uppercase tracking-widest border rounded-lg ${topic.accuracy < 70 ? 'border-white/20 bg-white/5 text-white/60' : 'border-white/20 bg-white/10 text-white'}`}>
            {topic.accuracy < 70 ? 'Needs Work' : 'Mastered'}
          </span>
        </div>
        {onPractice && (
          <button
            onClick={onPractice}
            className="bg-white text-black flex items-center justify-center px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/90 glow-soft"
          >
            Practice Topic
          </button>
        )}
      </div>
    </motion.div>
  );
}

