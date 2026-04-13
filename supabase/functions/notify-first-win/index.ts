import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FirstWinRequest {
  userId: string;
  sessionCount: number;
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
    const { userId, sessionCount }: FirstWinRequest = await req.json();

    console.log(`Checking first win for user ${userId}, session count: ${sessionCount}`);

    // Only proceed if this is the FIRST session
    if (sessionCount !== 1) {
      console.log(`Not first session (count: ${sessionCount}), skipping first win email`);
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "Not first session" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get user profile and email
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name, is_therapist")
      .eq("id", userId)
      .single();

    // Skip first_win email for therapists
    if (profile?.is_therapist) {
      console.log(`User ${userId} is a therapist, skipping first win email`);
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "User is a therapist" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (!authUser?.user?.email) {
      console.error(`No email found for user ${userId}`);
      return new Response(
        JSON.stringify({ success: false, error: "User email not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send the first win email
    const emailResult = await sendEmail("first_win", authUser.user.email, {
      userName: profile?.full_name || authUser.user.email.split("@")[0],
      dashboardUrl: "https://www.parlermoinsvite.fr/dashboard",
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

    console.log(`First win email sent successfully to ${authUser.user.email}`);

    return new Response(
      JSON.stringify({ success: true, emailSent: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in notify-first-win:", errorMessage);
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
