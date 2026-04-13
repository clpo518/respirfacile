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

interface PatientSummary {
  name: string
  sessionsCount: number
  totalMinutes: number
  averageSps: number
  isInactive: boolean
}

interface TherapistWeeklyReportProps {
  therapistName?: string
  weekStartDate: string
  weekEndDate: string
  totalPatients: number
  activePatients: number
  inactivePatients: number
  totalPatientSessions: number
  patients: PatientSummary[]
  dashboardUrl: string
}

export function TherapistWeeklyReportEmail(props: TherapistWeeklyReportProps) {
  const {
    therapistName = 'Cher orthophoniste',
    weekStartDate,
    weekEndDate,
    totalPatients,
    activePatients,
    inactivePatients,
    totalPatientSessions,
    patients,
    dashboardUrl,
  } = props

  const activeList = patients.filter(p => !p.isInactive)
  const inactiveList = patients.filter(p => p.isInactive)

  return (
    <BaseLayout preview={`Bilan ortho : ${activePatients} patients actifs, ${totalPatientSessions} sessions cette semaine`}>
      <Heading style={heading}>📋 Bilan hebdomadaire de vos patients</Heading>

      <Text style={dateRange}>Semaine du {weekStartDate} au {weekEndDate}</Text>

      <Text style={paragraph}>Bonjour {therapistName},</Text>

      <Text style={paragraph}>
        Voici le récapitulatif de l'activité de vos patients cette semaine.
      </Text>

      <Section style={statsSection}>
        <Row>
          <Column style={statCell}>
            <Text style={statNumber}>{totalPatients}</Text>
            <Text style={statLabel}>Patients</Text>
          </Column>
          <Column style={statCell}>
            <Text style={statNumber}>{activePatients}</Text>
            <Text style={statLabel}>Actifs</Text>
          </Column>
          <Column style={statCell}>
            <Text style={statNumber}>{totalPatientSessions}</Text>
            <Text style={statLabel}>Sessions</Text>
          </Column>
        </Row>
      </Section>

      {activeList.length > 0 && (
        <>
          <Hr style={divider} />
          <Text style={sectionTitle}>✅ Patients actifs cette semaine</Text>
          {activeList.map((patient, i) => (
            <Section key={i} style={patientRow}>
              <Text style={patientName}>{patient.name}</Text>
              <Text style={patientStats}>
                {patient.sessionsCount} session{patient.sessionsCount > 1 ? 's' : ''} · {patient.totalMinutes} min · {patient.averageSps.toFixed(1)} syll./sec
              </Text>
            </Section>
          ))}
        </>
      )}

      {inactiveList.length > 0 && (
        <>
          <Hr style={divider} />
          <Text style={sectionTitle}>⚠️ Patients inactifs cette semaine ({inactiveList.length})</Text>
          {inactiveList.map((patient, i) => (
            <Section key={i} style={patientRowInactive}>
              <Text style={patientName}>{patient.name}</Text>
              <Text style={patientStatsInactive}>Aucune session cette semaine</Text>
            </Section>
          ))}
        </>
      )}

      <Button style={button} href={dashboardUrl}>
        Voir le tableau de bord
      </Button>

      <Text style={footNote}>
        Cet email est envoyé automatiquement chaque dimanche soir.
      </Text>
    </BaseLayout>
  )
}

export default TherapistWeeklyReportEmail

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
  margin: '24px 0',
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

const patientRow = {
  backgroundColor: '#f8f6f3',
  borderRadius: '12px',
  padding: '12px 16px',
  margin: '8px 0',
}

const patientRowInactive = {
  backgroundColor: '#fef2f2',
  borderRadius: '12px',
  padding: '12px 16px',
  margin: '8px 0',
}

const patientName = {
  color: '#2e3346',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  margin: '0 0 4px',
}

const patientStats = {
  color: '#6e7282',
  fontSize: '13px',
  margin: '0',
}

const patientStatsInactive = {
  color: '#b91c1c',
  fontSize: '13px',
  margin: '0',
  fontStyle: 'italic' as const,
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
