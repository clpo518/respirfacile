import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import React from 'react';
import { Resend } from 'resend';
import { renderAsync } from '@react-email/components';

// Import templates
import { PaymentFailedEmail } from './_templates/payment-failed.tsx';
import { SubscriptionCanceledEmail } from './_templates/subscription-canceled.tsx';
import { SubscriptionConfirmedEmail } from './_templates/subscription-confirmed.tsx';
import { SubscriptionExpiringEmail } from './_templates/subscription-expiring.tsx';
import { InactivityReminderEmail } from './_templates/inactivity-reminder.tsx';
import { WeeklyReportEmail } from './_templates/weekly-report.tsx';
import { WelcomePatientEmail } from './_templates/welcome-patient.tsx';
import { WelcomeTherapistEmail } from './_templates/welcome-therapist.tsx';
import { RefundConfirmationEmail } from './_templates/refund-confirmation.tsx';
import { TrialExpiringEmail } from './_templates/trial-expiring.tsx';
import { FirstWinEmail } from './_templates/first-win.tsx';
import { PatientJoinedEmail } from './_templates/patient-joined.tsx';
import { PatientArchivedEmail } from './_templates/patient-archived.tsx';
import { B2CTrialExpiringEmail } from './_templates/b2c-trial-expiring.tsx';
import { AdminWeeklyDigestEmail } from './_templates/admin-weekly-digest.tsx';
import { TrialExtendedEmail } from './_templates/trial-extended.tsx';
import { NewsletterOrthoV1Email } from './_templates/newsletter-ortho-v1.tsx';
import { TherapistExpiringPatientEmail } from './_templates/therapist-expiring-patient.tsx';
import { PrescriptionAssignedEmail } from './_templates/prescription-assigned.tsx';
import { TherapistNoPatientEmail } from './_templates/therapist-no-patient.tsx';
import { TrialBugApologyEmail } from './_templates/trial-bug-apology.tsx';
import { NewsletterOrthoV2Email } from './_templates/newsletter-ortho-v2.tsx';
import { ReferralAppliedEmail } from './_templates/referral-applied.tsx';
import { ReferralCompletedEmail } from './_templates/referral-completed.tsx';
import { TherapistWeeklyReportEmail } from './_templates/therapist-weekly-report.tsx';
import { TherapistCommentEmail } from './_templates/therapist-comment.tsx';
import { PatientFirstSessionEmail } from './_templates/patient-first-session.tsx';
import { NewsletterOrthoV3Email } from './_templates/newsletter-ortho-v3.tsx';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Email types
type EmailType = 
  | 'payment_failed'
  | 'subscription_canceled'
  | 'subscription_confirmed'
  | 'subscription_expiring'
  | 'inactivity_reminder'
  | 'weekly_report'
  | 'welcome_patient'
  | 'welcome_therapist'
  | 'refund_confirmation'
  | 'trial_expiring'
  | 'first_win'
   | 'patient_joined'
   | 'patient_archived'
    | 'b2c_trial_expiring'
    | 'admin_weekly_digest'
    | 'trial_extended'
    | 'newsletter_ortho_v1'
    | 'therapist_expiring_patient'
    | 'prescription_assigned'
      | 'therapist_no_patient'
      | 'trial_bug_apology'
      | 'newsletter_ortho_v2'
      | 'referral_applied'
      | 'referral_completed'
      | 'therapist_weekly_report'
      | 'therapist_comment'
      | 'patient_first_session'
      | 'newsletter_ortho_v3';

interface EmailRequest {
  type: EmailType;
  to: string;
  data: Record<string, unknown>;
}

