import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Monitor,
  Zap,
  Calculator,
  BarChart3,
  Brain,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

/* ─────────── Easing ─────────── */
const ease = [0.22, 1, 0.36, 1] as const;

/* ─────────── Landing Navbar ─────────── */
function LandingNav({
  isDark,
  toggleTheme,
}: {
  isDark: boolean;
  toggleTheme: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = ["About", "Features", "How It Works"];

  return (
    <nav
      className={`fixed z-50 transition-all duration-500 ${scrolled ? "top-4" : "top-6"
        } left-1/2 -translate-x-1/2 w-[92%] max-w-5xl`}
    >
      <div className="glass-nav-floating rounded-full px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-black tracking-tighter text-xl text-white uppercase">
          SATCOACH
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(" ", "-")}`}
              className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50 hover:text-white transition-colors relative group"
            >
              {l}
              <span className="absolute bottom-0 left-0 w-0 h-px bg-white/30 group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/5 transition-all"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <Link
            to="/auth"
            className="hidden sm:block text-[11px] font-bold uppercase tracking-widest text-white/60 hover:text-white px-4 py-2 rounded-full transition-colors"
          >
            Sign In
          </Link>

          <Link
            to="/auth"
            className="bg-white text-black text-[11px] font-bold uppercase tracking-widest px-5 py-2.5 rounded-full hover:bg-white/90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/10"
          >
            Start Free
          </Link>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-white/60 hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.2, ease }}
            className="absolute top-full left-0 right-0 mt-3 glass-floating-dark rounded-3xl p-8 md:hidden"
          >
            <div className="flex flex-col gap-5">
              {navLinks.map((l) => (
                <a
                  key={l}
                  href={`#${l.toLowerCase().replace(" ", "-")}`}
                  onClick={() => setMobileOpen(false)}
                  className="text-lg font-black tracking-tight uppercase border-b border-white/5 pb-4 text-white/70 hover:text-white transition-colors"
                >
                  {l}
                </a>
              ))}
              <Link
                to="/auth"
                className="w-full bg-white text-black py-4 rounded-2xl font-black text-base uppercase tracking-widest text-center mt-2 hover:bg-white/90 transition-all"
              >
                Get Started Free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

