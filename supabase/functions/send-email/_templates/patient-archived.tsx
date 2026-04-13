import { Button, Heading, Text } from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface PatientArchivedEmailProps {
  patientName: string
  therapistName: string
  contactEmail?: string
}

export function PatientArchivedEmail({
  patientName,
  therapistName,
  contactEmail,
}: PatientArchivedEmailProps) {
  return (
    <BaseLayout preview="Votre suivi a été mis en pause">
      <Heading style={heading}>
        {patientName}, votre suivi est en pause
      </Heading>

      <Text style={paragraph}>
        Bonjour {patientName},
      </Text>

      <Text style={paragraph}>
        Nous vous informons que votre accompagnement avec {therapistName} a été mis en pause. 
        Cela signifie que vous n'avez plus accès aux exercices et à votre historique d'entraînement pour le moment.
      </Text>

      <Text style={paragraph}>
        Pas d'inquiétude, vos données sont conservées ! Votre progression et vos statistiques 
        restent sauvegardées et seront disponibles dès que votre suivi sera réactivé.
      </Text>

      <Text style={subheading}>
        Comment reprendre votre entraînement ?
      </Text>

      <Text style={paragraph}>
        Si vous souhaitez continuer à vous entraîner et profiter de tous les exercices, 
        contactez simplement votre orthophoniste {therapistName} pour qu'il/elle réactive votre accès.
      </Text>

      {contactEmail && (
        <Button style={button} href={`mailto:${contactEmail}`}>
          Contacter mon orthophoniste
        </Button>
      )}

      <Text style={paragraph}>
        Une question ? Écrivez-nous à contact@parlermoinsvite.fr, nous sommes là pour vous aider.
      </Text>

      <Text style={signoff}>
        À très bientôt,
      </Text>
      <Text style={signatureName}>
        L'équipe Parler Moins Vite
      </Text>
    </BaseLayout>
  )
}

export default PatientArchivedEmail

const heading = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#2e3346',
  marginBottom: '24px',
  textAlign: 'center' as const,
}

const subheading = {
  fontSize: '18px',
  fontWeight: '600' as const,
  color: '#2e3346',
  marginTop: '24px',
  marginBottom: '12px',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#2e3346',
  marginBottom: '16px',
}

const button = {
  backgroundColor: '#3a9e8e',
  borderRadius: '18px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '14px 28px',
  marginTop: '24px',
  marginBottom: '24px',
}

const signoff = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#6e7282',
  margin: '32px 0 4px',
}

const signatureName = {
  fontSize: '14px',
  fontWeight: 'bold' as const,
  color: '#3a9e8e',
  margin: '0',
}