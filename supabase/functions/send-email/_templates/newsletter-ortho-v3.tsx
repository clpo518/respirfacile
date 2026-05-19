import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Link,
  Hr,
  Heading,
  Img,
} from '@react-email/components'
import React from 'react'

export function NewsletterOrthoV3Email() {
  const baseUrl = 'https://lllzwnffmdicoqqxqmeh.supabase.co/storage/v1/object/public/email-assets'

  return (
    <Html>
      <Head />
      <Preview>RespirFacile voyage : France, Suisse, Belgique, Quebec... et un nouvel exercice Parkinson</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logoText}>RespirFacile</Text>
            <Text style={editionText}>Newsletter #3 — Avril 2026</Text>
          </Section>

          <Section style={content}>
            <Heading as="h1" style={h1}>{'\u{1F30D}'} L'application a travers{'\u00E9'} 4{'\u00A0'}733{'\u00A0'}km</Heading>

            <Text style={text}>
              Bonjour,
            </Text>

            <Text style={text}>
              J'ai une confession : je regarde mes stats de connexion tous les matins
              en buvant mon café. Et ce matin, j'ai failli le renverser.
            </Text>

            <Section style={fomoCard}>
              <Text style={fomoText}>
                {'\u{1F525}'} <strong>De plus en plus d'orthophonistes utilisent RespirFacile au quotidien.</strong>{' '}
                Pas juste « j'ai testé une fois ». Non : <strong>tous les jours</strong>, en séance,
                avec leurs patients. Et les retours sont unanimes :{' '}
                <em>ça aide vraiment</em>. Les patients progressent. Les orthos gagnent du temps.
                Et moi je dors de moins en moins {'\u{1F605}'}
              </Text>
            </Section>

            <Text style={text}>
              Mais le plus dingue, c'est la carte. L'application <strong>voyage</strong>.{' '}
              Des orthophonistes en <strong>France</strong>, en <strong>Suisse</strong>,{' '}
              en <strong>Belgique</strong>, et... au <strong>Québec</strong> !
            </Text>

            <Section style={mapCard}>
              <Text style={mapTitle}>{'\u2708\uFE0F'} Annecy {'\u2192'} Montr{'\u00E9'}al : 6{'\u00A0'}237 km</Text>
              <Text style={mapDesc}>
                Quand j'ai commencé ce projet dans mon bureau à Annecy, je ne pensais pas
                qu'un jour une orthophoniste québécoise l'utiliserait avec ses patients.
                Et pourtant. <strong>Le biofeedback SPS parle toutes les langues.</strong>{' '}
                (Enfin, surtout le français. Mais vous voyez l'idée.)
              </Text>
            </Section>

            <Hr style={hr} />

            <Heading as="h2" style={h2}>{'\u{1F3A4}'} Nouvel exercice : Projection Vocale</Heading>

            <Section style={featureCardHighlight}>
              <Text style={featureTitle}>Spécialement conçu pour la dysarthrie et Parkinson</Text>
              <Text style={featureDesc}>
                Les patients atteints de Parkinson ont souvent l'impression de parler
                suffisamment fort, alors que leur voix est en réalité trop faible.
                Cet exercice utilise le <strong>biofeedback de volume en temps réel</strong>{' '}
                pour les aider à <strong>recalibrer leur perception</strong> de l'intensité vocale.
              </Text>
              <Text style={featureDesc}>
                <br />
                10 textes de difficulté progressive avec consignes contextualisées.
                Le patient voit immédiatement si son volume est suffisant —{' '}
                un retour visuel objectif qui complète parfaitement le travail en séance.
              </Text>
            </Section>

            <Section style={illustrationSection}>
              <Img
                src={`${baseUrl}/projection-vocale.png`}
                alt="Exercice Projection Vocale - Biofeedback de volume pour Parkinson et dysarthrie"
                width="480"
                style={illustrationImg}
              />
              <Text style={illustrationCaption}>
                L'exercice Projection Vocale avec biofeedback de volume activé
              </Text>
            </Section>

            <Hr style={hr} />

            <Heading as="h2" style={h2}>{'\u{1F4CA}'} Vue progr{'\u00E8'}s patients am{'\u00E9'}lior{'\u00E9'}e</Heading>

            <Section style={featureCard}>
              <Text style={featureTitle}>Des courbes plus lisibles, des données plus claires</Text>
              <Text style={featureDesc}>
                J'ai retravaillé la vue de progression de chaque patient.{' '}
                Courbes de tendance, <strong>filtres par période</strong> (7j, 30j, 3 mois, tout),{' '}
                moyenne SPS bien visible, et des <strong>normes Van Zaalen</strong> en référence
                pour mieux situer chaque patient.
              </Text>
              <Text style={featureDesc}>
                <br />
                Plus besoin de compter les points à la main.{' '}
                L'évolution est <strong>immédiatement visible</strong>.
              </Text>
            </Section>

            <Section style={illustrationSection}>
              <Img
                src={`${baseUrl}/progres-patient.png`}
                alt="Vue progres patients - Courbe d'evolution avec filtres et normes Van Zaalen"
                width="480"
                style={illustrationImg}
              />
              <Text style={illustrationCaption}>
                Évolution sur 111 séances — moyenne, tendances et normes en un coup d'oeil
              </Text>
            </Section>

            <Hr style={hr} />

            <Heading as="h2" style={h2}>{'\u2728'} Et plein de petits d{'\u00E9'}tails...</Heading>

            <Section style={detailsList}>
              <Text style={detailItem}>{'\u{1F910}'} <strong>Tolérance au Silence</strong> — nouveau mode d'exercice avec compte à rebours et bilan détaillé</Text>
              <Text style={detailItem}>{'\u{1F4AC}'} <strong>Mode Dialogue</strong> — possibilité de changer de question en cours d'exercice</Text>
              <Text style={detailItem}>{'\u{1F4CB}'} <strong>Prescription d'exercices</strong> — tous les exercices sont maintenant prescriptibles depuis le dossier patient</Text>
              <Text style={detailItem}>{'\u{1F4C8}'} <strong>Bilans de séance</strong> — plus complets, avec waveform et timeline colorée</Text>
              <Text style={detailItem}>{'\u{1F527}'} Dizaines de corrections et ajustements sur l'ensemble de l'application</Text>
            </Section>

            <Section style={ctaSection}>
              <Link href="https://www.respirfacile.fr/pro" style={ctaButton}>
                Découvrir les nouveautés →
              </Link>
            </Section>

            <Hr style={hr} />

            <Section style={testimonialBox}>
              <Text style={testimonialText}>
                "Bien conçu et facile d'utilisation. C'est vraiment l'outil qu'il me
                manquait pour mesurer objectivement le débit de parole."
              </Text>
              <Text style={testimonialAuthor}>— Orthophoniste utilisatrice</Text>
            </Section>

            <Hr style={hr} />

            <Heading as="h2" style={h2}>{'\u{1F3AC}'} Pas encore test{'\u00E9'} ?</Heading>

            <Text style={text}>
              J'ai une <strong>démo de 12 minutes</strong> qui montre tout : biofeedback
              en temps réel, mode karaoké, réécoute augmentée, dialogue multi-voix...
            </Text>

            <Section style={ctaSection}>
              <Link href="https://www.youtube.com/watch?v=EW9oW9ZiaS8" style={ctaButtonOutline}>
                Voir la démo (12 min) →
              </Link>
            </Section>

            <Hr style={hr} />

            <Heading as="h2" style={h2}>{'\u{1F4E3}'} Un mot {'\u00E0'} un(e) coll{'\u00E8'}gue ?</Heading>

            <Text style={text}>
              Si l'outil vous plaît, <strong>le meilleur coup de pouce</strong> que
              vous puissiez me donner, c'est d'en parler autour de vous. Un petit message
              dans un groupe WhatsApp, un mot à une collègue... Chaque recommandation
              compte énormément.
            </Text>

            <Section style={contactCard}>
              <Text style={contactText}>
                <strong>06 98 42 54 43</strong> (appel, SMS ou WhatsApp)
              </Text>
              <Text style={contactText}>
                <Link href="mailto:contact@respirfacile.fr" style={link}>contact@respirfacile.fr</Link>
              </Text>
              <Text style={contactText}>
                Envie d'une visio de 15 min ? Écrivez-moi, je suis toujours dispo.
              </Text>
            </Section>

            <Hr style={hr} />

            <Text style={text}>
              Je continue à améliorer l'outil tous les jours. <strong>Chaque retour</strong> que
              vous me faites finit dans ma roadmap. Et croyez-moi, les prochaines
              nouveautés vont vous plaire.
            </Text>

            <Text style={text}>
              À très vite,
            </Text>

            <Text style={signature}>
              Clément<br />
              <em>Fondateur de RespirFacile — Ancien bredouilleur, toujours à fond</em><br />
              <em>Annecy</em>
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} RespirFacile. Tous droits réservés.
            </Text>
            <Text style={footerText}>
              <Link href="https://www.respirfacile.fr" style={footerLink}>www.respirfacile.fr</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default NewsletterOrthoV3Email

const main = {
  backgroundColor: '#f8f6f3',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
  borderRadius: '18px',
  overflow: 'hidden' as const,
}

const header = {
  padding: '32px 32px 24px',
  backgroundColor: '#3a9e8e',
  textAlign: 'center' as const,
}

const logoText = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#ffffff',
  margin: '0 0 4px',
}

