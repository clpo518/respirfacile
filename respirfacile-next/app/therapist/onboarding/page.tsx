import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingClient } from "./OnboardingClient";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  // Vérifier le rôle
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, therapist_code")
    .eq("id", user.id)
    .single();

  const isTherapist = profile?.role === "therapist" || profile?.role === "kine";
  if (!isTherapist) redirect("/dashboard");

  // Vérifier si le thérapeute a déjà des patients
  const { count } = await supabase
    .from("therapist_patients")
    .select("*", { count: "exact", head: true })
    .eq("therapist_id", user.id);

  // Si des patients existent, rediriger vers le tableau de bord
  if (count && count > 0) {
    redirect("/therapist");
  }

  const therapistCode = profile?.therapist_code || "PRO-XXXX";
  const firstName = profile?.full_name?.split(" ")[0] || "";

  return (
    <OnboardingClient therapistCode={therapistCode} firstName={firstName} />
  );
}
