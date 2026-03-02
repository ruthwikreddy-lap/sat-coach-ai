import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

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
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-12 text-center border-b-4 border-foreground pb-8">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border-4 border-foreground bg-foreground text-background">
            <Brain className="h-8 w-8" />
          </div>
          <h1 className="font-display text-4xl font-black tracking-tighter uppercase text-foreground">
            {isLogin ? "Sign In" : "Create Account"}
          </h1>
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em]">
            {isLogin ? "Welcome back to SATCOACH" : "Start your journey to a higher score"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-4 h-5 w-5" />
              <input
                type="text"
                placeholder="YOUR FULL NAME"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
                className="w-full border-4 border-foreground bg-background py-4 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest placeholder:text-foreground focus:bg-foreground focus:text-background outline-none transition-colors"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-4 h-5 w-5" />
            <input
              type="email"
              placeholder="EMAIL ADDRESS"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border-4 border-foreground bg-background py-4 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest placeholder:text-foreground focus:bg-foreground focus:text-background outline-none transition-colors"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 h-5 w-5" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border-4 border-foreground bg-background py-4 pl-12 pr-12 text-[10px] font-black uppercase tracking-widest placeholder:text-foreground focus:bg-foreground focus:text-background outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {isLogin && (
            <div className="text-right">
              <Link to="/forgot-password" title="Forgot password?" className="text-[10px] font-black uppercase tracking-widest border-b-2 border-foreground hover:bg-foreground hover:text-background transition-colors">
                Forgot password?
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full border-4 border-foreground bg-foreground py-5 text-xs font-black uppercase tracking-[0.3em] text-background hover:bg-background hover:text-foreground transition-all"
          >
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] font-black uppercase tracking-[0.2em]">
          {isLogin ? "Need an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="border-b-2 border-foreground hover:bg-foreground hover:text-background transition-colors"
          >
            {isLogin ? "Create one here" : "Sign in here"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
