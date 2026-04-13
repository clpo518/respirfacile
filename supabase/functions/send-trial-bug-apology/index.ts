import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get all impacted therapists: those who were fixed (trial = 30 days from start) and signed up before the fix
    const { data: therapists, error } = await supabase
      .from("profiles")
      .select("id, full_name, trial_end_date")
      .eq("is_therapist", true)
      .not("trial_start_date", "is", null)
      .not("trial_end_date", "is", null)
      .lt("created_at", "2026-03-08");

    if (error) throw error;

    // Get emails from auth.users via admin API
    const results: { email: string; status: string }[] = [];
    const dialogueImageUrl = `${supabaseUrl}/storage/v1/object/public/email-assets/email-dialogue-multi.png`;
    const baseUrl = "https://parlermoinsvite.lovable.app";

    for (const therapist of therapists || []) {
      try {
        const { data: userData } = await supabase.auth.admin.getUserById(therapist.id);
        if (!userData?.user?.email) continue;

        const email = userData.user.email;
        const firstName = (therapist.full_name || "").split(" ").pop() || therapist.full_name || "Professionnel";

        // Format trial end date
        const endDate = new Date(therapist.trial_end_date);
        const formattedDate = endDate.toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        // Send email via send-email function
        const { error: emailError } = await supabase.functions.invoke("send-email", {
          body: {
            type: "trial_bug_apology",
            to: email,
            data: {
              userName: firstName,
              newTrialEndDate: formattedDate,
              dashboardUrl: `${baseUrl}/dashboard/therapist`,
              dialogueImageUrl,
            },
          },
        });

        if (emailError) {
          console.error(`Failed to send to ${email}:`, emailError);
          results.push({ email, status: "failed" });
        } else {
          console.log(`Sent to ${email}`);
          results.push({ email, status: "sent" });
        }

        // Small delay to avoid rate limiting
        await new Promise((r) => setTimeout(r, 500));
      } catch (err) {
        console.error(`Error processing ${therapist.id}:`, err);
        results.push({ email: therapist.id, status: "error" });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total: results.length,
        sent: results.filter((r) => r.status === "sent").length,
        failed: results.filter((r) => r.status !== "sent").length,
        details: results,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
