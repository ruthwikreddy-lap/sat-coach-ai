import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 bg-background">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md text-center border-4 border-foreground p-12 bg-background">
        <h1 className="font-display text-4xl font-black tracking-tighter uppercase text-foreground">New Access Key</h1>
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em]">Define your new authentication sequence</p>
        <form onSubmit={handleSubmit} className="mt-12 space-y-6 text-left">
          <div className="relative">
            <Lock className="absolute left-4 top-4 h-5 w-5" />
            <input
              type="password"
              placeholder="NEW ACCESS KEY"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border-4 border-foreground bg-background py-4 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest placeholder:text-foreground focus:bg-foreground focus:text-background outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full border-4 border-foreground bg-foreground py-5 text-xs font-black uppercase tracking-[0.3em] text-background hover:bg-background hover:text-foreground transition-all"
          >
            {loading ? "Calibrating..." : "Finalize Key Rotation"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
