import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { question, options, correctAnswer, userAnswer, context } = await req.json();

    const systemPrompt = `You are an expert SAT Tutor. Provide high-quality, structured explanations:
- Use **bold** for key terms and concepts.
- Use bullet points for lists.
- Use numbered lists for sequential steps.
- Be concise but thorough.

${question ? `Question: ${question}` : ""}
${options?.length ? `Options: ${options.join(", ")}` : ""}
${correctAnswer !== undefined ? `Correct Answer: ${options?.[correctAnswer] || correctAnswer}` : ""}
${userAnswer !== null && userAnswer !== undefined ? `Student's Answer: ${options?.[userAnswer] || userAnswer}` : ""}

Provide a detailed, structured, and encouraging explanation.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: context || "Please explain this question to me in detail." },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI error:", response.status, errText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    return new Response(JSON.stringify({
      reply: data.choices[0].message.content,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ask-ai-tutor error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error", reply: "Sorry, I encountered an error. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});