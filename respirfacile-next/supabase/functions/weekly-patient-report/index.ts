import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Appelée par un cron Supabase chaque dimanche à 19h00
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
  const APP_URL = Deno.env.get('NEXT_PUBLIC_APP_URL') ?? 'https://respirfacile.fr'

  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 86400000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000)

  // Récupérer tous les patients actifs (liés à un thérapeute)
  const { data: patients } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'patient')

  if (!patients?.length) {
    return new Response(JSON.stringify({ ok: true, sent: 0 }), { headers: corsHeaders })
  }

  let sent = 0

  for (const patient of patients) {
    if (!patient.email) continue

    // Sessions cette semaine
    const { data: sessionsWeek } = await supabase
      .from('sessions')
      .select('exercise_id, score, created_at')
      .eq('user_id', patient.id)
      .gte('created_at', oneWeekAgo.toISOString())

    // Sessions semaine précédente
    const { count: prevCount } = await supabase
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', patient.id)
      .gte('created_at', twoWeeksAgo.toISOString())
      .lt('created_at', oneWeekAgo.toISOString())

    const sessionCount = sessionsWeek?.length || 0

    // Skip si 0 séances cette semaine ET 0 la semaine précédente (patient inactif depuis longtemps)
    if (sessionCount === 0 && (prevCount || 0) === 0) continue

    const firstName = patient.full_name?.split(' ')[0] || 'vous'
    const prevSessions = prevCount || 0
    const progressVsPrev = sessionCount - prevSessions

    // Meilleur score de pause cette semaine
    const scoresThisWeek = (sessionsWeek || [])
      .filter((s: any) => s.score !== null)
      .map((s: any) => s.score as number)
    const bestScore = scoresThisWeek.length > 0 ? Math.max(...scoresThisWeek) : null

    // Message d'encouragement personnalisé
    const getEncouragement = () => {
      if (sessionCount === 0) return {
        emoji: '💭',
        title: 'Cette semaine, on s\'est manqué',
        body: 'Ça arrive. La semaine prochaine, même une seule séance compte.'
      }
      if (progressVsPrev > 0) return {
        emoji: '🚀',
        title: `+${progressVsPrev} séances de plus que la semaine dernière !`,
        body: 'Vous êtes sur une belle lancée. Continuez comme ça.'
      }
      if (sessionCount >= 5) return {
        emoji: '🏆',
        title: 'Semaine exceptionnelle !',
        body: `${sessionCount} séances en une semaine, c'est remarquable.`
      }
      if (sessionCount >= 3) return {
        emoji: '💪',
        title: 'Bonne régularité !',
        body: `La régularité, c'est la clé. Vous êtes sur la bonne voie.`
      }
      return {
        emoji: '🌱',
        title: 'Vous avancez !',
        body: 'Chaque séance compte. Votre corps s\'adapte progressivement.'
      }
    }

    const enc = getEncouragement()
    const weekLabel = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f5f0e8; margin: 0; padding: 20px;">
  <div style="max-width: 560px; margin: 0 auto;">

    <!-- Header -->
    <div style="background: #2D5016; border-radius: 20px 20px 0 0; padding: 28px 36px;">
      <p style="color: #a8c87a; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 8px;">Respirfacile · Votre semaine</p>
      <h1 style="color: white; font-size: 22px; margin: 0 0 4px; font-weight: 700;">Bonjour ${firstName} 👋</h1>
      <p style="color: #c8e0a0; font-size: 13px; margin: 0;">Semaine du ${weekLabel}</p>
    </div>

    <!-- Stats -->
    <div style="background: white; padding: 24px 36px; border-left: 1px solid #e8e0d0; border-right: 1px solid #e8e0d0;">
      <div style="display: flex; gap: 0; border: 1px solid #e8e0d0; border-radius: 16px; overflow: hidden;">
        <div style="flex: 1; text-align: center; padding: 20px 12px; border-right: 1px solid #e8e0d0;">
          <p style="font-size: 32px; font-weight: 800; color: #2D5016; margin: 0;">${sessionCount}</p>
          <p style="font-size: 11px; color: #8a9a7a; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 1px;">Séances</p>
        </div>
        <div style="flex: 1; text-align: center; padding: 20px 12px; border-right: 1px solid #e8e0d0;">
          <p style="font-size: 32px; font-weight: 800; color: ${progressVsPrev > 0 ? '#22c55e' : progressVsPrev < 0 ? '#ef4444' : '#2D5016'}; margin: 0;">
            ${progressVsPrev > 0 ? '+' : ''}${progressVsPrev}
          </p>
          <p style="font-size: 11px; color: #8a9a7a; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 1px;">vs sem. passée</p>
        </div>
        <div style="flex: 1; text-align: center; padding: 20px 12px;">
          <p style="font-size: 32px; font-weight: 800; color: #8B4513; margin: 0;">${bestScore !== null ? bestScore : '—'}</p>
          <p style="font-size: 11px; color: #8a9a7a; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 1px;">Meilleur score</p>
        </div>
      </div>
    </div>

    <!-- Message encouragement -->
    <div style="background: white; padding: 0 36px 24px; border-left: 1px solid #e8e0d0; border-right: 1px solid #e8e0d0;">
      <div style="background: #f5f0e8; border-radius: 16px; padding: 20px 24px;">
        <p style="font-size: 28px; margin: 0 0 8px;">${enc.emoji}</p>
        <p style="font-size: 16px; font-weight: 700; color: #2D5016; margin: 0 0 6px;">${enc.title}</p>
        <p style="font-size: 13px; color: #4a6a3a; margin: 0; line-height: 1.6;">${enc.body}</p>
      </div>
    </div>

    <!-- CTA -->
    <div style="background: white; border: 1px solid #e8e0d0; border-top: none; border-radius: 0 0 20px 20px; padding: 20px 36px 28px; text-align: center;">
      <a href="${APP_URL}/exercises"
         style="display: inline-block; background: #2D5016; color: white; font-weight: 700; font-size: 14px; padding: 14px 32px; border-radius: 14px; text-decoration: none;">
        Faire une séance maintenant →
      </a>
      <p style="color: #a0a090; font-size: 11px; margin: 16px 0 0;">
        Rapport automatique Respirfacile · <a href="${APP_URL}" style="color: #5a7a46;">respirfacile.fr</a>
      </p>
    </div>

  </div>
</body>
</html>`

    if (!RESEND_API_KEY) continue

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Respirfacile <bilans@respirfacile.fr>',
        to: [patient.email],
        subject: `Votre semaine · ${sessionCount} séance${sessionCount > 1 ? 's' : ''} ${progressVsPrev > 0 ? '📈' : sessionCount === 0 ? '' : '💪'}`,
        html,
      }),
    })

    if (res.ok) sent++
  }

  return new Response(JSON.stringify({ ok: true, sent }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
