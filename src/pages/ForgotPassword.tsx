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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-accent">
          <Brain className="h-7 w-7 text-accent-foreground" />
        </div>
        {sent ? (
          <>
            <h1 className="font-display text-2xl font-bold text-foreground">Check your email</h1>
            <p className="mt-2 text-sm text-muted-foreground">We sent a password reset link to {email}</p>
            <Link to="/auth" className="mt-6 inline-block text-sm font-semibold text-accent hover:underline">
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold text-foreground">Reset password</h1>
            <p className="mt-2 text-sm text-muted-foreground">Enter your email to receive a reset link</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border bg-card py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl gradient-accent py-3 text-sm font-semibold text-accent-foreground disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
            <Link to="/auth" className="mt-4 inline-block text-sm text-muted-foreground hover:text-foreground">
              ← Back to sign in
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
