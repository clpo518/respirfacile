import {
  Button,
  Heading,
  Hr,
  Text,
  Section,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface PrescriptionAssignedEmailProps {
  patientName: string
  therapistName: string
  exerciseTitle: string
  message?: string
  exerciseUrl: string
}

export function PrescriptionAssignedEmail({
  patientName = 'Patient',
  therapistName = 'Votre orthophoniste',
  exerciseTitle = 'Exercice',
  message,
  exerciseUrl = 'https://www.parlermoinsvite.fr/dashboard',
}: PrescriptionAssignedEmailProps) {
  return (
    <BaseLayout preview={`${therapistName} vous a prescrit un exercice`}>
      <Heading style={heading}>📋 Nouvel exercice prescrit</Heading>

      <Text style={text}>
        Bonjour {patientName},
      </Text>

      <Text style={text}>
        <strong>{therapistName}</strong> vous a prescrit un nouvel exercice :
      </Text>

      <Section style={exerciseBox}>
        <Text style={exerciseName}>{exerciseTitle}</Text>
        {message && (
          <Text style={messageStyle}>💬 « {message} »</Text>
        )}
      </Section>

      <Section style={ctaSection}>
        <Button style={ctaButton} href={exerciseUrl}>
          Faire l'exercice →
        </Button>
      </Section>

      <Hr style={hr} />

      <Text style={footerNote}>
        Connectez-vous à votre espace pour retrouver tous vos exercices prescrits.
      </Text>
    </BaseLayout>
  )
}

export default PrescriptionAssignedEmail

const heading = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#2e3346',
  margin: '0 0 16px',
}

const text = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#2e3346',
  margin: '0 0 12px',
}

const exerciseBox = {
  backgroundColor: '#f0faf8',
  border: '1px solid #c6e8e0',
  borderRadius: '12px',
  padding: '20px',
  margin: '16px 0',
}

const exerciseName = {
  fontSize: '17px',
  fontWeight: 'bold' as const,
  color: '#3a9e8e',
  margin: '0 0 8px',
}

const messageStyle = {
  fontSize: '14px',
  color: '#6e7282',
  fontStyle: 'italic' as const,
  margin: '8px 0 0',
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '24px 0',
}

const ctaButton = {
  backgroundColor: '#3a9e8e',
  color: '#ffffff',
  padding: '14px 32px',
  borderRadius: '12px',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
  display: 'inline-block' as const,
}

const hr = {
  borderColor: '#e5dfd6',
  margin: '24px 0',
}

const footerNote = {
  fontSize: '13px',
  color: '#6e7282',
  margin: '0',
}
