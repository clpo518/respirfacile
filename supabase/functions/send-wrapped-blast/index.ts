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
      console.error(`Failed to send to ${to}:`, result);
      return { success: false, error: result.error };
    }
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Error sending to ${to}:`, errorMessage);
    return { success: false, error: errorMessage };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { templateType, dryRun, includePatients = false } = await req.json();

    if (!templateType) {
      return new Response(
        JSON.stringify({ error: "templateType is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get therapists
    const { data: therapists, error: thErr } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name")
      .eq("is_therapist", true);

    if (thErr) throw new Error(`Failed to fetch therapists: ${thErr.message}`);

    // Get patients if requested (those with at least 1 session this year)
    let patients: { id: string; full_name: string | null }[] = [];
    if (includePatients) {
      const year = new Date().getFullYear();
      const { data: sessions } = await supabaseAdmin
        .from("sessions")
        .select("user_id")
        .gte("created_at", `${year}-01-01T00:00:00Z`)
        .lte("created_at", `${year}-12-31T23:59:59Z`);

      const activeUserIds = [...new Set((sessions || []).map((s) => s.user_id))];

      if (activeUserIds.length > 0) {
        const { data: patientProfiles } = await supabaseAdmin
          .from("profiles")
          .select("id, full_name")
          .in("id", activeUserIds)
          .eq("is_therapist", false);

        patients = patientProfiles || [];
      }
    }

    const allProfiles = [...(therapists || []), ...patients];

    // Resolve emails and filter test accounts
    const fakePatterns = [
      /^fdfd/i, /^dfdfd/i, /^dfdffg/i, /^tesdf/i, /^testtut/i, /^toto@/i,
      /^fdjfnjfd/i, /^ortho1@/i, /^ortho@gmail/i, /^clement@gmail/i,
      /^tedfer@/i, /^fhj\./i,
    ];

    const recipients: { id: string; email: string; name: string }[] = [];
    for (const p of allProfiles) {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(p.id);
      if (authUser?.user?.email) {
        const email = authUser.user.email;
        const isFake = fakePatterns.some((pat) => pat.test(email));
        if (!isFake) {
          recipients.push({ id: p.id, email, name: p.full_name || email.split("@")[0] });
        }
      }
    }

    console.log(`Found ${recipients.length} recipients (${therapists?.length || 0} therapists, ${patients.length} patients)`);

    if (dryRun) {
      return new Response(
        JSON.stringify({ dryRun: true, count: recipients.length, emails: recipients.map((r) => r.email) }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let sent = 0;
    let errors = 0;
    const failedEmails: string[] = [];

    const batchSize = 5;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(async (recipient) => {
          console.log(`Sending ${templateType} to ${recipient.email}...`);
          return { email: recipient.email, ...(await sendEmail(templateType, recipient.email, {})) };
        })
      );
      for (const r of results) {
        if (r.success) sent++;
        else { errors++; failedEmails.push(r.email); }
      }
      if (i + batchSize < recipients.length) {
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    console.log(`Wrapped blast complete: ${sent} sent, ${errors} errors`);

    return new Response(
      JSON.stringify({ success: true, sent, errors, failedEmails }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-wrapped-blast:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
