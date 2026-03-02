// Mock SAT question data and types

export interface SATQuestion {
  id: string;
  section: "reading" | "writing" | "math-no-calc" | "math-calc";
  topic: string;
  difficulty: "easy" | "medium" | "hard";
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

export interface StudyPlanDay {
  day: string;
  date: string;
  tasks: {
    topic: string;
    type: "practice" | "review" | "test";
    duration: number; // minutes
    completed: boolean;
  }[];
}

export interface TopicPerformance {
  topic: string;
  section: string;
  accuracy: number;
  questionsAttempted: number;
  trend: "up" | "down" | "stable";
}

export const mockQuestions: SATQuestion[] = [
  {
    id: "q1",
    section: "math-calc",
    topic: "Linear Equations",
    difficulty: "medium",
    question: "If 3x + 7 = 22, what is the value of x?",
    options: ["3", "5", "7", "15"],
    correctAnswer: 1,
    explanation: "3x + 7 = 22 → 3x = 15 → x = 5",
  },
  {
    id: "q2",
    section: "math-calc",
    topic: "Data Interpretation",
    difficulty: "medium",
    question: "A dataset has values 12, 15, 18, 21, 24. What is the mean?",
    options: ["15", "18", "20", "21"],
    correctAnswer: 1,
    explanation: "(12+15+18+21+24)/5 = 90/5 = 18",
  },
  {
    id: "q3",
    section: "math-no-calc",
    topic: "Quadratic Equations",
    difficulty: "hard",
    question: "What are the solutions to x² - 5x + 6 = 0?",
    options: ["x = 1, 6", "x = 2, 3", "x = -2, -3", "x = -1, 6"],
    correctAnswer: 1,
    explanation: "Factor: (x-2)(x-3) = 0, so x = 2 or x = 3",
  },
  {
    id: "q4",
    section: "reading",
    topic: "Main Idea",
    difficulty: "easy",
    question: "Which best describes the primary purpose of a thesis statement in an essay?",
    options: [
      "To provide background information",
      "To state the main argument or claim",
      "To summarize the conclusion",
      "To list supporting evidence",
    ],
    correctAnswer: 1,
    explanation: "A thesis statement presents the main argument or claim of the essay.",
  },
  {
    id: "q5",
    section: "writing",
    topic: "Grammar",
    difficulty: "easy",
    question: 'Which sentence is grammatically correct?',
    options: [
      "Him and I went to the store.",
      "He and I went to the store.",
      "He and me went to the store.",
      "Him and me went to the store.",
    ],
    correctAnswer: 1,
    explanation: '"He and I" uses subject pronouns, correct for the subject position.',
  },
  {
    id: "q6",
    section: "math-calc",
    topic: "Percentages",
    difficulty: "easy",
    question: "A shirt originally costs $80. It is on sale for 25% off. What is the sale price?",
    options: ["$55", "$60", "$65", "$70"],
    correctAnswer: 1,
    explanation: "25% of $80 = $20. Sale price = $80 - $20 = $60",
  },
  {
    id: "q7",
    section: "math-calc",
    topic: "Linear Equations",
    difficulty: "hard",
    question: "If 2(3x - 4) + 5 = 4x + 9, what is x?",
    options: ["3", "5", "6", "8"],
    correctAnswer: 2,
    explanation: "6x - 8 + 5 = 4x + 9 → 6x - 3 = 4x + 9 → 2x = 12 → x = 6",
  },
  {
    id: "q8",
    section: "reading",
    topic: "Inference",
    difficulty: "medium",
    question: "When an author uses the phrase 'reading between the lines,' they are asking readers to:",
    options: [
      "Read more carefully",
      "Look for implied meaning",
      "Skip certain paragraphs",
      "Focus on the title",
    ],
    correctAnswer: 1,
    explanation: "'Reading between the lines' means identifying implied or hidden meaning.",
  },
  {
    id: "q9",
    section: "writing",
    topic: "Punctuation",
    difficulty: "medium",
    question: "Which sentence uses a semicolon correctly?",
    options: [
      "I like pizza; and burgers.",
      "I like pizza; however, I prefer burgers.",
      "I like; pizza and burgers.",
      "I like pizza, however; I prefer burgers.",
    ],
    correctAnswer: 1,
    explanation: "Semicolons connect independent clauses, often with transitional words like 'however.'",
  },
  {
    id: "q10",
    section: "math-no-calc",
    topic: "Geometry",
    difficulty: "medium",
    question: "What is the area of a triangle with base 10 and height 6?",
    options: ["16", "30", "60", "36"],
    correctAnswer: 1,
    explanation: "Area = (1/2) × base × height = (1/2)(10)(6) = 30",
  },
];

export const mockTestResults: TestResult[] = [
  { date: "2026-02-15", score: 1180, readingScore: 560, mathScore: 620, weakTopics: ["Linear Equations", "Inference"], timeSpent: 180 },
  { date: "2026-02-20", score: 1220, readingScore: 580, mathScore: 640, weakTopics: ["Data Interpretation", "Grammar"], timeSpent: 175 },
  { date: "2026-02-25", score: 1260, readingScore: 600, mathScore: 660, weakTopics: ["Quadratic Equations", "Punctuation"], timeSpent: 178 },
  { date: "2026-03-01", score: 1300, readingScore: 620, mathScore: 680, weakTopics: ["Geometry", "Main Idea"], timeSpent: 172 },
];

export const mockTopicPerformance: TopicPerformance[] = [
  { topic: "Linear Equations", section: "Math", accuracy: 65, questionsAttempted: 40, trend: "up" },
  { topic: "Quadratic Equations", section: "Math", accuracy: 52, questionsAttempted: 25, trend: "down" },
  { topic: "Data Interpretation", section: "Math", accuracy: 58, questionsAttempted: 30, trend: "stable" },
  { topic: "Geometry", section: "Math", accuracy: 72, questionsAttempted: 20, trend: "up" },
  { topic: "Percentages", section: "Math", accuracy: 85, questionsAttempted: 15, trend: "up" },
  { topic: "Main Idea", section: "Reading", accuracy: 70, questionsAttempted: 35, trend: "up" },
  { topic: "Inference", section: "Reading", accuracy: 55, questionsAttempted: 28, trend: "down" },
  { topic: "Grammar", section: "Writing", accuracy: 62, questionsAttempted: 30, trend: "stable" },
  { topic: "Punctuation", section: "Writing", accuracy: 68, questionsAttempted: 22, trend: "up" },
];

export const mockStudyPlan: StudyPlanDay[] = [
  {
    day: "Monday",
    date: "Mar 3",
    tasks: [
      { topic: "Quadratic Equations", type: "practice", duration: 30, completed: false },
      { topic: "Inference", type: "review", duration: 20, completed: false },
      { topic: "Data Interpretation", type: "practice", duration: 25, completed: false },
    ],
  },
  {
    day: "Tuesday",
    date: "Mar 4",
    tasks: [
      { topic: "Grammar", type: "practice", duration: 25, completed: false },
      { topic: "Linear Equations", type: "review", duration: 20, completed: false },
      { topic: "Reading Comprehension", type: "practice", duration: 30, completed: false },
    ],
  },
  {
    day: "Wednesday",
    date: "Mar 5",
    tasks: [
      { topic: "Mini Practice Test", type: "test", duration: 45, completed: false },
      { topic: "Weak Area Review", type: "review", duration: 30, completed: false },
    ],
  },
  {
    day: "Thursday",
    date: "Mar 6",
    tasks: [
      { topic: "Punctuation", type: "practice", duration: 20, completed: false },
      { topic: "Geometry", type: "practice", duration: 25, completed: false },
      { topic: "Main Idea", type: "review", duration: 20, completed: false },
    ],
  },
  {
    day: "Friday",
    date: "Mar 7",
    tasks: [
      { topic: "Full Practice Test", type: "test", duration: 180, completed: false },
    ],
  },
];
