import {
  Button,
  Heading,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface TherapistExpiringPatientEmailProps {
  patientName?: string
  therapistName?: string
  daysRemaining: number
}

export function TherapistExpiringPatientEmail(props: TherapistExpiringPatientEmailProps) {
  const { patientName = 'Bonjour', therapistName = 'votre orthophoniste', daysRemaining } = props

  return (
    <BaseLayout preview={`Votre accès à Parler Moins Vite est en jeu`}>
      <Heading style={heading}>
        ⚠️ Votre accès se termine dans {daysRemaining} jour{daysRemaining > 1 ? 's' : ''}
      </Heading>

      <Text style={paragraph}>Bonjour {patientName},</Text>

      <Text style={paragraph}>
        L'abonnement de {therapistName} à Parler Moins Vite arrive à expiration dans {daysRemaining} jour{daysRemaining > 1 ? 's' : ''}.
      </Text>

      <Text style={warningBox}>
        🔒 Sans renouvellement, vous perdrez l'accès à vos exercices, votre historique de sessions et le suivi de vos progrès. Toutes vos données seront conservées, mais inaccessibles.
      </Text>

      <Text style={paragraph}>
        <strong>Que pouvez-vous faire ?</strong>
      </Text>

      <Text style={actionBox}>
        📞 Contactez {therapistName} pour l'informer de la situation. Un simple message suffit :
      </Text>

      <Text style={scriptBox}>
        « Bonjour, je viens de recevoir un message de Parler Moins Vite indiquant que mon accès va bientôt expirer. Serait-il possible de renouveler votre abonnement pour que je puisse continuer mes exercices ? Merci ! »
      </Text>

      <Text style={reassuranceBox}>
        💾 Rassurez-vous : vos données (sessions, progrès, exercices) sont sauvegardées et seront immédiatement accessibles dès que votre orthophoniste renouvelle son abonnement.
      </Text>

      <Text style={paragraph}>
        <strong>Vous souhaitez continuer seul(e) ?</strong>
      </Text>

      <Text style={paragraph}>
        Vous pouvez aussi passer en <strong>Mode Autonomie</strong> et continuer vos exercices de manière indépendante, avec 7 jours d'essai gratuit. Il vous suffit d'aller dans vos Réglages et de choisir « Passer en mode autonome ».
      </Text>

      <Button style={autonomeButton} href="https://www.parlermoinsvite.fr/settings">
        Continuer en Mode Autonomie →
      </Button>

      <Text style={smallText}>
        Ce message est envoyé automatiquement pour vous permettre de continuer votre progression. Des questions ? Écrivez-nous à contact@parlermoinsvite.fr.
      </Text>
    </BaseLayout>
  )
}

export default TherapistExpiringPatientEmail

const heading = {
  color: '#e5a122',
  fontSize: '24px',
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

const warningBox = {
  backgroundColor: '#fef2f2',
  borderRadius: '18px',
  borderLeft: '4px solid #cd4540',
  color: '#b91c1c',
  fontSize: '14px',
  lineHeight: '22px',
  padding: '16px',
  margin: '24px 0',
}

const actionBox = {
  color: '#2e3346',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 12px',
}

const scriptBox = {
  backgroundColor: '#f8f6f3',
  borderRadius: '18px',
  borderLeft: '4px solid #3a9e8e',
  color: '#2a6b62',
  fontSize: '15px',
  fontStyle: 'italic' as const,
  lineHeight: '24px',
  padding: '16px 20px',
  margin: '12px 0 24px',
}

const reassuranceBox = {
  backgroundColor: '#eef7f5',
  borderRadius: '18px',
  color: '#2a6b62',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '16px',
  margin: '24px 0',
}

const autonomeButton = {
  backgroundColor: '#3a9e8e',
  borderRadius: '18px',
  color: '#ffffff',
  display: 'inline-block' as const,
  fontSize: '16px',
  fontWeight: 'bold' as const,
  padding: '14px 28px',
  textAlign: 'center' as const,
  textDecoration: 'none',
  margin: '8px 0 24px',
}

const smallText = {
  color: '#6e7282',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0 0',
}
