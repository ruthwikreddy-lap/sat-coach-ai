import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Send, User, Loader2, Command, Paperclip, X, Image as ImageIcon } from "lucide-react";
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
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImageBase64(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !imageBase64) || loading) return;

    const userMsg = input.trim();
    setInput("");

    // Create a display message that might include an image indicator if we wanted, 
    // but we can just show the text for now.
    const messageContent = userMsg || (imageBase64 ? "[Image Uploaded]" : "");
    const currentImage = imageBase64;
    setImageBase64(null); // Clear early for better UX

    setMessages(prev => [...prev, { role: "user", content: messageContent }]);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ask-ai-tutor", {
        body: {
          context: userMsg,
          question: "",
          options: [],
          correctAnswer: 0,
          userAnswer: null,
          imageBase64: currentImage
        },
      });

      if (error) throw error;
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
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
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border-4 border-foreground font-black uppercase bg-foreground text-background">
                    {m.role === "user" ? <User className="h-6 w-6" /> : <Brain className="h-6 w-6" />}
                  </div>
                  <div className={`relative border-4 border-foreground p-8 text-base font-medium ${m.role === "user"
                    ? "bg-foreground text-background uppercase tracking-tight"
                    : "bg-background text-foreground"
                    }`}>
                    <div className={`prose prose-sm max-w-none ${m.role === "user" ? "prose-invert" : ""}`}>
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="flex items-center gap-4 border-4 border-foreground bg-foreground px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-background">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  THINKING...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="relative mt-10">
        {imageBase64 && (
          <div className="absolute -top-16 left-0 right-0 flex items-center justify-between border-4 border-foreground bg-background px-4 py-2">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-widest text-foreground">Image Attached</span>
            </div>
            <button
              onClick={() => setImageBase64(null)}
              className="hover:bg-foreground hover:text-background p-1 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="flex gap-4">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex h-20 w-20 shrink-0 items-center justify-center border-4 border-foreground bg-background text-foreground hover:bg-foreground hover:text-background transition-all"
          >
            <Paperclip className="h-8 w-8" />
          </button>
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="TYPE YOUR QUESTION OR UPLOAD AN IMAGE..."
              className="w-full h-20 border-4 border-foreground bg-background px-8 py-4 text-base font-black uppercase tracking-tight text-foreground placeholder:text-foreground placeholder:opacity-30 outline-none focus:bg-foreground focus:text-background transition-all"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-3">
              <Command className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">ENTER</span>
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={loading || (!input.trim() && !imageBase64)}
            className="flex h-20 w-20 shrink-0 items-center justify-center border-4 border-foreground bg-foreground text-background hover:bg-background hover:text-foreground transition-all disabled:opacity-20"
          >
            <Send className="h-8 w-8" />
          </button>
        </div>
      </div>
    </div>
  );
}