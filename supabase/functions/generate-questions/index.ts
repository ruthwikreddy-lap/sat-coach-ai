import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = (section: string, difficulty: string, count: number) =>
  `You are an expert SAT question generator. Generate ${count} VERY SIMPLE AND EASY Digital SAT questions for the "${section}" section with "${difficulty}" difficulty. The language used in the questions, passages, and options must be plain, straightforward, and highly readable. Avoid complex vocabulary or overly confusing structuring.

Return a JSON object with a "questions" array. Each question must have:
- id: unique string
- section: "${section}"
- module: 1
- topic: a specific SAT topic
- difficulty: "${difficulty}"
- type: "mcq"
- question: the question text
- passage: optional reading passage (for reading-writing questions)
- options: array of 4 strings
- correctAnswer: index (0-3)
- explanation: detailed explanation

Return ONLY valid JSON: {"questions": [...]}`;

async function callLovableAI(section: string, difficulty: string, count: number) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt(section, difficulty, count) },
        { role: "user", content: `Generate ${count} SAT questions now.` },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Lovable AI error:", response.status, errText);
    throw new Error(`Lovable AI error: ${response.status}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

async function callOpenAI(section: string, difficulty: string, count: number) {
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  if (!OPENAI_API_KEY) throw new Error("No fallback API key available");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt(section, difficulty, count) },
        { role: "user", content: `Generate ${count} questions now.` },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("OpenAI error:", errText);
    throw new Error(`OpenAI error: ${response.status}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { section, difficulty, count = 1 } = await req.json();

    let parsed;
    try {
      // Try Lovable AI first
      parsed = await callLovableAI(section, difficulty, count);
    } catch (lovableErr) {
      console.warn("Lovable AI failed, trying OpenAI fallback:", lovableErr);
      try {
        parsed = await callOpenAI(section, difficulty, count);
      } catch (openaiErr) {
        console.error("Both AI providers failed:", openaiErr);
        throw new Error("All AI providers failed. Please try again later.");
      }
    }

    const questions = Array.isArray(parsed) ? parsed : (parsed.questions || [parsed]);

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-questions error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
