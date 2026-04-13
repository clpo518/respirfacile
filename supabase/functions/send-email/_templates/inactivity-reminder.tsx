import {
  Button,
  Heading,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface InactivityReminderEmailProps {
  userName?: string
  daysSinceLastSession: number
  currentStreak: number
  practiceUrl: string
}

export function InactivityReminderEmail(props: InactivityReminderEmailProps) {
  const { userName = 'Cher utilisateur', daysSinceLastSession, currentStreak, practiceUrl } = props
  return (
    <BaseLayout preview={`Cela fait ${daysSinceLastSession} jour${daysSinceLastSession > 1 ? 's' : ''} — une micro-session pour reprendre ?`}>
      <Heading style={heading}>
        On reprend ensemble ? 🎯
      </Heading>

      <Text style={paragraph}>Bonjour {userName},</Text>

      <Text style={paragraph}>
        Votre dernière session remonte à {daysSinceLastSession} jour{daysSinceLastSession > 1 ? 's' : ''}.
        La recherche montre que 5 minutes quotidiennes sont plus efficaces qu'une longue session hebdomadaire — votre cerveau a besoin de répétition pour ancrer de nouvelles habitudes.
      </Text>

      {currentStreak > 0 && (
        <Text style={paragraph}>
          Vous avez une série de {currentStreak} jour{currentStreak > 1 ? 's' : ''} à préserver — une micro-session de 3 minutes suffit pour la maintenir.
        </Text>
      )}

      <Text style={paragraph}>
        Reprenez là où vous en étiez : lancez un exercice, lisez quelques phrases, et c'est fait.
      </Text>

      <Button style={button} href={practiceUrl}>
        Reprendre l'entraînement
      </Button>

      <Text style={tip}>
        💡 Astuce : associez votre pratique à une habitude existante — après le café, pendant une pause, avant de dormir.
      </Text>

      <Text style={signatureName}>L'équipe Parler Moins Vite</Text>
    </BaseLayout>
  )
}

export default InactivityReminderEmail

const heading = {
  color: '#2e3346',
  fontSize: '22px',
  fontWeight: 'bold' as const,
  margin: '0 0 24px',
  padding: '0',
  textAlign: 'center' as const,
}

const paragraph = {
  color: '#2e3346',
  fontSize: '15px',
  lineHeight: '26px',
  margin: '0 0 16px',
}

const button = {
  backgroundColor: '#3a9e8e',
  borderRadius: '18px',
  color: '#fff',
  display: 'block',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  textAlign: 'center' as const,
  textDecoration: 'none',
  padding: '14px 28px',
  margin: '24px auto',
}

const tip = {
  color: '#6e7282',
  fontSize: '13px',
  lineHeight: '22px',
  margin: '24px 0 0',
}

const signatureName = {
  color: '#3a9e8e',
  fontSize: '14px',
  fontWeight: 'bold' as const,
  margin: '24px 0 0',
}