// Subject lines for each email type - UX optimized French copy
const EMAIL_SUBJECTS: Record<EmailType, string | ((data: Record<string, unknown>) => string)> = {
  payment_failed: "⚠️ Action requise : votre paiement a échoué",
  subscription_canceled: "Votre abonnement est suspendu",
  subscription_confirmed: "✅ Votre abonnement est activé",
  subscription_expiring: (data) => `Votre abonnement expire le ${data.expirationDate}`,
  inactivity_reminder: (data) => `⏰ Cela fait ${data.daysSinceLastSession} jour${data.daysSinceLastSession > 1 ? 's' : ''} sans pratique`,
  weekly_report: "📊 Votre bilan hebdomadaire RespirFacile",
  welcome_patient: "Bienvenue chez vous – Votre parole, votre rythme",
  welcome_therapist: "Bienvenue dans l'aventure 🎯 — on est ravis de vous accueillir",
  refund_confirmation: "💳 Confirmation de votre remboursement",
  trial_expiring: (data) => `⏰ Votre essai se termine dans ${data.daysRemaining} jours`,
  first_win: "Bravo ! Premier pas franchi 🏆",
  patient_joined: (data) => `${data.patientName} est bien connecté à votre compte`,
  patient_archived: "Votre suivi est en pause",
  b2c_trial_expiring: (data) => `⏰ Plus que ${data.daysRemaining} jour${(data.daysRemaining as number) > 1 ? 's' : ''} d'essai gratuit`,
  admin_weekly_digest: "🏠 Digest Admin – RespirFacile",
  trial_extended: "🎉 Votre accès gratuit est prolongé",
  newsletter_ortho_v1: "☕ Les coulisses de RespirFacile — Nouveautés & nuits blanches",
  therapist_expiring_patient: (data) => `⚠️ Votre accès se termine dans ${data.daysRemaining} jour${(data.daysRemaining as number) > 1 ? 's' : ''}`,
  prescription_assigned: (data) => `📋 ${data.therapistName} vous a prescrit un exercice`,
  therapist_no_patient: "💡 Rappel : invitez votre premier patient sur RespirFacile",
  trial_bug_apology: "🔧 Votre essai gratuit a été rétabli — et une surprise !",
  newsletter_ortho_v2: "🔥 3 nouveautés qui m'ont arraché les cheveux — Newsletter #2",
  newsletter_ortho_v3: "🌍 L'application a traversé 4 733 km — Newsletter #3",
  referral_applied: (data) => data.isReferrer 
    ? `🎁 ${data.referrerName} a utilisé votre code parrain !`
    : "✅ Votre code parrain a été enregistré",
  referral_completed: (data) => `🎉 Parrainage validé — 1 mois offert grâce à ${data.filleulName}`,
  therapist_weekly_report: "📋 Bilan hebdomadaire de vos patients",
  therapist_comment: (data) => `💬 ${data.therapistName} a commenté votre séance`,
  patient_first_session: (data) => `🎉 ${data.patientName} a terminé son premier exercice !`,
};

