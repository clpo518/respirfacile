import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MessageThread } from "@/components/therapist/MessageThread";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PatientMessagesPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const { data: therapistProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isTherapist = therapistProfile?.role === "therapist" || therapistProfile?.role === "kine";
  if (!isTherapist) redirect("/dashboard");

  // Vérifier que ce patient appartient à cet orthophoniste
  const { data: link } = await supabase
    .from("therapist_patients")
    .select("id")
    .eq("therapist_id", user.id)
    .eq("patient_id", id)
    .single();

  if (!link) notFound();

  // Profil patient
  const { data: patient } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", id)
    .single();

  if (!patient) notFound();

  // Messages existants
  const { data: messages } = await supabase
    .from("messages")
    .select("id, content, sender_role, read_at, created_at")
    .eq("therapist_id", user.id)
    .eq("patient_id", id)
    .order("created_at", { ascending: true });

  const patientName = patient.full_name || patient.email || "Patient";

  return (
    <div className="min-h-screen bg-beige-200 flex flex-col">
      {/* Header */}
      <header className="bg-beige-100/90 backdrop-blur border-b border-beige-300 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link
            href={`/therapist/patients/${id}`}
            className="flex items-center gap-2 text-forest-500 hover:text-forest-700 transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium hidden sm:inline">Retour au bilan</span>
          </Link>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-forest-500/10 border border-forest-500/20 flex items-center justify-center text-forest-700 text-sm font-bold flex-shrink-0">
              {patientName[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-forest-800 text-sm truncate">{patientName}</p>
              <p className="text-xs text-forest-500">Messages directs</p>
            </div>
          </div>
        </div>
      </header>

      {/* Thread */}
      <div className="flex-1 max-w-3xl mx-auto w-full flex flex-col" style={{ height: "calc(100vh - 57px)" }}>
        <MessageThread
          therapistId={user.id}
          patientId={id}
          patientName={patientName}
          initialMessages={(messages ?? []) as any}
        />
      </div>
    </div>
  );
}
