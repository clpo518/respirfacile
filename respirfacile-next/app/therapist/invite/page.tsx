import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InviteClient } from "./InviteClient";

export default async function InvitePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  // Vérifier le rôle
  const { data: profile } = await supabase
    .from("profiles")
    .select("therapist_code")
    .eq("id", user.id)
    .single();

  if (!profile?.therapist_code) redirect("/therapist");

  return <InviteClient therapistCode={profile.therapist_code} />;
}
