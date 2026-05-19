import {
  Button,
  Heading,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface TherapistCommentEmailProps {
  patientName?: string
  therapistName?: string
  commentPreview: string
  sessionUrl: string
}

export function TherapistCommentEmail(props: TherapistCommentEmailProps) {
  const {
    patientName = 'Cher utilisateur',
    therapistName = 'Votre orthophoniste',
    commentPreview,
    sessionUrl,
  } = props

  return (
    <BaseLayout preview={`${therapistName} vous a laissé un commentaire`}>
      <Heading style={heading}>💬 Nouveau feedback de votre orthophoniste</Heading>

      <Text style={paragraph}>Bonjour {patientName},</Text>

      <Text style={paragraph}>
        <strong>{therapistName}</strong> a laissé un commentaire sur l'une de vos séances :
      </Text>

      <Text style={commentBox}>
        « {commentPreview} »
      </Text>

      <Text style={paragraph}>
        Consultez votre séance pour voir le feedback complet et continuer votre progression.
      </Text>

      <Button href={sessionUrl} style={button}>
        Voir le feedback
      </Button>

      <Text style={signatureText}>À bientôt,</Text>
      <Text style={signatureName}>L'équipe RespirFacile</Text>
    </BaseLayout>
  )
}

const heading = {
  color: '#2e3346',
  fontSize: '24px',
  fontWeight: 'bold' as const,
  lineHeight: '32px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

const paragraph = {
  color: '#2e3346',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 18px',
}

const commentBox = {
  backgroundColor: '#f3f0ff',
  borderRadius: '18px',
  borderLeft: '4px solid #7c3aed',
  color: '#4c1d95',
  fontSize: '15px',
  fontStyle: 'italic' as const,
  lineHeight: '24px',
  padding: '16px 20px',
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
