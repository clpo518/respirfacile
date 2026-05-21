import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { patient_email } = body;

    if (!patient_email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    // Récupérer le code Pro du thérapeute
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("therapist_code, full_name")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.therapist_code) {
      return NextResponse.json(
        { error: "Code Pro introuvable ou vous n'êtes pas un thérapeute" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://respirfacile.fr";
    const inviteLink = `${appUrl}/auth?code=${profile.therapist_code}&email=${encodeURIComponent(patient_email)}`;

    // Log l'invitation dans email_logs (silently fail si table pas créée)
    // Log silently - ignore errors if table not yet created
    try {
      await supabase.from("email_logs").insert({
        user_id: user.id,
        email_type: "patient_invite",
        recipient_email: patient_email,
        status: "pending",
      })
    } catch { /* silent */ }

    return NextResponse.json({
      ok: true,
      invite_link: inviteLink,
      therapist_code: profile.therapist_code,
      patient_email,
    });
  } catch (error) {
    console.error("[invite-patient] Error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
