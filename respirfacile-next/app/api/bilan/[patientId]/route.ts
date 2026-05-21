import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { patient_id, recipient_email, note } = await req.json();
  if (!patient_id || !recipient_email) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Vérifier que ce patient appartient bien à cet ortho
  const { data: link } = await supabase
    .from('therapist_patients')
    .select('id')
    .eq('therapist_id', user.id)
    .eq('patient_id', patient_id)
    .single();

  if (!link) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Récupérer les profils
  const [{ data: patient }, { data: therapist }] = await Promise.all([
    supabase.from('profiles').select('full_name, email').eq('id', patient_id).single(),
    supabase.from('profiles').select('full_name, email').eq('id', user.id).single(),
  ]);

  const patientName = patient?.full_name || 'Patient';
  const therapistName = therapist?.full_name || 'Votre thérapeute';
  const bilanUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://respirfacile.fr'}/api/bilan/${patient_id}`;

  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    // Dev mode, log sans envoyer
    console.log(`[DEV] Bilan email would be sent to ${recipient_email} for patient ${patientName}`);
    return NextResponse.json({ ok: true, dev: true });
  }

  const defaultNote = `Je vous transmets le bilan de rééducation respiratoire de ${patientName}, suivi dans notre cabinet avec l'application Respirfacile.`;

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f5f0e8; margin: 0; padding: 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.08);">
    <div style="background: #2D5016; padding: 28px 36px;">
      <p style="color: #a8c87a; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 6px;">Respirfacile</p>
      <h1 style="color: white; font-size: 20px; margin: 0; font-weight: 700;">Bilan de rééducation respiratoire</h1>
      <p style="color: #c8e0a0; font-size: 14px; margin: 6px 0 0;">${patientName}</p>
    </div>
    <div style="padding: 32px 36px;">
      <p style="color: #3d5a2a; margin: 0 0 20px;">Bonjour,</p>
      <p style="color: #5a7a46; line-height: 1.7; margin: 0 0 24px;">${note || defaultNote}</p>

      <div style="background: #f5f0e8; border-radius: 16px; padding: 20px 24px; margin: 0 0 28px; border-left: 4px solid #2D5016;">
        <p style="color: #2D5016; font-weight: 700; font-size: 13px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Le bilan comprend</p>
        <ul style="color: #5a7a46; font-size: 14px; line-height: 2; margin: 0; padding-left: 20px;">
          <li>Historique complet des séances</li>
          <li>Progression des scores (pause contrôlée, cohérence cardiaque)</li>
          <li>Taux d'observance semaine par semaine</li>
          <li>Programme d'exercices prescrit</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 0 0 24px;">
        <a href="${bilanUrl}"
           style="display: inline-block; background: #2D5016; color: white; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 14px; text-decoration: none;">
          Télécharger le bilan PDF →
        </a>
      </div>

      <p style="color: #8a9a7a; font-size: 13px; line-height: 1.6; margin: 0; border-top: 1px solid #e8e0d0; padding-top: 20px;">
        Ce bilan a été généré automatiquement par Respirfacile et transmis par <strong>${therapistName}</strong>.
        Pour toute question, contactez directement le praticien.
      </p>
    </div>
  </div>
</body>
</html>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${therapistName} via Respirfacile <noreply@respirfacile.fr>`,
      to: [recipient_email],
      subject: `Bilan de rééducation respiratoire, ${patientName}`,
      html,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Email failed' }, { status: 500 });
  }

  // Log
  await supabase.from('email_logs').insert({
    user_id: patient_id,
    email_type: 'bilan_share',
    recipient_email,
    status: 'sent',
  });

  return NextResponse.json({ ok: true });
}
