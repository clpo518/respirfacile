import {
  Button,
  Heading,
  Hr,
  Row,
  Column,
  Section,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface WeeklyReportEmailProps {
  userName?: string
  weekStartDate: string
  weekEndDate: string
  totalSessions: number
  totalMinutes: number
  averageSps: number
  targetSps: number
  currentStreak: number
  improvement: number
  practiceUrl: string
}

export function WeeklyReportEmail(props: WeeklyReportEmailProps) {
  const {
    userName = 'Cher utilisateur',
    weekStartDate,
    weekEndDate,
    totalSessions,
    totalMinutes,
    averageSps,
    targetSps,
    currentStreak,
    improvement,
    practiceUrl,
  } = props

  const isOnTarget = averageSps <= targetSps

  return (
    <BaseLayout preview={`Votre bilan de la semaine : ${totalSessions} sessions, ${totalMinutes} minutes`}>
      <Heading style={heading}>📊 Votre bilan hebdomadaire</Heading>

      <Text style={dateRange}>Semaine du {weekStartDate} au {weekEndDate}</Text>

      <Text style={paragraph}>Bonjour {userName},</Text>

      <Text style={paragraph}>
        Voici le récapitulatif de votre semaine d'entraînement sur RespirFacile !
      </Text>

      <Section style={statsSection}>
        <Row>
          <Column style={statCell}>
            <Text style={statNumber}>{totalSessions}</Text>
            <Text style={statLabel}>Séances</Text>
          </Column>
          <Column style={statCell}>
            <Text style={statNumber}>{totalMinutes}</Text>
            <Text style={statLabel}>Minutes</Text>
          </Column>
        </Row>
        <Row>
          <Column style={statCell}>
            <Text style={statNumber}>{averageSps.toFixed(1)}</Text>
            <Text style={statLabel}>Syll./sec</Text>
          </Column>
          <Column style={statCell}>
            <Text style={statNumber}>{currentStreak} 🔥</Text>
            <Text style={statLabel}>Série</Text>
          </Column>
        </Row>
      </Section>

      <Hr style={divider} />

      {improvement !== 0 && (
        <Text style={improvement < 0 ? progressPositive : progressNegative}>
          {improvement < 0 ? '\u2705' : '\u26A0\uFE0F'} {improvement < 0 ? '' : '+'}{improvement}% {improvement < 0 ? 'plus lent que la semaine derni\u00E8re \u2014 bravo !' : 'plus rapide que la semaine derni\u00E8re'}
        </Text>
      )}

      <Text style={targetBox}>
        🎯 Objectif : {targetSps.toFixed(1)} syll./sec — {isOnTarget 
          ? '✅ Excellent ! Vous êtes dans votre objectif.'
          : `Encore ${(averageSps - targetSps).toFixed(1)} syll./sec à réduire. Continuez !`}
      </Text>

      <Button style={button} href={practiceUrl}>
        Continuer mon entraînement
      </Button>

      <Text style={motivationText}>
        {totalSessions >= 5 
          ? "🌟 Bravo ! Vous êtes régulier, c'est la clé du succès !"
          : totalSessions >= 3
          ? "👍 Bonne semaine ! Essayez d'ajouter 1-2 sessions de plus."
          : "💪 Chaque session compte ! Fixez-vous l'objectif de 5 min/jour."}
      </Text>
    </BaseLayout>
  )
}

export default WeeklyReportEmail

const heading = {
  color: '#3a9e8e',
  fontSize: '24px',
  fontWeight: 'bold' as const,
  margin: '0 0 8px',
  padding: '0',
  textAlign: 'center' as const,
}

const dateRange = {
  color: '#6e7282',
  fontSize: '14px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

const paragraph = {
  color: '#2e3346',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 18px',
}

const statsSection = {
  margin: '24px 0',
}

const statCell = {
  backgroundColor: '#f8f6f3',
  borderRadius: '18px',
  padding: '16px',
  textAlign: 'center' as const,
  border: '4px solid #ffffff',
}

const statNumber = {
  color: '#3a9e8e',
  fontSize: '28px',
  fontWeight: 'bold' as const,
  margin: '0',
  lineHeight: '1.2',
}

const statLabel = {
  color: '#6e7282',
  fontSize: '11px',
  margin: '4px 0 0',
  textTransform: 'uppercase' as const,
}

const divider = {
  borderColor: '#e5dfd6',
  margin: '24px 0',
}

const progressPositive = {
  backgroundColor: '#eef7f5',
  borderRadius: '18px',
  color: '#166534',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  padding: '12px 16px',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}

const progressNegative = {
  backgroundColor: '#fef2f2',
  borderRadius: '18px',
  color: '#b91c1c',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  padding: '12px 16px',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}

const targetBox = {
  backgroundColor: '#f8f6f3',
  borderRadius: '18px',
  color: '#2a6b62',
  fontSize: '14px',
  lineHeight: '22px',
  padding: '16px',
  margin: '16px 0',
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

const motivationText = {
  color: '#6e7282',
  fontSize: '14px',
  fontStyle: 'italic' as const,
  textAlign: 'center' as const,
  margin: '0',
}