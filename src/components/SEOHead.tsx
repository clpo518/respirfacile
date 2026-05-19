import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://www.respirfacile.fr';
const SITE_NAME = 'RespirFacile';

// ─────────────────────────────────────────────
// Config SEO par route statique
// ─────────────────────────────────────────────

interface SeoEntry {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  noindex?: boolean;
}

const seoConfig: Record<string, SeoEntry> = {
  '/': {
    title: 'RespirFacile — Rééducation respiratoire SAOS & myofonctionnel',
    description: "Application de rééducation respiratoire pour les patients SAOS et troubles myofonctionnels orofaciaux. Exercices guidés par biofeedback visuel, suivi de progression, programmes personnalisés par votre praticien.",
    keywords: 'rééducation respiratoire, SAOS, apnée du sommeil, TMOF, exercices respiratoires, biofeedback, orthophoniste, kinésithérapeute',
    ogImage: '/og-home.png',
  },
  '/pro': {
    title: 'RespirFacile PRO — Outil de suivi pour orthophonistes et kinésithérapeutes',
    description: "Prescrivez des exercices respiratoires à vos patients SAOS et TMOF, suivez leur compliance en temps réel. Tableau de bord, programmes personnalisés, export PDF. Essai 30 jours gratuit.",
    keywords: 'orthophoniste SAOS, kiné respiratoire, suivi patient, compliance exercices, télésoin respiratoire, rééducation nasale',
    ogImage: '/og-patients.png',
  },
  '/pricing': {
    title: 'Tarifs — RespirFacile | Gratuit patients, 29€/mois pros',
    description: "Gratuit pour les patients, 29€/mois pour les professionnels de santé. Essai 30 jours sans carte bancaire. Jusqu'à 10 patients actifs inclus.",
    ogImage: '/og-pricing.png',
  },
  '/about': {
    title: 'À propos — RespirFacile | Notre mission',
    description: "Découvrez la mission de RespirFacile : rendre la rééducation respiratoire accessible et efficace entre les séances, pour patients SAOS et TMOF.",
    ogImage: '/og-about.png',
  },
  '/contact': {
    title: 'Contact — RespirFacile',
    description: "Contactez l'équipe RespirFacile pour toute question sur l'application ou l'abonnement PRO.",
  },
  '/blog': {
    title: 'Blog — RespirFacile | Rééducation respiratoire, SAOS & TMOF',
    description: "Articles cliniques sur la rééducation respiratoire : SAOS, troubles myofonctionnels orofaciaux, cohérence cardiaque, compliance patient. Rédigés pour orthophonistes et patients.",
    keywords: 'blog rééducation respiratoire, exercices SAOS, TMOF orthophonie, cohérence cardiaque',
    ogImage: '/og-blog.png',
  },
  '/diagnostic': {
    title: 'Test de débit respiratoire gratuit — RespirFacile',
    description: "Évaluez votre profil respiratoire en 3 minutes. Test gratuit, résultats immédiats, recommandations personnalisées.",
    ogImage: '/og-diagnostic.png',
  },
  '/legal/privacy': {
    title: 'Politique de confidentialité — RespirFacile',
    description: "Comment RespirFacile collecte et protège vos données personnelles. Conformité RGPD, hébergement EU.",
    noindex: true,
  },
  '/legal/terms': {
    title: "Conditions d'utilisation — RespirFacile",
    description: "Conditions générales d'utilisation de l'application RespirFacile.",
    noindex: true,
  },
  // Pages app → noindex (contenu privé, pas de valeur SEO)
  '/auth': {
    title: 'Connexion — RespirFacile',
    description: "Connectez-vous à votre espace RespirFacile.",
    noindex: true,
  },
  '/dashboard': {
    title: 'Mon espace — RespirFacile',
    description: "Votre tableau de bord patient RespirFacile.",
    noindex: true,
  },
  '/practice': {
    title: 'Exercices — RespirFacile',
    description: "Bibliothèque d'exercices respiratoires guidés.",
    noindex: true,
  },
  '/patients': {
    title: 'Mes patients — RespirFacile PRO',
    description: "Tableau de bord professionnel — suivez vos patients.",
    noindex: true,
  },
  '/settings': {
    title: 'Réglages — RespirFacile',
    description: "Gérez votre compte RespirFacile.",
    noindex: true,
  },
  '/session-live': {
    title: 'Session en cours — RespirFacile',
    description: "Exercice respiratoire guidé.",
    noindex: true,
  },
};

// ─────────────────────────────────────────────
// Meta SEO par slug d'article de blog
// ─────────────────────────────────────────────

