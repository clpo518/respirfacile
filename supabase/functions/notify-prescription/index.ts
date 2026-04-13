import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyPrescriptionRequest {
  patientId: string;
  therapistId: string;
  exerciseTitle: string;
  message?: string;
}

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
    const { patientId, therapistId, exerciseTitle, message }: NotifyPrescriptionRequest = await req.json();

    console.log(`Notifying patient ${patientId} of prescription from ${therapistId}`);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get patient email
    const { data: patientAuth } = await supabaseAdmin.auth.admin.getUserById(patientId);
    if (!patientAuth?.user?.email) {
      console.error(`No email found for patient ${patientId}`);
      return new Response(
        JSON.stringify({ success: false, error: "Patient email not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get patient & therapist names
    const { data: patientProfile } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", patientId)
      .single();

    const { data: therapistProfile } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", therapistId)
      .single();

    const patientName = patientProfile?.full_name || patientAuth.user.email.split("@")[0];
    const therapistName = therapistProfile?.full_name || "Votre orthophoniste";

    const emailResult = await sendEmail("prescription_assigned", patientAuth.user.email, {
      patientName,
      therapistName,
      exerciseTitle,
      message: message || undefined,
      exerciseUrl: "https://www.parlermoinsvite.fr/dashboard",
    });

    if (!emailResult.success) {
      return new Response(
        JSON.stringify({ success: false, error: emailResult.error }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Prescription email sent to ${patientAuth.user.email}`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in notify-prescription:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
