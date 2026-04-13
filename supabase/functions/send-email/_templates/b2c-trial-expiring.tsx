import {
  Button,
  Heading,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface B2CTrialExpiringEmailProps {
  patientName?: string
  daysRemaining: number
  subscribeUrl: string
}

export function B2CTrialExpiringEmail(props: B2CTrialExpiringEmailProps) {
  const { patientName = 'Cher utilisateur', daysRemaining, subscribeUrl } = props

  return (
    <BaseLayout preview={`Votre essai gratuit se termine dans ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''}`}>
      <Heading style={heading}>
        ⏰ Plus que {daysRemaining} jour{daysRemaining > 1 ? 's' : ''} d'essai
      </Heading>

      <Text style={paragraph}>Bonjour {patientName},</Text>

      <Text style={paragraph}>
        Votre essai gratuit de 7 jours sur Parler Moins Vite touche à sa fin.
        {daysRemaining <= 1
          ? " C'est votre dernier jour pour profiter de toutes les fonctionnalités."
          : ` Il vous reste ${daysRemaining} jours pour continuer à vous entraîner sans interruption.`
        }
      </Text>

      <Text style={benefitsBox}>
        ✅ Ce que vous conservez avec l'abonnement : bibliothèque complète (+155 exercices), mesure de vitesse en temps réel, courbes de progression, et la possibilité de rattacher un orthophoniste à tout moment.
      </Text>

      <Text style={priceBox}>
        ☕ Seulement 9€/mois — moins de 2 cafés — pour continuer votre parcours vers une parole plus fluide.
      </Text>

      <Button style={button} href={subscribeUrl}>
        Continuer pour 9€/mois
      </Button>

      <Text style={reassuranceText}>
        💚 Vos données de progression sont préservées. En vous abonnant, vous reprenez exactement là où vous en êtes.
      </Text>

      <Text style={alternativeText}>
        💡 Vous avez un orthophoniste ? Demandez-lui son Code Pro et ajoutez-le dans vos Réglages pour basculer sur un accès gratuit inclus dans son abonnement.
      </Text>

      <Text style={signatureText}>À vos côtés,</Text>
      <Text style={signatureName}>L'équipe Parler Moins Vite</Text>
    </BaseLayout>
  )
}

export default B2CTrialExpiringEmail

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

const benefitsBox = {
  backgroundColor: '#eef7f5',
  borderRadius: '18px',
  borderLeft: '4px solid #3ab58f',
  color: '#166534',
  fontSize: '14px',
  lineHeight: '22px',
  padding: '16px',
  margin: '24px 0',
}

const priceBox = {
  backgroundColor: '#f9efe5',
  borderRadius: '18px',
  borderLeft: '4px solid #e5a122',
  color: '#92400e',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  lineHeight: '24px',
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

const reassuranceText = {
  color: '#166534',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 16px',
}

const alternativeText = {
  backgroundColor: '#f8f6f3',
  borderRadius: '18px',
  color: '#2a6b62',
  fontSize: '14px',
  lineHeight: '22px',
  padding: '16px',
  margin: '24px 0',
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