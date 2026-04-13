import {
  Button,
  Heading,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface TrialExpiringEmailProps {
  therapistName?: string
  daysRemaining: number
  patientsCount: number
  subscribeUrl: string
  referralCode?: string
}

export function TrialExpiringEmail(props: TrialExpiringEmailProps) {
  const { therapistName = 'Cher orthophoniste', daysRemaining, patientsCount, subscribeUrl, referralCode } = props
  
  const referralUrl = referralCode 
    ? `https://parlermoinsvite.fr/pro?ref=${referralCode}` 
    : null;
  
  return (
    <BaseLayout preview={`Votre période d'essai se termine dans ${daysRemaining} jours`}>
      <Heading style={heading}>
        ⏰ Votre essai se termine dans {daysRemaining} jour{daysRemaining > 1 ? 's' : ''}
      </Heading>

      <Text style={paragraph}>Bonjour {therapistName},</Text>

      <Text style={paragraph}>
        Votre période d'essai gratuite de Parler Moins Vite Pro arrive à son terme dans {daysRemaining} jour{daysRemaining > 1 ? 's' : ''}.
      </Text>

      {patientsCount > 0 && (
        <Text style={warningBox}>
          ⚠️ Important : Vous avez actuellement {patientsCount} patient{patientsCount > 1 ? 's' : ''} suivi{patientsCount > 1 ? 's' : ''}. Sans abonnement, vous ne pourrez plus accéder à leurs données ni leur assigner des exercices.
        </Text>
      )}

      <Text style={benefitsBox}>
        ✨ Avec Parler Moins Vite Pro : Suivi illimité de vos patients, accès aux métriques cliniques avancées, génération de bilans PDF, assignation d'exercices personnalisés, et support prioritaire.
      </Text>

      <Text style={testimonialBox}>
        💬 "Bien conçu et facile d'utilisation. C'est vraiment l'outil qu'il me manquait pour mesurer objectivement le débit de parole." — Orthophoniste
      </Text>

      <Button style={button} href={subscribeUrl}>
        Souscrire maintenant
      </Button>

      {referralCode && referralUrl && (
        <Text style={referralBox}>
          💡 Astuce parrainage : Recommandez Parler Moins Vite à un confrère et recevez tous les deux 1 mois gratuit ! Partagez simplement ce lien : {referralUrl} — Votre code : {referralCode}
        </Text>
      )}

      <Text style={smallText}>
        Des questions sur nos offres ? Écrivez-nous à contact@parlermoinsvite.fr — nous serons ravis de vous aider.
      </Text>
    </BaseLayout>
  )
}

export default TrialExpiringEmail

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

const benefitsBox = {
  backgroundColor: '#f8f6f3',
  borderRadius: '18px',
  color: '#2a6b62',
  fontSize: '14px',
  lineHeight: '24px',
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

const smallText = {
  color: '#6e7282',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0 0',
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