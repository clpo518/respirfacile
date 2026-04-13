import {
  Button,
  Heading,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface PatientJoinedEmailProps {
  therapistName?: string
  patientName?: string
  patientDetailUrl: string
  dashboardUrl: string
}

export function PatientFirstSessionEmail(props: PatientJoinedEmailProps) {
  const { therapistName = 'Docteur', patientName = 'Votre patient', patientDetailUrl, dashboardUrl } = props
  return (
    <BaseLayout preview={`${patientName} vient de terminer son premier exercice !`}>
      <Heading style={heading}>Première séance réussie ! 🎉</Heading>

      <Text style={paragraph}>Bonjour {therapistName},</Text>

      <Text style={celebrationBox}>
        🏆 <strong>{patientName}</strong> vient de terminer son tout premier exercice sur ParlerMoinsVite !
      </Text>

      <Text style={paragraph}>
        C'est un moment clé : votre patient a franchi le pas et commence à s'entraîner en autonomie. 
        Vous pouvez déjà consulter son bilan détaillé avec les données de débit et la forme d'onde audio.
      </Text>

      <Button style={button} href={patientDetailUrl}>
        Voir le bilan de {patientName}
      </Button>

      <Text style={tipBox}>
        💡 <strong>Conseil :</strong> Un commentaire d'encouragement sur cette première séance 
        renforce l'engagement du patient. Vous pouvez en laisser un directement depuis le détail de la séance.
      </Text>

      <Text style={signatureText}>À bientôt,</Text>
      <Text style={signatureName}>L'équipe Parler Moins Vite</Text>
    </BaseLayout>
  )
}

export default PatientFirstSessionEmail

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

const celebrationBox = {
  backgroundColor: '#f9efe5',
  borderRadius: '18px',
  color: '#92400e',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const tipBox = {
  backgroundColor: '#eef7f5',
  borderRadius: '18px',
  color: '#2a6b62',
  fontSize: '15px',
  lineHeight: '24px',
  padding: '20px',
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
