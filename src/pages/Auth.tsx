import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/dashboard");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;

        if (data.session) {
          navigate("/dashboard");
          toast.success("Account created and signed in!");
        } else {
          toast.success("Account created! You can now sign in.");
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 bg-black particle-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease }}
        className="w-full max-w-md"
      >
        <div className="glass-card-depth rounded-3xl p-8 md:p-12">
          <div className="mb-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-white"
            >
              <Brain className="h-8 w-8" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="font-display text-4xl font-black tracking-tighter uppercase gradient-text"
            >
              {isLogin ? "Sign In" : "Create Account"}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/40"
            >
              {isLogin ? "Welcome back to SATCOACH" : "Start your journey to a higher score"}
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="relative"
              >
                <User className="absolute left-4 top-4 h-5 w-5 text-white/40" />
                <input
                  type="text"
                  placeholder="YOUR FULL NAME"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className="w-full border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest placeholder:text-white/30 text-white focus:bg-white/10 focus:border-white/20 outline-none transition-all rounded-xl"
                />
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55, duration: 0.4 }}
              className="relative"
            >
              <Mail className="absolute left-4 top-4 h-5 w-5 text-white/40" />
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest placeholder:text-white/30 text-white focus:bg-white/10 focus:border-white/20 outline-none transition-all rounded-xl"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="relative"
            >
              <Lock className="absolute left-4 top-4 h-5 w-5 text-white/40" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full border border-white/10 bg-white/5 py-4 pl-12 pr-12 text-[10px] font-black uppercase tracking-widest placeholder:text-white/30 text-white focus:bg-white/10 focus:border-white/20 outline-none transition-all rounded-xl"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-white/40 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </motion.div>

            {isLogin && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65, duration: 0.4 }}
                className="text-right"
              >
                <Link to="/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                  Forgot password?
                </Link>
              </motion.div>
            )}

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-5 text-xs font-black uppercase tracking-[0.3em] hover:bg-white/90 hover:scale-105 active:scale-95 transition-all rounded-xl shadow-lg shadow-white/10 glow-soft"
            >
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
            </motion.button>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.4 }}
            className="mt-8 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white/40"
          >
            {isLogin ? "Need an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-white hover:text-white/80 transition-colors"
            >
              {isLogin ? "Create one here" : "Sign in here"}
            </button>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
