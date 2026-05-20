import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
)

Deno.serve(async () => {
  try {
    // Patients qui n'ont pas fait de séance depuis 7 jours
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    // Récupère les liens thérapeute-patient actifs
    const { data: links } = await supabase
      .from("therapist_patients")
      .select("therapist_id, patient_id, profiles!therapist_patients_patient_id_fkey(full_name, email)")
      .eq("status", "active")

    if (!links?.length) return new Response("Aucun lien actif", { status: 200 })

    const alerts: Array<{ therapistId: string; patientName: string; patientEmail: string }> = []

    for (const link of links) {
      const patientId = link.patient_id
      // Cherche si le patient a une séance dans les 7 derniers jours
      const { count } = await supabase
        .from("sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", patientId)
        .eq("completed", true)
        .gte("created_at", sevenDaysAgo)

      if ((count ?? 0) === 0) {
        const profile = (link as any).profiles
        alerts.push({
          therapistId: link.therapist_id,
          patientName: profile?.full_name ?? "Votre patient",
          patientEmail: profile?.email ?? "",
        })
      }
    }

    // Regroupe les alertes par thérapeute
    const byTherapist: Record<string, Array<{ name: string; email: string }>> = {}
    for (const alert of alerts) {
      if (!byTherapist[alert.therapistId]) byTherapist[alert.therapistId] = []
      byTherapist[alert.therapistId].push({ name: alert.patientName, email: alert.patientEmail })
    }

    // Pour chaque thérapeute concerné, envoie une notification
    let sent = 0
    for (const [therapistId, patients] of Object.entries(byTherapist)) {
      const { data: therapist } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", therapistId)
        .maybeSingle()

      if (!therapist?.email) continue

      const patientList = patients.map(p => `- ${p.name}`).join("\n")
      const count = patients.length

      await supabase.functions.invoke("send-email", {
        body: {
          to: therapist.email,
          subject: `${count} patient${count > 1 ? "s" : ""} inactif${count > 1 ? "s" : ""} cette semaine — RespirFacile`,
          html: `
            <p>Bonjour ${therapist.full_name?.split(" ")[0] ?? ""},</p>
            <p>Ces patients liés à votre compte n'ont pas réalisé de séance depuis plus de 7 jours :</p>
            <pre style="background:#f5f5f5;padding:12px;border-radius:8px;font-family:monospace">${patientList}</pre>
            <p>Un message de motivation dans leur tableau de bord peut faire toute la différence.</p>
            <p><a href="https://respirfacile.fr/patients" style="color:#2D5A4F;font-weight:bold">Voir mes patients →</a></p>
            <br>
            <p style="color:#666;font-size:12px">RespirFacile · contact@respirfacile.fr</p>
          `,
        },
      })
      sent++
    }

    return new Response(
      JSON.stringify({ processed: links.length, alerts: alerts.length, emailsSent: sent }),
      { headers: { "Content-Type": "application/json" }, status: 200 },
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 })
  }
})
