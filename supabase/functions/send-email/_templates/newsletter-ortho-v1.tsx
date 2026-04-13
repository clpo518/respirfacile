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

export function NewsletterOrthoV1Email() {
  return (
    <Html>
      <Head />
      <Preview>☕ Les coulisses de ParlerMoinsVite — Nouveautés, cafés et nuits blanches</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logoText}>🎙️ Parler Moins Vite</Text>
            <Text style={editionText}>Newsletter #1 — Février 2026</Text>
          </Section>

          <Section style={content}>
            {/* Intro */}
            <Heading as="h1" style={h1}>Les coulisses de ParlerMoinsVite ☕</Heading>

            <Text style={text}>
              Bonjour,
            </Text>

            <Text style={text}>
              Avant toute chose : <strong>merci</strong>. Merci pour vos retours par mail, par SMS, en visio…
              L'engouement autour de l'application me touche énormément. Chaque message d'un·e orthophoniste
              qui me dit « <em>c'est exactement ce qu'il me manquait</em> » me donne l'énergie de continuer.
            </Text>

            <Hr style={hr} />

            {/* Qui suis-je */}
            <Heading as="h2" style={h2}>Qui se cache derrière tout ça ? 👋</Heading>

            <Section style={founderSection}>
              <Img
                src="https://lllzwnffmdicoqqxqmeh.supabase.co/storage/v1/object/public/email-assets/clement-founder.jpg?v=2"
                alt="Clément, fondateur de ParlerMoinsVite"
                width="120"
                height="120"
                style={founderImg}
              />
              <Text style={text}>
                Je m'appelle <strong>Clément</strong>, j'ai 36 ans et j'habite à Annecy 🏔️.
                Ancien bredouilleur, j'ai consulté mon orthophoniste Audrey en 2022 — et j'ai
                réalisé qu'entre les séances, je n'avais <strong>aucun outil</strong> pour m'entraîner.
              </Text>
            </Section>

            <Text style={text}>
              J'ai d'abord codé un petit prototype pour moi. Puis Audrey l'a testé avec d'autres patients.
              Et je me suis dit : « <em>si ça m'aide, ça pourrait aider tout le monde</em> ». 😊
            </Text>

            <Text style={text}>
              Résultat : je passe mes soirées et mes week-ends à développer ParlerMoinsVite.
              Juste moi, mon clavier, et beaucoup trop de café. ☕
            </Text>

            <Hr style={hr} />

            {/* Nouveautés */}
            <Heading as="h2" style={h2}>Ce qui a bougé ces dernières semaines 🚀</Heading>

            <Text style={statsLine}>
              <em>(35 cafés, 2 nuits blanches et 1 clavier qui commence à fatiguer)</em>
            </Text>

            <Section style={featureCard}>
              <Text style={featureTitle}>👶 Mode Enfant — Des phrases courtes illustrées par des emojis</Text>
              <Text style={featureDesc}>
                Le patient lit ou écoute des phrases courtes et amusantes, illustrées par des emojis.
                Par exemple : 🐱 + 🎹 = « <em>Le chat joue du piano</em> ». Il prononce la phrase,
                et on mesure son débit en temps réel. Ludique, visuel, parfait dès 6 ans. 🎨
              </Text>
            </Section>

            <Section style={featureCard}>
              <Text style={featureTitle}>🧑‍🎓 Mode Adolescent — Des sujets qui leur parlent</Text>
              <Text style={featureDesc}>
                Fini les textes qui ennuient : ici, on fait parler les ados sur <strong>leurs sujets</strong>.
                Le match décisif, le premier jour au lycée, convaincre ses parents de sortir, commander
                au fast-food, expliquer un retard au prof… Des situations concrètes qui déclenchent
                la parole spontanée. Avec calibrage automatique sur les normes Van Zaalen (4.2 SPS enfant, 5.0 ado/adulte).
              </Text>
            </Section>

            <Section style={featureCardHighlight}>
              <Text style={featureTitle}>💬 Mode Dialogue — La parole libre, enfin mesurée</Text>
              <Text style={featureDesc}>
                C'est <strong>l'outil clé pour le transfert</strong>. Votre patient parle librement, sans texte,
                avec un retour visuel en temps réel sur son débit. Plus de « lis ce texte » — place à la vraie vie.
                On mesure enfin la parole spontanée. 🎯
              </Text>
            </Section>

            <Section style={featureCardHighlight}>
              <Text style={featureTitle}>🔬 Mode En Séance — Votre débitmètre de poche</Text>
              <Text style={featureDesc}>
                Mesurez le débit de votre patient <strong>en direct, pendant la consultation</strong>.
                Interface plein écran, zéro distraction. Vous choisissez la durée (1, 2, 5 ou 10 min)
                et les données sont automatiquement enregistrées sur le compte du patient.
                Un vrai instrument de mesure clinique. 📊
              </Text>
            </Section>

            <Section style={featureCard}>
              <Text style={featureTitle}>📖 Mode Récit Résumé — Inspiré de Van Zaalen</Text>
              <Text style={featureDesc}>
                Vous connaissez l'histoire du porte-monnaie de Van Zaalen ? J'ai créé <strong>20 histoires similaires</strong>.
                Le patient écoute un récit, puis le résume avec ses propres mots. L'algorithme détecte
                automatiquement s'il a été <strong>bref</strong> et si les <strong>4 points clés</strong> du texte sont bien présents.
                Oui, tout ça se fait automatiquement. 🤯
              </Text>
            </Section>

            <Section style={featureCard}>
              <Text style={featureTitle}>🏠 Espace Ortho — Testez tout, sans limite</Text>
              <Text style={featureDesc}>
                Depuis votre tableau de bord, vous avez désormais une <strong>vue complète sur tous les exercices</strong> de vos patients.
                Et surtout : vous pouvez les tester vous-même, autant de fois que vous voulez.
                Idéal pour préparer une séance ou découvrir un nouveau mode. 🧪
              </Text>
            </Section>

            {/* CTA Button */}
            <Section style={ctaSection}>
              <Link href="https://www.parlermoinsvite.fr/auth" style={ctaButton}>
                Découvrir les nouveautés →
              </Link>
            </Section>

            <Hr style={hr} />

            {/* Calcul SPS */}
            <Heading as="h2" style={h2}>Sous le capot : nouveau calcul de vitesse 🧮</Heading>

            <Text style={text}>
              On a <strong>complètement retravaillé</strong> le système de mesure du débit articulatoire.
              Au lieu d'un retour mot par mot (instable et source de frustration), on travaille maintenant
              par <strong>paquets de 5 syllabes</strong>.
            </Text>

            <Text style={text}>
              Concrètement : dès que le patient prononce 5 syllabes, la jauge se met à jour.
              Le retour visuel est <strong>stable, réactif, et beaucoup plus fiable</strong> —
              fini les jauges qui sautent dans tous les sens.
            </Text>

            <Text style={text}>
              Si vous utilisez les normes Van Zaalen, vous serez comme chez vous.
              Le Niveau 4 = 4.0 SPS, le Niveau 5 = 5.0 SPS, etc. Simple et clair.
            </Text>

            <Hr style={hr} />

            {/* CTA - Bouche à oreille */}
            <Heading as="h2" style={h2}>Un petit coup de pouce ? 🙏</Heading>

            <Text style={text}>
              Si l'application vous plaît et que vous connaissez des collègues qui pourraient
              être intéressé·e·s, <strong>un petit mot de votre part ferait une énorme différence</strong>.
              Le bouche-à-oreille entre orthos, c'est notre meilleur canal. 💛
            </Text>

            <Text style={text}>
              Et si vous avez des questions, des idées ou juste envie de discuter :
            </Text>

            <Section style={contactCard}>
              <Text style={contactText}>
                📞 <strong>06 98 42 54 43</strong> (appel ou SMS)
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
              Merci infiniment pour votre confiance. C'est grâce à vous que ce projet existe
              et continue d'avancer. Vous êtes les premiers à croire en cet outil —
              et ça, ça n'a pas de prix.
            </Text>

            <Text style={text}>
              À très vite,
            </Text>

            <Text style={signature}>
              Clément<br />
              <em>Fondateur de ParlerMoinsVite — Ancien bredouilleur, toujours bavard 😄</em><br />
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

export default NewsletterOrthoV1Email

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

const featureCard = {
  backgroundColor: '#f8f6f3',
  border: '1px solid #e5dfd6',
  borderRadius: '18px',
  padding: '16px 20px',
  marginBottom: '12px',
}

const featureCardHighlight = {
  backgroundColor: '#eef7f5',
  border: '2px solid #3a9e8e',
  borderRadius: '18px',
  padding: '16px 20px',
  marginBottom: '12px',
}

const featureTitle = {
  fontSize: '15px',
  fontWeight: 'bold' as const,
  color: '#2e3346',
  margin: '0 0 6px',
}

const featureDesc = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#2e3346',
  margin: '0',
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