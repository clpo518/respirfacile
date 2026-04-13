import {
  Button,
  Heading,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface TrialExtendedEmailProps {
  userName: string
  newEndDate: string
  isTherapist?: boolean
  therapistCode?: string
  dashboardUrl: string
}

export function TrialExtendedEmail(props: TrialExtendedEmailProps) {
  const { userName = 'Cher utilisateur', newEndDate, isTherapist, therapistCode, dashboardUrl } = props

  return (
    <BaseLayout preview={`Bonne nouvelle : votre accès gratuit est prolongé jusqu'au ${newEndDate} !`}>
      <Heading style={heading}>Votre accès est prolongé 🎉</Heading>

      <Text style={paragraph}>Bonjour {userName},</Text>

      <Text style={paragraph}>
        Bonne nouvelle ! Nous avons prolongé votre accès gratuit à Parler Moins Vite.
      </Text>

      <Text style={highlightBox}>
        📅 Votre nouvel accès est valable <strong>jusqu'au {newEndDate}</strong>. Toutes les fonctionnalités restent disponibles sans aucune interruption.
      </Text>

      {isTherapist && therapistCode && (
        <Text style={proCodeBox}>
          🔑 Votre Code Pro : <strong>{therapistCode}</strong><br />
          Partagez-le avec vos patients pour qu'ils rejoignent votre espace de suivi.
        </Text>
      )}

      <Text style={paragraph}>
        Profitez de cette période pour {isTherapist
          ? "explorer le tableau de bord, inviter vos patients et découvrir les outils d'analyse clinique."
          : "continuer vos exercices et consolider vos progrès à votre rythme."
        }
      </Text>

      <Button style={button} href={dashboardUrl}>
        {isTherapist ? 'Accéder à mon tableau de bord' : 'Continuer mes exercices'}
      </Button>

      <Text style={reassuranceBox}>
        💚 Aucune action requise de votre part. Votre accès est automatiquement prolongé.
      </Text>

      <Text style={signatureText}>À bientôt,</Text>
      <Text style={signatureName}>L'équipe Parler Moins Vite</Text>
    </BaseLayout>
  )
}

export default TrialExtendedEmail

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

const highlightBox = {
  backgroundColor: '#f8f6f3',
  borderRadius: '18px',
  borderLeft: '4px solid #3a9e8e',
  color: '#2a6b62',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '20px',
  margin: '24px 0',
}

const proCodeBox = {
  backgroundColor: '#eef7f5',
  borderRadius: '18px',
  borderLeft: '4px solid #3ab58f',
  color: '#166534',
  fontSize: '15px',
  lineHeight: '24px',
  padding: '20px',
  margin: '24px 0',
}

const reassuranceBox = {
  backgroundColor: '#f8f6f3',
  borderRadius: '18px',
  color: '#6e7282',
  fontSize: '14px',
  lineHeight: '22px',
  padding: '16px',
  margin: '24px 0',
  textAlign: 'center' as const,
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