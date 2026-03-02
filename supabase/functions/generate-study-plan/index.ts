import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { current_score, target_score, exam_date, weak_topics, preferred_subjects } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const apiKey = OPENAI_API_KEY || LOVABLE_API_KEY;
    if (!apiKey) throw new Error("No API key configured (OPENAI_API_KEY or LOVABLE_API_KEY)");

    const isOpenAI = !!OPENAI_API_KEY;
    const apiUrl = isOpenAI
      ? "https://api.openai.com/v1/chat/completions"
      : "https://ai.gateway.lovable.dev/v1/chat/completions";
    const model = isOpenAI ? "gpt-4o" : "google/gemini-pro"; // Or whichever model is appropriate

    const daysUntilExam = exam_date
      ? Math.max(1, Math.ceil((new Date(exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 30;

    const systemPrompt = `You are an expert SAT tutor and study plan generator. Create a personalized 7-day study plan.

Context:
- Current score: ${current_score || 1200}
- Target score: ${target_score || 1500}
- Days until exam: ${daysUntilExam}
- Weak topics: ${(weak_topics || []).join(", ") || "not yet identified"}
- Preferred subjects: ${(preferred_subjects || []).join(", ") || "all subjects"}

Return a JSON array of study tasks using this tool.`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate my personalized SAT study plan for this week. Focus heavily on my weak areas." },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_study_plan",
              description: "Generate a structured weekly study plan with daily tasks",
              parameters: {
                type: "object",
                properties: {
                  tasks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        topic: { type: "string", description: "The topic to study" },
                        task_type: { type: "string", enum: ["practice", "review", "test"], description: "Type of activity" },
                        duration: { type: "number", description: "Duration in minutes" },
                        day_of_week: { type: "number", description: "0=Monday, 6=Sunday" },
                        priority: { type: "string", enum: ["high", "medium", "low"] },
                      },
                      required: ["topic", "task_type", "duration", "day_of_week"],
                    },
                  },
                },
                required: ["tasks"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_study_plan" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI error:", response.status, errText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("No study plan generated");
  } catch (e) {
    console.error("generate-study-plan error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
