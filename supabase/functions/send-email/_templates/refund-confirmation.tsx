import {
  Heading,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface RefundConfirmationEmailProps {
  userName?: string
  refundAmount: string
}

export function RefundConfirmationEmail(props: RefundConfirmationEmailProps) {
  const { userName = 'Cher utilisateur', refundAmount } = props
  return (
    <BaseLayout preview="Confirmation de votre remboursement">
      <Heading style={heading}>💳 Remboursement confirmé</Heading>

      <Text style={paragraph}>Bonjour {userName},</Text>

      <Text style={paragraph}>
        Nous vous confirmons que votre remboursement de {refundAmount} a été effectué avec succès.
      </Text>

      <Text style={infoBox}>
        💡 Information : Le remboursement apparaîtra sur votre compte bancaire sous 5 à 10 jours ouvrés selon votre banque.
      </Text>

      <Text style={paragraph}>
        Votre accès premium a été désactivé. Vos données de progression restent sauvegardées si vous souhaitez revenir plus tard.
      </Text>

      <Text style={paragraph}>
        Nous espérons vous revoir bientôt sur Parler Moins Vite. Si vous avez des questions, écrivez-nous à contact@parlermoinsvite.fr
      </Text>

      <Text style={paragraph}>Merci d'avoir utilisé Parler Moins Vite. 🙏</Text>
    </BaseLayout>
  )
}

export default RefundConfirmationEmail

const heading = {
  color: '#2e3346',
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

const infoBox = {
  backgroundColor: '#eef7f5',
  borderRadius: '18px',
  borderLeft: '4px solid #3ab58f',
  color: '#166534',
  fontSize: '14px',
  lineHeight: '22px',
  padding: '16px',
  margin: '24px 0',
}