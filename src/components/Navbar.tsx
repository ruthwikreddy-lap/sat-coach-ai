import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, BookOpen, Target, Brain, BarChart3, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/practice", label: "Practice Test", icon: BookOpen },
  { path: "/study-plan", label: "Study Plan", icon: Target },
  { path: "/weak-areas", label: "Weak Areas", icon: Brain },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
];

export default function Navbar() {
  const location = useLocation();
  const { user, signOut } = useAuth();

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

        {user && (
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} className="relative px-3 py-2 text-sm font-medium transition-colors">
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
        )}

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/profile" className="rounded-lg p-2 text-muted-foreground hover:text-foreground">
                <User className="h-5 w-5" />
              </Link>
              <button onClick={signOut} className="rounded-lg p-2 text-muted-foreground hover:text-foreground">
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="rounded-lg gradient-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      {user && (
        <div className="flex justify-center gap-1 border-t border-border pb-2 pt-1 md:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className="flex flex-col items-center gap-0.5 px-3 py-1">
                <Icon className={`h-4 w-4 ${isActive ? "text-accent" : "text-muted-foreground"}`} />
                <span className={`text-[10px] ${isActive ? "text-accent font-semibold" : "text-muted-foreground"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
