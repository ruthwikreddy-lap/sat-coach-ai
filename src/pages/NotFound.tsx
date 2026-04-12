import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black particle-bg">
      <div className="glass-card-depth rounded-3xl p-20 text-center border-glow">
        <h1 className="mb-6 text-8xl font-black uppercase tracking-tighter gradient-text">404</h1>
        <p className="mb-8 text-xs font-black uppercase tracking-[0.4em] text-white/40">COORDINATES NOT FOUND IN MATRIX</p>
        <a href="/" className="inline-block bg-white text-black px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] rounded-xl hover:bg-white/90 glow-soft">
          RETURN TO HOME
        </a>
      </div>
    </div>
  );
};

export default NotFound;
