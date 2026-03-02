import { SATQuestion } from "../data/mockData";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export async function generateSATQuestions(
    section: "reading-writing" | "math",
    module: 1 | 2,
    difficulty: "easy" | "medium" | "hard",
    count: number
): Promise<SATQuestion[]> {
    if (!OPENAI_API_KEY) {
        throw new Error("Missing OpenAI API Key");
    }

    const systemPrompt = `You are a Digital SAT question generator. Generate ${count} ${difficulty} questions for the ${section.replace("-", " ")} module ${module} of the NEW Digital SAT format (2024+).

    SECTION: READING & WRITING (RW) - FULL BREAKDOWN
    📊 DISTRIBUTION: ~50% Reading-Based, ~50% Writing & Language-Based.

    🔹 1. Reading-Based Questions (~50%):
    - Main Idea: Summarize the passage.
    - Inference: What is implied but not directly stated?
    - Evidence-Based: Which choice best supports the answer?
    - Vocabulary in Context: Meaning of a word inside the specific passage.
    RULE: Each question MUST have its own unique short passage (25-150 words). 1 passage = 1 question.

    🔹 2. Writing & Language Questions (~50%):
    - Grammar (Standard English Conventions): Subject-verb agreement, Tense consistency, Pronoun clarity, Punctuation (commas, semicolons, colons).
    - Sentence Structure: Run-ons, fragments, combining sentences.
    - Transitions: Logical connectors (However, Therefore, Similarly).
    - Rhetorical Skills: Improve clarity, Add/remove sentences, Choose best sentence placement.
    RULE: These also use short passages/contexts (25-150 words).

    SECTION: MATH - FULL BREAKDOWN
    📊 DISTRIBUTION:
    - Algebra (~35-40%): Linear equations, inequalities, systems of equations, functions. (HIGH WEIGHT)
    - Advanced Math (~30-35%): Quadratic equations, polynomials, exponents, nonlinear functions.
    - Problem Solving & Data Analysis (~15-20%): Ratios, percentages, unit rates, basic statistics.
    - Geometry & Trigonometry (~10-15%): Triangles, circles, area/volume, basic trig (sin, cos, tan).

    QUESTION TYPES:
    1. Multiple Choice (MCQs): 4 options.
    2. Student-Produced Response (Grid-in): No options. The user must type the answer.
    RULE: Generate a mix of both types. Calculator is ALWAYS allowed.

    Return a JSON object with a 'questions' key containing an array of objects matching this TypeScript interface:
    interface SATQuestion {
      id: string; // unique id
      section: "${section}";
      module: ${module};
      difficulty: "${difficulty}";
      topic: string; // Use EXACT topic names from the bullets above
      type: "mcq" | "grid-in"; // NEW: Specify the question type
      passage?: string; // Optional context for Math
      question: string;
      options: string[]; // exactly 4 options for mcq. Empty array for grid-in.
      correctAnswer: number | string; // index (0-3) for mcq, or the exact numerical string for grid-in
      explanation: string; // concise explanation
    }
    Ensure questions reflect the actual 2024 Digital SAT standards exactly.`;

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Generate ${count} questions now results must strictly be JSON.` },
                ],
                response_format: { type: "json_object" }
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("OpenAI Error:", err);
            throw new Error("Failed to generate questions. Check API key or quota.");
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        const result = JSON.parse(content);

        // Override AI-generated IDs with truly unique ones in JS
        const questions = (Array.isArray(result) ? result : (result.questions || [])).map((q: any) => ({
            ...q,
            id: crypto.randomUUID()
        }));

        return questions as SATQuestion[];
    } catch (error) {
        console.error("Error generating SAT questions:", error);
        throw error;
    }
}
