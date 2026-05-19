import { useParams, useNavigate, Link } from "react-router-dom";
import { Wind, ArrowLeft, Clock, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";

// ─────────────────────────────────────────────
// Données articles
// ─────────────────────────────────────────────

const ARTICLES: Record<string, {
  category: string;
  title: string;
  date: string;
  readTime: string;
  content: string;
  // CTA contextuel selon l'article
  ctaTarget: "patient" | "pro";
}> = {
  "saos-exercices-respiratoires": {
    category: "SAOS",
    title: "SAOS : pourquoi les exercices respiratoires améliorent la qualité du sommeil",
    date: "15 janvier 2025",
    readTime: "6 min",
    ctaTarget: "patient",
    content: `
Le syndrome d'apnées obstructives du sommeil (SAOS) est caractérisé par des épisodes répétés d'obstruction des voies aériennes supérieures pendant le sommeil. Si le traitement de référence reste la pression positive continue (CPAP), les exercices respiratoires jouent un rôle complémentaire essentiel, notamment pour les formes légères à modérées.

## Comment les exercices agissent sur le SAOS

Les exercices de résistance expiratoire renforcent les muscles dilatateurs du pharynx, réduisant ainsi la tendance à l'affaissement des voies aériennes pendant le sommeil. Plusieurs études randomisées ont montré une réduction de l'IAH (Index d'Apnées-Hypopnées) pouvant aller jusqu'à 36% après 3 mois d'exercices réguliers.

La pause contrôlée agit quant à elle sur l'hyperventilation chronique souvent associée au SAOS. En normalisant le CO₂ alvéolaire, elle permet une meilleure régulation du tonus musculaire respiratoire.

## Le protocole recommandé

Une séance quotidienne de 15-20 minutes, idéalement le soir avant le coucher, comprenant :
- 5 minutes de respiration nasale profonde
- 5 minutes de pause contrôlée (4s inspire / 5s pause / 4s expire / 3s pause basse)
- 5 minutes de résistance expiratoire

Les résultats sont généralement perceptibles après 4 à 6 semaines de pratique régulière.

## Le rôle du biofeedback visuel

La difficulté majeure des exercices respiratoires est le respect précis du rythme et des durées. Le biofeedback visuel — un cercle animé synchronisé sur le rythme prescrit — permet au patient de rester dans la zone cible sans effort cognitif, maximisant l'efficacité de chaque séance.

C'est précisément ce que propose RespirFacile : un guidage visuel en temps réel, adapté à chaque exercice et à chaque profil patient.
    `.trim(),
  },
  "tmof-respiration-nasale": {
    category: "TMOF",
    title: "Troubles myofonctionnels orofaciaux : le rôle clé de la respiration nasale",
    date: "8 janvier 2025",
    readTime: "5 min",
    ctaTarget: "pro",
    content: `
Les troubles myofonctionnels orofaciaux (TMOF) regroupent un ensemble de dysfonctions des muscles de la sphère oro-faciale : langue, lèvres, joues, palais. La respiration buccale est à la fois l'une des causes principales et l'une des conséquences les plus fréquentes de ces troubles.

## Le cercle vicieux respiration buccale / TMOF

Quand un enfant ou un adulte respire majoritairement par la bouche, plusieurs mécanismes se mettent en place : la langue perd sa position correcte (appui au palais), les muscles faciaux se déséquilibrent, et le palais ne reçoit plus la stimulation mécanique nécessaire à son développement.

Ce déséquilibre favorise à son tour la respiration buccale, créant un cercle vicieux difficile à rompre sans prise en charge spécifique.

## La rééducation nasale : pilier du traitement

La rééducation nasale consiste à réentraîner le patient à respirer par le nez, en utilisant des exercices progressifs de résistance et de conscience corporelle. Les exercices de respiration nasale de RespirFacile guident le patient avec un cycle inspiratoire nasal de 4 secondes et expiratoire de 6 secondes.

Associée au travail postural et à la rééducation de la déglutition réalisés en séance, la pratique quotidienne à domicile est déterminante pour consolider les acquis.
    `.trim(),
  },
  "coherence-cardiaque-sommeil": {
    category: "Bien-être",
    title: "Cohérence cardiaque et sommeil : le protocole 5-5 expliqué",
    date: "2 janvier 2025",
    readTime: "4 min",
    ctaTarget: "patient",
    content: `
La cohérence cardiaque est une technique de régulation du système nerveux autonome basée sur un rythme respiratoire précis : 5 secondes d'inspiration, 5 secondes d'expiration, soit 6 cycles par minute.

## Pourquoi 6 cycles par minute ?

À cette fréquence, la variabilité de la fréquence cardiaque (VFC) se synchronise avec le rythme respiratoire, créant un état de cohérence entre le système cardiovasculaire et le système nerveux. Cet état active le système parasympathique, responsable de la détente et de la récupération.

Les effets documentés incluent : réduction du cortisol (hormone du stress), amélioration de la qualité du sommeil, régulation de la tension artérielle et amélioration de la concentration.

## Comment pratiquer

3 séances de 5 minutes par jour suffisent pour observer des effets. La séance du soir, idéalement dans les 30 minutes précédant le coucher, est particulièrement efficace pour faciliter l'endormissement.

RespirFacile propose un exercice de cohérence cardiaque guidé par biofeedback visuel, avec un cercle qui se dilate et se contracte exactement au rythme 5-5.
    `.trim(),
  },
  "compliance-patients-exercices": {
    category: "Pour les pros",
    title: "Comment améliorer la compliance de vos patients aux exercices respiratoires",
    date: "20 décembre 2024",
    readTime: "7 min",
    ctaTarget: "pro",
    content: `
La compliance aux exercices à domicile est le défi numéro un de la rééducation respiratoire. Selon les études, moins de 40% des patients pratiquent régulièrement leurs exercices après 2 mois de suivi — et ce chiffre chute encore si les exercices sont perçus comme abstraits ou difficiles à réaliser correctement.

## Les 3 freins principaux

**Le manque de guidage** : sans feedback visuel ou sonore, le patient perd vite le rythme et ne sait pas s'il réalise l'exercice correctement. La frustration génère l'abandon.

**L'absence de progression visible** : sans suivi de progression, il est impossible pour le patient de voir ses améliorations — et donc de rester motivé.

**La complexité des instructions** : des exercices décrits avec des durées précises (« inspirez 4 secondes, pause 2 secondes... ») sont difficiles à suivre en pratique sans aide externe.

## Les leviers qui fonctionnent

Le biofeedback visuel est le plus puissant. Un cercle animé qui se dilate et se contracte synchroniquement avec le rythme cible élimine le besoin de compter, réduit l'effort cognitif et rend l'exercice presque méditatif.

Le suivi de compliance, visible à la fois par le patient et par le praticien, crée un effet d'engagement et de responsabilisation. Les patients savent que leurs données sont visibles — et cela les motive.

Les rappels quotidiens, personnalisables (heure, fréquence), réduisent l'oubli qui est la première raison de non-compliance.

C'est exactement l'architecture de RespirFacile : biofeedback visuel + suivi de progression + rappels configurables.
    `.trim(),
  },
};

// ─────────────────────────────────────────────
// CTA blocs contextuels
// ─────────────────────────────────────────────

function CtaPatient() {
  const navigate = useNavigate();
  return (
    <div className="my-10 rounded-2xl bg-primary/5 border border-primary/20 p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <Wind className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Pratiquez cet exercice maintenant</p>
          <p className="text-sm text-muted-foreground mt-1">
            RespirFacile guide vos exercices avec un cercle animé synchronisé sur votre rythme. Gratuit, sans téléchargement.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => navigate("/auth?tab=signup")}
          className="btn-forest px-5 py-2.5 text-sm flex items-center gap-2"
        >
          Commencer gratuitement
          <ArrowRight className="w-4 h-4" />
        </button>
        <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors">
          Voir comment ça fonctionne
        </Link>
      </div>
    </div>
  );
}

