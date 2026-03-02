import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, BookOpen, Target, Brain, BarChart3, LogOut, User, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/practice", label: "Practice", icon: BookOpen },
  { path: "/weak-areas", label: "Review", icon: Brain },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/tutor", label: "Tutor", icon: MessageSquare },
];

export default function Navbar() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  if (location.pathname === "/focus-test") return null;

  return (
    <nav className="sticky top-0 z-50 border-b border-foreground bg-background">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-8">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background">
            <Brain className="h-6 w-6" />
          </div>
          <span className="font-display text-2xl font-black tracking-tighter text-foreground uppercase">
            SATCOACH
          </span>
        </Link>

        {user && (
          <div className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-4 py-2 text-sm font-black tracking-tight uppercase ${isActive ? "bg-foreground text-background" : "text-foreground hover:bg-foreground hover:text-background"
                    }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-x-4 -bottom-1 h-0.5 bg-foreground rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/profile" className="p-2.5 text-foreground hover:bg-foreground hover:text-background">
                <User className="h-5.5 w-5.5" />
              </Link>
              <div className="h-6 w-px bg-foreground mx-1" />
              <button
                onClick={signOut}
                className="p-2.5 text-foreground hover:bg-foreground hover:text-background"
                title="Sign Out"
              >
                <LogOut className="h-5.5 w-5.5" />
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="border-4 border-foreground bg-foreground px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-background hover:bg-background hover:text-foreground transition-all"
            >
              SIGN IN
            </Link>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      {user && (
        <div className="flex items-center justify-around border-t border-border/10 bg-background/50 py-3 px-2 backdrop-blur-md lg:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1.5 ${isActive ? "bg-foreground text-background py-2" : "text-foreground"
                  }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                  {item.label.split(' ')[0]}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}

