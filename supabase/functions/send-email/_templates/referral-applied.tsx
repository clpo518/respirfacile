import {
  Button,
  Heading,
  Text,
} from '@react-email/components'
import React from 'react'
import { BaseLayout } from './base-layout.tsx'

interface ReferralAppliedEmailProps {
  userName?: string
  referrerName?: string
  dashboardUrl: string
  isReferrer?: boolean // true = email to the referrer, false = email to the referred
}

export function ReferralAppliedEmail(props: ReferralAppliedEmailProps) {
  const {
    userName = 'Cher utilisateur',
    referrerName = 'un(e) collègue',
    dashboardUrl,
    isReferrer = false,
  } = props

  if (isReferrer) {
    // Email sent to the REFERRER when someone uses their code
    return (
      <BaseLayout preview={`${userName} vient d'utiliser votre code parrain !`}>
        <Heading style={heading}>Quelqu'un vous a choisi comme parrain ! 🎉</Heading>

        <Text style={paragraph}>Bonjour {userName},</Text>

        <Text style={celebrationBox}>
          🎁 <strong>{referrerName}</strong> vient d'entrer votre code parrain sur ParlerMoinsVite !
        </Text>

        <Text style={paragraph}>
          Votre parrainage est maintenant <strong>enregistré</strong>. Voici ce qui va se passer :
        </Text>

        <Text style={stepBox}>
          <strong>📋 Prochaine étape :</strong><br />
          Quand {referrerName} passera à l'abonnement payant, vous recevrez automatiquement un <strong>coupon de 100% de réduction</strong> sur votre prochaine facture — soit <strong>1 mois entièrement gratuit</strong>.
        </Text>

        <Text style={paragraph}>
          Vous n'avez rien à faire : le coupon sera appliqué automatiquement. Si vous êtes encore en période d'essai, il sera activé dès votre premier paiement.
        </Text>

        <Text style={tipBox}>
          💡 <strong>Astuce :</strong> Plus vous parrainez, plus vous gagnez ! Chaque filleul(e) qui s'abonne = 1 mois gratuit supplémentaire. C'est cumulable sans limite.
        </Text>

        <Button href={dashboardUrl} style={button}>
          Voir mon tableau de bord
        </Button>

        <Text style={signatureText}>À bientôt,</Text>
        <Text style={signatureName}>Clément — ParlerMoinsVite</Text>
      </BaseLayout>
    )
  }

  // Email sent to the REFERRED person when they enter a code
  return (
    <BaseLayout preview="Votre code parrain a bien été pris en compte !">
      <Heading style={heading}>Code parrain activé ✅</Heading>

      <Text style={paragraph}>Bonjour {userName},</Text>

      <Text style={celebrationBox}>
        🎁 Vous avez bien enregistré le code parrain de <strong>{referrerName}</strong> !
      </Text>

      <Text style={paragraph}>
        Votre parrainage est <strong>en attente</strong>. Voici comment ça va fonctionner :
      </Text>

      <Text style={stepBox}>
        <strong>📋 Comment obtenir votre mois gratuit :</strong><br /><br />
        1. Continuez à utiliser ParlerMoinsVite pendant votre essai gratuit<br />
        2. Quand vous passerez à l'abonnement payant, un <strong>coupon de 100% de réduction</strong> sera automatiquement appliqué sur votre <strong>2e mois</strong><br />
        3. Résultat : vous payez le 1er mois, le 2e est <strong>entièrement offert</strong>
      </Text>

      <Text style={paragraph}>
        Et votre parrain ({referrerName}) recevra aussi 1 mois gratuit de son côté. C'est gagnant-gagnant ! 🤝
      </Text>

      <Text style={tipBox}>
        💡 <strong>Vous aussi, vous pouvez parrainer !</strong> Partagez votre propre code parrain depuis votre tableau de bord pour gagner encore plus de mois gratuits.
      </Text>

      <Button href={dashboardUrl} style={button}>
        Continuer sur ParlerMoinsVite
      </Button>

      <Text style={signatureText}>À bientôt,</Text>
      <Text style={signatureName}>Clément — ParlerMoinsVite</Text>
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

const stepBox = {
  backgroundColor: '#eef7f5',
  borderRadius: '18px',
  color: '#2a6b62',
  fontSize: '15px',
  lineHeight: '24px',
  padding: '20px',
  margin: '24px 0',
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
