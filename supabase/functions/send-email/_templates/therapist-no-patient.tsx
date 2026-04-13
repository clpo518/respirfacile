import {
  Button,
  Heading,
  Hr,
  Section,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface TherapistNoPatientEmailProps {
  therapistName?: string
  therapistCode?: string
  dashboardUrl: string
  sessionLiveUrl: string
}

export function TherapistNoPatientEmail(props: TherapistNoPatientEmailProps) {
  const {
    therapistName = 'Cher orthophoniste',
    therapistCode,
    dashboardUrl,
    sessionLiveUrl,
  } = props

  return (
    <BaseLayout preview="Vous n'avez pas encore invité de patient — voici comment démarrer.">
      <Heading style={heading}>Un petit rappel pour bien démarrer 👋</Heading>

      <Text style={paragraph}>Bonjour {therapistName},</Text>

      <Text style={paragraph}>
        Cela fait une semaine que vous avez créé votre compte Pro, et vous n'avez 
        pas encore invité de patient. Pas de souci — voici un rappel rapide pour 
        tirer le meilleur de l'outil.
      </Text>

      <Hr style={divider} />

      <Text style={sectionTitle}>🔗 Comment inviter un patient ?</Text>

      <Text style={paragraph}>
        C'est très simple : partagez votre <strong>Code Pro</strong> à vos patients. 
        Ils le saisissent à l'inscription et sont automatiquement liés à votre compte. 
        Vous accédez ensuite à leurs statistiques, leurs enregistrements et pouvez 
        laisser des notes cliniques.
      </Text>

      {therapistCode && (
        <Text style={codeBox}>
          Votre Code Pro : {therapistCode}
        </Text>
      )}

      {therapistCode && (
        <Text style={codeInstruction}>
          Transmettez ce code par SMS, WhatsApp ou sur une ordonnance.
        </Text>
      )}

      <Button style={button} href={dashboardUrl}>
        Accéder à mon tableau de bord
      </Button>

      <Hr style={divider} />

      <Text style={sectionTitle}>🎯 Pas de patient ? L'outil reste utile !</Text>

      <Text style={paragraph}>
        Même sans patient inscrit, vous pouvez déjà :
      </Text>

      <Section style={featureCardHighlight}>
        <Text style={featureCardTitle}>🔬 Débitmètre en séance</Text>
        <Text style={featureCardDesc}>
          Mesurez le débit de parole de vos patients en direct pendant la consultation. 
          Sélectionnez une cible et obtenez une mesure SPS objective en temps réel.
          Pas besoin que le patient ait un compte.
        </Text>
      </Section>

      <Button style={buttonSecondary} href={sessionLiveUrl}>
        Essayer le mode En Séance
      </Button>

      <Section style={featureCard}>
        <Text style={featureCardTitle}>📚 Tester les 155+ exercices</Text>
        <Text style={featureCardDesc}>
          Parcourez la bibliothèque complète et testez les exercices en « Mode Découverte » 
          — vos essais ne polluent aucune statistique patient.
        </Text>
      </Section>

      <Section style={featureCard}>
        <Text style={featureCardTitle}>📊 Visualiser le biofeedback</Text>
        <Text style={featureCardDesc}>
          Familiarisez-vous avec la jauge de débit, les normes Van Zaalen, 
          et le retour visuel que vos patients verront à l'entraînement.
        </Text>
      </Section>

      <Hr style={divider} />

      <Text style={paragraph}>
        Si vous avez la moindre question sur le fonctionnement, n'hésitez vraiment pas 
        à m'écrire — je suis disponible et je réponds personnellement.
      </Text>

      <Text style={signatureText}>À très vite,</Text>
      <Text style={signatureName}>Clément — Fondateur de Parler Moins Vite</Text>
      <Text style={signatureEmail}>contact@parlermoinsvite.fr</Text>
    </BaseLayout>
  )
}

export default TherapistNoPatientEmail

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

const buttonSecondary = {
  backgroundColor: '#2e3346',
  borderRadius: '18px',
  color: '#fff',
  display: 'block',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  textAlign: 'center' as const,
  textDecoration: 'none',
  padding: '12px 24px',
  margin: '20px auto',
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
  margin: '0 0 2px',
}

const signatureEmail = {
  color: '#6e7282',
  fontSize: '13px',
  lineHeight: '18px',
  margin: '0 0 16px',
}
