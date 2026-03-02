// Mock SAT question data and types

export interface SATQuestion {
  id: string;
  section: "reading-writing" | "math";
  module: 1 | 2;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  passage?: string;
  question: string;
  options: string[];
  correctAnswer: number;
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

export const mockQuestions: SATQuestion[] = [
  // READING & WRITING - MODULE 1 (Baseline)
  {
    id: "rw1-1",
    section: "reading-writing",
    module: 1,
    topic: "Vocabulary in Context",
    difficulty: "medium",
    question: "The researchers encountered a precarious situation when the support beams began to creak. As used in the context, 'precarious' most nearly means:",
    options: ["Certain", "Stable", "Uncertain", "Harmless"],
    correctAnswer: 2,
    explanation: "The context describes a situation that could easily fail or is unstable.",
  },
  {
    id: "rw1-2",
    section: "reading-writing",
    module: 1,
    topic: "Main Idea",
    difficulty: "easy",
    question: "Which best describes the primary purpose of a thesis statement in an essay?",
    options: ["To provide background", "To state the main argument", "To summarize the conclusion", "To list evidence"],
    correctAnswer: 1,
    explanation: "A thesis statement presents the main argument or claim.",
  },
  // MATH - MODULE 1 (Baseline)
  {
    id: "m1-1",
    section: "math",
    module: 1,
    topic: "Linear Equations",
    difficulty: "medium",
    question: "If 3x + 7 = 22, what is the value of x?",
    options: ["3", "5", "7", "15"],
    correctAnswer: 1,
    explanation: "3x = 15, so x = 5.",
  },
  {
    id: "m1-2",
    section: "math",
    module: 1,
    topic: "Quadratic Equations",
    difficulty: "hard",
    question: "What are the solutions to x² - 5x + 6 = 0?",
    options: ["x = 1, 6", "x = 2, 3", "x = -2, -3", "x = -1, 6"],
    correctAnswer: 1,
    explanation: "(x-2)(x-3) = 0, so x = 2 or x = 3.",
  },
  // READING & WRITING - MODULE 2 (Hard - for good performance)
  {
    id: "rw2h-1",
    section: "reading-writing",
    module: 2,
    topic: "Inference",
    difficulty: "hard",
    question: "The author implies that the new policy will likely lead to better environmental protection because:",
    options: ["Costs will decrease", "Emissions will be reduced", "Processing is faster", "More jobs are created"],
    correctAnswer: 1,
    explanation: "The author mentions 'sustainable future' and 'reduced emissions' explicitly.",
  },
  // MATH - MODULE 2 (Hard - for good performance)
  {
    id: "m2h-1",
    section: "math",
    module: 2,
    topic: "Advanced Math",
    difficulty: "hard",
    question: "What is the product of the solutions to x² - 7x + 12 = 0?",
    options: ["7", "12", "-12", "-7"],
    correctAnswer: 1,
    explanation: "The product of roots is c/a = 12.",
  }
];
