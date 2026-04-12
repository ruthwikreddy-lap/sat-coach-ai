import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const ease = [0.22, 1, 0.36, 1] as const;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      navigate("/auth");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated!");
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 bg-black particle-bg">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease }} className="w-full max-w-md">
        <div className="glass-card-depth rounded-3xl p-12 border-glow text-center">
          <h1 className="font-display text-4xl font-black tracking-tighter uppercase gradient-text">New Access Key</h1>
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Define your new authentication sequence</p>
          <form onSubmit={handleSubmit} className="mt-12 space-y-6 text-left">
            <div className="relative">
              <Lock className="absolute left-4 top-4 h-5 w-5 text-white/40" />
              <input
                type="password"
                placeholder="NEW ACCESS KEY"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest placeholder:text-white/30 text-white focus:bg-white/10 focus:border-white/20 outline-none transition-all rounded-xl"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-5 text-xs font-black uppercase tracking-[0.3em] rounded-xl hover:bg-white/90 glow-soft"
            >
              {loading ? "Calibrating..." : "Finalize Key Rotation"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
