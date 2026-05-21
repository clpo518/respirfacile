import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EXERCISES } from "@/lib/data/exercises";
import SessionClient from "./SessionClient";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ exerciseId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { exerciseId } = await params;
  const ex = EXERCISES.find((e) => e.id === exerciseId);
  return {
    title: ex ? `${ex.name_fr} | Respirfacile` : "Séance | Respirfacile",
  };
}

export default async function SessionPage({ params }: Props) {
  const { exerciseId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isTherapist = profile?.role === "therapist" || profile?.role === "kine";
  if (isTherapist) redirect("/therapist");

  const exercise = EXERCISES.find((e) => e.id === exerciseId);
  if (!exercise) notFound();

  return <SessionClient exercise={exercise} userId={user.id} />;
}
