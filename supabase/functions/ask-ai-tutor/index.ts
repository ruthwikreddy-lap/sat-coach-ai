import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function callLovableAI(messages: any[]) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY not configured");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "google/gemini-2.5-flash", messages }),
  });

  if (!response.ok) throw new Error(`Lovable AI error: ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

async function callOpenAI(messages: any[]) {
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) throw new Error("No fallback API key");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o", messages }),
  });

  if (!response.ok) throw new Error(`OpenAI error: ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { question, options, correctAnswer, userAnswer, context, imageBase64 } = await req.json();

    const systemPrompt = `You are an expert SAT Tutor. Your goal is to help the student learn using the Socratic Method.
Do NOT just give away the correct answer or provide a static explanation immediately.
Instead, guide the student to the answer by asking probing questions.
For example, if the student answers incorrectly, say: "You chose [their answer], but notice [a specific clue]. What is the [underlying concept]?"
- Provide high-quality, structured explanations when appropriate, but prioritize guiding questions.
- Use **bold** for key terms and concepts.
- Be concise, encouraging, and highly interactive.
- If the student is completely stuck, you can provide more direct help.

${question ? `Question: ${question}` : ""}
${options?.length ? `Options: ${options.join(", ")}` : ""}
${correctAnswer !== undefined ? `Correct Answer: ${options?.[correctAnswer] || correctAnswer}` : ""}
${userAnswer !== null && userAnswer !== undefined ? `Student's Answer: ${options?.[userAnswer] || userAnswer}` : ""}`;

    const userContent = imageBase64
      ? [
        { type: "text", text: context || "Please help me with this image." },
        { type: "image_url", image_url: { url: imageBase64 } }
      ]
      : context || "Please help me with this.";

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ];

    let reply: string;
    try {
      reply = await callLovableAI(messages);
    } catch (e) {
      console.warn("Lovable AI failed, trying OpenAI:", e);
      try {
        reply = await callOpenAI(messages);
      } catch (e2) {
        throw new Error("All AI providers failed");
      }
    }

    return new Response(JSON.stringify({ reply }), {
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
