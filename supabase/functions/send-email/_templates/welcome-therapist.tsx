import {
  Button,
  Heading,
  Hr,
  Section,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface WelcomeTherapistEmailProps {
  therapistName?: string
  therapistCode?: string
  referralCode?: string
  dashboardUrl: string
}

export function WelcomeTherapistEmail(props: WelcomeTherapistEmailProps) {
  const { therapistName = 'Cher orthophoniste', therapistCode, referralCode, dashboardUrl } = props
  
  const referralUrl = referralCode 
    ? `https://parlermoinsvite.fr/pro?ref=${referralCode}` 
    : 'https://parlermoinsvite.fr/pro';
  
  return (
    <BaseLayout preview="Votre compte Pro est prêt — invitez votre premier patient.">
      <Heading style={heading}>Bienvenue dans l'aventure 🎯</Heading>

      <Text style={paragraph}>Bonjour {therapistName},</Text>

      <Text style={paragraph}>
        Votre compte est actif. Voici l'essentiel pour démarrer :
      </Text>

      {therapistCode && (
        <Text style={codeBox}>
          Votre Code Pro : {therapistCode}
        </Text>
      )}

      {therapistCode && (
        <Text style={codeInstruction}>
          Partagez ce code avec vos patients pour qu'ils se connectent à votre compte. Ils bénéficieront d'un accès complet et gratuit.
        </Text>
      )}

      <Button style={button} href={dashboardUrl}>
        Inviter mon premier patient
      </Button>

      <Text style={trialBox}>
        🎁 30 jours d'essai gratuit — accès à toutes les fonctionnalités Pro.
      </Text>

      <Hr style={divider} />

      <Text style={sectionTitle}>Ce que vous pouvez faire</Text>

      <Section style={featureCardHighlight}>
        <Text style={featureCardTitle}>🔬 Débitmètre en séance</Text>
        <Text style={featureCardDesc}>
          Mesurez le débit de votre patient en direct, pendant la consultation. Interface plein écran, zéro distraction. Un vrai instrument de mesure clinique.
        </Text>
      </Section>

      <Section style={featureCard}>
        <Text style={featureCardTitle}>📊 Retour visuel en temps réel</Text>
        <Text style={featureCardDesc}>
          Vos patients visualisent leur débit syllabique en direct, avec les normes Van Zaalen comme référence.
        </Text>
      </Section>

      <Section style={featureCard}>
        <Text style={featureCardTitle}>🔥 Vos patients s'entraînent entre les séances</Text>
        <Text style={featureCardDesc}>
          Séries, objectifs quotidiens, badges : la gamification motive vos patients à pratiquer régulièrement, même entre deux rendez-vous.
        </Text>
      </Section>

      <Section style={featureCard}>
        <Text style={featureCardTitle}>📚 +155 exercices variés</Text>
        <Text style={featureCardDesc}>
          Lecture, respiration, articulation, dialogue, récit résumé, rébus enfant… Une bibliothèque complète pour tous les profils.
        </Text>
      </Section>

      <Section style={featureCard}>
        <Text style={featureCardTitle}>📄 Bilans PDF en un clic</Text>
        <Text style={featureCardDesc}>
          Générez des rapports cliniques détaillés avec l'évolution du débit, les courbes de progression et les notes de séance.
        </Text>
      </Section>

      <Hr style={divider} />

      <Text style={testimonialBox}>
        💬 "Bien conçu et facile d'utilisation. C'est vraiment l'outil qu'il me manquait pour mesurer objectivement le débit de parole." — Orthophoniste
      </Text>

      {referralCode && (
        <>
          <Hr style={divider} />
          <Text style={referralBox}>
            👥 Parrainage : Partagez avec vos confrères et recevez 1 mois gratuit chacun ! Code : {referralCode} — {referralUrl}
          </Text>
        </>
      )}

      <Text style={paragraph}>
        Des questions ? Écrivez-nous à contact@parlermoinsvite.fr
      </Text>

      <Text style={signatureText}>À votre service,</Text>
      <Text style={signatureName}>L'équipe Parler Moins Vite</Text>
    </BaseLayout>
  )
}

export default WelcomeTherapistEmail

const heading = {
  color: '#3a9e8e',
  fontSize: '26px',
  fontWeight: 'bold' as const,
  margin: '0 0 24px',
  padding: '0',
  textAlign: 'center' as const,
}

const paragraph = {
  color: '#2e3346',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 18px',
}

const codeBox = {
  backgroundColor: '#2e3346',
  borderRadius: '18px',
  color: '#5ed4c0',
  fontSize: '22px',
  fontWeight: 'bold' as const,
  lineHeight: '28px',
  padding: '24px',
  margin: '16px 0 8px',
  textAlign: 'center' as const,
}

const codeInstruction = {
  color: '#6e7282',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 20px',
  textAlign: 'center' as const,
}

const trialBox = {
  backgroundColor: '#eef7f5',
  borderRadius: '18px',
  borderLeft: '4px solid #3ab58f',
  color: '#166534',
  fontSize: '14px',
  lineHeight: '22px',
  padding: '16px',
  margin: '24px 0',
}

const referralBox = {
  backgroundColor: '#eef7f5',
  borderRadius: '18px',
  borderLeft: '4px solid #3a9e8e',
  color: '#2a6b62',
  fontSize: '14px',
  lineHeight: '22px',
  padding: '16px',
  margin: '24px 0',
}

const divider = {
  borderColor: '#e5dfd6',
  margin: '32px 0',
}

const sectionTitle = {
  color: '#2e3346',
  fontSize: '18px',
  fontWeight: 'bold' as const,
  lineHeight: '28px',
  margin: '0 0 16px',
}

const featureCard = {
  backgroundColor: '#f8f6f3',
  border: '1px solid #e5dfd6',
  borderRadius: '18px',
  padding: '16px 20px',
  marginBottom: '12px',
}

const featureCardHighlight = {
  backgroundColor: '#eef7f5',
  border: '2px solid #3a9e8e',
  borderRadius: '18px',
  padding: '16px 20px',
  marginBottom: '12px',
}

const featureCardTitle = {
  fontSize: '15px',
  fontWeight: 'bold' as const,
  color: '#2e3346',
  margin: '0 0 6px',
}

const featureCardDesc = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#2e3346',
  margin: '0',
}

const button = {
  backgroundColor: '#3a9e8e',
  borderRadius: '18px',
  color: '#fff',
  display: 'block',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  textAlign: 'center' as const,
  textDecoration: 'none',
  padding: '14px 28px',
  margin: '28px auto',
}

const signatureText = {
  color: '#6e7282',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '32px 0 4px',
}

const signatureName = {
  color: '#3a9e8e',
  fontSize: '14px',
  fontWeight: 'bold' as const,
  lineHeight: '20px',
  margin: '0 0 16px',
}

const testimonialBox = {
  backgroundColor: '#f8f6f3',
  borderRadius: '18px',
  borderLeft: '4px solid #3a9e8e',
  color: '#2a6b62',
  fontSize: '15px',
  fontStyle: 'italic' as const,
  lineHeight: '24px',
  padding: '16px 20px',
  margin: '24px 0',
}
