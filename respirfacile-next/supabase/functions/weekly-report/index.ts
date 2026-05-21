import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Appellée par un cron Supabase chaque lundi à 8h00
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
  const APP_URL = Deno.env.get('NEXT_PUBLIC_APP_URL') ?? 'https://respirfacile.fr'

  // Récupérer tous les thérapeutes actifs
  const { data: therapists } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'therapist')
    .in('subscription_status', ['active', 'trialing'])

  if (!therapists?.length) {
    return new Response(JSON.stringify({ ok: true, sent: 0 }), { headers: corsHeaders })
  }

  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 86400000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000)
  let sent = 0

  for (const therapist of therapists) {
    // Patients de ce thérapeute
    const { data: links } = await supabase
      .from('therapist_patients')
      .select('patient_id, patient:profiles!therapist_patients_patient_id_fkey(id, full_name, email)')
      .eq('therapist_id', therapist.id)
      .eq('status', 'active')

    if (!links?.length) continue

    const patientIds = links.map((l: any) => l.patient_id)
    const patientMap: Record<string, string> = {}
    links.forEach((l: any) => { patientMap[l.patient_id] = l.patient?.full_name || 'Patient' })

    // Sessions cette semaine vs semaine précédente
    const { data: sessionsWeek } = await supabase
      .from('sessions')
      .select('user_id, created_at, exercise_id, score')
      .in('user_id', patientIds)
      .gte('created_at', oneWeekAgo.toISOString())

    const { data: sessionsPrevWeek } = await supabase
      .from('sessions')
      .select('user_id, created_at')
      .in('user_id', patientIds)
      .gte('created_at', twoWeeksAgo.toISOString())
      .lt('created_at', oneWeekAgo.toISOString())

    // Stats par patient cette semaine
    const statsByPatient: Record<string, { sessions: number; prevSessions: number; lastDate: string | null }> = {}
    patientIds.forEach(id => { statsByPatient[id] = { sessions: 0, prevSessions: 0, lastDate: null } })
    sessionsWeek?.forEach((s: any) => {
      statsByPatient[s.user_id].sessions++
      if (!statsByPatient[s.user_id].lastDate || s.created_at > statsByPatient[s.user_id].lastDate!) {
        statsByPatient[s.user_id].lastDate = s.created_at
      }
    })
    sessionsPrevWeek?.forEach((s: any) => { statsByPatient[s.user_id].prevSessions++ })

    // Classer : actifs, en baisse, inactifs
    const active = patientIds.filter(id => statsByPatient[id].sessions >= 3)
    const slipping = patientIds.filter(id => statsByPatient[id].sessions > 0 && statsByPatient[id].sessions < 3)
    const inactive = patientIds.filter(id => statsByPatient[id].sessions === 0)

    const totalSessions = (sessionsWeek?.length || 0)
    const firstName = therapist.full_name?.split(' ')[0] || 'Docteur'

    // Générer les lignes de tableau patients
    const renderPatientRow = (id: string, category: 'active' | 'slipping' | 'inactive') => {
      const name = patientMap[id]
      const stats = statsByPatient[id]
      const trend = stats.sessions > stats.prevSessions ? '📈' : stats.sessions < stats.prevSessions ? '📉' : '➡️'
      const badge = category === 'active' ? '#22c55e' : category === 'slipping' ? '#f59e0b' : '#ef4444'
      const badgeLabel = category === 'active' ? 'Actif' : category === 'slipping' ? 'En baisse' : 'Inactif'
      return `
        <tr>
          <td style="padding: 10px 16px; font-size: 14px; color: #2D5016; font-weight: 500;">${name}</td>
          <td style="padding: 10px 16px; text-align: center;">
            <span style="display: inline-block; background: ${badge}20; color: ${badge}; border: 1px solid ${badge}40; border-radius: 20px; padding: 2px 10px; font-size: 12px; font-weight: 600;">${badgeLabel}</span>
          </td>
          <td style="padding: 10px 16px; text-align: center; font-size: 14px; font-weight: 700; color: #2D5016;">${stats.sessions}</td>
          <td style="padding: 10px 16px; text-align: center; font-size: 18px;">${category === 'inactive' ? '⚠️' : trend}</td>
          <td style="padding: 10px 16px; text-align: center;">
            <a href="${APP_URL}/therapist/patients/${id}" style="color: #2D5016; font-size: 12px; font-weight: 600; text-decoration: none; border: 1px solid #a8c87a; padding: 4px 10px; border-radius: 8px;">Voir →</a>
          </td>
        </tr>`
    }

    const allRows = [
      ...active.map(id => renderPatientRow(id, 'active')),
      ...slipping.map(id => renderPatientRow(id, 'slipping')),
      ...inactive.map(id => renderPatientRow(id, 'inactive')),
    ].join('')

    const weekLabel = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f5f0e8; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto;">

    <!-- Header -->
    <div style="background: #2D5016; border-radius: 20px 20px 0 0; padding: 28px 36px;">
      <p style="color: #a8c87a; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 8px;">Respirfacile · Rapport hebdo</p>
      <h1 style="color: white; font-size: 22px; margin: 0 0 4px; font-weight: 700;">Bonjour ${firstName} 👋</h1>
      <p style="color: #c8e0a0; font-size: 13px; margin: 0;">Semaine du ${weekLabel}</p>
    </div>

    <!-- Stats résumé -->
    <div style="background: white; padding: 24px 36px; border-left: 1px solid #e8e0d0; border-right: 1px solid #e8e0d0;">
      <div style="display: flex; gap: 0; border: 1px solid #e8e0d0; border-radius: 16px; overflow: hidden;">
        <div style="flex: 1; text-align: center; padding: 20px 12px; border-right: 1px solid #e8e0d0;">
          <p style="font-size: 28px; font-weight: 800; color: #2D5016; margin: 0;">${patientIds.length}</p>
          <p style="font-size: 11px; color: #8a9a7a; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 1px;">Patients</p>
        </div>
        <div style="flex: 1; text-align: center; padding: 20px 12px; border-right: 1px solid #e8e0d0;">
          <p style="font-size: 28px; font-weight: 800; color: #22c55e; margin: 0;">${active.length}</p>
          <p style="font-size: 11px; color: #8a9a7a; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 1px;">Actifs</p>
        </div>
        <div style="flex: 1; text-align: center; padding: 20px 12px; border-right: 1px solid #e8e0d0;">
          <p style="font-size: 28px; font-weight: 800; color: #2D5016; margin: 0;">${totalSessions}</p>
          <p style="font-size: 11px; color: #8a9a7a; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 1px;">Séances</p>
        </div>
        <div style="flex: 1; text-align: center; padding: 20px 12px;">
          <p style="font-size: 28px; font-weight: 800; color: ${inactive.length > 0 ? '#ef4444' : '#22c55e'}; margin: 0;">${inactive.length}</p>
          <p style="font-size: 11px; color: #8a9a7a; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 1px;">Inactifs</p>
        </div>
      </div>
    </div>

    <!-- Tableau patients -->
    <div style="background: white; padding: 0 36px 28px; border-left: 1px solid #e8e0d0; border-right: 1px solid #e8e0d0;">
      <h2 style="font-size: 14px; font-weight: 700; color: #2D5016; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 1px;">Détail par patient</h2>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #e8e0d0; border-radius: 12px; overflow: hidden;">
        <thead>
          <tr style="background: #f5f0e8;">
            <th style="padding: 10px 16px; text-align: left; font-size: 11px; color: #8a9a7a; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Patient</th>
            <th style="padding: 10px 16px; text-align: center; font-size: 11px; color: #8a9a7a; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Statut</th>
            <th style="padding: 10px 16px; text-align: center; font-size: 11px; color: #8a9a7a; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Séances</th>
            <th style="padding: 10px 16px; text-align: center; font-size: 11px; color: #8a9a7a; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Tendance</th>
            <th style="padding: 10px 16px; text-align: center; font-size: 11px; color: #8a9a7a; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Action</th>
          </tr>
        </thead>
        <tbody style="background: white;">
          ${allRows}
        </tbody>
      </table>
    </div>

    <!-- CTA -->
    ${inactive.length > 0 ? `
    <div style="background: #fff7ed; border: 1px solid #fed7aa; border-left: none; border-right: none; padding: 16px 36px;">
      <p style="color: #92400e; font-size: 13px; margin: 0;">
        ⚠️ <strong>${inactive.length} patient${inactive.length > 1 ? 's' : ''} n'a${inactive.length > 1 ? 'ont' : ''} pas pratiqué cette semaine.</strong>
        Un message d'encouragement augmente le taux de retour de 60%.
      </p>
    </div>` : `
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-left: none; border-right: none; padding: 16px 36px;">
      <p style="color: #166534; font-size: 13px; margin: 0;">
        🎉 <strong>Excellent !</strong> Tous vos patients ont pratiqué cette semaine. Continuez comme ça.
      </p>
    </div>`}

    <div style="background: white; border: 1px solid #e8e0d0; border-top: none; border-radius: 0 0 20px 20px; padding: 24px 36px; text-align: center;">
      <a href="${APP_URL}/therapist"
         style="display: inline-block; background: #2D5016; color: white; font-weight: 700; font-size: 14px; padding: 14px 32px; border-radius: 14px; text-decoration: none;">
        Ouvrir le tableau de bord →
      </a>
      <p style="color: #a0a090; font-size: 11px; margin: 16px 0 0;">
        Rapport automatique Respirfacile · <a href="${APP_URL}" style="color: #5a7a46;">respirfacile.fr</a>
      </p>
    </div>

  </div>
</body>
</html>`

    if (!RESEND_API_KEY || !therapist.email) continue

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Respirfacile <rapports@respirfacile.fr>',
        to: [therapist.email],
        subject: `Votre rapport hebdo · ${active.length}/${patientIds.length} patients actifs cette semaine`,
        html,
      }),
    })

    if (res.ok) sent++
  }

  return new Response(JSON.stringify({ ok: true, sent }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
