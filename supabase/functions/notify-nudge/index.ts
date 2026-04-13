import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendEmail(
  type: string,
  to: string,
  data: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
        },
        body: JSON.stringify({ type, to, data }),
      }
    );
    const result = await response.json();
    if (!response.ok) {
      console.error(`Failed to send ${type} email:`, result);
      return { success: false, error: result.error };
    }
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Error sending ${type} email:`, errorMessage);
    return { success: false, error: errorMessage };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { patientId, therapistId } = await req.json();

    if (!patientId || !therapistId) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing patientId or therapistId" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify therapist-patient link
    const { data: patient } = await supabaseAdmin
      .from("profiles")
      .select("full_name, linked_therapist_id, current_streak, last_activity_date")
      .eq("id", patientId)
      .single();

    if (!patient || patient.linked_therapist_id !== therapistId) {
      return new Response(
        JSON.stringify({ success: false, error: "Not authorized" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get patient email
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(patientId);
    if (!authUser?.user?.email) {
      return new Response(
        JSON.stringify({ success: false, error: "Patient email not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Calculate days since last activity
    const daysSince = patient.last_activity_date
      ? Math.floor((Date.now() - new Date(patient.last_activity_date).getTime()) / (1000 * 60 * 60 * 24))
      : 7;

    const emailResult = await sendEmail("inactivity_reminder", authUser.user.email, {
      userName: patient.full_name || authUser.user.email.split("@")[0],
      daysSinceLastSession: Math.max(daysSince, 1),
      currentStreak: patient.current_streak || 0,
      practiceUrl: "https://www.parlermoinsvite.fr/dashboard",
    });

    if (!emailResult.success) {
      return new Response(
        JSON.stringify({ success: false, error: emailResult.error }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Nudge email sent to patient ${patientId} (${authUser.user.email})`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in notify-nudge:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
