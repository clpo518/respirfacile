import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { patient_id, therapist_id, exercises } = await req.json()

    if (!patient_id || !therapist_id || !exercises?.length) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Récupérer les infos patient + thérapeute
    const [{ data: patient }, { data: therapist }] = await Promise.all([
      supabaseAdmin.from('profiles').select('full_name, email').eq('id', patient_id).single(),
      supabaseAdmin.from('profiles').select('full_name, email').eq('id', therapist_id).single(),
    ])

    if (!patient?.email) {
      return new Response(JSON.stringify({ error: 'Patient email not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const patientFirstName = patient.full_name?.split(' ')[0] || 'Cher patient'
    const therapistName = therapist?.full_name || 'Votre praticien'
    const exerciseList = exercises
      .map((ex: { name: string; frequency: string; note?: string }) => {
        let line = `• ${ex.name}, ${ex.frequency}`
        if (ex.note) line += `\n  → ${ex.note}`
        return line
      })
      .join('\n')

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

    if (!RESEND_API_KEY) {
      // Log sans envoyer si pas de clé
      console.log('No RESEND_API_KEY, email would have been sent to:', patient.email)
      return new Response(JSON.stringify({ ok: true, skipped: 'no_resend_key' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const emailHtml = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f5f0e8; margin: 0; padding: 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.08);">
    <div style="background: #2D5016; padding: 32px 40px; text-align: center;">
      <p style="color: #a8c87a; font-size: 13px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 8px;">Respirfacile</p>
      <h1 style="color: white; font-size: 22px; margin: 0; font-weight: 700;">Votre programme est prêt 🌿</h1>
    </div>
    <div style="padding: 36px 40px;">
      <p style="color: #3d5a2a; font-size: 16px; margin: 0 0 20px;">Bonjour ${patientFirstName},</p>
      <p style="color: #5a7a46; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
        ${therapistName} vient de vous prescrire un programme d'exercices respiratoires personnalisé.
        Vous pouvez le retrouver directement dans votre espace patient.
      </p>

      <div style="background: #f5f0e8; border-radius: 16px; padding: 20px 24px; margin: 0 0 28px;">
        <p style="color: #2D5016; font-weight: 700; font-size: 14px; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px;">
          Vos exercices prescrits
        </p>
        <pre style="color: #3d5a2a; font-family: inherit; font-size: 14px; line-height: 1.8; margin: 0; white-space: pre-wrap;">${exerciseList}</pre>
      </div>

      <div style="text-align: center; margin: 0 0 28px;">
        <a href="${Deno.env.get('NEXT_PUBLIC_APP_URL') ?? 'https://respirfacile.fr'}/dashboard"
           style="display: inline-block; background: #2D5016; color: white; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 14px; text-decoration: none;">
          Voir mon programme →
        </a>
      </div>

      <p style="color: #8a9a7a; font-size: 13px; line-height: 1.6; margin: 0;">
        Conseil : pratiquez de préférence le matin, à jeun ou 2h après un repas.
        La régularité est plus importante que l'intensité.
      </p>
    </div>
    <div style="background: #f5f0e8; padding: 20px 40px; text-align: center; border-top: 1px solid #e8e0d0;">
      <p style="color: #a0a090; font-size: 12px; margin: 0;">
        Vous recevez cet email car vous êtes patient sur Respirfacile.<br/>
        <a href="${Deno.env.get('NEXT_PUBLIC_APP_URL') ?? 'https://respirfacile.fr'}" style="color: #5a7a46;">respirfacile.fr</a>
      </p>
    </div>
  </div>
</body>
</html>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Respirfacile <noreply@respirfacile.fr>',
        to: [patient.email],
        subject: `${therapistName} vous a prescrit ${exercises.length} exercice${exercises.length > 1 ? 's' : ''} respiratoire${exercises.length > 1 ? 's' : ''}`,
        html: emailHtml,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Resend error:', err)
      return new Response(JSON.stringify({ error: 'Email send failed', details: err }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Log dans email_logs
    await supabaseAdmin.from('email_logs').insert({
      user_id: patient_id,
      email_type: 'prescription_notification',
      recipient_email: patient.email,
      status: 'sent',
    })

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Function error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
