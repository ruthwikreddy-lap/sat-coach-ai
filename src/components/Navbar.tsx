import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  BarChart3,
  LogOut,
  User,
  MessageSquare,
  Menu,
  X,
  Moon,
  Sun,
  Zap,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/practice", label: "Practice", icon: BookOpen },
  { path: "/drill", label: "Drill", icon: Zap },
  { path: "/weak-areas", label: "Review", icon: Brain },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/tutor", label: "Tutor", icon: MessageSquare },
];

export default function Navbar() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  /* ── scroll shadow ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── restore persisted theme ── */
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = saved === "dark" || (!saved && prefersDark);
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  /* ── close mobile menu on route change ── */
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  /* ── hidden pages ── */
  if (location.pathname === "/focus-test") return null;
  if (location.pathname === "/" && !user) return null;

  return (
    <>
      {/* ─── Main bar ─── */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
            ? "glass-nav shadow-lg shadow-black/5"
            : "bg-background/90 backdrop-blur-md border-b border-foreground/[0.06]"
          }`}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 gap-4">

          {/* ── Logo ── */}
          <Link
            to={user ? "/dashboard" : "/"}
            className="flex items-center gap-2 flex-shrink-0 group"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background group-hover:scale-110 transition-transform">
              <Brain className="h-3.5 w-3.5" />
            </div>
            <span className="font-display text-[15px] font-black tracking-tighter text-foreground uppercase">
              SATCOACH
            </span>
          </Link>

          {/* ── Desktop nav ── */}
          {user && (
            <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-semibold rounded-lg transition-colors duration-150 ${isActive
                        ? "text-background"
                        : "text-foreground/50 hover:text-foreground hover:bg-foreground/[0.06]"
                      }`}
                  >
                    {/* Active pill (layout-animated) */}
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-lg bg-foreground"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon className="relative h-3.5 w-3.5 flex-shrink-0" />
                    <span className="relative">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* ── Right actions ── */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title="Toggle theme"
              className="p-2 rounded-lg text-foreground/40 hover:text-foreground hover:bg-foreground/[0.06] transition-colors"
            >
              {isDark
                ? <Sun className="h-[15px] w-[15px]" />
                : <Moon className="h-[15px] w-[15px]" />}
            </button>

            {user ? (
              <>
                <Link
                  to="/profile"
                  title="Profile"
                  className={`p-2 rounded-lg transition-colors ${location.pathname === "/profile"
                      ? "bg-foreground text-background"
                      : "text-foreground/40 hover:text-foreground hover:bg-foreground/[0.06]"
                    }`}
                >
                  <User className="h-[15px] w-[15px]" />
                </Link>
                <button
                  onClick={signOut}
                  title="Sign out"
                  className="p-2 rounded-lg text-foreground/40 hover:text-foreground hover:bg-foreground/[0.06] transition-colors"
                >
                  <LogOut className="h-[15px] w-[15px]" />
                </button>

                {/* Mobile hamburger */}
                <button
                  className="lg:hidden ml-1 p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.06] transition-colors"
                  onClick={() => setMobileOpen((v) => !v)}
                  aria-label="Toggle menu"
                >
                  {mobileOpen
                    ? <X className="h-4 w-4" />
                    : <Menu className="h-4 w-4" />}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="hidden sm:inline-flex text-[12px] font-semibold text-foreground/50 hover:text-foreground px-3.5 py-2 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth"
                  className="bg-foreground text-background px-5 py-2 text-[11px] font-bold uppercase tracking-widest rounded-full hover:opacity-90 transition-opacity"
                >
                  Start Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Mobile drawer ─── */}
      <AnimatePresence>
        {mobileOpen && user && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-foreground/10 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed top-0 right-0 z-50 h-full w-72 bg-background border-l border-foreground/8 shadow-2xl shadow-black/20 lg:hidden flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 h-14 border-b border-foreground/8">
                <span className="font-display text-[14px] font-black tracking-tighter uppercase text-foreground">
                  SATCOACH
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-foreground/40 hover:text-foreground hover:bg-foreground/[0.06] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Nav links */}
              <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
                {navItems.map((item, i) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 28 }}
                    >
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-[13px] transition-colors ${isActive
                            ? "bg-foreground text-background"
                            : "text-foreground/60 hover:text-foreground hover:bg-foreground/[0.06]"
                          }`}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {isActive && (
                          <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Drawer footer */}
              <div className="px-3 pb-6 pt-2 border-t border-foreground/8 flex flex-col gap-1">
                <Link
                  to="/profile"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-[13px] transition-colors ${location.pathname === "/profile"
                      ? "bg-foreground text-background"
                      : "text-foreground/60 hover:text-foreground hover:bg-foreground/[0.06]"
                    }`}
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); toggleTheme(); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-[13px] text-foreground/60 hover:text-foreground hover:bg-foreground/[0.06] transition-colors w-full text-left"
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {isDark ? "Light Mode" : "Dark Mode"}
                </button>
                <button
                  onClick={() => { setMobileOpen(false); signOut(); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-[13px] text-foreground/60 hover:text-foreground hover:bg-foreground/[0.06] transition-colors w-full text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
