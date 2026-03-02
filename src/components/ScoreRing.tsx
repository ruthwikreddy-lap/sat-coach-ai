import { motion } from "framer-motion";

interface ScoreRingProps {
  score: number;
  maxScore: number;
  label: string;
  size?: number;
}

export default function ScoreRing({ score, maxScore, label, size = 120 }: ScoreRingProps) {
  const percentage = (score / maxScore) * 100;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group" style={{ width: size, height: size }}>
        {/* Outer subtle glow */}
        <div className="absolute inset-0 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />

        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            className="text-primary/10"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            className="text-primary"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "circOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-display text-4xl font-black text-foreground"
          >
            {score}
          </motion.span>
          <span className="text-[10px] uppercase tracking-[0.2em] font-black opacity-40">Pts</span>
        </div>
      </div>
      <span className="text-xs font-black uppercase tracking-[0.15em] opacity-80">{label}</span>
    </div>
  );
}

