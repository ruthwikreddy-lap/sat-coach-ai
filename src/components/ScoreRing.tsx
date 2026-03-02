import { motion } from "framer-motion";

interface ScoreRingProps {
  score: number;
  maxScore: number;
  label: string;
  size?: number;
}

export default function ScoreRing({ score, maxScore, label, size = 120 }: ScoreRingProps) {
  const percentage = (score / maxScore) * 100;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative group" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="black"
            strokeWidth={strokeWidth}
            fill="none"
            className="opacity-10"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="black"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 2, ease: "circOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-display text-5xl font-black text-foreground"
          >
            {score}
          </motion.span>
        </div>
      </div>
      <div className="space-y-1 text-center">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] block bg-foreground text-background px-2 py-0.5">{label}</span>
      </div>
    </div>
  );
}
