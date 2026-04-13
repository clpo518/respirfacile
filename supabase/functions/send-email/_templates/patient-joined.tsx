import {
  Button,
  Heading,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface PatientJoinedEmailProps {
  therapistName?: string
  patientName: string
  patientDetailUrl: string
  referralCode?: string
  patientsCount?: number
}

export function PatientJoinedEmail(props: PatientJoinedEmailProps) {
  const { therapistName = 'Cher orthophoniste', patientName, patientDetailUrl, referralCode, patientsCount } = props
  
  const referralUrl = referralCode 
    ? `https://parlermoinsvite.fr/pro?ref=${referralCode}` 
    : null;
  
  return (
    <BaseLayout preview={`${patientName} est maintenant connecté à votre compte.`}>
      <Heading style={heading}>Nouveau patient connecté ✨</Heading>

      <Text style={paragraph}>Bonjour {therapistName},</Text>

      <Text style={successBox}>
        🎯 {patientName} vient de rejoindre votre compte en utilisant votre code orthophoniste.
      </Text>

      <Text style={paragraph}>
        Votre patient est maintenant prêt à recevoir des exercices personnalisés et à commencer son entraînement. Vous pourrez suivre sa progression en temps réel depuis votre tableau de bord.
      </Text>

      <Text style={highlightBox}>
        📋 Prochaine étape : Assignez-lui un premier exercice adapté à son niveau pour lancer sa pratique du bon pied.
      </Text>

      <Button style={button} href={patientDetailUrl}>
        Assigner un exercice
      </Button>

      {referralCode && referralUrl && (
        <Text style={referralBox}>
          👥 Vos confrères aussi pourraient en profiter ! Partagez votre lien de parrainage et recevez 1 mois gratuit pour chaque inscription : {referralUrl}
        </Text>
      )}

      <Text style={signatureText}>Bonne collaboration,</Text>
      <Text style={signatureName}>L'équipe Parler Moins Vite</Text>
    </BaseLayout>
  )
}

export default PatientJoinedEmail

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

const successBox = {
  backgroundColor: '#eef7f5',
  borderRadius: '18px',
  borderLeft: '4px solid #3ab58f',
  color: '#166534',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  lineHeight: '26px',
  padding: '20px',
  margin: '24px 0',
}

const highlightBox = {
  backgroundColor: '#f8f6f3',
  borderRadius: '18px',
  color: '#2a6b62',
  fontSize: '15px',
  lineHeight: '24px',
  padding: '20px',
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