import { motion } from "framer-motion";
import { ReactNode } from "react";

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
      className="border-4 border-foreground p-8 bg-background flex flex-col justify-between group transition-all hover:bg-foreground hover:text-background"
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 group-hover:opacity-100">{title}</p>
          <div className="border-2 border-foreground group-hover:border-background p-2 transition-colors">
            {icon}
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="font-display text-5xl font-black tracking-tighter uppercase leading-none">{value}</h3>
          {subtitle && (
            <p className="text-[10px] font-black uppercase tracking-widest opacity-30 group-hover:opacity-100">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="mt-8 h-1 w-full bg-foreground/10 group-hover:bg-background/20" />
    </motion.div>
  );
}
