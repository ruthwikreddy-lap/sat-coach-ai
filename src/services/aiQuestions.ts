import { SATQuestion } from "../data/mockData";
import { supabase } from "@/integrations/supabase/client";

export async function generateSATQuestions(
  section: "reading-writing" | "math",
  module: 1 | 2,
  difficulty: "easy" | "medium" | "hard",
  count: number
): Promise<SATQuestion[]> {
  try {
    const { data, error } = await supabase.functions.invoke("generate-questions", {
      body: { section, module, difficulty, count },
    });

    if (error) throw error;

    const questions = (data?.questions || []).map((q: any) => ({
      ...q,
      id: crypto.randomUUID(),
    }));

    return questions as SATQuestion[];
  } catch (error) {
    console.error("Error generating SAT questions:", error);
    throw error;
  }
}