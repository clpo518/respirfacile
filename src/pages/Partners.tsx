import { ExternalLink, Heart, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";


interface Partner {
  name: string;
  role: string;
  description: string;
  website: string;
  highlights: string[];
}

const partners: Partner[] = [
  {
    name: "Amy Jouberton — Clés de Com",
    role: "Orthophoniste & formatrice spécialisée dans le bégaiement",
    description:
      "Amy est orthophoniste libérale depuis 10 ans, enseignante et formatrice passionnée. À travers Clés de Com, elle propose des formations professionnelles et des ressources pédagogiques pour mieux comprendre et accompagner le bégaiement. Plus de 320 orthophonistes formé·es en France et en francophonie lui font confiance.",
    website: "https://clesdecom.com",
    highlights: [
      "Formations en présentiel et e-learning pour orthophonistes",
      "Ressources gratuites pour parents et enseignants",
      "320+ orthophonistes formé·es en francophonie",
    ],
  },
];

const PartnerCard = ({ partner }: { partner: Partner }) => (
  <div className="rounded-2xl border border-border bg-card p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">{partner.name}</h2>
        <p className="text-primary font-medium text-sm">{partner.role}</p>
      </div>

      <p className="text-muted-foreground leading-relaxed">{partner.description}</p>

      <ul className="space-y-2">
        {partner.highlights.map((h, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            {h}
          </li>
        ))}
      </ul>

      <a
        href={partner.website}
        target="_blank"
        rel="nofollow noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors w-fit"
      >
        Découvrir {partner.name.split("—")[0].trim()}
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  </div>
);

const Partners = () => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="container px-4 md:px-6 max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <Heart className="w-4 h-4" />
              Nos coups de cœur
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Partenaires
            </h1>
            <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Des professionnels passionnés qui partagent notre mission : rendre l'accompagnement de la fluence plus accessible, plus humain et plus efficace. On les a rencontrés, on les admire, on vous les recommande.
            </p>
          </div>

          {/* Partner cards */}
          <div className="space-y-8">
            {partners.map((partner, i) => (
              <PartnerCard key={i} partner={partner} />
            ))}
          </div>

          {/* Back link */}
          <div className="mt-12 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Partners;
