import {
  Button,
  Heading,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface WelcomePatientEmailProps {
  patientName?: string
  therapistName?: string
  appUrl: string
  isSolo?: boolean
  referralCode?: string
}

export function WelcomePatientEmail(props: WelcomePatientEmailProps) {
  const { patientName = 'Cher patient', therapistName, appUrl, isSolo, referralCode } = props
  const referralLink = referralCode ? `https://www.parlermoinsvite.fr/auth?tab=signup&ref=${referralCode}` : null
  return (
    <BaseLayout preview="Tout commence par une première respiration.">
      <Heading style={heading}>Bienvenue chez vous 🌟</Heading>

      <Text style={paragraph}>Bonjour {patientName},</Text>

      <Text style={paragraph}>
        Vous avez fait le premier pas, et c'est déjà beaucoup. Prendre soin de sa parole demande du courage, et nous sommes honorés de vous accompagner dans ce chemin.
      </Text>

      {therapistName && (
        <Text style={paragraph}>
          {therapistName} vous a invité à rejoindre Parler Moins Vite. Ensemble, vous allez progresser à votre rythme, en toute sérénité.
        </Text>
      )}

      {isSolo && (
        <Text style={soloBox}>
          🚀 Vous avez activé <strong>7 jours d'essai gratuit</strong>. Profitez de toutes les fonctionnalités sans limite pendant cette période. Si vous avez un orthophoniste, vous pourrez ajouter son Code Pro dans les Réglages à tout moment.
        </Text>
      )}

      <Text style={reassuranceBox}>
        💚 Vous êtes dans un espace sécurisé. Ici, pas de jugement, pas de pression. Chaque exercice est conçu pour vous aider à trouver votre propre tempo, celui qui vous ressemble.
      </Text>

      <Text style={highlightParagraph}>
        Votre parole, votre rythme. C'est notre philosophie. Les progrès viendront naturellement, session après session, à votre cadence.
      </Text>

      <Button style={button} href={appUrl}>
        Démarrer mon premier exercice
      </Button>

      <Text style={tipBox}>
        🎧 Conseil : Trouvez un endroit calme pour votre première session. 5 minutes suffisent pour commencer.
      </Text>

      {isSolo && referralLink && (
        <Text style={referralBox}>
          🎁 <strong>Passez le mot !</strong> Partagez votre lien d'invitation avec un ami. S'il s'abonne après son essai gratuit, vous gagnez chacun <strong>1 mois offert</strong>.<br /><br />
          Votre lien : <a href={referralLink} style={{ color: '#3a9e8e' }}>{referralLink}</a>
        </Text>
      )}

      <Text style={signatureText}>À vos côtés,</Text>
      <Text style={signatureName}>L'équipe Parler Moins Vite</Text>
    </BaseLayout>
  )
}

export default WelcomePatientEmail

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

const highlightParagraph = {
  color: '#2e3346',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  lineHeight: '26px',
  margin: '0 0 18px',
}

const reassuranceBox = {
  backgroundColor: '#eef7f5',
  borderRadius: '18px',
  borderLeft: '4px solid #3ab58f',
  color: '#166534',
  fontSize: '15px',
  lineHeight: '24px',
  padding: '20px',
  margin: '24px 0',
}

const tipBox = {
  backgroundColor: '#f8f6f3',
  borderRadius: '18px',
  color: '#6e7282',
  fontSize: '14px',
  lineHeight: '22px',
  padding: '16px',
  margin: '24px 0',
}

const soloBox = {
  backgroundColor: '#f9efe5',
  borderRadius: '18px',
  borderLeft: '4px solid #e5a122',
  color: '#92400e',
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

const referralBox = {
  backgroundColor: '#eef7f5',
  borderRadius: '18px',
  borderLeft: '4px solid #3a9e8e',
  color: '#2a6b62',
  fontSize: '14px',
  lineHeight: '22px',
  padding: '16px 20px',
  margin: '24px 0',
}