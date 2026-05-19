import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Wind, Stethoscope, Users, ClipboardList, TrendingUp, Shield,
  CheckCircle2, ChevronRight, Star, ArrowRight, FileDown,
  Activity, Moon, HeartPulse, Zap
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22,1,0.36,1] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.10 } } };

const BENEFITS = [
  { icon: Users,        title: "Tableau de bord patients",    desc: "Tous vos patients sur une interface, avec statut, observance et dernière séance." },
  { icon: ClipboardList,title: "Programmes personnalisés",    desc: "Créez des programmes adaptés : SAOS, TMOF, kiné respiratoire. Jokers inclus." },
  { icon: TrendingUp,   title: "Suivi de progression",        desc: "Courbes, scores et taux d'observance semaine par semaine, exportables PDF." },
  { icon: Activity,     title: "Exercices validés",           desc: "30 exercices respiratoires guidés, Pause Contrôlée, myofonctionnel, cohérence cardiaque." },
  { icon: Shield,       title: "Données sécurisées RGPD",    desc: "Hébergement en France (Supabase EU), chiffrement, conforme au cadre santé." },
  { icon: FileDown,     title: "Export & bilans",             desc: "Générez des bilans PDF par patient pour intégration au dossier médical." },
];

const PROFILES = [
  { icon: Stethoscope, label: "Orthophonistes",          desc: "SAOS, TMOF, ronflements, respiration buccale" },
  { icon: HeartPulse,  label: "Kinésithérapeutes",       desc: "Rééducation respiratoire, post-opératoire, BPCO" },
  { icon: Moon,        label: "Médecins du sommeil",     desc: "Suivi observance CPAP, éducation thérapeutique" },
  { icon: Activity,    label: "Pneumologues",            desc: "Exercices complémentaires entre consultations" },
];

const TESTIMONIALS = [
  { name: "Marie-Claire B.", role: "Orthophoniste, Lyon",       text: "Mes patients font enfin leurs exercices entre les séances. Le taux de complétion a doublé en 2 mois.", stars: 5 },
  { name: "Dr. Amina K.",   role: "Kinésithérapeute, Paris",   text: "Le suivi temps réel et les courbes de progression m'ont permis d'adapter les protocoles beaucoup plus vite.", stars: 5 },
  { name: "Thomas L.",      role: "Médecin du sommeil, Bordeaux", text: "Enfin un outil patient qui s'intègre dans mon flux de travail sans friction. L'essai 30 jours m'a convaincu.", stars: 5 },
];

const FAQ = [
  { q: "Combien coûte l'abonnement ?", a: "Starter à 15€/mois (10 patients), Pro à 25€/mois (30 patients), Cabinet à 49€/mois (illimité, multi-praticiens). Essai 30 jours gratuit, sans carte bancaire." },
  { q: "Comment mes patients accèdent-ils à l'app ?", a: "Vous partagez votre code PRO (format PRO-XXXXXX) à vos patients. Ils créent un compte gratuit et saisissent votre code — ils sont automatiquement liés à votre tableau de bord." },
  { q: "Les données sont-elles conformes au RGPD ?", a: "Oui. Les données sont hébergées en France (Supabase EU Paris), chiffrées en transit et au repos. Aucune donnée n'est partagée avec des tiers à des fins publicitaires." },
  { q: "Puis-je créer mes propres exercices ?", a: "Les exercices sont fournis par RespirFacile et validés cliniquement. Vous pouvez personnaliser les programmes : sélection d'exercices, durée, fréquence, jours de repos." },
  { q: "Y a-t-il une application mobile ?", a: "L'application est une Progressive Web App (PWA) — elle s'installe sur mobile comme une app native depuis le navigateur, sans passer par l'App Store." },
];

const StarRating = ({ n }: { n: number }) => (
  <div className="flex gap-0.5">{Array.from({ length: n }).map((_, i) => <Star key={i} className="w-4 h-4 fill-accent text-accent" />)}</div>
);