const editionText = {
  fontSize: '13px',
  color: '#c8ebe4',
  margin: '0',
}

const content = { padding: '32px' }

const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#2e3346',
  margin: '0 0 24px',
  lineHeight: '1.3',
}

const h2 = {
  fontSize: '18px',
  fontWeight: 'bold' as const,
  color: '#2e3346',
  margin: '0 0 12px',
}

const text = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#2e3346',
  margin: '0 0 16px',
}

const hr = { borderColor: '#e5dfd6', margin: '28px 0' }

const fomoCard = {
  backgroundColor: '#fef9ec',
  border: '2px solid #f0d76a',
  borderRadius: '18px',
  padding: '16px 20px',
  margin: '16px 0',
}

const fomoText = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#2e3346',
  margin: '0',
}

const mapCard = {
  backgroundColor: '#eef7f5',
  border: '2px solid #3a9e8e',
  borderRadius: '18px',
  padding: '20px 24px',
  margin: '16px 0',
}

const mapTitle = {
  fontSize: '16px',
  fontWeight: 'bold' as const,
  color: '#2e3346',
  margin: '0 0 8px',
}

const mapDesc = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#2e3346',
  margin: '0',
}

const featureCardHighlight = {
  backgroundColor: '#eef7f5',
  border: '2px solid #3a9e8e',
  borderRadius: '18px',
  padding: '20px 24px',
  marginBottom: '16px',
}

