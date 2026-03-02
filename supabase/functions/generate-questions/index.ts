
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform",
};

serve(async (req) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
        const { section, difficulty, count = 1 } = await req.json();
        const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

        if (!OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY is not configured in Supabase secrets");
        }

        const systemPrompt = `You are an expert SAT question generator. Generate ${count} Digital SAT questions for the "${section}" section with "${difficulty}" difficulty.
    
    Return a JSON array of questions. Each question must have:
    - id: unique string
    - section: "${section}"
    - topic: a specific SAT topic
    - difficulty: "${difficulty}"
    - question: the question text
    - options: array of 4 strings
    - correctAnswer: index (0-3)
    - explanation: detailed explanation
    
    Format: JSON only.`;

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
                    { role: "user", content: `Generate ${count} questions now.` },
                ],
                response_format: { type: "json_object" },
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("OpenAI error:", errText);
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        const parsed = JSON.parse(content);

        // Support both { questions: [...] } and [...] formats
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
