import { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Monitor,
  Zap,
  Calculator,
  BarChart3,
  Sparkles,
  Brain,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", damping: 15 } },
};

/* ───────────── Hero ───────────── */
function Hero() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-40">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.04)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto max-w-5xl px-6 lg:px-8 text-center"
      >
        <motion.div variants={item} className="mb-8 flex justify-center">
          <span className="inline-flex items-center gap-2 border border-foreground/20 bg-foreground/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/70 rounded-full">
            <Sparkles className="h-3.5 w-3.5" /> Updated for 2024 Digital SAT
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          className="font-display text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-foreground mb-8"
        >
          Master the <br className="hidden sm:block" /> Digital SAT
        </motion.h1>

        <motion.p
          variants={item}
          className="mx-auto max-w-2xl text-lg sm:text-xl font-medium text-foreground/50 mb-12 text-balance"
        >
          The only platform that perfectly replicates the Bluebook interface with
          adaptive modules and instant AI feedback.
        </motion.p>

        <motion.div
          variants={item}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/auth"
            className="w-full sm:w-auto bg-foreground text-background px-10 py-4 text-sm font-bold uppercase tracking-widest transition-all hover:opacity-90 flex items-center justify-center gap-3 group rounded-lg"
          >
            Start Practice Now
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto border-2 border-foreground/20 text-foreground px-10 py-4 text-sm font-bold uppercase tracking-widest transition-all hover:border-foreground/40 text-center rounded-lg"
          >
            See the Interface
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={item}
          className="mt-20 grid grid-cols-3 gap-8 mx-auto max-w-lg"
        >
          {[
            { value: "25,000+", label: "Active Students" },
            { value: "+170 PTS", label: "Average Gain" },
            { value: "100%", label: "Digital Ready" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                {s.value}
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-foreground/40 mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ───────────── About ───────────── */
function About() {
  return (
    <section id="about" className="py-24 px-6 border-t border-foreground/10">
      <div className="mx-auto max-w-5xl">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40 mb-3">
              About
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tighter mb-6">
              What is SATCOACH?
            </h2>
            <p className="text-sm font-semibold uppercase tracking-widest text-foreground/50 mb-6">
              AI-powered Digital SAT prep platform
            </p>
            <p className="text-foreground/60 leading-relaxed mb-4">
              SATCOACH is a full-stack web application that helps high school
              students prepare for the Digital SAT. Instead of buying expensive
              prep books or paying for tutors, students get an intelligent,
              adaptive practice environment that works exactly like the real exam
              — inside a browser.
            </p>
            <p className="text-foreground/60 leading-relaxed">
              The core idea: every time you take a practice test, the app learns
              what you're bad at, tells you immediately, and builds a study plan
              around it. The more you use it, the better it gets at pointing you
              toward what actually needs work.
            </p>
          </div>
          <div className="border border-foreground/10 rounded-2xl p-8 bg-foreground/[0.02]">
            <div className="flex items-center gap-3 mb-4">
              <Monitor className="h-5 w-5 text-foreground/60" />
              <span className="text-sm font-semibold text-foreground/60">
                Mirroring the 2024 Bluebook Experience
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────── Problem ───────────── */
function Problem() {
  const problems = [
    "Official SAT practice tests are few and not adaptive",
    "Expensive tutors and courses aren't accessible to most students",
    "Static prep books don't give instant feedback or adapt to your level",
    "No free tool currently mirrors the 2024 Digital SAT's adaptive system",
  ];

  return (
    <section className="py-24 px-6 border-t border-foreground/10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 max-w-xl">
          <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40 mb-3">
            The Problem It Solves
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tighter mb-4">
            Bridging the gap in SAT prep
          </h2>
          <p className="text-foreground/60 leading-relaxed">
            SATCOACH fills the gap with AI-generated, adaptive questions that
            match the real College Board blueprint — for free.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {problems.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-4 border border-foreground/10 rounded-xl p-6 hover:bg-foreground/[0.02] transition-colors"
            >
              <div className="mt-0.5 h-6 w-6 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-foreground/60">
                  {i + 1}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground/70">{p}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────── Features ───────────── */
function Features() {
  const features = [
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Adaptive Practice",
      desc: "Questions automatically adjust to your level, just like the real SAT module system.",
    },
    {
      icon: <Monitor className="h-5 w-5" />,
      title: "Real Test Interface",
      desc: "The workspace looks and feels exactly like the official Bluebook exam app.",
    },
    {
      icon: <Calculator className="h-5 w-5" />,
      title: "Built-in Calculator",
      desc: "Use the same Desmos Graphing Calculator tools allowed on test day.",
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Instant Feedback",
      desc: "See your mistakes immediately and learn how to fix them for next time.",
    },
  ];

  return (
    <section id="features" className="py-24 px-6 border-t border-foreground/10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40 mb-3">
            Core Benefits
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tighter mb-4">
            Everything you need to succeed
          </h2>
          <p className="text-foreground/50 max-w-xl mx-auto">
            Our platform is designed to mirror the real 2024 College Board
            Bluebook experience.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group border border-foreground/10 rounded-2xl p-6 hover:border-foreground/30 transition-colors"
            >
              <div className="h-10 w-10 rounded-xl bg-foreground/10 flex items-center justify-center mb-5 group-hover:bg-foreground group-hover:text-background transition-colors">
                {f.icon}
              </div>
              <h3 className="font-display text-lg font-bold tracking-tight mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-foreground/50 leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────── How It Works ───────────── */
function HowItWorks() {
  const steps = [
    { n: "01", title: "Take a practice test", desc: "Start with a full or focused test to see where you stand." },
    { n: "02", title: "Get your score instantly", desc: "No waiting. See your predicted SAT score immediately." },
    { n: "03", title: "Improve weak areas", desc: "Our AI identifies exactly what you need to study next." },
    { n: "04", title: "Repeat → increase score", desc: "Keep practicing and watch your predicted score climb." },
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 bg-foreground text-background">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tighter mb-4">
            How it works
          </h2>
          <p className="text-background/50 text-sm uppercase tracking-widest">
            Four simple steps to a higher score
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="border border-background/10 rounded-2xl p-6"
            >
              <div className="text-4xl font-black text-background/10 mb-4">
                {s.n}
              </div>
              <h3 className="font-display text-lg font-bold tracking-tight mb-2">
                {s.title}
              </h3>
              <p className="text-sm text-background/50 leading-relaxed">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────── Tech Stack ───────────── */
function TechStack() {
  const tech = [
    { label: "Frontend", value: "React 18 + TypeScript + Vite" },
    { label: "Styling", value: "Tailwind CSS + Radix UI" },
    { label: "Animations", value: "Framer Motion" },
    { label: "Backend", value: "Lovable Cloud" },
    { label: "AI Engine", value: "Edge Functions + Gemini" },
    { label: "State", value: "TanStack React Query" },
  ];

  return (
    <section className="py-24 px-6 border-t border-foreground/10">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tighter mb-12">
          Modern Tech Stack
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {tech.map((t) => (
            <div
              key={t.label}
              className="border border-foreground/10 rounded-xl p-4 text-left"
            >
              <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">
                {t.label}
              </div>
              <div className="text-sm font-semibold text-foreground/80">
                {t.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────── CTA ───────────── */
function CTASection() {
  return (
    <section className="py-32 px-6">
      <div className="mx-auto max-w-3xl text-center relative">
        <h2 className="font-display text-4xl sm:text-6xl font-black tracking-tighter mb-8">
          Start your journey <br /> to a 1400+ score
        </h2>
        <Link
          to="/auth"
          className="inline-flex bg-foreground text-background px-14 py-5 text-sm font-bold uppercase tracking-widest transition-all hover:opacity-90 rounded-lg"
        >
          Start Practice
        </Link>
      </div>
    </section>
  );
}

/* ───────────── Main ───────────── */
export default function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading || user) return null;

  return (
    <div className="bg-background min-h-screen selection:bg-foreground selection:text-background">
      <Hero />
      <About />
      <Problem />
      <Features />
      <HowItWorks />
      <TechStack />
      <CTASection />

      <footer className="border-t border-foreground/10 py-12 px-6">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-foreground" />
            <span className="font-display text-lg font-black tracking-tighter uppercase">
              SATCOACH
            </span>
          </div>
          <div className="flex gap-6 text-xs font-medium text-foreground/40">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Contact</span>
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-foreground/30">
            © 2024 Built for Student Success
          </div>
        </div>
      </footer>
    </div>
  );
}
