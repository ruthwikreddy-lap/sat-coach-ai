// Digital SAT question types and configuration

export interface SATQuestion {
  id: string;
  section: "reading-writing" | "math";
  module: 1 | 2;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  type: "mcq" | "grid-in";
  passage?: string; // Short for R&W (25-150 words), optional for Math.
  question: string;
  options: string[]; // empty for grid-in
  correctAnswer: number | string; // index (0-3) for MCQs, or the string answer for grid-in
  explanation: string;
}

export interface TestResult {
  date: string;
  score: number;
  readingScore: number;
  mathScore: number;
  weakTopics: string[];
  timeSpent: number; // minutes
}

export interface TopicPerformance {
  topic: string;
  section: string;
  accuracy: number;
  questionsAttempted: number;
  trend: "up" | "down" | "stable";
}

// Clear mock questions as requested, will use OpenAI API
export const mockQuestions: SATQuestion[] = [];