/* ─────────── Hero ─────────── */
function Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center justify-center pt-28 pb-16 overflow-hidden bg-black">
      {/* Subtle depth gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950/50 to-black" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "38px 38px",
        }} />
        {/* Subtle ambient glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-[120px] animate-parallax-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/3 rounded-full blur-[100px] animate-float-delayed" />
      </div>

      <div className="mx-auto max-w-7xl px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Typography */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease }}
            className="text-center lg:text-left"
          >
            <h1 className="font-display text-[clamp(3.5rem,12vw,7rem)] font-black tracking-tighter leading-[0.9] text-white mb-6 text-balance">
              Master the
              <br className="hidden sm:block" /> Digital SAT
            </h1>

            <p className="text-lg md:text-xl font-medium text-white/40 max-w-xl mx-auto lg:mx-0 mb-10 text-balance leading-relaxed">
              The only platform that perfectly replicates the Bluebook interface
              with adaptive modules and instant AI feedback.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to="/auth"
                className="w-full sm:w-auto bg-white text-black px-9 py-4 rounded-full font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 group hover:bg-white/90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/10"
              >
                Start Practice Now
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto glass-button text-white px-9 py-4 rounded-full font-bold text-sm uppercase tracking-widest text-center"
              >
                See How It Works
              </a>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.9, ease }}
              className="mt-16 pt-8 border-t border-white/8 grid grid-cols-3 gap-6 max-w-sm mx-auto lg:mx-0"
            >
              {[
                { v: "25,000+", l: "Active Students" },
                { v: "+170 PTS", l: "Average Gain" },
                { v: "100%", l: "Digital Ready" },
              ].map((s) => (
                <div key={s.l} className="text-center">
                  <div className="text-3xl sm:text-4xl font-black tracking-tighter text-white mb-1">
                    {s.v}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
                    {s.l}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right side - Floating glass cards */}
          <div className="relative h-[500px] hidden lg:block">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease }}
              className="absolute top-0 right-0 w-72 glass-card-depth rounded-3xl p-6 animate-float"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                <Zap size={24} className="text-white" />
              </div>
              <h3 className="font-display text-lg font-black tracking-tight uppercase mb-2 text-white">
                Adaptive Practice
              </h3>
              <p className="text-sm text-white/40 leading-relaxed">
                Questions adjust to your level in real-time
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease }}
              className="absolute top-32 left-0 w-64 glass-card-depth rounded-3xl p-6 animate-float-delayed"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                <Monitor size={24} className="text-white" />
              </div>
              <h3 className="font-display text-lg font-black tracking-tight uppercase mb-2 text-white">
                Real Interface
              </h3>
              <p className="text-sm text-white/40 leading-relaxed">
                Exact Bluebook replication
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8, ease }}
              className="absolute bottom-0 right-20 w-80 glass-card-depth rounded-3xl p-6 animate-float"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                <BarChart3 size={24} className="text-white" />
              </div>
              <h3 className="font-display text-lg font-black tracking-tight uppercase mb-2 text-white">
                Instant Feedback
              </h3>
              <p className="text-sm text-white/40 leading-relaxed">
                AI-powered analysis of every mistake
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── About ─────────── */
function About() {
  return (
    <section id="about" className="py-28 border-t border-white/8 px-6 bg-black">
      <div className="mx-auto max-w-5xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease }}
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/30 mb-4">
              What is SATCOACH?
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tighter mb-8 leading-[1.05] text-white">
              AI-powered Digital SAT prep platform
            </h2>
            <p className="text-white/50 leading-relaxed mb-5 text-[15px]">
              SATCOACH is a full-stack web application that helps high school
              students prepare for the Digital SAT. Instead of buying expensive
              prep books or paying for tutors, students get an intelligent,
              adaptive practice environment that works exactly like the real exam
              — inside a browser.
            </p>
            <p className="text-white/50 leading-relaxed text-[15px]">
              The core idea: every time you take a practice test, the app learns
              what you're bad at, tells you immediately, and builds a study plan
              around it. The more you use it, the better it gets at pointing you
              toward what actually needs work.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease }}
            className="aspect-video rounded-[2rem] glass-card-depth flex items-center justify-center"
          >
            <div className="text-center px-8">
              <Brain size={48} className="mx-auto mb-4 text-white/20" />
              <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/40">
                Mirroring the 2024 Bluebook Experience
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── Problem ─────────── */
function Problem() {
  const problems = [
    "Official SAT practice tests are few and not adaptive",
    "Expensive tutors and courses aren't accessible to most students",
    "Static prep books don't give instant feedback or adapt to your level",
    "No free tool currently mirrors the 2024 Digital SAT's adaptive system",
  ];

  return (
    <section className="py-28 bg-white text-black px-6">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.35em] text-black/40 mb-4">
            The Problem It Solves
          </div>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-6 leading-[1.05]">
            Bridging the gap in SAT prep
          </h2>
          <p className="text-black/60 text-[15px] leading-relaxed">
            SATCOACH fills this gap with AI-generated, adaptive questions that
            match the real College Board blueprint — for free.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {problems.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease }}
              className="flex items-start gap-4 p-6 rounded-2xl bg-black/5 border border-black/10 hover:bg-black/10 transition-all"
            >
              <X size={18} className="text-black/30 mt-0.5 flex-shrink-0" />
              <p className="font-medium text-black/80 text-[14px] leading-relaxed">{p}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── Features ─────────── */
