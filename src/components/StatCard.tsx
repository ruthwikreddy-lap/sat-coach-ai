import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
}

export default function StatCard({ title, value, subtitle, icon, trend, trendValue }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-4 border-foreground p-8 bg-background flex flex-col justify-between"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="font-display text-5xl font-black tracking-tighter uppercase">{value}</h3>
          </div>
          {trend && trendValue && (
            <div className="inline-block bg-foreground text-background px-2 py-1 text-[10px] font-black uppercase tracking-widest">
              {trend === "up" ? "DELTA +" : trend === "down" ? "DELTA -" : "STABLE"} {trendValue}
            </div>
          )}
          {subtitle && (
            <p className="text-[10px] font-black uppercase tracking-widest leading-none">
              {subtitle}
            </p>
          )}
        </div>
        <div className="border-2 border-foreground p-3">
          {icon}
        </div>
      </div>
      <div className="mt-8 h-2 bg-foreground" />
    </motion.div>
  );
}

