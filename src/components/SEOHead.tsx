/**
 * SEO Head Component
 * Provides page-specific meta tags, canonical URLs, JSON-LD structured data
 * Uses react-helmet-async for declarative <head> management
 */

import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { blogPosts } from '@/data/blogPosts';

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  jsonLd?: object;
}

const SITE_URL = 'https://www.parlermoinsvite.fr';
const SITE_NAME = 'ParlerMoinsVite';
const OG_DEFAULT = `${SITE_URL}/og-default.png`;

// Per-page OG images
const ogImages: Record<string, string> = {
  '/': `${SITE_URL}/og-home.png`,
  '/patients': `${SITE_URL}/og-patients.png`,
  '/pricing': `${SITE_URL}/og-pricing.png`,
  '/pro': `${SITE_URL}/og-home.png`,
  '/assessment': `${SITE_URL}/og-assessment.png`,
  '/about': `${SITE_URL}/og-about.png`,
  '/blog': `${SITE_URL}/og-blog.png`,
  '/partenaires': `${SITE_URL}/og-partenaires.png`,
  '/diagnostic': `${SITE_URL}/og-diagnostic.png`,
  '/blog/test-vocal-debit-parole-gratuit': `${SITE_URL}/og-diagnostic.png`,
  '/blog/comprendre-le-bredouillement': `${SITE_URL}/og-blog-comprendre-bredouillement.png`,
  '/blog/3-exercices-ralentir-debit': `${SITE_URL}/og-blog-exercices-debit.png`,
  '/blog/mon-histoire-bredouillement-ia': `${SITE_URL}/og-blog-histoire-fondateur.png`,
  '/blog/comment-parler-moins-vite': `${SITE_URL}/og-blog-parler-moins-vite.png`,
  '/blog/stress-parler-trop-vite-solutions': `${SITE_URL}/og-blog-stress-parole.png`,
  '/blog/guide-supprimer-mots-parasites-tics-langage': `${SITE_URL}/og-blog-mots-parasites.png`,
  '/blog/mesurer-vitesse-articulatoire-praat': `${SITE_URL}/og-blog-vitesse-articulatoire.png`,
  '/blog/exercice-orthophonie-enfant-non-lecteur-rebus': `${SITE_URL}/og-blog-rebus-enfant.png`,
  '/blog/pourquoi-ralentir-ne-marche-pas': `${SITE_URL}/og-default.png`,
  '/blog/mode-dialogue-diarisation-biofeedback-seance': `${SITE_URL}/og-blog-mode-dialogue.png`,
  '/blog/tdah-et-bredouillement-lien-comorbidite': `${SITE_URL}/og-blog-tdah-bredouillement.png`,
  '/blog/comparatif-outils-debit-parole-bredouillement': `${SITE_URL}/og-blog-comparatif-outils.png`,
};

