// Digital SAT question types and configuration

export interface SATQuestion {
  id: string;
  section: "reading-writing" | "math";
  module: 1 | 2;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  type: "mcq" | "grid-in";
  passage?: string;
  question: string;
  options: string[];
  correctAnswer: number | string;
  explanation: string;
}

export interface TestResult {
  date: string;
  score: number;
  readingScore: number;
  mathScore: number;
  weakTopics: string[];
  timeSpent: number;
}

export interface TopicPerformance {
  topic: string;
  section: string;
  accuracy: number;
  questionsAttempted: number;
  trend: "up" | "down" | "stable";
}

// Fallback mock questions for Focus Mode and offline testing
export const mockQuestions: SATQuestion[] = [
  {
    id: "mock-rw-1",
    section: "reading-writing",
    module: 1,
    difficulty: "medium",
    topic: "Main Idea",
    type: "mcq",
    passage: "The discovery of penicillin by Alexander Fleming in 1928 revolutionized medicine. Before antibiotics, even minor infections could be fatal. Fleming's observation that mold inhibited bacterial growth led to the development of the first widely used antibiotic, saving millions of lives worldwide.",
    question: "Which choice best states the main idea of this passage?",
    options: [
      "Alexander Fleming was a careless scientist who made accidental discoveries.",
      "The discovery of penicillin transformed medical treatment of infections.",
      "Mold is dangerous to human health and should be avoided.",
      "Antibiotics were available before Fleming's discovery but rarely used."
    ],
    correctAnswer: 1,
    explanation: "The passage focuses on how Fleming's discovery of penicillin revolutionized medicine by enabling effective treatment of infections."
  },
  {
    id: "mock-rw-2",
    section: "reading-writing",
    module: 1,
    difficulty: "medium",
    topic: "Vocabulary in Context",
    type: "mcq",
    passage: "The senator's proposal was met with considerable resistance from her colleagues. Despite the opposition, she remained resolute in her commitment to the legislation, arguing that the long-term benefits would far outweigh any short-term inconveniences.",
    question: "As used in the passage, 'resolute' most nearly means:",
    options: ["Angry", "Determined", "Flexible", "Confused"],
    correctAnswer: 1,
    explanation: "'Resolute' means firmly determined. The context shows the senator maintained her position despite opposition."
  },
  {
    id: "mock-rw-3",
    section: "reading-writing",
    module: 1,
    difficulty: "easy",
    topic: "Standard English Conventions",
    type: "mcq",
    question: "The research team _____ their findings at the annual conference last month.",
    options: ["present", "presents", "presented", "presenting"],
    correctAnswer: 2,
    explanation: "The past tense 'presented' is correct because the action occurred 'last month,' indicating a completed past event."
  },
  {
    id: "mock-math-1",
    section: "math",
    module: 1,
    difficulty: "medium",
    topic: "Algebra",
    type: "mcq",
    question: "If 3x + 7 = 22, what is the value of x?",
    options: ["3", "5", "7", "15"],
    correctAnswer: 1,
    explanation: "3x + 7 = 22 → 3x = 15 → x = 5."
  },
  {
    id: "mock-math-2",
    section: "math",
    module: 1,
    difficulty: "medium",
    topic: "Problem-Solving & Data Analysis",
    type: "mcq",
    question: "A store sells a shirt for $40 after a 20% discount. What was the original price?",
    options: ["$45", "$48", "$50", "$52"],
    correctAnswer: 2,
    explanation: "If the discounted price is 80% of the original: 0.80 × P = 40, so P = $50."
  },
  {
    id: "mock-math-3",
    section: "math",
    module: 1,
    difficulty: "hard",
    topic: "Advanced Math",
    type: "mcq",
    question: "What are the solutions to x² - 5x + 6 = 0?",
    options: ["x = 1 and x = 6", "x = 2 and x = 3", "x = -2 and x = -3", "x = -1 and x = 6"],
    correctAnswer: 1,
    explanation: "Factor: (x - 2)(x - 3) = 0, so x = 2 or x = 3."
  },
  {
    id: "mock-rw-4",
    section: "reading-writing",
    module: 1,
    difficulty: "medium",
    topic: "Inference",
    type: "mcq",
    passage: "Maya checked the weather forecast three times before packing her bag. She included an umbrella, a raincoat, and waterproof boots, even though the sky outside was perfectly clear.",
    question: "Based on the passage, which inference is best supported?",
    options: [
      "Maya enjoys collecting rain gear.",
      "Maya does not trust weather forecasts.",
      "Maya is cautious and prepares for predicted rain.",
      "Maya is going on a long trip overseas."
    ],
    correctAnswer: 2,
    explanation: "Maya's repeated checking and packing of rain gear despite clear skies suggests she is cautiously preparing based on the forecast."
  },
  {
    id: "mock-math-4",
    section: "math",
    module: 1,
    difficulty: "easy",
    topic: "Geometry & Trigonometry",
    type: "mcq",
    question: "A circle has a radius of 7 cm. What is its area? (Use π ≈ 3.14)",
    options: ["43.96 cm²", "153.86 cm²", "21.98 cm²", "307.72 cm²"],
    correctAnswer: 1,
    explanation: "Area = πr² = 3.14 × 7² = 3.14 × 49 = 153.86 cm²."
  },
];