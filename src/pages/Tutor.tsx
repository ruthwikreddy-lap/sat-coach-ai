import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Send, User, Loader2, Sparkles, Command } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function Tutor() {
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hi! I'm your SAT Tutor. How can I help you study today?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setLoading(true);

        const localKey = import.meta.env.VITE_OPENAI_API_KEY;

        try {
            if (localKey) {
                const response = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${localKey}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: "gpt-4o",
                        messages: [
                            {
                                role: "system",
                                content: `You are an elite SAT Strategist. Maintain a professional, concise, and academic tone. 
                                - Use **bold** for critical concepts.
                                - Use bullet points (•) for structural breakdowns.
                                - Use numbered lists for sequential logic.
                                - Aim for maximum clarity and precision.`
                            },
                            { role: "user", content: userMsg },
                        ],
                    }),
                });

                if (!response.ok) throw new Error("API Error");
                const data = await response.json();
                setMessages(prev => [...prev, { role: "assistant", content: data.choices[0].message.content }]);
            } else {
                const { data, error } = await supabase.functions.invoke("ask-ai-tutor", {
                    body: {
                        context: userMsg,
                        question: "Question",
                        options: [],
                        correctAnswer: 0,
                        userAnswer: null
                    },
                });

                if (error) throw error;
                setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
            }
        } catch (e: any) {
            console.error(e);
            toast.error("Connection lost. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto flex h-[calc(100vh-5.5rem)] max-w-5xl flex-col px-6 py-10">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-12 flex items-center justify-between border-b-4 border-foreground pb-8"
            >
                <div className="flex items-center gap-6">
                    <div className="flex h-16 w-16 items-center justify-center border-4 border-foreground bg-foreground text-background">
                        <Brain className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="font-display text-4xl font-black tracking-tighter text-foreground uppercase">AI Tutor</h1>
                        <div className="flex items-center gap-3">
                            <div className="h-3 w-3 bg-foreground animate-pulse" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Ready</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Chat area */}
            <div className="flex-1 overflow-hidden border-4 border-foreground bg-background">
                <div
                    ref={scrollRef}
                    className="h-full overflow-y-auto overflow-x-hidden p-10 scroll-smooth flex flex-col gap-10"
                >
                    <AnimatePresence>
                        {messages.map((m, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: m.role === "user" ? 20 : -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div className={`flex max-w-[85%] gap-6 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center border-4 border-foreground font-black uppercase bg-foreground text-background shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]`}>
                                        {m.role === "user" ? <User className="h-6 w-6" /> : <Brain className="h-6 w-6" />}
                                    </div>
                                    <div className={`relative border-4 border-foreground p-8 text-base font-medium ${m.role === "user"
                                        ? "bg-foreground text-background uppercase tracking-tight shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]"
                                        : "bg-background text-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]"
                                        }`}>
                                        <div className={`prose prose-sm max-w-none ${m.role === "user" ? "prose-invert" : ""}`}>
                                            <ReactMarkdown>{m.content}</ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-start"
                            >
                                <div className="flex items-center gap-4 border-4 border-foreground bg-foreground px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-background">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    THINKING...
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Input area */}
            <div className="relative mt-10">
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="TYPE YOUR QUESTION HERE..."
                            className="w-full h-20 border-4 border-foreground bg-background px-8 py-4 text-base font-black uppercase tracking-tight text-foreground placeholder:text-foreground placeholder:opacity-30 outline-none focus:bg-foreground focus:text-background transition-all"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3 hidden md:flex">
                            <Command className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">ENTER</span>
                        </div>
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="flex h-20 w-20 shrink-0 items-center justify-center border-4 border-foreground bg-foreground text-background hover:bg-background hover:text-foreground transition-all disabled:opacity-20"
                    >
                        <Send className="h-8 w-8" />
                    </button>
                </div>
            </div>
        </div>
    );
}

