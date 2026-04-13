import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { therapistId, patientId, patientName } = await req.json();

    if (!therapistId || !patientId) {
      return new Response(JSON.stringify({ error: "Missing therapistId or patientId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get therapist email
    const { data: therapist } = await supabase.auth.admin.getUserById(therapistId);
    if (!therapist?.user?.email) {
      return new Response(JSON.stringify({ skipped: true, reason: "No therapist email" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get therapist name
    const { data: therapistProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", therapistId)
      .maybeSingle();

    const therapistName = therapistProfile?.full_name?.split(" ")[0] || "Docteur";

    // Send email via send-email function
    const response = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
        },
        body: JSON.stringify({
          type: "patient_first_session",
          to: therapist.user.email,
          data: {
            therapistName,
            patientName: patientName || "Votre patient",
            patientDetailUrl: `https://www.parlermoinsvite.fr/patient/${patientId}`,
            dashboardUrl: "https://www.parlermoinsvite.fr/patient/list",
          },
        }),
      }
    );

    const result = await response.json();
    console.log("Magic moment email result:", result);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
