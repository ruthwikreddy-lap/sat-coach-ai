import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Index from "./pages/Index";
import PracticeTest from "./pages/PracticeTest";
import StudyPlan from "./pages/StudyPlan";
import WeakAreas from "./pages/WeakAreas";
import Analytics from "./pages/Analytics";
import FocusTest from "./pages/FocusTest";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/practice" element={<PracticeTest />} />
          <Route path="/study-plan" element={<StudyPlan />} />
          <Route path="/weak-areas" element={<WeakAreas />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/focus-test" element={<FocusTest />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
