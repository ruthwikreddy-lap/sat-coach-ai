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
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      animate={{ opacity: 1, y: 0 }}
      className="border-4 border-foreground p-8 bg-background shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col gap-8"
    >
      <div className="flex items-start justify-between border-b-2 border-foreground pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center border-4 border-foreground bg-foreground text-background">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <p className="font-display text-xl font-black uppercase tracking-tight text-foreground">{topic.topic}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mt-1">{topic.section} · {topic.questionsAttempted} {topic.questionsAttempted === 1 ? 'Test' : 'Tests'}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl font-black uppercase tracking-tighter">{topic.accuracy}%</p>
          <div className="flex items-center justify-end gap-1 opacity-40">
            <TrendIcon className="h-3 w-3" />
            <span className="text-[8px] font-black uppercase tracking-widest">{topic.trend}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <span className={`px-2 py-1 text-[8px] font-black uppercase tracking-widest border-2 ${topic.accuracy < 70 ? 'border-red-500 text-red-500' : 'border-green-500 text-green-500'}`}>
            {topic.accuracy < 70 ? 'Needs Work' : 'Mastered'}
          </span>
        </div>
        {onPractice && (
          <button
            onClick={onPractice}
            className="flex items-center justify-center border-4 border-foreground bg-foreground px-8 py-3 text-[10px] font-black uppercase tracking-widest text-background hover:bg-background hover:text-foreground transition-all"
          >
            Practice Topic
          </button>
        )}
      </div>
    </motion.div>
  );
}

