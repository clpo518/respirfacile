import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Link,
  Button,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

export function WrappedInviteEmail() {
  return (
    <BaseLayout preview="Votre bilan annuel PMV est prêt ! Découvrez vos stats 2025.">
      <Text style={greeting}>Bonjour 👋</Text>

      <Text style={paragraph}>
        Votre <strong>bilan annuel RespirFacile</strong> est prêt !
      </Text>

      <Text style={paragraph}>
        Combien d'heures d'entraînement ? Quelle progression ? Quel exercice favori ?
        Découvrez votre année en quelques slides 🎙️✨
      </Text>

      <Section style={buttonContainer}>
        <Button
          href="https://respirfacile.fr/wrapped/2025"
          style={button}
        >
          Découvrir mon bilan 2025
        </Button>
      </Section>

      <Text style={footnote}>
        Ce bilan est un cadeau de l'équipe PMV. Merci d'avoir été là cette année 💚
      </Text>
    </BaseLayout>
  )
}

export default WrappedInviteEmail

const greeting = {
  fontSize: '18px',
  fontWeight: 'bold' as const,
  color: '#2e3346',
  margin: '0 0 16px',
}

const paragraph = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#2e3346',
  margin: '0 0 16px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
}

const button = {
  backgroundColor: '#3a9e8e',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  borderRadius: '18px',
}

const footnote = {
  fontSize: '13px',
  color: '#6e7282',
  margin: '24px 0 0',
  textAlign: 'center' as const,
}
