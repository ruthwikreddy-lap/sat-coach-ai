import { motion } from "framer-motion";
import { ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
}

export default function StatCard({ title, value, subtitle, icon }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease }}
      className="glass-card-depth rounded-2xl p-8 border-glow flex flex-col justify-between group transition-all hover:bg-white/10"
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 group-hover:text-white">{title}</p>
          <div className="border border-white/20 group-hover:border-white p-2 transition-colors rounded-lg bg-white/5">
            {icon}
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="font-display text-5xl font-black tracking-tighter uppercase leading-none text-white">{value}</h3>
          {subtitle && (
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-white">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="mt-8 h-1 w-full bg-white/10 rounded-full" />
    </motion.div>
  );
}
