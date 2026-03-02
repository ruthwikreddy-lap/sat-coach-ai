import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Mail } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

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
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md text-center">
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center border-4 border-foreground bg-foreground text-background">
          <Brain className="h-8 w-8" />
        </div>
        {sent ? (
          <>
            <h1 className="font-display text-4xl font-black tracking-tighter uppercase text-foreground">Link Dispatched</h1>
            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em]">ACCESS PROTOCOL SENT TO: {email}</p>
            <Link to="/auth" className="mt-8 border-4 border-foreground px-8 py-3 inline-block text-[10px] font-black uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors">
              Establish Connection
            </Link>
          </>
        ) : (
          <>
            <h1 className="font-display text-4xl font-black tracking-tighter uppercase text-foreground">Recover Key</h1>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em]">Input email for reset vector transmission</p>
            <form onSubmit={handleSubmit} className="mt-12 space-y-6 text-left">
              <div className="relative">
                <Mail className="absolute left-4 top-4 h-5 w-5" />
                <input
                  type="email"
                  placeholder="EMAIL VECTOR"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border-4 border-foreground bg-background py-4 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest placeholder:text-foreground focus:bg-foreground focus:text-background outline-none transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full border-4 border-foreground bg-foreground py-5 text-xs font-black uppercase tracking-[0.3em] text-background hover:bg-background hover:text-foreground transition-all"
              >
                {loading ? "Transmitting..." : "Send Reset Vector"}
              </button>
            </form>
            <Link to="/auth" className="mt-8 inline-block text-[10px] font-black uppercase tracking-[0.2em] border-b-2 border-foreground hover:bg-foreground hover:text-background transition-colors">
              ← Return to Access Terminal
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
