
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform",
};

serve(async (req) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
        const { question, options, correctAnswer, userAnswer, context } = await req.json();
        const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

        // Fallback if no API key
        if (!OPENAI_API_KEY) {
            return new Response(JSON.stringify({
                reply: "I'm in Demo Mode! To provide real AI explanations, please add your OpenAI API key to the Supabase secrets. \n\nNormally, I would explain that since the correct answer is option " + (correctAnswer + 1) + " and you chose option " + (userAnswer !== null ? userAnswer + 1 : "nothing") + ", the key concept here is to focus on the logical relationship between the variables."
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const systemPrompt = `You are an expert SAT Tutor. Provide high-quality, structured explanations:
    - Use **bold** for key terms and concepts.
    - Use bullet points (•) for lists of points.
    - Use numbered lists (1, 2, 3) for sequential steps.
    - Use alphabetical lists (a, b, c) for sub-options or secondary points.
    - Use double newlines between sections for clean spacing.
    
    Question: ${question}
    Options: ${options.join(", ")}
    Correct Answer: ${options[correctAnswer]}
    Student's Answer: ${userAnswer !== null ? options[userAnswer] : "No answer"}
    
    Deliver a detailed, structured, and encouraging explanation. Scan-ability is a priority for the student.`;

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
                    { role: "user", content: context || "Please explain this question to me in detail." },
                ],
            }),
        });

        const data = await response.json();
        return new Response(JSON.stringify({
            reply: data.choices[0].message.content
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (e) {
        return new Response(
            JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
