import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Brain, ArrowRight, Shield, Target, Zap, CheckCircle2, Globe, Users, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

import { Variants } from "framer-motion";

const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const item: Variants = {
    hidden: { opacity: 0, y: 30 },
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
        <div className="bg-background min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden border-b-8 border-foreground py-24 sm:py-32">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center"
                >
                    <motion.div variants={item} className="mb-8 flex justify-center">
                        <div className="bg-foreground text-background px-6 py-2 text-[10px] font-black uppercase tracking-[0.4em]">
                            Next-Generation SAT Intelligence
                        </div>
                    </motion.div>

                    <motion.h1
                        variants={item}
                        className="font-display text-7xl sm:text-9xl font-black uppercase tracking-tighter leading-[0.85] text-foreground mb-8"
                    >
                        MASTER<br /> THE MATRIX
                    </motion.h1>

                    <motion.p
                        variants={item}
                        className="mx-auto max-w-2xl text-lg sm:text-xl font-medium text-foreground/60 mb-12"
                    >
                        The only SAT platform powered by Neural Adaptive Logic. Mirroring the 2024 Bluebook experience with pinpoint precision.
                    </motion.p>

                    <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link
                            to="/auth"
                            className="w-full sm:w-auto bg-foreground text-background border-4 border-foreground hover:bg-background hover:text-foreground px-12 py-6 text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 group"
                        >
                            GET STARTED <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a
                            href="#features"
                            className="w-full sm:w-auto bg-background text-foreground border-4 border-foreground hover:invert px-12 py-6 text-sm font-black uppercase tracking-widest transition-all"
                        >
                            VIEW CORE PROTOCOLS
                        </a>
                    </motion.div>
                </motion.div>
            </section>

            {/* Stats Row */}
            <section className="bg-foreground text-background py-12 px-6 overflow-hidden">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { label: "Elite Members", value: "25K+", icon: Users },
                            { label: "Average Gain", value: "+170", icon: Trophy },
                            { label: "Global Reach", value: "140+", icon: Globe },
                            { label: "Neural Speed", value: "0.2ms", icon: Zap },
                        ].map((stat) => (
                            <div key={stat.label} className="flex flex-col items-center text-center gap-2">
                                <stat.icon className="h-5 w-5 opacity-30" />
                                <div className="text-3xl font-black">{stat.value}</div>
                                <div className="text-[10px] font-black uppercase tracking-widest opacity-40">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 px-6 bg-background">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-20 space-y-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40">Core Systems</div>
                        <h2 className="font-display text-5xl sm:text-7xl font-black uppercase tracking-tighter">ENGINEERED FOR EXCELLENCE</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Adaptive Neural Logic",
                                desc: "Our engine uses real performance data to calibrate your Module 2 difficulty with 100% test-day accuracy.",
                                icon: Brain
                            },
                            {
                                title: "Bluebook Parity",
                                desc: "The exact interface, navigation, and timing systems you will encounter in the official Digital SAT exam.",
                                icon: Target
                            },
                            {
                                title: "Non-CAS Desmos",
                                desc: "Fully integrated, moveable, and resizable Desmos calculator following all College Board safety standards.",
                                icon: zap
                            },
                            {
                                title: "Distraction Lockdown",
                                desc: "Our Focus Guard system detects tab switching and monitors attention during proctored sessions.",
                                icon: Shield
                            },
                            {
                                title: "Blueprint Weighting",
                                desc: "Questions generated strictly following the official domain percentages (e.g. 35% Algebra).",
                                icon: CheckCircle2
                            },
                            {
                                title: "Real-Time Tracking",
                                desc: "Instant analytics showing your weak topics, sessions history, and target score trajectory.",
                                icon: BarChart3
                            }
                        ].map((feat) => (
                            <div key={feat.title} className="border-8 border-foreground p-8 hover:bg-foreground hover:text-background transition-colors group">
                                <div className="bg-foreground text-background group-hover:bg-background group-hover:text-foreground w-12 h-12 flex items-center justify-center mb-8 transition-colors">
                                    <feat.icon className="h-6 w-6" />
                                </div>
                                <h3 className="font-display text-2xl font-black uppercase tracking-tight mb-4">{feat.title}</h3>
                                <p className="text-sm font-medium leading-relaxed opacity-60 group-hover:opacity-100">
                                    {feat.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-foreground py-32 px-6">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="font-display text-5xl sm:text-7xl font-black uppercase tracking-tighter text-background mb-12">
                        READY TO BREAK THE LIMIT?
                    </h2>
                    <Link
                        to="/auth"
                        className="inline-flex bg-background text-foreground border-4 border-background hover:invert px-16 py-8 text-lg font-black uppercase tracking-widest transition-all group"
                    >
                        INITIALIZE CONNECTION <Zap className="ml-4 h-6 w-6 group-hover:scale-110 transition-transform" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t-8 border-foreground py-16 px-6">
                <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center bg-foreground text-background">
                            <Brain className="h-8 w-8" />
                        </div>
                        <span className="font-display text-3xl font-black tracking-tighter text-foreground uppercase">
                            SATCOACH
                        </span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-foreground/40">
                        <a href="#" className="hover:text-foreground transition-colors">Security Proto</a>
                        <a href="#" className="hover:text-foreground transition-colors">API Keys</a>
                        <a href="#" className="hover:text-foreground transition-colors">Legal Override</a>
                        <a href="#" className="hover:text-foreground transition-colors">System Status</a>
                    </div>

                    <div className="text-[10px] font-black uppercase tracking-widest text-foreground/20">
                        © 2024 NEURAL INTERFACE LABS
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Fixed Lucide icons for mapping
const zap = Zap;
const BarChart3 = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" />
    </svg>
);