export const BLOG_SEO: Record<string, SeoEntry & { datePublished: string; dateModified: string; author: string }> = {
  'saos-exercices-respiratoires': {
    title: 'SAOS : les exercices respiratoires améliorent-ils la qualité du sommeil ? — RespirFacile',
    description: "Les exercices de pause contrôlée et résistance expiratoire peuvent réduire l'IAH jusqu'à 36% en 3 mois. Protocole recommandé et rôle du biofeedback visuel.",
    keywords: 'exercices respiratoires SAOS, réduire apnées du sommeil, pause contrôlée SAOS, rééducation respiratoire sommeil',
    ogImage: '/og-home.png',
    datePublished: '2025-01-15',
    dateModified: '2025-01-15',
    author: 'RespirFacile',
  },
  'tmof-respiration-nasale': {
    title: 'TMOF et respiration nasale : rôle clé de la rééducation — RespirFacile',
    description: "La respiration buccale est à la fois cause et conséquence des TMOF. Comment la rééducation nasale s'inscrit dans le protocole thérapeutique de l'orthophoniste.",
    keywords: 'TMOF respiration nasale, troubles myofonctionnels orofaciaux, rééducation nasale orthophonie, respiration buccale enfant',
    ogImage: '/og-patients.png',
    datePublished: '2025-01-08',
    dateModified: '2025-01-08',
    author: 'RespirFacile',
  },
  'coherence-cardiaque-sommeil': {
    title: 'Cohérence cardiaque et sommeil : le protocole 5-5 expliqué — RespirFacile',
    description: "5 secondes d'inspiration, 5 secondes d'expiration, 6 cycles/min. La science derrière la cohérence cardiaque et ses effets sur la qualité du sommeil.",
    keywords: 'cohérence cardiaque sommeil, protocole 5-5, variabilité fréquence cardiaque, exercice respiratoire stress',
    ogImage: '/og-blog.png',
    datePublished: '2025-01-02',
    dateModified: '2025-01-02',
    author: 'RespirFacile',
  },
  'compliance-patients-exercices': {
    title: 'Améliorer la compliance aux exercices respiratoires : guide praticien — RespirFacile',
    description: "Moins de 40% des patients font leurs exercices après 2 mois. Biofeedback visuel, suivi de progression, rappels : les leviers prouvés pour changer ça.",
    keywords: 'compliance exercices respiratoires, suivi patient orthophonie, biofeedback visuel, motivation patient rééducation',
    ogImage: '/og-patients.png',
    datePublished: '2024-12-20',
    dateModified: '2024-12-20',
    author: 'RespirFacile',
  },
};

const DEFAULT_SEO: SeoEntry = {
  title: 'RespirFacile — Rééducation respiratoire SAOS & TMOF',
  description: "Application de rééducation respiratoire pour SAOS et TMOF. Exercices guidés par biofeedback visuel.",
  ogImage: '/og-default.png',
};

// ─────────────────────────────────────────────
// Composant
// ─────────────────────────────────────────────

const SEOHead = () => {
  const { pathname } = useLocation();

  const slug = pathname.startsWith('/blog/') ? pathname.replace('/blog/', '') : null;
  const blogMeta = slug ? BLOG_SEO[slug] : null;

  let config: SeoEntry;
  if (blogMeta) {
    config = blogMeta;
  } else {
    config = seoConfig[pathname] ?? DEFAULT_SEO;
  }

  const canonicalUrl = `${SITE_URL}${pathname === '/' ? '' : pathname}`;
  const ogImageUrl = config.ogImage ? `${SITE_URL}${config.ogImage}` : `${SITE_URL}/og-default.png`;

  // JSON-LD de base (SoftwareApplication) pour les pages produit
  const appJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    description: "Application de rééducation respiratoire pour SAOS et TMOF. Biofeedback visuel, suivi de progression, programmes personnalisés.",
    url: SITE_URL,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      description: 'Gratuit pour les patients — 29€/mois pour les professionnels',
    },
  };

  // JSON-LD BlogPosting pour les articles
  const blogJsonLd = blogMeta ? {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blogMeta.title.split(' — ')[0],
    description: blogMeta.description,
    url: canonicalUrl,
    datePublished: blogMeta.datePublished,
    dateModified: blogMeta.dateModified,
    author: {
      '@type': 'Organization',
      name: 'RespirFacile',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'RespirFacile',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    image: ogImageUrl,
    inLanguage: 'fr-FR',
    keywords: blogMeta.keywords,
  } : null;

  return (
    <Helmet>
      <html lang="fr" />
      <title>{config.title}</title>
      <meta name="description" content={config.description} />
      {config.keywords && <meta name="keywords" content={config.keywords} />}
      <link rel="canonical" href={canonicalUrl} />
      {config.noindex && <meta name="robots" content="noindex, nofollow" />}
      {!config.noindex && <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />}

      {/* Open Graph */}
      <meta property="og:title"       content={config.title} />
      <meta property="og:description" content={config.description} />
      <meta property="og:type"        content={blogMeta ? 'article' : 'website'} />
      <meta property="og:url"         content={canonicalUrl} />
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:locale"      content="fr_FR" />
      <meta property="og:image"       content={ogImageUrl} />
      <meta property="og:image:width"  content="1200" />
      <meta property="og:image:height" content="630" />
      {blogMeta && <meta property="article:published_time" content={blogMeta.datePublished} />}
      {blogMeta && <meta property="article:modified_time"  content={blogMeta.dateModified} />}

      {/* Twitter */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={config.title} />
      <meta name="twitter:description" content={config.description} />
      <meta name="twitter:image"       content={ogImageUrl} />

      {/* JSON-LD */}
      {blogJsonLd
        ? <script type="application/ld+json">{JSON.stringify(blogJsonLd)}</script>
        : <script type="application/ld+json">{JSON.stringify(appJsonLd)}</script>
      }
    </Helmet>
  );
};

export default SEOHead;
export type { SeoEntry };
