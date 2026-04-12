import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Mail } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const ease = [0.22, 1, 0.36, 1] as const;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 bg-black particle-bg">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease }} className="w-full max-w-md text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
          className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-white"
        >
          <Brain className="h-8 w-8" />
        </motion.div>
        {sent ? (
          <>
            <h1 className="font-display text-4xl font-black tracking-tighter uppercase gradient-text">Link Dispatched</h1>
            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">ACCESS PROTOCOL SENT TO: {email}</p>
            <Link to="/auth" className="mt-8 bg-white text-black px-8 py-3 inline-block text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white/90 glow-soft">
              Establish Connection
            </Link>
          </>
        ) : (
          <>
            <h1 className="font-display text-4xl font-black tracking-tighter uppercase gradient-text">Recover Key</h1>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Input email for reset vector transmission</p>
            <form onSubmit={handleSubmit} className="mt-12 space-y-6 text-left">
              <div className="relative">
                <Mail className="absolute left-4 top-4 h-5 w-5 text-white/40" />
                <input
                  type="email"
                  placeholder="EMAIL VECTOR"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest placeholder:text-white/30 text-white focus:bg-white/10 focus:border-white/20 outline-none transition-all rounded-xl"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black py-5 text-xs font-black uppercase tracking-[0.3em] rounded-xl hover:bg-white/90 glow-soft"
              >
                {loading ? "Transmitting..." : "Send Reset Vector"}
              </button>
            </form>
            <Link to="/auth" className="mt-8 inline-block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">
              ← Return to Access Terminal
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