const featureCard = {
  backgroundColor: '#f8f6f3',
  border: '1px solid #e5dfd6',
  borderRadius: '18px',
  padding: '20px 24px',
  marginBottom: '16px',
}

const featureTitle = {
  fontSize: '16px',
  fontWeight: 'bold' as const,
  color: '#2e3346',
  margin: '0 0 8px',
}

const featureDesc = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#2e3346',
  margin: '0',
}

const illustrationSection = {
  textAlign: 'center' as const,
  margin: '0 0 24px',
}

const illustrationImg = {
  borderRadius: '12px',
  border: '1px solid #e5dfd6',
  maxWidth: '100%',
  height: 'auto' as const,
}

const illustrationCaption = {
  fontSize: '12px',
  color: '#6e7282',
  margin: '8px 0 0',
  fontStyle: 'italic' as const,
}

const detailsList = {
  backgroundColor: '#f8f6f3',
  borderRadius: '18px',
  padding: '20px 24px',
  margin: '0 0 16px',
}

const detailItem = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#2e3346',
  margin: '0 0 10px',
}

const testimonialBox = {
  backgroundColor: '#f8f6f3',
  borderRadius: '18px',
  borderLeft: '4px solid #3a9e8e',
  padding: '16px 20px',
  margin: '0',
}

const testimonialText = {
  fontSize: '15px',
  fontStyle: 'italic' as const,
  lineHeight: '1.6',
  color: '#2a6b62',
  margin: '0 0 8px',
}

const testimonialAuthor = {
  fontSize: '13px',
  color: '#6e7282',
  margin: '0',
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '28px 0 0',
}

const ctaButton = {
  backgroundColor: '#3a9e8e',
  color: '#ffffff',
  padding: '14px 32px',
  borderRadius: '18px',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
  display: 'inline-block' as const,
}

const ctaButtonOutline = {
  backgroundColor: '#ffffff',
  color: '#3a9e8e',
  padding: '14px 32px',
  borderRadius: '18px',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
  display: 'inline-block' as const,
  border: '2px solid #3a9e8e',
}

const contactCard = {
  backgroundColor: '#eef7f5',
  border: '1px solid #b5ddd5',
  borderRadius: '18px',
  padding: '16px 20px',
}

const contactText = {
  fontSize: '14px',
  lineHeight: '1.8',
  color: '#2e3346',
  margin: '0',
}

const link = { color: '#3a9e8e', textDecoration: 'underline' }

const signature = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#2e3346',
  margin: '0',
}

const footer = {
  padding: '24px 32px',
  backgroundColor: '#f8f6f3',
  textAlign: 'center' as const,
}

const footerText = {
  fontSize: '12px',
  color: '#6e7282',
  margin: '0 0 4px',
}

const footerLink = { color: '#3a9e8e', textDecoration: 'none' }
