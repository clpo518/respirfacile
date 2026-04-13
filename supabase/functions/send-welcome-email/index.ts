import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WelcomeEmailRequest {
  userId: string;
  email: string;
  fullName?: string;
  isTherapist: boolean;
  isSolo?: boolean;
  therapistCode?: string;
  referralCode?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email, fullName, isTherapist, isSolo, therapistCode, referralCode }: WelcomeEmailRequest = await req.json();

    console.log(`Sending welcome email to ${email} (isTherapist: ${isTherapist}, isSolo: ${isSolo})`);

    // Determine email type and data based on user role
    const emailType = isTherapist ? "welcome_therapist" : "welcome_patient";
    
    const emailData = isTherapist 
      ? {
          therapistName: fullName || email.split("@")[0],
          therapistCode: therapistCode,
          referralCode: referralCode,
          dashboardUrl: "https://www.parlermoinsvite.fr/patient/list",
        }
      : {
          patientName: fullName || email.split("@")[0],
          therapistName: isSolo ? undefined : undefined, // Will be filled when linked
          appUrl: "https://www.parlermoinsvite.fr/practice",
          isSolo: isSolo || false,
          referralCode: referralCode,
        };

    // Call the send-email function
    const response = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
        },
        body: JSON.stringify({
          type: emailType,
          to: email,
          data: emailData,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error(`Failed to send welcome email:`, result);
      return new Response(
        JSON.stringify({ success: false, error: result.error }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Welcome email sent successfully to ${email}`);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-welcome-email:", errorMessage);
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
