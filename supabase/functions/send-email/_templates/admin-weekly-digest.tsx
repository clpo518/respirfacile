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

interface AdminWeeklyDigestProps {
  weekStartDate: string
  weekEndDate: string
  totalUsers: number
  newTherapists: number
  newPatients: number
  activeUsers: number
  totalSessions: number
  sessionsThisWeek: number
  payingCount: number
  canceledCount: number
  trialsExpiringSoon: number
  totalTrials: number
  deepgramCostWeek: number
  deepgramCostMonth: number
  deepgramCostTotal: number
  dashboardUrl: string
}

export function AdminWeeklyDigestEmail(props: AdminWeeklyDigestProps) {
  const {
    weekStartDate,
    weekEndDate,
    totalUsers,
    newTherapists,
    newPatients,
    activeUsers,
    totalSessions,
    sessionsThisWeek,
    payingCount,
    canceledCount,
    trialsExpiringSoon,
    totalTrials,
    deepgramCostWeek,
    deepgramCostMonth,
    deepgramCostTotal,
    dashboardUrl,
  } = props

  const newTotal = newTherapists + newPatients

  return (
    <BaseLayout preview={`Admin digest : +${newTotal} inscrits, ${sessionsThisWeek} sessions, $${deepgramCostWeek} Deepgram`}>
      <Heading style={heading}>🏠 Digest Admin Hebdomadaire</Heading>

      <Text style={dateRange}>Semaine du {weekStartDate} au {weekEndDate}</Text>

      <Text style={paragraph}>
        Voici le résumé de la semaine pour Parler Moins Vite.
      </Text>

      <Text style={sectionTitle}>📥 Nouvelles inscriptions</Text>
      <Section style={statsSection}>
        <Row>
          <Column style={statCell}>
            <Text style={statNumber}>{newTotal}</Text>
            <Text style={statLabel}>Total</Text>
          </Column>
          <Column style={statCell}>
            <Text style={statNumber}>{newTherapists}</Text>
            <Text style={statLabel}>Orthos</Text>
          </Column>
          <Column style={statCell}>
            <Text style={statNumber}>{newPatients}</Text>
            <Text style={statLabel}>Patients</Text>
          </Column>
        </Row>
      </Section>

      <Hr style={divider} />

      <Text style={sectionTitle}>📊 Activité</Text>
      <Section style={statsSection}>
        <Row>
          <Column style={statCell}>
            <Text style={statNumber}>{totalUsers}</Text>
            <Text style={statLabel}>Inscrits total</Text>
          </Column>
          <Column style={statCell}>
            <Text style={statNumber}>{activeUsers}</Text>
            <Text style={statLabel}>Actifs (7j)</Text>
          </Column>
          <Column style={statCell}>
            <Text style={statNumber}>{sessionsThisWeek}</Text>
            <Text style={statLabel}>Sessions sem.</Text>
          </Column>
        </Row>
      </Section>

      <Hr style={divider} />

      <Text style={sectionTitle}>💳 Abonnements</Text>
      <Section style={statsSection}>
        <Row>
          <Column style={statCell}>
            <Text style={statNumber}>{payingCount}</Text>
            <Text style={statLabel}>Payants</Text>
          </Column>
          <Column style={statCell}>
            <Text style={statNumber}>{totalTrials}</Text>
            <Text style={statLabel}>En essai</Text>
          </Column>
          <Column style={statCell}>
            <Text style={statNumber}>{trialsExpiringSoon}</Text>
            <Text style={statLabel}>Expire &lt;7j</Text>
          </Column>
        </Row>
        <Row>
          <Column style={statCell}>
            <Text style={statNumber}>{canceledCount}</Text>
            <Text style={statLabel}>Annulés</Text>
          </Column>
          <Column style={{ ...statCell, backgroundColor: 'transparent' }} />
          <Column style={{ ...statCell, backgroundColor: 'transparent' }} />
        </Row>
      </Section>

      <Hr style={divider} />

      <Text style={sectionTitle}>💰 Coûts Deepgram</Text>
      <Section style={statsSection}>
        <Row>
          <Column style={statCell}>
            <Text style={statNumber}>${deepgramCostWeek}</Text>
            <Text style={statLabel}>Cette sem.</Text>
          </Column>
          <Column style={statCell}>
            <Text style={statNumber}>${deepgramCostMonth}</Text>
            <Text style={statLabel}>Ce mois</Text>
          </Column>
          <Column style={statCell}>
            <Text style={statNumber}>${deepgramCostTotal}</Text>
            <Text style={statLabel}>Total</Text>
          </Column>
        </Row>
      </Section>

      <Button style={button} href={dashboardUrl}>
        Voir le dashboard complet
      </Button>

      <Text style={footNote}>
        Cet email est envoyé automatiquement chaque dimanche soir.
      </Text>
    </BaseLayout>
  )
}

export default AdminWeeklyDigestEmail

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

const sectionTitle = {
  color: '#2e3346',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  margin: '16px 0 8px',
}

const statsSection = {
  margin: '8px 0',
}

const statCell = {
  backgroundColor: '#f8f6f3',
  borderRadius: '18px',
  padding: '12px 8px',
  textAlign: 'center' as const,
  border: '3px solid #ffffff',
}

const statNumber = {
  color: '#3a9e8e',
  fontSize: '24px',
  fontWeight: 'bold' as const,
  margin: '0',
  lineHeight: '1.2',
}

const statLabel = {
  color: '#6e7282',
  fontSize: '10px',
  margin: '4px 0 0',
  textTransform: 'uppercase' as const,
}

const divider = {
  borderColor: '#e5dfd6',
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

const footNote = {
  color: '#6e7282',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '0',
  fontStyle: 'italic' as const,
}