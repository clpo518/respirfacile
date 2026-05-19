import {
  Button,
  Heading,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface SubscriptionCanceledEmailProps {
  userName?: string
  resubscribeUrl: string
}

export function SubscriptionCanceledEmail(props: SubscriptionCanceledEmailProps) {
  const { userName = 'Cher utilisateur', resubscribeUrl } = props
  return (
    <BaseLayout preview="Votre abonnement a été annulé. Vos données sont préservées.">
      <Heading style={heading}>Votre abonnement est annulé</Heading>

      <Text style={paragraph}>Bonjour {userName},</Text>

      <Text style={paragraph}>
        Nous vous confirmons que votre abonnement RespirFacile a bien été annulé. Nous respectons votre décision et vous remercions d'avoir fait partie de notre communauté.
      </Text>

      <Text style={dataBox}>
        💾 Bonne nouvelle : Vos données de progression restent sauvegardées pendant 6 mois. Vous pouvez reprendre exactement là où vous en étiez si vous changez d'avis.
      </Text>

      <Text style={paragraph}>
        Si vous souhaitez vous réabonner un jour, votre compte vous attendra avec tout votre historique intact.
      </Text>

      <Button style={button} href={resubscribeUrl}>
        Me réabonner
      </Button>

      <Text style={surveyBox}>
        📝 Une dernière chose : pour nous aider à nous améliorer, pourriez-vous nous dire en une phrase ce qui vous a manqué ?
      </Text>

      <Text style={paragraph}>
        Votre retour nous aide énormément. Écrivez-nous à contact@respirfacile.fr
      </Text>

      <Text style={paragraph}>
        Merci pour le temps passé avec nous, et bonne continuation dans votre parcours.
      </Text>

      <Text style={signatureText}>Avec gratitude,</Text>
      <Text style={signatureName}>L'équipe RespirFacile</Text>
    </BaseLayout>
  )
}

export default SubscriptionCanceledEmail

const heading = {
  color: '#2e3346',
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

const dataBox = {
  backgroundColor: '#eef7f5',
  borderRadius: '18px',
  borderLeft: '4px solid #3ab58f',
  color: '#166534',
  fontSize: '15px',
  lineHeight: '24px',
  padding: '20px',
  margin: '24px 0',
}

const surveyBox = {
  backgroundColor: '#f8f6f3',
  borderRadius: '18px',
  color: '#2a6b62',
  fontSize: '15px',
  lineHeight: '24px',
  padding: '20px',
  margin: '24px 0',
}

const button = {
  backgroundColor: '#6e7282',
  borderRadius: '18px',
  color: '#fff',
  display: 'block',
  fontSize: '14px',
  fontWeight: 'bold' as const,
  textAlign: 'center' as const,
  textDecoration: 'none',
  padding: '12px 24px',
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