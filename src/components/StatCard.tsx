import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  variant?: "default" | "accent" | "amber" | "success";
}

const variantStyles = {
  default: "bg-card border-border",
  accent: "bg-teal-light border-teal/20",
  amber: "bg-amber-light border-amber/20",
  success: "bg-success-light border-success/20",
};

const iconBgStyles = {
  default: "bg-secondary",
  accent: "bg-accent/15",
  amber: "bg-amber/15",
  success: "bg-success/15",
};

export default function StatCard({ title, value, subtitle, icon, trend, trendValue, variant = "default" }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-5 shadow-card ${variantStyles[variant]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 font-display text-3xl font-bold text-foreground">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
          {trend && trendValue && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`text-xs font-semibold ${
                  trend === "up" ? "text-success" : trend === "down" ? "text-danger" : "text-muted-foreground"
                }`}
              >
                {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={`rounded-lg p-2.5 ${iconBgStyles[variant]}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