const seoConfig: Record<string, SEOConfig> = {
  // -- Public Pages --
  '/': {
    title: 'Outil de Suivi Bredouillement pour Orthophonistes | ParlerMoinsVite',
    description: "Plateforme de télé-soin pour orthophonistes. Suivez l'entraînement de vos patients bredouilleurs à distance avec des métriques SPS (Van Zaalen). Essai 30 jours gratuit.",
    keywords: 'orthophoniste bredouillement, suivi patient tachylalie, télé-soin orthophonie, SPS Van Zaalen, outil rééducation fluence',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: SITE_NAME,
        applicationCategory: 'HealthApplication',
        operatingSystem: 'Web',
        description: "Outil de suivi du bredouillement pour orthophonistes. Métriques SPS, bilans automatiques et suivi patient à distance.",
        url: SITE_URL,
        offers: {
          '@type': 'Offer',
          price: '14.90',
          priceCurrency: 'EUR',
          description: 'Abonnement Pro à partir de 14,90€/mois (3, 5 ou 10 patients)'
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'POCLE — ParlerMoinsVite',
        url: SITE_URL,
        logo: `${SITE_URL}/logo-email.png`,
        description: "Plateforme d'entraînement vocal pour les troubles de la fluence : bredouillement, tachylalie. Créée à Annecy par un développeur bredouilleur.",
        founder: {
          '@type': 'Person',
          name: 'Clément'
        },
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Annecy',
          addressCountry: 'FR'
        },
        sameAs: [],
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'contact@parlermoinsvite.fr',
          contactType: 'customer service',
          availableLanguage: 'French'
        }
      }
    ]
  },
  '/patients': {
    title: 'Exercices Bredouillement & Tachylalie | ParlerMoinsVite',
    description: "L'application d'entraînement pour les personnes qui bredouillent ou parlent trop vite. Mesurez votre débit en syllabes/seconde, visualisez vos progrès et entraînez-vous 5 min/jour.",
    keywords: 'bredouillement exercices, parler trop vite, tachylalie, ralentir débit parole, biofeedback vocal, entraînement élocution'
  },
  '/pricing': {
    title: 'Tarifs Orthophonistes & Accès Patient Gratuit | ParlerMoinsVite',
    description: "Abonnement Pro dès 14,90€/mois (3, 5 ou 10 patients). Gratuit pour les patients. Essai 30 jours sans carte bancaire. Sans engagement.",
    keywords: 'tarif orthophoniste, prix suivi patient, abonnement orthophonie, outil clinique bredouillement'
  },
  '/pro': {
    title: 'Espace Orthophonistes — Suivi Bredouillement à Distance | ParlerMoinsVite',
    description: "Outil clinique pour le suivi du bredouillement. SPS Van Zaalen, bilans PDF automatiques, suivi patient à distance. 30 jours d'essai gratuit.",
    keywords: 'orthophoniste bredouillement, outil rééducation fluence, suivi patient distance, SPS Van Zaalen, bilan orthophonique'
  },
  '/auth': {
    title: 'Connexion — ParlerMoinsVite',
    description: 'Connectez-vous à votre espace patient ou professionnel ParlerMoinsVite.',
    keywords: 'connexion parlermoinsvite, inscription orthophoniste, compte patient'
  },
  '/assessment': {
    title: 'Test Bredouillement Gratuit en 2 min | Évaluez votre débit',
    description: "Évaluez vos symptômes de bredouillement gratuitement en 10 questions. Basé sur l'Inventaire Prédictif du Bredouillement validé cliniquement. Résultat immédiat.",
    keywords: 'test bredouillement gratuit, auto-diagnostic tachylalie, évaluation débit parole, symptômes cluttering',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: 'Test de dépistage du bredouillement',
      description: "Auto-diagnostic basé sur l'Inventaire Prédictif du Bredouillement.",
      audience: { '@type': 'PeopleAudience', healthCondition: { '@type': 'MedicalCondition', name: 'Bredouillement (Cluttering)' } }
    }
  },
  '/about': {
    title: "Notre Histoire — Créé par un Bredouilleur, pour les Bredouilleurs",
    description: "Découvrez l'histoire de Clément, fondateur de ParlerMoinsVite. Comment un développeur bredouilleur a créé l'outil d'entraînement qu'il cherchait.",
    keywords: 'histoire parlermoinsvite, fondateur bredouillement, POCLE, Annecy'
  },
  '/contact': {
    title: 'Contact — ParlerMoinsVite',
    description: "Contactez l'équipe ParlerMoinsVite basée à Annecy. Réponse sous 24h. Support humain et confidentiel.",
    keywords: 'contact parlermoinsvite, support orthophoniste, aide technique'
  },
  '/legal/terms': {
    title: "Conditions Générales d'Utilisation — ParlerMoinsVite",
    description: "CGU de l'application ParlerMoinsVite. Conditions d'accès, utilisation du service et responsabilités.",
    keywords: 'CGU, conditions générales, mentions légales'
  },
  '/legal/privacy': {
    title: 'Politique de Confidentialité & RGPD — ParlerMoinsVite',
    description: 'Comment ParlerMoinsVite protège vos données personnelles. Hébergement européen, chiffrement, conformité RGPD.',
    keywords: 'confidentialité, RGPD, données personnelles, protection données santé'
  },
  '/partenaires': {
    title: 'Nos Partenaires — Coups de Cœur Orthophonie | ParlerMoinsVite',
    description: "Découvrez les professionnels passionnés qui partagent notre mission : rendre l'accompagnement de la fluence plus accessible et plus humain.",
    keywords: 'partenaires orthophonie, Clés de Com, Amy Jouberton, bégaiement formation, bredouillement partenaires'
  },
  '/diagnostic': {
    title: 'Test Vocal Gratuit — Mesurez votre débit de parole en 30 secondes',
    description: "Parlez-vous trop vite ? Faites le test vocal gratuit, sans inscription. Résultat clinique instantané en syllabes/seconde basé sur les normes de Van Zaalen.",
    keywords: 'test vocal gratuit, mesurer débit parole, parler trop vite, diagnostic bredouillement, vitesse élocution, syllabes par seconde',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: 'Test vocal de débit de parole',
      description: "Auto-diagnostic vocal gratuit pour mesurer votre vitesse de parole en syllabes par seconde.",
      audience: { '@type': 'PeopleAudience', healthCondition: { '@type': 'MedicalCondition', name: 'Bredouillement (Cluttering)' } }
    }
  },

  // -- Blog Pages --
  '/blog': {
    title: 'Blog Bredouillement & Élocution — Guides et Exercices',
    description: 'Articles experts sur le bredouillement, exercices orthophoniques et témoignages. Apprenez à maîtriser votre débit de parole.',
    keywords: 'blog bredouillement, exercices élocution, parler moins vite, tachylalie, orthophonie, débit parole'
  },
  '/blog/comprendre-le-bredouillement': {
    title: "Je mange mes mots : Suis-je bredouilleur ? Guide Complet 2025",
    description: 'Symptômes du bredouillement (cluttering), causes neurologiques et différences avec le bégaiement. Checklist de diagnostic + solutions.',
    keywords: 'bredouillement symptômes, cluttering, différence bégaiement bredouillement, télescopage syllabes, diagnostic'
  },
  '/blog/3-exercices-ralentir-debit': {
    title: "3 Exercices d'Orthophoniste pour Arrêter de Parler Trop Vite",
    description: "Syllabe appuyée, Chunking, Biofeedback : 3 techniques de rééducation orthophonique pour ralentir votre débit sans passer pour un robot. 5 min/jour.",
    keywords: 'exercices ralentir débit, articulation orthophonie, biofeedback vocal, chunking parole, syllabe appuyée'
  },
  '/blog/mon-histoire-bredouillement-ia': {
    title: "Témoignage : J'ai codé un outil pour soigner mon bredouillement",
    description: "L'histoire du créateur de ParlerMoinsVite. Comment un développeur bredouilleur a créé un outil de biofeedback vocal pour reprendre le contrôle.",
    keywords: 'témoignage bredouillement, créateur parlermoinsvite, biofeedback vocal, histoire fondateur'
  },
  '/blog/comment-parler-moins-vite': {
    title: 'Comment parler moins vite ? Comprendre le bredouillement',
    description: "Guide complet pour comprendre le débit rapide et le bredouillement. Exercices d'orthophonie adaptés, biofeedback visuel et méthode karaoké.",
    keywords: 'comment parler moins vite, bredouillement solutions, articuler mieux, exercices débit, lecture guidée'
  },
  '/blog/stress-parler-trop-vite-solutions': {
    title: 'Pourquoi je parle trop vite quand je suis stressé ? 4 Solutions',
    description: "Mécanique du stress sur la voix : respiration abdominale, règle des premiers mots, silence et biofeedback. 4 techniques anti-stress pour maîtriser son débit.",
    keywords: 'stress parler vite, tachyphémie émotionnelle, respiration abdominale, prise de parole stress'
  },
  '/blog/guide-supprimer-mots-parasites-tics-langage': {
    title: "\"Euh\", \"Du coup\" : Guide Complet pour Supprimer vos Tics de Langage",
    description: "Psychologie des mots parasites, impact sur la crédibilité professionnelle et méthode en 3 étapes pour les éliminer. Détecteur automatique intégré.",
    keywords: 'mots parasites, tics de langage, euh du coup en fait, éloquence professionnelle, diction'
  },
  '/blog/mesurer-vitesse-articulatoire-praat': {
    title: "Mesurer la vitesse articulatoire : Fini la galère avec Praat ?",
    description: "Comment calculer la vitesse articulatoire sans perdre 15 minutes sur Praat ? Découvrez la méthode automatique pour le bredouillement.",
    keywords: 'vitesse articulatoire, Praat, mesure débit, syllabes par seconde, bredouillement diagnostic, BEB orthophonie'
  },
  '/blog/exercice-orthophonie-enfant-non-lecteur-rebus': {
    title: "Orthophonie enfant non-lecteur : exercice Rébus pour le débit",
    description: "Premier exercice de fluence pour enfants non-lecteurs. 30 séquences d'emojis avec biofeedback visuel, mode guidé et bilan SPS. Dès 4 ans, sans savoir lire.",
    keywords: 'orthophonie enfant, exercice non lecteur, rébus orthophonie, tachylalie enfant, fluence enfant, biofeedback enfant, bredouillement enfant',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: "Orthophonie et enfant non-lecteur : comment travailler le débit sans savoir lire ?",
      description: "Premier exercice de fluence pour enfants non-lecteurs basé sur des séquences d'emojis avec biofeedback visuel.",
      author: { '@type': 'Person', name: 'Clément' },
      publisher: { '@type': 'Organization', name: 'ParlerMoinsVite' },
      datePublished: '2025-07-14'
    }
  },
  '/blog/tdah-et-bredouillement-lien-comorbidite': {
    title: "TDAH et Bredouillement : pourquoi ces deux troubles vont souvent ensemble",
    description: "30 à 50% des bredouilleurs ont un TDAH. Découvrez le lien neurologique, les symptômes communs et comment adapter la rééducation orthophonique.",
    keywords: 'TDAH bredouillement, cluttering ADHD, comorbidité TDAH fluence, fonctions exécutives parole, orthophonie TDAH, tachylalie attention',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: "TDAH et Bredouillement : pourquoi ces deux troubles vont souvent ensemble",
      description: "30 à 50% des bredouilleurs présentent aussi un TDAH. Analyse du lien neurologique et des implications cliniques.",
      author: { '@type': 'Person', name: 'Clément' },
      publisher: { '@type': 'Organization', name: 'ParlerMoinsVite' },
      datePublished: '2026-03-08'
    }
  },
  '/blog/mode-dialogue-diarisation-biofeedback-seance': {
    title: "Mode Dialogue : biofeedback vocal avec détection des interlocuteurs",
    description: "Premier outil de biofeedback qui fonctionne en conversation. Diarisation vocale, jauges SPS par locuteur, 5 cas d'usage cliniques concrets.",
    keywords: 'mode dialogue orthophonie, diarisation vocale, biofeedback conversation, bredouillement séance, SPS temps réel, détection locuteurs',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: "Mode Dialogue : le biofeedback vocal qui détecte qui parle",
      description: "Premier outil de biofeedback vocal fonctionnant en conversation réelle avec diarisation par locuteur.",
      author: { '@type': 'Person', name: 'Clément' },
      publisher: { '@type': 'Organization', name: 'ParlerMoinsVite' },
      datePublished: '2026-03-08'
    }
  },
  '/blog/comparatif-outils-debit-parole-bredouillement': {
    title: "Comparatif Outils Débit de Parole 2026 : Speed Control, DAF, Praat…",
    description: "Quel outil pour le bredouillement ? On compare Speed Control, DAF, Praat, métronome et ParlerMoinsVite. Fonctionnalités, limites et verdict clinique.",
    keywords: 'comparatif outil débit parole, speed control avis, application bredouillement, tachylalie outil, mesurer SPS, biofeedback vocal, orthophonie outil',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: "Quel outil pour travailler son débit de parole ? Comparatif 2026",
      description: "Comparatif complet des outils pour le bredouillement : Speed Control, DAF, Praat, métronome, Speechlab et ParlerMoinsVite.",
      author: { '@type': 'Person', name: 'Clément' },
      publisher: { '@type': 'Organization', name: 'ParlerMoinsVite' },
      datePublished: '2026-02-20'
    }
  },
  '/blog/pourquoi-ralentir-ne-marche-pas': {
    title: "Pourquoi ralentir est impossible quand on bredouille (et la solution)",
    description: "Votre compteur de vitesse interne est cassé : voilà pourquoi « faire un effort » ne suffit pas. Découvrez le biofeedback visuel, la méthode qui répare la perception.",
    keywords: 'ralentir bredouillement, biofeedback vocal, compteur vitesse parole, déficit monitoring, rééducation débit',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: "Tout le monde vous dit de « ralentir », mais vous n'y arrivez pas ? Voici pourquoi.",
      description: "Pourquoi « faire un effort » ne suffit pas quand on bredouille, et comment le biofeedback visuel répare le compteur de vitesse interne.",
      author: { '@type': 'Person', name: 'Clément' },
      publisher: { '@type': 'Organization', name: 'ParlerMoinsVite' },
      datePublished: '2025-02-15'
    }
  },
  '/blog/test-vocal-debit-parole-gratuit': {
    title: "Parlez-vous trop vite ? Test vocal gratuit en 30 secondes",
    description: "Mesurez votre débit de parole gratuitement avec notre test vocal en ligne. Résultat clinique instantané en syllabes/seconde (normes Van Zaalen). Sans inscription.",
    keywords: 'test vocal gratuit, mesurer débit parole, parler trop vite test, bredouillement auto-diagnostic, vitesse élocution, syllabes par seconde',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: "Parlez-vous trop vite ? Faites le test vocal gratuit en 30 secondes",
      description: "Mesurez votre débit de parole gratuitement avec notre test vocal en ligne. Résultat clinique instantané basé sur les normes de Van Zaalen.",
      author: { '@type': 'Person', name: 'Clément' },
      publisher: { '@type': 'Organization', name: 'ParlerMoinsVite' },
      datePublished: '2025-02-12'
    }
  },

  // -- App Pages (Patient) --
  '/dashboard': {
    title: 'Mon Espace — Suivi de Progression | ParlerMoinsVite',
    description: 'Vos statistiques de débit, derniers enregistrements et objectifs de la semaine.',
    keywords: 'tableau de bord, progression, statistiques débit, suivi entraînement'
  },
  '/library': {
    title: "Bibliothèque d'Exercices — +60 Exercices | ParlerMoinsVite",
    description: "Textes normés, virelangues, respiration, défis moteurs et pièges cognitifs. Plus de 60 exercices pour travailler votre rythme.",
    keywords: 'exercices orthophonie, fluence, virelangues, lecture guidée, diadococinésie'
  },
  '/practice': {
    title: "Studio d'Entraînement — Biofeedback Vocal | ParlerMoinsVite",
    description: "Interface d'enregistrement avec retour visuel (Waveform), jauge SPS en temps réel et détection des mots parasites.",
    keywords: 'entraînement biofeedback, exercice débit, jauge vitesse parole, karaoké vocal'
  },
  '/settings': {
    title: 'Paramètres — ParlerMoinsVite',
    description: 'Gérez votre profil, vos préférences et votre abonnement.',
    keywords: 'paramètres, profil, préférences'
  },
  '/subscription/manage': {
    title: 'Mon Abonnement — ParlerMoinsVite',
    description: 'Gérez votre abonnement Premium ParlerMoinsVite.',
    keywords: 'abonnement, gestion, premium'
  },

  // -- App Pages (Therapist) --
  '/patient/list': {
    title: 'Mes Patients — Tableau de Bord Pro | ParlerMoinsVite',
    description: 'Gérez vos patients, suivez leur progression et envoyez des prescriptions à distance.',
    keywords: 'gestion patients, suivi orthophonie, tableau de bord pro'
  },
  '/pro/subscription': {
    title: 'Abonnement Pro — ParlerMoinsVite',
    description: 'Choisissez votre offre professionnelle et commencez à suivre vos patients.',
    keywords: 'abonnement pro, offre orthophoniste'
  },
  '/pro/subscription/manage': {
    title: 'Gérer mon Abonnement Pro — ParlerMoinsVite',
    description: 'Modifiez ou annulez votre abonnement professionnel.',
    keywords: 'gestion abonnement, annulation, facturation'
  }
};