function CtaPro() {
  const navigate = useNavigate();
  return (
    <div className="my-10 rounded-2xl border border-border bg-card p-6 space-y-4">
      <p className="text-xs font-semibold text-primary uppercase tracking-wide">Pour les praticiens</p>
      <p className="font-semibold text-foreground text-lg leading-snug">
        Prescrivez ces exercices à vos patients et suivez leur compliance en temps réel
      </p>
      <ul className="space-y-2">
        {[
          "Programmes personnalisés SAOS, TMOF, kiné respiratoire",
          "Tableau de bord patients avec taux de compliance",
          "Partage par code PRO — vos patients accèdent gratuitement",
        ].map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-3 flex-wrap pt-1">
        <button
          onClick={() => navigate("/pro")}
          className="btn-forest px-5 py-2.5 text-sm flex items-center gap-2"
        >
          Essai 30 jours gratuit
          <ArrowRight className="w-4 h-4" />
        </button>
        <span className="text-xs text-muted-foreground">Sans CB · Jusqu'à 10 patients</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Page article
// ─────────────────────────────────────────────

const BlogArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const article = slug ? ARTICLES[slug] : null;

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Article introuvable.</p>
          <button onClick={() => navigate("/blog")} className="btn-forest px-6 py-2">Retour au blog</button>
        </div>
      </div>
    );
  }

  // Render markdown-like content — avec insertion du CTA à mi-article
  const renderContent = (text: string) => {
    const blocks = text.split("\n\n");
    const midPoint = Math.floor(blocks.length / 2);

    return blocks.map((block, i) => {
      const rendered = (() => {
        if (block.startsWith("## ")) {
          return <h2 key={i} className="font-display text-2xl font-semibold text-foreground mt-8 mb-3">{block.replace("## ", "")}</h2>;
        }
        if (block.startsWith("- ")) {
          const items = block.split("\n").filter(l => l.startsWith("- "));
          return (
            <ul key={i} className="list-disc list-inside space-y-1 text-muted-foreground">
              {items.map((item, j) => <li key={j}>{item.replace("- ", "")}</li>)}
            </ul>
          );
        }
        const parts = block.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className="text-muted-foreground leading-relaxed">
            {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-foreground font-semibold">{part}</strong> : part)}
          </p>
        );
      })();

      // Insérer CTA au milieu de l'article
      if (i === midPoint) {
        return (
          <div key={`group-${i}`}>
            {rendered}
            {article.ctaTarget === "pro" ? <CtaPro /> : <CtaPatient />}
          </div>
        );
      }
      return rendered;
    });
  };

  return (
    <div className="min-h-screen bg-background">

      {/* ── Header ───────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container px-4 md:px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Wind className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-semibold text-foreground text-lg">RespirFacile</span>
          </button>
          <div className="flex items-center gap-3">
            <Link to="/pro" className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pour les praticiens
            </Link>
            <button onClick={() => navigate("/auth?tab=signup")} className="btn-forest text-sm px-4 py-2">
              Essai gratuit
            </button>
          </div>
        </div>
      </header>

      {/* ── Contenu article ───────────────────── */}
      <div className="pt-32 pb-24 px-4 md:px-6">
        <div className="container mx-auto max-w-2xl">

          {/* Breadcrumb */}
          <button
            onClick={() => navigate("/blog")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au blog
          </button>

          {/* Category badge */}
          <div className="mb-4">
            <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
              {article.category}
            </span>
          </div>

          {/* Titre */}
          <h1 className="font-display text-4xl font-semibold text-foreground mb-4 leading-snug">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-10 pb-8 border-b border-border/50">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {article.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {article.readTime} de lecture
            </span>
          </div>

          {/* Corps de l'article */}
          <div className="space-y-4">
            {renderContent(article.content)}
          </div>

          {/* CTA final — opposé au CTA mid-article pour pas se répéter */}
          <div className="mt-12">
            {article.ctaTarget === "pro" ? <CtaPatient /> : <CtaPro />}
          </div>

          {/* Articles liés */}
          <div className="mt-16 pt-8 border-t border-border/50">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">À lire aussi</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(ARTICLES)
                .filter(([s]) => s !== slug)
                .slice(0, 2)
                .map(([s, a]) => (
                  <Link
                    key={s}
                    to={`/blog/${s}`}
                    className="p-4 rounded-xl border border-border hover:border-primary/30 hover:shadow-sm transition-all group"
                  >
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {a.category}
                    </span>
                    <p className="mt-2 text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
                      {a.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />{a.readTime}
                    </p>
                  </Link>
                ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Footer ───────────────────────────── */}
      <footer className="py-8 px-4 border-t border-border/50">
        <div className="container mx-auto max-w-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2025 RespirFacile · Tous droits réservés</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link to="/legal/privacy" className="hover:text-foreground transition-colors">Confidentialité</Link>
            <Link to="/legal/terms" className="hover:text-foreground transition-colors">CGU</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogArticle;
