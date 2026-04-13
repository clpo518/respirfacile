import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { transcript, keyPoints, originalText } = await req.json();

    if (!transcript || !keyPoints || !originalText) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Tu es un orthophoniste spécialisé dans l'évaluation du bredouillement (cluttering).
Tu analyses la restitution orale d'un patient qui a écouté une histoire courte.

IMPORTANT : Ce n'est PAS un test de mémoire. Tu évalues la QUALITÉ de la restitution :
- Le patient a-t-il mentionné les points clés (même reformulés) ?
- A-t-il été concis ou a-t-il fait des digressions ?
- Y a-t-il des parenthèses dans des parenthèses (enchâssements) ?
- Les informations sont-elles dans un ordre logique ?

Ton feedback doit être ENCOURAGEANT et cliniquement pertinent.
Réponds UNIQUEMENT avec un JSON valide, sans markdown ni backticks.`;

    const userPrompt = `Histoire originale : "${originalText}"

Points clés attendus :
${keyPoints.map((kp: string, i: number) => `${i + 1}. ${kp}`).join("\n")}

Transcription du patient : "${transcript}"

Analyse cette restitution et réponds en JSON avec ce schéma exact :
{
  "keyPointResults": [
    { "keyPoint": "texte du point clé", "found": true/false, "comment": "bref commentaire" }
  ],
  "score": nombre de points trouvés,
  "total": nombre total de points clés,
  "concision": "concis" | "acceptable" | "digressif",
  "concisionComment": "commentaire sur la concision",
  "digressions": ["liste des digressions détectées, vide si aucune"],
  "organisation": "logique" | "partiellement logique" | "désorganisé",
  "organisationComment": "commentaire sur l'ordre des informations",
  "globalFeedback": "feedback encourageant global en 2-3 phrases"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, réessayez dans quelques instants." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits insuffisants." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erreur d'analyse" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(JSON.stringify({ error: "No response from AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse JSON from response (handle potential markdown wrapping)
    let analysis;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      analysis = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Invalid AI response format", raw: content }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-retelling error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