// Render the appropriate email template
async function renderEmail(type: EmailType, data: Record<string, unknown>): Promise<string> {
  let element: React.ReactElement;

  switch (type) {
    case 'payment_failed':
      element = React.createElement(PaymentFailedEmail, {
        userName: data.userName as string,
        updatePaymentUrl: data.updatePaymentUrl as string,
      });
      break;

    case 'subscription_canceled':
      element = React.createElement(SubscriptionCanceledEmail, {
        userName: data.userName as string,
        resubscribeUrl: data.resubscribeUrl as string,
      });
      break;

    case 'subscription_confirmed':
      element = React.createElement(SubscriptionConfirmedEmail, {
        userName: data.userName as string,
        planName: data.planName as string,
        isTherapist: data.isTherapist as boolean | undefined,
        dashboardUrl: data.dashboardUrl as string,
      });
      break;

    case 'subscription_expiring':
      element = React.createElement(SubscriptionExpiringEmail, {
        userName: data.userName as string,
        expirationDate: data.expirationDate as string,
        renewUrl: data.renewUrl as string,
      });
      break;

    case 'inactivity_reminder':
      element = React.createElement(InactivityReminderEmail, {
        userName: data.userName as string,
        daysSinceLastSession: data.daysSinceLastSession as number,
        currentStreak: data.currentStreak as number,
        practiceUrl: data.practiceUrl as string,
      });
      break;

    case 'weekly_report':
      element = React.createElement(WeeklyReportEmail, {
        userName: data.userName as string,
        weekStartDate: data.weekStartDate as string,
        weekEndDate: data.weekEndDate as string,
        totalSessions: data.totalSessions as number,
        totalMinutes: data.totalMinutes as number,
        averageSps: data.averageSps as number,
        targetSps: data.targetSps as number,
        currentStreak: data.currentStreak as number,
        improvement: data.improvement as number,
        practiceUrl: data.practiceUrl as string,
      });
      break;

    case 'welcome_patient':
      element = React.createElement(WelcomePatientEmail, {
        patientName: data.patientName as string,
        therapistName: data.therapistName as string,
        appUrl: data.appUrl as string,
        isSolo: data.isSolo as boolean | undefined,
      });
      break;

    case 'welcome_therapist':
      element = React.createElement(WelcomeTherapistEmail, {
        therapistName: data.therapistName as string,
        therapistCode: data.therapistCode as string,
        referralCode: data.referralCode as string,
        dashboardUrl: data.dashboardUrl as string,
      });
      break;

    case 'refund_confirmation':
      element = React.createElement(RefundConfirmationEmail, {
        userName: data.userName as string,
        refundAmount: data.refundAmount as string,
      });
      break;

    case 'trial_expiring':
      element = React.createElement(TrialExpiringEmail, {
        therapistName: data.therapistName as string,
        daysRemaining: data.daysRemaining as number,
        patientsCount: data.patientsCount as number,
        subscribeUrl: data.subscribeUrl as string,
        referralCode: data.referralCode as string,
      });
      break;

    case 'first_win':
      element = React.createElement(FirstWinEmail, {
        userName: data.userName as string,
        dashboardUrl: data.dashboardUrl as string,
      });
      break;

    case 'patient_joined':
      element = React.createElement(PatientJoinedEmail, {
        therapistName: data.therapistName as string,
        patientName: data.patientName as string,
        patientDetailUrl: data.patientDetailUrl as string,
        referralCode: data.referralCode as string,
      });
      break;

     case 'patient_archived':
       element = React.createElement(PatientArchivedEmail, {
         patientName: data.patientName as string,
         therapistName: data.therapistName as string,
         contactEmail: data.contactEmail as string | undefined,
       });
       break;

    case 'b2c_trial_expiring':
      element = React.createElement(B2CTrialExpiringEmail, {
        patientName: data.patientName as string,
        daysRemaining: data.daysRemaining as number,
        subscribeUrl: data.subscribeUrl as string,
      });
      break;

    case 'admin_weekly_digest':
      element = React.createElement(AdminWeeklyDigestEmail, {
        weekStartDate: data.weekStartDate as string,
        weekEndDate: data.weekEndDate as string,
        totalUsers: data.totalUsers as number,
        newTherapists: data.newTherapists as number,
        newPatients: data.newPatients as number,
        activeUsers: data.activeUsers as number,
        totalSessions: data.totalSessions as number,
        sessionsThisWeek: data.sessionsThisWeek as number,
        payingCount: data.payingCount as number,
        canceledCount: data.canceledCount as number,
        trialsExpiringSoon: data.trialsExpiringSoon as number,
        totalTrials: data.totalTrials as number,
        deepgramCostWeek: data.deepgramCostWeek as number,
        deepgramCostMonth: data.deepgramCostMonth as number,
        deepgramCostTotal: data.deepgramCostTotal as number,
        dashboardUrl: data.dashboardUrl as string,
      });
      break;

    case 'trial_extended':
      element = React.createElement(TrialExtendedEmail, {
        userName: data.userName as string,
        newEndDate: data.newEndDate as string,
        isTherapist: data.isTherapist as boolean | undefined,
        therapistCode: data.therapistCode as string | undefined,
        dashboardUrl: data.dashboardUrl as string,
      });
      break;

    case 'newsletter_ortho_v1':
      element = React.createElement(NewsletterOrthoV1Email);
      break;

    case 'therapist_expiring_patient':
      element = React.createElement(TherapistExpiringPatientEmail, {
        patientName: data.patientName as string,
        therapistName: data.therapistName as string,
        daysRemaining: data.daysRemaining as number,
      });
      break;

    case 'prescription_assigned':
      element = React.createElement(PrescriptionAssignedEmail, {
        patientName: data.patientName as string,
        therapistName: data.therapistName as string,
        exerciseTitle: data.exerciseTitle as string,
        message: data.message as string | undefined,
        exerciseUrl: data.exerciseUrl as string,
      });
      break;

    case 'therapist_no_patient':
      element = React.createElement(TherapistNoPatientEmail, {
        therapistName: data.therapistName as string,
        therapistCode: data.therapistCode as string | undefined,
        dashboardUrl: data.dashboardUrl as string,
        sessionLiveUrl: data.sessionLiveUrl as string,
      });
      break;

    case 'trial_bug_apology':
      element = React.createElement(TrialBugApologyEmail, {
        userName: data.userName as string,
        newTrialEndDate: data.newTrialEndDate as string,
        dashboardUrl: data.dashboardUrl as string,
        dialogueImageUrl: data.dialogueImageUrl as string,
      });
      break;

    case 'newsletter_ortho_v2':
      element = React.createElement(NewsletterOrthoV2Email);
      break;

    case 'newsletter_ortho_v3':
      element = React.createElement(NewsletterOrthoV3Email);
      break;

    case 'referral_applied':
      element = React.createElement(ReferralAppliedEmail, {
        userName: data.userName as string,
        referrerName: data.referrerName as string,
        dashboardUrl: data.dashboardUrl as string,
        isReferrer: data.isReferrer as boolean | undefined,
      });
      break;

    case 'referral_completed':
      element = React.createElement(ReferralCompletedEmail, {
        userName: data.userName as string,
        filleulName: data.filleulName as string,
        dashboardUrl: data.dashboardUrl as string,
      });
      break;

    case 'therapist_weekly_report':
      element = React.createElement(TherapistWeeklyReportEmail, {
        therapistName: data.therapistName as string,
        weekStartDate: data.weekStartDate as string,
        weekEndDate: data.weekEndDate as string,
        totalPatients: data.totalPatients as number,
        activePatients: data.activePatients as number,
        inactivePatients: data.inactivePatients as number,
        totalPatientSessions: data.totalPatientSessions as number,
        patients: data.patients as Array<{ name: string; sessionsCount: number; totalMinutes: number; averageSps: number; isInactive: boolean }>,
        dashboardUrl: data.dashboardUrl as string,
      });
      break;

    case 'therapist_comment':
      element = React.createElement(TherapistCommentEmail, {
        patientName: data.patientName as string,
        therapistName: data.therapistName as string,
        commentPreview: data.commentPreview as string,
        sessionUrl: data.sessionUrl as string,
      });
      break;

    case 'patient_first_session':
      element = React.createElement(PatientFirstSessionEmail, {
        therapistName: data.therapistName as string,
        patientName: data.patientName as string,
        patientDetailUrl: data.patientDetailUrl as string,
        dashboardUrl: data.dashboardUrl as string,
      });
      break;

    default:
      throw new Error(`Unknown email type: ${type}`);
  }

  return await renderAsync(element);
}

// Get subject line for email type
function getSubject(type: EmailType, data: Record<string, unknown>): string {
  const subject = EMAIL_SUBJECTS[type];
  if (typeof subject === 'function') {
    return subject(data);
  }
  return subject;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, to, data }: EmailRequest = await req.json();

    // Validate required fields
    if (!type || !to) {
      throw new Error("Missing required fields: type and to are required");
    }

    console.log(`Sending ${type} email to ${to}`);

    // Render the email template
    const html = await renderEmail(type, data);
    const subject = getSubject(type, data);

    // Send the email
    const emailResponse = await resend.emails.send({
      from: "RespirFacile <noreply@respirfacile.fr>",
      to: [to],
      subject,
      html,
    });

    console.log(`Email sent successfully:`, emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending email:", errorMessage);
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
