import {
  Button,
  Heading,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface SubscriptionExpiringEmailProps {
  userName?: string
  expirationDate: string
  renewUrl: string
}

export function SubscriptionExpiringEmail(props: SubscriptionExpiringEmailProps) {
  const { userName = 'Cher utilisateur', expirationDate, renewUrl } = props
  return (
    <BaseLayout preview={`Votre abonnement expire le ${expirationDate}`}>
      <Heading style={heading}>⏰ Votre abonnement expire bientôt</Heading>

      <Text style={paragraph}>Bonjour {userName},</Text>

      <Text style={paragraph}>
        Votre abonnement Parler Moins Vite arrive à expiration le {expirationDate}.
      </Text>

      <Text style={paragraph}>
        Pour continuer à bénéficier de toutes les fonctionnalités premium et maintenir votre progression, pensez à renouveler votre abonnement.
      </Text>

      <Text style={statsBox}>
        📊 Votre progression compte ! Ne perdez pas votre série d'entraînement et continuez à améliorer votre débit de parole.
      </Text>

      <Button style={button} href={renewUrl}>
        Renouveler mon abonnement
      </Button>

      <Text style={smallText}>
        Si votre abonnement est configuré en renouvellement automatique, vous pouvez ignorer cet email.
      </Text>
    </BaseLayout>
  )
}

export default SubscriptionExpiringEmail

const heading = {
  color: '#e5a122',
  fontSize: '24px',
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

const statsBox = {
  backgroundColor: '#f8f6f3',
  borderRadius: '18px',
  borderLeft: '4px solid #3a9e8e',
  color: '#2a6b62',
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

const smallText = {
  color: '#6e7282',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0 0',
}