import {
  Button,
  Heading,
  Img,
  Link,
  Section,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface TrialBugApologyEmailProps {
  userName: string;
  newTrialEndDate: string;
  dashboardUrl: string;
  dialogueImageUrl: string;
}

export function TrialBugApologyEmail({
  userName,
  newTrialEndDate,
  dashboardUrl,
  dialogueImageUrl,
}: TrialBugApologyEmailProps) {
  return (
    <BaseLayout preview={`${userName}, votre essai gratuit a été rétabli — bonne nouvelle en bonus !`}>
      <Heading style={h1}>
        Bonjour {userName} 👋
      </Heading>

      <Text style={paragraph}>
        Nous vous devons des excuses. Un petit bug technique a raccourci votre période d'essai gratuite à <strong>7 jours</strong> au lieu des <strong>30 jours</strong> prévus.
      </Text>

      <Text style={paragraph}>
        <strong>C'est corrigé.</strong> Votre essai est désormais prolongé jusqu'au{' '}
        <span style={highlight}>{newTrialEndDate}</span>, comme promis initialement.
      </Text>

      <Text style={paragraph}>
        Vous pouvez vous reconnecter dès maintenant — toutes vos données sont intactes. 🙏
      </Text>

      <Section style={ctaSection}>
        <Button href={dashboardUrl} style={primaryButton}>
          Accéder à mon espace
        </Button>
      </Section>

      {/* Separator */}
      <Section style={separator} />

      {/* Feature announcement */}
      <Heading as="h2" style={h2}>
        🆕 Nouveau : Mode Dialogue à plusieurs
      </Heading>

      <Text style={paragraph}>
        Profitez de cette bonne nouvelle pour découvrir notre dernière fonctionnalité : le <strong>Mode Dialogue multi-locuteurs</strong>.
      </Text>

      <Img
        src={dialogueImageUrl}
        alt="Mode dialogue avec mesure du débit pour chaque interlocuteur"
        width="100%"
        style={featureImage}
      />

      <Text style={paragraph}>
        Mesurez le débit de parole de <strong>chaque interlocuteur</strong> en temps réel lors de vos séances. Idéal pour :
      </Text>

      <Text style={bulletList}>
        ✅ Évaluer l'échange patient-orthophoniste en direct{'\n'}
        ✅ Comparer les vitesses articulatoires{'\n'}
        ✅ Suivre la régulation du débit en situation de dialogue
      </Text>

      <Text style={paragraph}>
        Disponible dans le <strong>Débitmètre en séance</strong> et le <strong>Mode Dialogue</strong> depuis votre tableau de bord.
      </Text>

      <Section style={ctaSection}>
        <Button href={`${dashboardUrl.replace('/dashboard', '')}/session-live`} style={secondaryButton}>
          Essayer le mode dialogue →
        </Button>
      </Section>

      <Text style={signOff}>
        Merci pour votre patience et votre confiance,{'\n'}
        L'équipe RespirFacile
      </Text>
    </BaseLayout>
  )
}

export default TrialBugApologyEmail

const h1 = {
  color: '#2e3346',
  fontSize: '24px',
  fontWeight: 'bold' as const,
  margin: '0 0 20px',
}

const h2 = {
  color: '#2e3346',
  fontSize: '20px',
  fontWeight: 'bold' as const,
  margin: '0 0 16px',
}

const paragraph = {
  color: '#2e3346',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const highlight = {
  color: '#3a9e8e',
  fontWeight: 'bold' as const,
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '24px 0',
}

const primaryButton = {
  backgroundColor: '#3a9e8e',
  borderRadius: '12px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block' as const,
  padding: '14px 28px',
}

const secondaryButton = {
  backgroundColor: '#f0faf7',
  borderRadius: '12px',
  color: '#3a9e8e',
  fontSize: '15px',
  fontWeight: '600' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block' as const,
  padding: '12px 24px',
  border: '1px solid #3a9e8e',
}

const separator = {
  borderTop: '1px solid #e5dfd6',
  margin: '32px 0',
}

const bulletList = {
  color: '#2e3346',
  fontSize: '15px',
  lineHeight: '28px',
  margin: '0 0 16px',
  whiteSpace: 'pre-line' as const,
}

const featureImage = {
  borderRadius: '12px',
  margin: '16px 0',
}

const signOff = {
  color: '#6e7282',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '24px 0 0',
  whiteSpace: 'pre-line' as const,
  fontStyle: 'italic' as const,
}
