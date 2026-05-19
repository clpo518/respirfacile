import {
  Button,
  Heading,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface ReferralCompletedEmailProps {
  userName?: string
  filleulName?: string
  dashboardUrl: string
}

export function ReferralCompletedEmail(props: ReferralCompletedEmailProps) {
  const {
    userName = 'Cher utilisateur',
    filleulName = 'votre filleul(e)',
    dashboardUrl,
  } = props

  return (
    <BaseLayout preview="Votre mois gratuit de parrainage est activé !">
      <Heading style={heading}>Votre mois gratuit est activé ! 🎉</Heading>

      <Text style={paragraph}>Bonjour {userName},</Text>

      <Text style={celebrationBox}>
        🏆 <strong>{filleulName}</strong> vient de souscrire à un abonnement ! Votre parrainage est validé.
      </Text>

      <Text style={paragraph}>
        Comme promis, voici votre récompense :
      </Text>

      <Text style={rewardBox}>
        <strong>🎁 Un coupon 100% de réduction</strong> a été automatiquement appliqué sur votre compte.<br /><br />
        👉 Votre <strong>prochain mois sera entièrement gratuit</strong>.<br /><br />
        Vous n'avez rien à faire — la réduction apparaîtra sur votre prochaine facture.
      </Text>

      <Text style={paragraph}>
        Et {filleulName} bénéficie également d'un mois offert de son côté. Tout le monde y gagne ! 🤝
      </Text>

      <Text style={tipBox}>
        💡 <strong>Continuez à parrainer !</strong> Chaque collègue qui s'abonne via votre code = 1 mois gratuit en plus. Sans limite.
        <br /><br />
        Votre code est disponible dans la section "Parrainage" de votre tableau de bord.
      </Text>

      <Button href={dashboardUrl} style={button}>
        Voir mon tableau de bord
      </Button>

      <Text style={signatureText}>Merci pour votre confiance,</Text>
      <Text style={signatureName}>Clément — RespirFacile</Text>
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

const celebrationBox = {
  backgroundColor: '#f9efe5',
  borderRadius: '18px',
  color: '#92400e',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  lineHeight: '26px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const rewardBox = {
  backgroundColor: '#ecfdf5',
  borderRadius: '18px',
  color: '#065f46',
  fontSize: '15px',
  lineHeight: '24px',
  padding: '20px',
  margin: '24px 0',
  border: '1px solid #a7f3d0',
}

const tipBox = {
  backgroundColor: '#f8f6f3',
  borderRadius: '18px',
  color: '#6e7282',
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
