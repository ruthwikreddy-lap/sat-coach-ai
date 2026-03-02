import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-center border-8 border-white p-20 bg-black">
        <h1 className="mb-6 text-8xl font-black uppercase tracking-tighter text-white">404</h1>
        <p className="mb-8 text-xs font-black uppercase tracking-[0.4em] text-white">COORDINATES NOT FOUND IN MATRIX</p>
        <a href="/" className="inline-block border-4 border-white bg-white px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-black hover:bg-black hover:text-white transition-all">
          RETURN TO HOME
        </a>
      </div>
    </div>
  );
};

export default NotFound;
