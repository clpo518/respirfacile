import {
  Button,
  Heading,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface FirstWinEmailProps {
  userName?: string
  dashboardUrl: string
}

export function FirstWinEmail(props: FirstWinEmailProps) {
  const { userName = 'Cher utilisateur', dashboardUrl } = props
  return (
    <BaseLayout preview="Vous venez de franchir le pas le plus difficile.">
      <Heading style={heading}>Bravo ! Premier pas franchi 🏆</Heading>

      <Text style={paragraph}>Bonjour {userName},</Text>

      <Text style={celebrationBox}>
        🎉 Vous venez de terminer votre premier exercice ! C'est le pas le plus difficile, et vous l'avez fait.
      </Text>

      <Text style={paragraph}>
        Beaucoup de gens hésitent, repoussent, attendent "le bon moment". Pas vous. Vous avez agi, et c'est ce qui fait toute la différence.
      </Text>

      <Text style={scienceBox}>
        🧠 Le saviez-vous ? La neuroplasticité fonctionne par répétition. Chaque session renforce les nouvelles connexions neuronales qui vous aident à maîtriser votre débit. La clé, c'est la régularité — même 5 minutes par jour.
      </Text>

      <Text style={highlightParagraph}>
        Votre prochain objectif : 3 jours consécutifs. Petit, réalisable, transformateur.
      </Text>

      <Button style={button} href={dashboardUrl}>
        Voir ma progression
      </Button>

      <Text style={tipBox}>
        💡 Conseil : Programmez un rappel quotidien à une heure fixe. L'habitude est votre meilleure alliée.
      </Text>

      <Text style={signatureText}>Fiers de vous,</Text>
      <Text style={signatureName}>L'équipe Parler Moins Vite</Text>
    </BaseLayout>
  )
}

export default FirstWinEmail

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

const celebrationBox = {
  backgroundColor: '#f9efe5',
  borderRadius: '18px',
  color: '#92400e',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  lineHeight: '26px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const scienceBox = {
  backgroundColor: '#eef7f5',
  borderRadius: '18px',
  color: '#2a6b62',
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