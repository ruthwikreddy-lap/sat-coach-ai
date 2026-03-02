import { useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Brain, ArrowRight, Shield, Target, Zap, CheckCircle2, Trophy, Clock, Search, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", damping: 15 } },
};

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
        <div className="bg-background min-h-screen font-sans selection:bg-foreground selection:text-background">
            {/* Hero Section */}
            <section className="relative overflow-hidden border-b-8 border-foreground py-20 lg:py-32">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="relative mx-auto max-w-5xl px-6 lg:px-8 text-center"
                >
                    <motion.div variants={item} className="mb-6 flex justify-center">
                        <div className="bg-foreground text-background px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] rounded-sm">
                            Updated for 2024 Digital SAT
                        </div>
                    </motion.div>

                    <motion.h1
                        variants={item}
                        className="font-display text-5xl sm:text-8xl font-black uppercase tracking-tighter leading-[0.9] text-foreground mb-8"
                    >
                        Get a 1400+ on the SAT<br className="hidden sm:block" /> with real practice
                    </motion.h1>

                    <motion.p
                        variants={item}
                        className="mx-auto max-w-2xl text-lg sm:text-xl font-medium text-foreground/60 mb-12"
                    >
                        Practice with adaptive modules, real Bluebook-style interface, and instant feedback to improve your score fast.
                    </motion.p>

                    <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/auth"
                            className="w-full sm:w-auto bg-foreground text-background border-4 border-foreground hover:bg-background hover:text-foreground px-10 py-5 text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 group"
                        >
                            Start Free Practice <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a
                            href="#how-it-works"
                            className="w-full sm:w-auto bg-background text-foreground border-4 border-foreground hover:bg-foreground hover:text-background px-10 py-5 text-sm font-black uppercase tracking-widest transition-all text-center"
                        >
                            See How It Works
                        </a>
                    </motion.div>
                </motion.div>
            </section>

            {/* Proof Section */}
            <section className="bg-foreground text-background py-16 px-6">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8">
                        {[
                            { label: "Students Practicing", value: "25,000+", icon: Trophy },
                            { label: "Avg Score Gain", value: "+170 points", icon: BarChart3 },
                            { label: "Digital Format", value: "2024 Ready", icon: Clock },
                        ].map((stat) => (
                            <div key={stat.label} className="flex flex-col items-center text-center gap-3">
                                <div className="text-4xl font-black tracking-tighter underline decoration-4 decoration-background/20 underline-offset-8">{stat.value}</div>
                                <div className="text-[11px] font-black uppercase tracking-widest opacity-60 italic">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 px-6">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-20">
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40 mb-4">Core Benefits</div>
                        <h2 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-tighter">Everything you need to succeed</h2>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                title: "Adaptive Practice",
                                desc: "Questions automatically adjust to your level, just like the real SAT module system.",
                                icon: Zap
                            },
                            {
                                title: "Real Test Interface",
                                desc: "The workspace looks and feels exactly like the official Bluebook exam app.",
                                icon: Target
                            },
                            {
                                title: "Built-in Calculator",
                                desc: "Use the same Desmos Graphing Calculator tools allowed on test day.",
                                icon: Search
                            },
                            {
                                title: "Instant Feedback",
                                desc: "See your mistakes immediately and learn how to fix them for next time.",
                                icon: Brain
                            }
                        ].map((feat) => (
                            <div key={feat.title} className="border-4 border-foreground p-8 hover:bg-foreground/5 transition-colors group relative overflow-hidden">
                                <div className="bg-foreground text-background w-10 h-10 flex items-center justify-center mb-6">
                                    <feat.icon className="h-5 w-5" />
                                </div>
                                <h3 className="font-display text-xl font-black uppercase tracking-tight mb-3">{feat.title}</h3>
                                <p className="text-sm font-medium leading-relaxed text-foreground/60">
                                    {feat.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-24 px-6 bg-foreground text-background border-y-8 border-foreground">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-20 text-center">
                        <h2 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-tighter">How it works</h2>
                        <p className="mt-6 text-background/60 font-medium uppercase text-xs tracking-[0.2em]">Four simple steps to a higher score</p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { step: "1", title: "Take a practice test", desc: "Start with a full or focused test to see where you stand." },
                            { step: "2", title: "Get your score instantly", desc: "No waiting. See your predicted SAT score immediately." },
                            { step: "3", title: "Improve weak areas", desc: "Our AI identifies exactly what you need to study next." },
                            { step: "4", title: "Repeat → increase score", desc: "Keep practicing and watch your predicted score climb." }
                        ].map((step, idx) => (
                            <div key={idx} className="relative p-6 border-2 border-background/20 rounded-lg">
                                <div className="text-6xl font-black text-background/10 absolute -top-4 -left-2 select-none">{step.step}</div>
                                <h3 className="relative font-display text-xl font-black uppercase tracking-tight mb-3 z-10">{step.title}</h3>
                                <p className="relative text-sm font-medium text-background/60 z-10">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 px-6 text-center">
                <div className="mx-auto max-w-3xl">
                    <h2 className="font-display text-4xl sm:text-7xl font-black uppercase tracking-tighter mb-12">
                        Start your first SAT practice test now
                    </h2>
                    <Link
                        to="/auth"
                        className="inline-flex bg-foreground text-background border-4 border-foreground hover:bg-background hover:text-foreground px-16 py-7 text-lg font-black uppercase tracking-widest transition-all group"
                    >
                        Start Practice <Zap className="ml-3 h-5 w-5 fill-current group-hover:scale-110 transition-transform" />
                    </Link>
                </div>
            </section>

            {/* Simple Footer */}
            <footer className="border-t-4 border-foreground py-12 px-6">
                <div className="mx-auto max-w-7xl flex flex-col sm:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <Brain className="h-6 w-6 text-foreground" />
                        <span className="font-display text-xl font-black tracking-tighter uppercase">SATCOACH</span>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                        &copy; 2024 Built for Student Success
                    </div>
                </div>
            </footer>
        </div>
    );
}
