import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PatientJoinedRequest {
  patientId: string;
  therapistId: string;
}

// Helper function to send emails via the send-email edge function
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
    console.log(`Successfully sent ${type} email to ${to}`);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Error sending ${type} email:`, errorMessage);
    return { success: false, error: errorMessage };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { patientId, therapistId }: PatientJoinedRequest = await req.json();

    console.log(`Notifying therapist ${therapistId} that patient ${patientId} joined`);

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get patient profile
    const { data: patientProfile } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", patientId)
      .single();

    // Get therapist profile including referral_code
    const { data: therapistProfile } = await supabaseAdmin
      .from("profiles")
      .select("full_name, referral_code")
      .eq("id", therapistId)
      .single();

    const { data: therapistAuth } = await supabaseAdmin.auth.admin.getUserById(therapistId);

    if (!therapistAuth?.user?.email) {
      console.error(`No email found for therapist ${therapistId}`);
      return new Response(
        JSON.stringify({ success: false, error: "Therapist email not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get patient email for name fallback
    const { data: patientAuth } = await supabaseAdmin.auth.admin.getUserById(patientId);
    const patientName = patientProfile?.full_name || 
      patientAuth?.user?.email?.split("@")[0] || 
      "Un nouveau patient";

    // Send the patient joined email with referral code
    const emailResult = await sendEmail("patient_joined", therapistAuth.user.email, {
      therapistName: therapistProfile?.full_name || therapistAuth.user.email.split("@")[0],
      patientName: patientName,
      patientDetailUrl: `https://www.parlermoinsvite.fr/patient/${patientId}`,
      referralCode: therapistProfile?.referral_code || null,
    });

    if (!emailResult.success) {
      return new Response(
        JSON.stringify({ success: false, error: emailResult.error }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Patient joined email sent successfully to ${therapistAuth.user.email}`);

    return new Response(
      JSON.stringify({ success: true, emailSent: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in notify-patient-joined:", errorMessage);
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
