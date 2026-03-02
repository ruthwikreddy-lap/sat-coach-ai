import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, BookOpen, Target, Brain, BarChart3 } from "lucide-react";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/practice", label: "Practice Test", icon: BookOpen },
  { path: "/study-plan", label: "Study Plan", icon: Target },
  { path: "/weak-areas", label: "Weak Areas", icon: Brain },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
];

export default function Navbar() {
  const location = useLocation();

  // Hide navbar in focus mode
  if (location.pathname === "/focus-test") return null;

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-accent">
            <Brain className="h-5 w-5 text-accent-foreground" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-foreground">
            SAT<span className="text-accent">Coach</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative px-3 py-2 text-sm font-medium transition-colors"
              >
                <span className={isActive ? "text-accent" : "text-muted-foreground hover:text-foreground"}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-x-0 -bottom-[1px] h-0.5 gradient-accent rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Mobile nav */}
        <div className="flex items-center gap-3 md:hidden">
          {navItems.slice(0, 3).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className="p-2">
                <Icon className={`h-5 w-5 ${isActive ? "text-accent" : "text-muted-foreground"}`} />
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
