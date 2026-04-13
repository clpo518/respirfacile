import {
  Button,
  Heading,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface PaymentFailedEmailProps {
  userName?: string
  updatePaymentUrl: string
}

export function PaymentFailedEmail(props: PaymentFailedEmailProps) {
  const { userName = 'Cher utilisateur', updatePaymentUrl } = props
  return (
    <BaseLayout preview="Action requise : votre paiement a échoué">
      <Heading style={heading}>⚠️ Votre paiement a échoué</Heading>

      <Text style={paragraph}>Bonjour {userName},</Text>

      <Text style={paragraph}>
        Nous n'avons pas pu traiter votre dernier paiement pour votre abonnement Parler Moins Vite.
      </Text>

      <Text style={paragraph}>
        Pour continuer à profiter de toutes les fonctionnalités premium, veuillez mettre à jour vos informations de paiement.
      </Text>

      <Button style={button} href={updatePaymentUrl}>
        Mettre à jour mon moyen de paiement
      </Button>

      <Text style={smallText}>
        Si vous pensez qu'il s'agit d'une erreur, contactez-nous à contact@parlermoinsvite.fr
      </Text>
    </BaseLayout>
  )
}

export default PaymentFailedEmail

const heading = {
  color: '#cd4540',
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