// FAQ structured data for landing pages
const patientFaqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: "Est-ce que ça remplace un orthophoniste ?",
      acceptedAnswer: { '@type': 'Answer', text: "Non, ParlerMoinsVite est un outil complémentaire pour s'entraîner entre les séances. Il est idéalement recommandé et suivi par votre praticien." }
    },
    {
      '@type': 'Question',
      name: "C'est quoi le bredouillement ?",
      acceptedAnswer: { '@type': 'Answer', text: "Le bredouillement (cluttering) est un trouble de la fluence caractérisé par un débit perçu comme trop rapide et/ou irrégulier, des télescopages de syllabes, et parfois des difficultés à organiser son discours." }
    },
    {
      '@type': 'Question',
      name: "Combien de temps faut-il s'entraîner ?",
      acceptedAnswer: { '@type': 'Answer', text: "5 à 10 minutes par jour suffisent pour observer des progrès. La régularité est plus importante que la durée." }
    },
    {
      '@type': 'Question',
      name: "Mes enregistrements sont-ils confidentiels ?",
      acceptedAnswer: { '@type': 'Answer', text: "Oui. Vos enregistrements sont chiffrés et accessibles uniquement par vous (et votre orthophoniste si vous le liez à votre compte). Hébergement conforme RGPD." }
    }
  ]
};

const proFaqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: "Comment fonctionne l'essai gratuit ?",
      acceptedAnswer: { '@type': 'Answer', text: "Vous avez 30 jours pour tester toutes les fonctionnalités avec jusqu'à 3 patients. Aucune carte bancaire requise. Passez ensuite à l'offre 3, 5 ou 10 patients." }
    },
    {
      '@type': 'Question',
      name: "Mes patients doivent-ils payer ?",
      acceptedAnswer: { '@type': 'Answer', text: "Non, c'est gratuit pour vos patients. Votre abonnement couvre leurs accès. Ils créent simplement leur compte avec votre Code Pro." }
    },
    {
      '@type': 'Question',
      name: "Les données sont-elles sécurisées ?",
      acceptedAnswer: { '@type': 'Answer', text: "Absolument. Hébergement européen, chiffrement, conformité RGPD. Seuls vous et votre patient avez accès aux données." }
    }
  ]
};

// Breadcrumb definitions per path pattern
function getBreadcrumbs(pathname: string): Array<{ name: string; url: string }> {
  const crumbs: Array<{ name: string; url: string }> = [
    { name: 'Accueil', url: SITE_URL }
  ];

  if (pathname === '/') return crumbs;

  const breadcrumbMap: Record<string, Array<{ name: string; url: string }>> = {
    '/pro': [{ name: 'Orthophonistes', url: `${SITE_URL}/pro` }],
    '/pricing': [{ name: 'Tarifs', url: `${SITE_URL}/pricing` }],
    '/assessment': [{ name: 'Test Bredouillement', url: `${SITE_URL}/assessment` }],
    '/diagnostic': [{ name: 'Test Vocal', url: `${SITE_URL}/diagnostic` }],
    '/about': [{ name: 'À propos', url: `${SITE_URL}/about` }],
    '/contact': [{ name: 'Contact', url: `${SITE_URL}/contact` }],
    '/blog': [{ name: 'Blog', url: `${SITE_URL}/blog` }],
    '/partenaires': [{ name: 'Partenaires', url: `${SITE_URL}/partenaires` }],
    '/auth': [{ name: 'Connexion', url: `${SITE_URL}/auth` }],
    '/legal/terms': [{ name: 'Mentions légales', url: `${SITE_URL}/legal/terms` }],
    '/legal/privacy': [{ name: 'Confidentialité', url: `${SITE_URL}/legal/privacy` }],
  };

  if (breadcrumbMap[pathname]) {
    crumbs.push(...breadcrumbMap[pathname]);
  } else if (pathname.startsWith('/blog/')) {
    crumbs.push({ name: 'Blog', url: `${SITE_URL}/blog` });
    const slug = pathname.replace('/blog/', '');
    const post = blogPosts.find(p => p.slug === slug);
    if (post) {
      crumbs.push({ name: post.title, url: `${SITE_URL}${pathname}` });
    }
  }

  return crumbs;
}

