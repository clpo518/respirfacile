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

export function NewsletterOrthoV2Email() {
  const baseUrl = 'https://lllzwnffmdicoqqxqmeh.supabase.co/storage/v1/object/public/email-assets'

  return (
    <Html>
      <Head />
      <Preview>🔥 3 nouveautés qui m'ont arraché les cheveux — Newsletter #2</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logoText}>🎙️ Parler Moins Vite</Text>
            <Text style={editionText}>Newsletter #2 — Mars 2026</Text>
          </Section>

          <Section style={content}>
            {/* Intro */}
            <Heading as="h1" style={h1}>3 nouveautés qui m'ont arraché les cheveux 🤯</Heading>

            <Text style={text}>
              Bonjour,
            </Text>

            <Text style={text}>
              Je commence par le plus important : <strong>merci</strong>. Vraiment.
            </Text>

            <Text style={text}>
              Depuis la dernière newsletter, j'ai reçu des visios, des SMS, des vocaux,
              des messages WhatsApp… C'est <strong>incroyable</strong>. Certain·e·s d'entre vous
              ont pris 30 minutes de leur temps pour me montrer comment ils utilisaient l'outil
              en séance. D'autres m'ont envoyé des captures d'écran de résultats patients.
              Quelqu'un m'a même envoyé un vocal de 4 minutes à 23h un dimanche. 😄
            </Text>

            <Section style={socialProofCard}>
              <Text style={socialProofText}>
                📊 <strong>Plusieurs orthophonistes ont souscrit</strong> et utilisent l'outil
                <strong> chaque semaine</strong> avec leurs patients. Les retours terrain sont
                unanimes : le biofeedback en temps réel change la donne en séance.
              </Text>
            </Section>

            <Text style={text}>
              Cet engouement me donne une énergie folle pour continuer. Alors j'ai mis les
              bouchées doubles. Et j'ai <em>un peu</em> souffert. 😅
            </Text>

            <Hr style={hr} />

            {/* Re-présentation pour les nouveaux */}
            <Heading as="h2" style={h2}>Pour ceux qui débarquent 👋</Heading>

            <Section style={founderSection}>
              <Img
                src={`${baseUrl}/clement-founder.jpg?v=2`}
                alt="Clément, fondateur de ParlerMoinsVite"
                width="100"
                height="100"
                style={founderImg}
              />
              <Text style={text}>
                Je m'appelle <strong>Clément</strong>, j'ai 36 ans, je vis à Annecy 🏔️.
                Ancien bredouilleur, j'ai consulté une orthophoniste en 2022. Entre les séances,
                je n'avais <strong>aucun outil</strong> pour m'entraîner. Alors j'en ai créé un.
              </Text>
            </Section>

            <Text style={text}>
              ParlerMoinsVite, c'est un <strong>débitmètre intelligent</strong> avec biofeedback
              en temps réel, pensé pour les orthophonistes et leurs patients. Pas une startup
              à 50 salariés — juste moi, mon clavier, et beaucoup trop de café. ☕
            </Text>

            <Hr style={hr} />

            {/* Les 3 nouveautés */}
            <Heading as="h2" style={h2}>Les 3 nouveautés qui m'ont coûté des nuits blanches 🚀</Heading>

            <Text style={statsLine}>
              <em>(47 cafés, 3 nuits blanches, 1 clavier remplacé, et au moins 12 fois
              où j'ai failli tout casser)</em>
            </Text>

            {/* ---- Nouveauté 1 : Texte perso ---- */}
            <Section style={featureCardHighlight}>
              <Text style={featureTitle}>📝 Mode « Mon texte » — Entraînez-vous sur votre propre contenu</Text>
              <Text style={featureDesc}>
                Vos patients préparent une présentation orale ? Un entretien ? Un exposé ?
                Ils collent <strong>leur propre texte</strong> et s'entraînent dessus avec le
                biofeedback SPS en temps réel.
              </Text>
              <Text style={featureDesc}>
                <br />
                Pour les orthos : vous pouvez importer vos textes cliniques habituels
                (le fameux « texte des voitures » 🚗) et mesurer le débit dessus.
                Plus besoin de chronométrer manuellement.
              </Text>
              <Text style={featureDescItalic}>
                <br />
                <em>Techniquement ? Ça avait l'air simple. Ça ne l'était pas du tout.
                Adapter le surligneur karaoké à un texte de longueur variable, recalculer
                le rythme en temps réel, gérer les retours à la ligne… J'ai refait ce module
                3 fois avant d'être satisfait. 😤</em>
              </Text>
            </Section>

            <Section style={illustrationSection}>
              <Img
                src={`${baseUrl}/custom-text-preview.png`}
                alt="Mode Mon texte — Collez votre propre contenu et entraînez-vous avec le biofeedback"
                width="480"
                style={illustrationImg}
              />
              <Text style={illustrationCaption}>
                Collez n'importe quel texte et entraînez-vous dessus avec le biofeedback SPS
              </Text>
            </Section>

            {/* ---- Nouveauté 2 : Dialogue multi ---- */}
            <Section style={featureCardHighlight}>
              <Text style={featureTitle}>💬 Mode Dialogue Multi — Chacun sa bulle, chacun son débit</Text>
              <Text style={featureDesc}>
                Le mode dialogue détecte maintenant <strong>automatiquement les différents
                interlocuteurs</strong>. Chaque personne reçoit sa propre jauge avec son débit
                en temps réel. Votre patient parle trop vite ? Sa bulle passe en orange.
                Vous êtes dans le vert ? Il le voit.
              </Text>
              <Text style={featureDesc}>
                <br />
                Parfait pour les exercices de <strong>transfert en situation réelle</strong> :
                conversations en cabinet, jeux de rôle, échanges avec un proche.
              </Text>
              <Text style={featureDescItalic}>
                <br />
                <em>La diarisation (détection de qui parle) est probablement le truc le plus
                complexe que j'ai codé. Il a fallu gérer les voix qui se chevauchent,
                les « bulles fantômes » dues au bruit ambiant, le recalcul du débit par
                locuteur… J'ai ajouté un sélecteur pour verrouiller le nombre d'interlocuteurs
                et stabiliser le tout. Résultat : ça marche. Et c'est magique. ✨</em>
              </Text>
            </Section>

            <Section style={illustrationSection}>
              <Img
                src={`${baseUrl}/dialogue-multi-v2.png`}
                alt="Mode dialogue avec détection des interlocuteurs — chacun sa bulle avec son débit SPS"
                width="520"
                style={illustrationImg}
              />
              <Text style={illustrationCaption}>
                Chaque interlocuteur reçoit sa propre jauge colorée en temps réel
              </Text>
            </Section>

            {/* ---- Nouveauté 3 : Réécoute augmentée ---- */}
            <Section style={featureCardHighlight}>
              <Text style={featureTitle}>🔬 Réécoute augmentée — La courbe qui voit tout</Text>
              <Text style={featureDesc}>
                Chaque session enregistrée est maintenant accompagnée d'une
                <strong> courbe SPS synchronisée</strong> sous la forme d'onde audio.
                Votre patient voit <strong>exactement où il a accéléré</strong>.
              </Text>
              <Text style={featureDesc}>
                <br />
                Il clique sur un pic orange dans la courbe → l'audio saute à cet endroit →
                il se réécoute → il comprend. <strong>L'auto-correction devient intuitive.</strong>
              </Text>
              <Text style={featureDescItalic}>
                <br />
                <em>Synchroniser une courbe de données avec un lecteur audio interactif,
                en gardant l'alignement pixel-parfait même quand on zoome ou qu'on scrolle…
                Disons que j'ai découvert des bugs que je ne savais même pas possibles.
                Mais le résultat est là : un vrai instrument d'analyse clinique. 🎯</em>
              </Text>
            </Section>

            <Section style={illustrationSection}>
              <Img
                src={`${baseUrl}/reecoute-augmentee-v2.png`}
                alt="Réécoute augmentée avec courbe SPS synchronisée — détection des accélérations"
                width="520"
                style={illustrationImg}
              />
              <Text style={illustrationCaption}>
                Courbe colorée + audio synchronisé = auto-correction intuitive
              </Text>
            </Section>

            {/* CTA Button */}
            <Section style={ctaSection}>
              <Link href="https://www.parlermoinsvite.fr/pro" style={ctaButton}>
                Découvrir les nouveautés →
              </Link>
            </Section>

            <Hr style={hr} />

            {/* Vidéo démo */}
            <Heading as="h2" style={h2}>🎬 Pas encore eu le temps de tester ?</Heading>

            <Text style={text}>
              J'ai enregistré une <strong>démo rapide de 12 minutes</strong> qui montre
              l'outil en action : le biofeedback en temps réel, le mode karaoké, la réécoute
              augmentée… Tout ce qu'il faut pour se faire une idée en un coup d'œil.
            </Text>

            <Section style={ctaSection}>
              <Link href="https://www.youtube.com/watch?v=EW9oW9ZiaS8" style={ctaButtonOutline}>
                ▶ Voir la démo (12 min) →
              </Link>
            </Section>

            <Hr style={hr} />

            {/* Bouche à oreille */}
            <Heading as="h2" style={h2}>Un mot à un·e collègue ? 🙏</Heading>

            <Text style={text}>
              Si l'outil vous plaît, <strong>le meilleur coup de pouce que vous puissiez me donner</strong>,
              c'est d'en parler autour de vous. Un petit message dans un groupe WhatsApp
              d'orthos, un mot à une collègue en salle d'attente, un partage de cette newsletter…
            </Text>

            <Text style={text}>
              Le bouche-à-oreille entre orthophonistes, c'est <strong>notre seul canal</strong>.
              Et chaque recommandation compte énormément. 💛
            </Text>

            <Section style={contactCard}>
              <Text style={contactText}>
                📞 <strong>06 98 42 54 43</strong> (appel, SMS ou WhatsApp)
              </Text>
              <Text style={contactText}>
                📧 <Link href="mailto:contact@parlermoinsvite.fr" style={link}>contact@parlermoinsvite.fr</Link>
              </Text>
              <Text style={contactText}>
                📅 Envie d'une visio de 15 min ? Écrivez-moi, je suis toujours dispo.
              </Text>
            </Section>

            <Hr style={hr} />

            {/* Closing */}
            <Text style={text}>
              Je continue à améliorer l'outil tous les jours. <strong>Je suis à fond.</strong>
              Chaque retour que vous me faites finit dans ma roadmap. Et les prochaines
              fonctionnalités vont vous plaire (teaser : 📄 rapports PDF cliniques en un clic…).
            </Text>

            <Text style={text}>
              Encore une fois : <strong>merci</strong>. Merci de croire en ce projet.
              Merci de l'utiliser. Merci de m'aider à le rendre meilleur.
            </Text>

            <Text style={text}>
              À très vite,
            </Text>

            <Text style={signature}>
              Clément<br />
              <em>Fondateur de ParlerMoinsVite — Ancien bredouilleur, toujours à fond 🚀</em><br />
              <em>Annecy 🏔️</em>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Parler Moins Vite. Tous droits réservés.
            </Text>
            <Text style={footerText}>
              <Link href="https://www.parlermoinsvite.fr" style={footerLink}>www.parlermoinsvite.fr</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default NewsletterOrthoV2Email

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

const content = {
  padding: '32px',
}

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

const statsLine = {
  fontSize: '14px',
  color: '#6e7282',
  margin: '0 0 20px',
  lineHeight: '1.5',
}

const hr = {
  borderColor: '#e5dfd6',
  margin: '28px 0',
}

const founderSection = {
  textAlign: 'center' as const,
  marginBottom: '8px',
}

const founderImg = {
  borderRadius: '50%',
  objectFit: 'cover' as const,
  margin: '0 auto 16px',
  display: 'block' as const,
}

const featureCardHighlight = {
  backgroundColor: '#eef7f5',
  border: '2px solid #3a9e8e',
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

const featureDescItalic = {
  fontSize: '13px',
  lineHeight: '1.6',
  color: '#6e7282',
  margin: '0',
}

const socialProofCard = {
  backgroundColor: '#fef9ec',
  border: '2px solid #f0d76a',
  borderRadius: '18px',
  padding: '16px 20px',
  margin: '16px 0',
}

const socialProofText = {
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

const link = {
  color: '#3a9e8e',
  textDecoration: 'underline',
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

const signature = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#2e3346',
  margin: '0',
}

const footer = {
  padding: '24px 32px',
  borderTop: '1px solid #e5dfd6',
  backgroundColor: '#f8f6f3',
}

const footerText = {
  color: '#6e7282',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0 0 4px',
  textAlign: 'center' as const,
}

const footerLink = {
  color: '#3a9e8e',
  textDecoration: 'underline',
}