const ProLanding = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container px-4 md:px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Wind className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-semibold text-foreground text-lg">RespirFacile</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium ml-1">PRO</span>
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/auth")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Connexion</button>
            <button onClick={() => navigate("/auth?tab=signup")} className="btn-forest text-sm px-4 py-2">Essai 30 jours gratuit</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-24 px-4 md:px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Stethoscope className="w-3.5 h-3.5" />
              Pour les professionnels de santé
            </motion.div>
            <motion.h1 variants={fadeUp} className="font-display text-5xl md:text-7xl font-semibold text-foreground leading-tight mb-6">
              Prescrivez des exercices.<br />
              <span className="text-primary">Suivez les résultats.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              RespirFacile PRO permet aux orthophonistes, kinésithérapeutes et médecins du sommeil de prescrire des exercices respiratoires et de suivre l'observance de leurs patients en temps réel.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate("/auth?tab=signup")} className="btn-forest text-base px-8 py-4 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Démarrer l'essai gratuit
              </button>
              <button onClick={() => navigate("/auth")} className="btn-forest-outline text-base px-8 py-4 flex items-center gap-2">
                J'ai déjà un compte <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
            <motion.p variants={fadeUp} className="text-sm text-muted-foreground mt-4">
              30 jours gratuits · Sans carte bancaire · Résiliation en 1 clic
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Profils */}
      <section className="py-16 px-4 md:px-6 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.p variants={fadeUp} className="text-center text-sm text-muted-foreground uppercase tracking-widest font-medium mb-8">Conçu pour</motion.p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {PROFILES.map((p) => (
                <motion.div key={p.label} variants={fadeUp} className="card-rf p-5 text-center">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <p.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="font-semibold text-sm text-foreground mb-1">{p.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bénéfices */}
      <section className="py-20 px-4 md:px-6">
        <div className="container mx-auto max-w-5xl">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <h2 className="font-display text-4xl font-semibold text-foreground mb-3">Tout ce qu'il vous faut</h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">Un outil pensé pour s'intégrer dans votre pratique, pas pour la remplacer.</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {BENEFITS.map((b) => (
                <motion.div key={b.title} variants={fadeUp} className="card-rf p-6 flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <b.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{b.title}</h3>
                    <p className="text-sm text-muted-foreground">{b.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-20 px-4 md:px-6 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.h2 variants={fadeUp} className="font-display text-4xl font-semibold text-foreground text-center mb-12">Ils l'utilisent déjà</motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t) => (
                <motion.div key={t.name} variants={fadeUp} className="card-rf p-6">
                  <StarRating n={t.stars} />
                  <p className="text-sm text-muted-foreground mt-3 mb-4 leading-relaxed">"{t.text}"</p>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing simplifié */}
      <section className="py-20 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.h2 variants={fadeUp} className="font-display text-4xl font-semibold text-foreground mb-4">Tarifs simples, sans surprise</motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg mb-10">30 jours gratuits · Aucune carte bancaire · Annulez quand vous voulez.</motion.p>
            <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { name: "Starter",  price: "15",  patients: "10 patients",  highlighted: false },
                { name: "Pro",      price: "25",  patients: "30 patients",  highlighted: true  },
                { name: "Cabinet",  price: "49",  patients: "Illimité",     highlighted: false },
              ].map((plan) => (
                <div key={plan.name} className={`card-rf p-7 text-left ${plan.highlighted ? "ring-2 ring-primary shadow-lg" : ""}`}>
                  {plan.highlighted && (
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Recommandé</p>
                  )}
                  <p className="font-display text-xl font-semibold text-foreground mb-1">{plan.name}</p>
                  <div className="font-display text-4xl font-bold text-foreground mb-1">
                    {plan.price}€<span className="text-lg font-normal text-muted-foreground">/mois</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-5">{plan.patients}</p>
                  <button
                    onClick={() => navigate("/auth?tab=signup")}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      plan.highlighted
                        ? "btn-forest"
                        : "border border-border hover:border-primary/30 text-foreground"
                    }`}
                  >
                    Commencer
                  </button>
                </div>
              ))}
            </motion.div>
            <motion.p variants={fadeUp} className="text-sm text-muted-foreground">
              Tous les plans incluent : Accès patient gratuit · Données hébergées en France · RGPD conforme ·{' '}
              <button onClick={() => navigate("/pricing")} className="text-primary underline underline-offset-2 hover:text-primary/80">
                Voir le détail des plans
              </button>
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 md:px-6 bg-muted/30">
        <div className="container mx-auto max-w-2xl">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.h2 variants={fadeUp} className="font-display text-4xl font-semibold text-foreground text-center mb-12">Questions fréquentes</motion.h2>
            <div className="space-y-4">
              {FAQ.map((item) => (
                <motion.div key={item.q} variants={fadeUp} className="card-rf p-6">
                  <h3 className="font-semibold text-foreground mb-2">{item.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 px-4 md:px-6 bg-primary text-white">
        <div className="container mx-auto max-w-2xl text-center">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.h2 variants={fadeUp} className="font-display text-4xl font-semibold text-white mb-4">Prêt à essayer ?</motion.h2>
            <motion.p variants={fadeUp} className="text-primary-foreground/70 text-lg mb-8">30 jours gratuits, sans carte bancaire. Accès complet dès l'inscription.</motion.p>
            <motion.button variants={fadeUp} onClick={() => navigate("/auth?tab=signup")}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-pill bg-white text-primary font-medium text-base hover:bg-white/90 transition-all duration-250">
              Démarrer maintenant <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 md:px-6 border-t border-border/50">
        <div className="container mx-auto max-w-5xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
              <Wind className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium text-foreground">RespirFacile</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <button onClick={() => navigate("/")} className="hover:text-foreground transition-colors">Accueil</button>
            <button onClick={() => navigate("/legal/privacy")} className="hover:text-foreground transition-colors">Confidentialité</button>
            <button onClick={() => navigate("/contact")} className="hover:text-foreground transition-colors">Contact</button>
          </div>
          <p className="text-xs text-muted-foreground">© 2025 RespirFacile</p>
        </div>
      </footer>
    </div>
  );
};

export default ProLanding;