function Features() {
  const features = [
    {
      icon: <Zap size={22} />,
      title: "Adaptive Practice",
      desc: "Questions automatically adjust to your level, just like the real SAT module system.",
    },
    {
      icon: <Monitor size={22} />,
      title: "Real Test Interface",
      desc: "The workspace looks and feels exactly like the official Bluebook exam app.",
    },
    {
      icon: <Calculator size={22} />,
      title: "Built-in Calculator",
      desc: "Use the same Desmos Graphing Calculator tools allowed on test day.",
    },
    {
      icon: <BarChart3 size={22} />,
      title: "Instant Feedback",
      desc: "See your mistakes immediately and learn how to fix them for next time.",
    },
  ];

  return (
    <section id="features" className="py-28 px-6 border-t border-white/8 bg-black">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="max-w-2xl mb-16"
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/30 mb-4">
            Core Benefits
          </div>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-6 leading-[1.05] text-white">
            Everything you need to succeed
          </h2>
          <p className="text-white/50 text-[15px] leading-relaxed">
            Our platform is designed to mirror the real 2024 College Board
            Bluebook experience, providing a seamless transition from practice
            to test day.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease }}
              whileHover={{ y: -8 }}
              className="group p-7 rounded-3xl glass-card-depth cursor-default"
            >
              <div className="w-11 h-11 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                {f.icon}
              </div>
              <h3 className="font-display text-base font-black tracking-tight uppercase mb-3 text-white">
                {f.title}
              </h3>
              <p className="text-[13px] text-white/40 leading-relaxed font-medium">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── How It Works ─────────── */
function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Take a practice test",
      desc: "Start with a full or focused test to see where you stand.",
    },
    {
      n: "02",
      title: "Get your score instantly",
      desc: "No waiting. See your predicted SAT score immediately.",
    },
    {
      n: "03",
      title: "Improve weak areas",
      desc: "Our AI identifies exactly what you need to study next.",
    },
    {
      n: "04",
      title: "Repeat → increase score",
      desc: "Keep practicing and watch your predicted score climb.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-28 px-6 bg-white text-black"
    >
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.35em] text-black/40 mb-4">
            How It Works
          </div>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-6 leading-[1.05]">
            Four simple steps to a higher score
          </h2>
          <p className="text-black/60 text-[15px] leading-relaxed">
            Our intelligent system guides you through a continuous cycle of
            assessment and improvement.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease }}
              className="flex gap-7 group"
            >
              <div className="text-7xl font-black text-black/[0.06] tracking-tighter leading-none group-hover:text-black/10 transition-colors select-none">
                {s.n}
              </div>
              <div className="pt-1">
                <h3 className="font-display text-xl font-black tracking-tight uppercase mb-2 text-black">
                  {s.title}
                </h3>
                <p className="text-black/60 text-[14px] leading-relaxed font-medium">
                  {s.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── CTA ─────────── */
function CTA() {
  return (
    <section className="py-24 px-6 bg-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease }}
        className="mx-auto max-w-5xl glass-card-depth rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden"
      >
        {/* Decorative ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/3 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10">
          <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter mb-10 leading-[1.05] text-balance text-white">
            Start your journey
            <br className="hidden sm:block" /> to a 1400+ score
          </h2>
          <Link
            to="/auth"
            className="inline-flex bg-white text-black px-12 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white/90 hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-white/10"
          >
            Start Practice Free
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

/* ─────────── Footer ─────────── */
function Footer() {
  return (
    <footer className="py-16 px-6 border-t border-white/8 bg-black">
      <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-8">
        <span className="font-display font-black tracking-tighter text-xl uppercase text-white">
          SATCOACH
        </span>

        <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
          <a href="#" className="hover:text-white transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Terms
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Contact
          </a>
        </div>

        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">
          © 2024 Built for Student Success
        </div>
      </div>
    </footer>
  );
}

/* ─────────── Page ─────────── */
export default function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return (
      saved === "dark" ||
      (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  useEffect(() => {
    if (user && !loading) navigate("/dashboard");
  }, [user, loading, navigate]);

  // Sync theme toggle on landing page
  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  if (loading || user) return null;

  return (
    <div className="bg-black min-h-screen selection:bg-white selection:text-black">
      <LandingNav isDark={isDark} toggleTheme={toggleTheme} />
      <main>
        <Hero />
        <About />
        <Problem />
        <Features />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