function buildBreadcrumbJsonLd(crumbs: Array<{ name: string; url: string }>) {
  if (crumbs.length <= 1) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

function useSEOConfig() {
  const location = useLocation();
  
  let config = seoConfig[location.pathname];
  let jsonLd = config?.jsonLd;
  
  if (!config) {
    if (location.pathname.startsWith('/patient/')) {
      config = {
        title: 'Dossier Patient — Suivi Clinique | ParlerMoinsVite',
        description: "Enregistrements, courbe d'évolution SPS et métriques cliniques de votre patient.",
        keywords: 'dossier patient, suivi clinique, SPS, évolution orthophonie'
      };
    } else if (location.pathname.startsWith('/session/')) {
      config = {
        title: 'Analyse de Session — ParlerMoinsVite',
        description: 'Analysez votre enregistrement : courbe de débit SPS, disfluences détectées et waveform.',
        keywords: 'session analyse, enregistrement, débit SPS, waveform'
      };
    } else if (location.pathname.startsWith('/blog/')) {
      config = {
        title: 'Article — Blog ParlerMoinsVite',
        description: "Article sur le bredouillement, l'élocution et les exercices orthophoniques.",
        keywords: 'blog bredouillement, article orthophonie'
      };
    } else {
      config = {
        title: 'ParlerMoinsVite — Outil de suivi du bredouillement',
        description: "Plateforme de télé-soin pour orthophonistes et patients bredouilleurs. Métriques SPS, biofeedback vocal et suivi à distance.",
        keywords: 'parlermoinsvite, bredouillement, orthophoniste'
      };
    }
  }

  // Add FAQ JSON-LD for landing pages
  if (location.pathname === '/patients') {
    jsonLd = patientFaqJsonLd;
  } else if (location.pathname === '/pricing') {
    jsonLd = proFaqJsonLd;
  }

  // Auto-generate Article JSON-LD for blog posts
  const isBlogArticle = location.pathname.startsWith('/blog/') && location.pathname !== '/blog';
  let blogPost: (typeof blogPosts)[number] | undefined;
  if (isBlogArticle) {
    const slug = location.pathname.replace('/blog/', '');
    blogPost = blogPosts.find(p => p.slug === slug);
    if (blogPost && !jsonLd) {
      const articleOgImage = ogImages[location.pathname] || ogImages['/blog'] || OG_DEFAULT;
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: blogPost.title,
        description: blogPost.excerpt,
        image: articleOgImage,
        datePublished: blogPost.date,
        dateModified: blogPost.date,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${SITE_URL}${location.pathname}`
        },
        author: { '@type': 'Person', name: blogPost.author },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo-email.png` }
        }
      };
    }
    // Enrich existing Article JSON-LD
    if (blogPost && jsonLd && (jsonLd as any)['@type'] === 'Article') {
      const ld = jsonLd as any;
      const articleOgImage = ogImages[location.pathname] || ogImages['/blog'] || OG_DEFAULT;
      if (!ld.image) ld.image = articleOgImage;
      if (!ld.dateModified) ld.dateModified = blogPost.date;
      if (!ld.mainEntityOfPage) ld.mainEntityOfPage = { '@type': 'WebPage', '@id': `${SITE_URL}${location.pathname}` };
      if (!ld.publisher?.logo) {
        ld.publisher = { ...ld.publisher, logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo-email.png` } };
      }
    }
  }

  const canonicalPath = location.pathname === '/' ? '' : location.pathname;
  const pageOgImage = ogImages[location.pathname]
    || (location.pathname.startsWith('/blog/') ? ogImages['/blog'] : undefined)
    || OG_DEFAULT;
  const ogType = isBlogArticle ? 'article' : 'website';

  // Build breadcrumb JSON-LD
  const breadcrumbs = getBreadcrumbs(location.pathname);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(breadcrumbs);

  return { config, jsonLd, breadcrumbJsonLd, canonicalPath, pageOgImage, ogType, isBlogArticle, blogPost, pathname: location.pathname };
}

export default function SEOHead() {
  const { config, jsonLd, breadcrumbJsonLd, canonicalPath, pageOgImage, ogType, isBlogArticle, blogPost, pathname } = useSEOConfig();

  return (
    <Helmet>
      <title>{config.title}</title>
      <meta name="description" content={config.description} />
      {config.keywords && <meta name="keywords" content={config.keywords} />}
      <link rel="canonical" href={`${SITE_URL}${canonicalPath}`} />

      {/* Open Graph */}
      <meta property="og:title" content={config.title} />
      <meta property="og:description" content={config.description} />
      <meta property="og:url" content={`${SITE_URL}${pathname}`} />
      <meta property="og:image" content={pageOgImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="fr_FR" />
      <meta property="og:type" content={ogType} />
      {isBlogArticle && blogPost && (
        <meta property="article:published_time" content={blogPost.date} />
      )}
      {isBlogArticle && blogPost && (
        <meta property="article:author" content={blogPost.author} />
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={config.title} />
      <meta name="twitter:description" content={config.description} />
      <meta name="twitter:image" content={pageOgImage} />

      {/* JSON-LD: Primary structured data */}
      {jsonLd && !Array.isArray(jsonLd) && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
      {jsonLd && Array.isArray(jsonLd) && jsonLd.map((ld, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(ld)}
        </script>
      ))}

      {/* JSON-LD: BreadcrumbList */}
      {breadcrumbJsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbJsonLd)}
        </script>
      )}
    </Helmet>
  );
}
