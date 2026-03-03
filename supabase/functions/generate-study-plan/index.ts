import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { current_score, target_score, exam_date, weak_topics, preferred_subjects } = await req.json();

    const daysUntilExam = exam_date
      ? Math.max(1, Math.ceil((new Date(exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 30;

    const systemPrompt = `You are an expert SAT tutor. Create a personalized 7-day study plan.

Context:
- Current score: ${current_score || 1200}
- Target score: ${target_score || 1500}
- Days until exam: ${daysUntilExam}
- Weak topics: ${(weak_topics || []).join(", ") || "not yet identified"}
- Preferred subjects: ${(preferred_subjects || []).join(", ") || "all subjects"}

Return a JSON object with a "tasks" array. Each task should have:
- topic (string): The SAT topic to study
- task_type (string): "practice", "review", or "test"
- duration (number): Duration in minutes (15-60)
- day_of_week (number): 0=Monday through 6=Sunday

Create 3-5 tasks per day, focusing heavily on weak areas. Vary task types.
Return ONLY valid JSON: {"tasks": [...]}`;

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
          { role: "user", content: "Generate my personalized SAT study plan for this week." },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI error:", response.status, errText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);

    return new Response(JSON.stringify({ tasks: parsed.tasks || [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-study-plan error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error", tasks: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});