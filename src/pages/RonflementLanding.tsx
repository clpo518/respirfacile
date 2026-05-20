import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Wind, ArrowRight, CheckCircle2, Star } from "lucide-react"

const STATS = [
  { value: "40%", label: "des adultes ronflent régulièrement" },
  { value: "−50%", label: "d'apnées après 3 mois d'exercices" },
  { value: "13", label: "essais randomisés contrôlés" },
]

const EXERCISES = [
  { icon: "👅", name: "Position de repos de la langue", benefit: "Réduit l'obstruction pharyngée en corrigeant la posture linguale" },
  { icon: "🗣️", name: "Élévation du voile du palais", benefit: "Renforce les muscles qui vibrent la nuit et causent le ronflement" },
  { icon: "👄", name: "Fermeture labiale", benefit: "Réhabilite la respiration nasale — les ronfleurs respirent souvent par la bouche" },
  { icon: "🧘", name: "Rétraction cervicale", benefit: "Améliore la posture du cou, libère les voies aériennes supérieures" },
]

const REASONS = [
  "Votre partenaire dort dans une autre pièce",
  "Vous vous réveillez avec la bouche sèche",
  "Vous avez mal à la gorge le matin",
  "Vous vous sentez fatigué même après 8h de sommeil",
  "On vous dit que vous faites des pauses dans votre respiration",
]

const TESTIMONIALS = [
  { name: "Marie, 52 ans", text: "Après 6 semaines, mon mari a arrêté de dormir dans le canapé. Je n'avais pas réalisé à quel point ça affectait notre vie.", stars: 5 },
  { name: "Thomas, 44 ans", text: "Mon médecin m'avait dit que c'était normal. RespirFacile m'a montré que non. Mon score BOLT est passé de 8 à 21 secondes.", stars: 5 },
  { name: "Isabelle, 38 ans", text: "En 3 mois j'ai arrêté les bandelettes nasales. Les exercices de langue font vraiment la différence.", stars: 4 },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function RonflementLanding() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
        <div className="container px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Wind className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-semibold text-foreground text-lg">RespirFacile</span>
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/bilan-sommeil")} className="text-sm text-muted-foreground hover:text-foreground hidden md:block">
              Test gratuit
            </button>
            <button onClick={() => navigate("/auth?tab=signup")} className="btn-forest text-sm px-4 py-2">
              Commencer
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="pt-28 pb-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div initial="hidden" animate="show" variants={fadeUp}>
              <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-orange-100 text-orange-700 mb-5">
                Solution validée par 13 essais cliniques
              </span>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground leading-tight mb-5">
                Arrêtez de ronfler.<br />
                <span className="text-primary">Sans chirurgie, sans appareil.</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                20 minutes d'exercices par jour renforcent les muscles de votre gorge et réduisent le ronflement de 50 % en 3 mois.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate("/bilan-sommeil")}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-border hover:border-primary/40 bg-card text-foreground font-medium"
                >
                  Faire le test gratuit (2 min)
                </button>
                <button
                  onClick={() => navigate("/auth?tab=signup")}
                  className="btn-forest px-6 py-3.5 gap-2 font-semibold"
                >
                  Commencer maintenant
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-10 px-4 bg-muted/30">
          <div className="max-w-2xl mx-auto grid grid-cols-3 gap-4">
            {STATS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="font-display text-3xl font-bold text-primary">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-tight">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Reconnaissez-vous ces signes ? */}
        <section className="py-14 px-4">
          <div className="max-w-xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2 text-center">
              Vous reconnaissez-vous ?
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              Ces signes indiquent souvent un problème traitable par la rééducation.
            </p>
            <div className="space-y-3">
              {REASONS.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <p className="text-sm text-foreground">{r}</p>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-6 p-5 rounded-2xl bg-primary/5 border border-primary/15 text-center"
            >
              <p className="text-sm font-medium text-foreground mb-3">
                Si vous vous reconnaissez dans 3 signes ou plus, la rééducation respiratoire peut vous aider.
              </p>
              <button
                onClick={() => navigate("/bilan-sommeil")}
                className="text-sm text-primary font-semibold hover:underline flex items-center gap-1 mx-auto"
              >
                Évaluer mon profil gratuitement <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* Exercices */}
        <section className="py-14 px-4 bg-muted/30">
          <div className="max-w-xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2 text-center">
              Des exercices qui agissent sur la cause
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              Le ronflement vient de muscles affaiblis. Ces exercices les renforcent.
            </p>
            <div className="space-y-3">
              {EXERCISES.map((ex, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border"
                >
                  <span className="text-2xl shrink-0 mt-0.5">{ex.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{ex.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{ex.benefit}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Témoignages */}
        <section className="py-14 px-4">
          <div className="max-w-xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
              Ils ont retrouvé un sommeil réparateur
            </h2>
            <div className="space-y-4">
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="card-rf p-5"
                >
                  <div className="flex mb-2">
                    {Array(t.stars).fill(0).map((_, si) => (
                      <Star key={si} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/80 italic leading-relaxed mb-2">"{t.text}"</p>
                  <p className="text-xs text-muted-foreground font-medium">{t.name}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="py-16 px-4 bg-gradient-to-b from-background to-primary/5">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Prêt à arrêter de ronfler ?
            </h2>
            <p className="text-muted-foreground mb-8">
              Programme personnalisé · 8 semaines · Suivi par votre orthophoniste
            </p>
            <button
              onClick={() => navigate("/auth?tab=signup")}
              className="btn-forest px-8 py-4 text-base font-semibold gap-2"
            >
              Commencer gratuitement
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-muted-foreground mt-4">Sans engagement · Résultat en 8 semaines</p>
          </div>
        </section>
      </main>

      <footer className="py-8 px-4 border-t border-border/50 text-center">
        <p className="text-xs text-muted-foreground">© 2025 RespirFacile · contact@respirfacile.fr</p>
      </footer>
    </div>
  )
}
