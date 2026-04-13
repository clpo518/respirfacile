import {
  Button,
  Heading,
  Link,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface SubscriptionConfirmedEmailProps {
  userName?: string
  planName: string
  isTherapist?: boolean
  dashboardUrl: string
  invoiceUrl?: string
}

export function SubscriptionConfirmedEmail(props: SubscriptionConfirmedEmailProps) {
  const { userName = 'Cher utilisateur', planName, isTherapist, dashboardUrl, invoiceUrl } = props
  return (
    <BaseLayout preview="Votre abonnement est activé ! Bienvenue.">
      <Heading style={heading}>✅ Abonnement activé</Heading>

      <Text style={paragraph}>Bonjour {userName},</Text>

      <Text style={paragraph}>
        Votre abonnement <strong>{planName}</strong> est maintenant actif. Merci pour votre confiance !
      </Text>

      {isTherapist ? (
        <Text style={highlightBox}>
          🎯 Vous pouvez dès maintenant inviter vos patients et suivre leur progression en temps réel. Chaque exercice génère des données cliniques exploitables.
        </Text>
      ) : (
        <Text style={highlightBox}>
          🎯 Vous avez désormais accès à tous les exercices et au suivi détaillé de votre progression. C'est parti !
        </Text>
      )}

      <Button style={button} href={dashboardUrl}>
        {isTherapist ? "Accéder à mon tableau de bord" : "Commencer un exercice"}
      </Button>

      {invoiceUrl && (
        <Text style={invoiceText}>
          🧾 <Link href={invoiceUrl} style={invoiceLink}>Télécharger votre facture</Link>
        </Text>
      )}

      <Text style={smallText}>
        Des questions ? Écrivez-nous à contact@parlermoinsvite.fr
      </Text>

      <Text style={signatureText}>À votre service,</Text>
      <Text style={signatureName}>L'équipe Parler Moins Vite</Text>
    </BaseLayout>
  )
}

export default SubscriptionConfirmedEmail

const heading = {
  color: '#3ab58f',
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

const highlightBox = {
  backgroundColor: '#eef7f5',
  borderRadius: '18px',
  borderLeft: '4px solid #3ab58f',
  color: '#166534',
  fontSize: '15px',
  lineHeight: '24px',
  padding: '20px',
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

const invoiceText = {
  color: '#2e3346',
  fontSize: '15px',
  lineHeight: '22px',
  textAlign: 'center' as const,
  margin: '0 0 24px',
}

const invoiceLink = {
  color: '#3a9e8e',
  textDecoration: 'underline',
}

const smallText = {
  color: '#6e7282',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0 0',
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