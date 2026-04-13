import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Activity, ArrowRight, BarChart3, Headphones, FileText, Users, Shield,
  Clock, FlaskConical, MessageCircleWarning, AudioWaveform, Timer,
  FileDown, Sparkles, Zap, Dna, CheckCircle2, Flame, Target
} from "lucide-react";
import { ProDemoSection } from "./ProDemoSection";
import { AugmentedPlaybackSection } from "./AugmentedPlaybackSection";
import LiveSessionCard from "./LiveSessionCard";

const benefits = [
  { icon: Timer, title: "Mesure objective du débit", description: "Mesure les Syllabes Par Seconde en excluant les pauses.", isNew: true },
  { icon: Dna, title: "Calibrage par Âge", description: "Objectifs adaptés automatiquement au profil du patient.", isNew: true },
  { icon: MessageCircleWarning, title: "Analyse de Fluence", description: "Répétitions, blocages, allongements et mots d'appui détectés automatiquement." },
  { icon: Headphones, title: "Suivi à distance", description: "Vérifiez l'assiduité entre deux séances." },
];

const features = [
  { icon: Users, title: "Gestion des patients", description: "Invitez vos patients avec un code unique. Suivez leur progression depuis votre tableau de bord." },
  { icon: Activity, title: "SPS & Ratio de Fluence", description: "Syllabes/seconde calculées sur le temps de parole réel + ratio parole/silence." },
  { icon: AudioWaveform, title: "Retour visuel & Disfluences", description: "Visualisez la forme d'onde et la répartition des mots d'appui." },
  { icon: BarChart3, title: "Courbes d'évolution", description: "Visualisez l'évolution du SPS moyen sur plusieurs semaines." },
  { icon: Clock, title: "Historique complet", description: "Accédez à toutes les séances avec enregistrements audio et métriques." },
  { icon: Shield, title: "Données sécurisées", description: "Hébergement conforme RGPD. Données chiffrées et accessibles uniquement par vous." },
  { icon: Sparkles, title: "Mode Pédiatrique", description: "Exercices visuels par emojis pour les patients non-lecteurs. Barres de souffle intégrées.", isNew: true },
];

const ageNorms = [
  { label: "Enfant", age: "<12 ans", sps: 4.2, emoji: "👶", color: "bg-blue-500" },
  { label: "Adolescent", age: "13-20", sps: 5.5, emoji: "🧑", color: "bg-purple-500" },
  { label: "Adulte", age: "21-60", sps: 5.0, emoji: "👤", color: "bg-primary" },
  { label: "Senior", age: ">60 ans", sps: 4.5, emoji: "🧓", color: "bg-amber-500" },
];

export const ProSections = () => {
  return (
    <>
      {/* Trust badges */}
      <section className="py-8 bg-muted/50 border-y border-border/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {benefits.map((benefit, index) => (
              <motion.div key={index} className="flex items-center gap-2 text-muted-foreground" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.1 }}>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <benefit.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium">{benefit.title}</span>
                {benefit.isNew && <span className="px-1.5 py-0.5 text-[10px] font-bold bg-orange-500 text-white rounded-full uppercase">Nouveau</span>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ProDemoSection />

      {/* Live Session Mode Card — first feature card */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <LiveSessionCard />
          </div>
        </div>
      </section>

      {/* Augmented Playback */}
      <AugmentedPlaybackSection />

      {/* Age Calibration */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <motion.div className="max-w-5xl mx-auto" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Card className="p-8 md:p-12 border-2 border-primary/20 bg-gradient-to-br from-primary/[0.02] to-transparent">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-bold uppercase tracking-wide">
                  <Dna className="w-4 h-4" />Exclusif
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-sm font-medium">
                  <FlaskConical className="w-4 h-4" />Basé sur Van Zaalen
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                    Calibrage <span className="text-primary">par Âge</span>
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Le débit articulatoire naturel varie selon l'âge.
                    <strong className="text-foreground"> L'application adapte automatiquement les objectifs au profil de chaque patient.</strong>
                  </p>
                  <ul className="space-y-3 mb-8">
                    {["Fini les faux positifs : objectifs adaptés à l'âge", "Normes cliniques Van Zaalen intégrées", "Alerte si objectif dépasse la norme physiologique"].map((item, i) => (
                      <li key={i} className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" /><span className="text-muted-foreground">{item}</span></li>
                    ))}
                  </ul>
                </div>
                <div className="relative">
                  <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
                    <div className="text-center text-sm text-muted-foreground mb-4">Normes SPS par tranche d'âge</div>
                    <div className="space-y-4">
                      {ageNorms.map((group, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-2xl">{group.emoji}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-foreground font-medium">{group.label}</span>
                              <span className="text-muted-foreground">{group.age}</span>
                            </div>
                            <div className="h-3 bg-muted rounded-full overflow-hidden">
                              <div className={`h-full ${group.color} rounded-full transition-all duration-500`} style={{ width: `${(group.sps / 6) * 100}%` }} />
                            </div>
                          </div>
                          <span className="text-primary font-bold w-12 text-right">{group.sps}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-[10px] text-center text-muted-foreground pt-3 mt-4 border-t border-border">Van Zaalen — Articulatory Rate Norms</div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* PDF Report */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="container px-4 md:px-6">
          <motion.div className="max-w-5xl mx-auto" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Card className="p-8 md:p-12 border-2 border-primary/20">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-bold uppercase tracking-wide">
                  <Sparkles className="w-4 h-4" />Nouveau
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-600 text-sm font-medium">
                  <Zap className="w-4 h-4" />Gain de temps considérable
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                    Bilan PDF <span className="text-primary">en 1 clic</span>
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Générez une base de bilan clinique avec les données objectives de vos patients.
                    <strong className="text-foreground"> Un point de départ solide pour vos comptes-rendus.</strong>
                  </p>
                  <ul className="space-y-3 mb-8">
                    {["Analyse intelligente : interprétations cliniques auto-générées", "Graphiques intégrés : courbe d'évolution du SPS dans le PDF", "Assiduité documentée : séances, temps de pratique, série en cours"].map((item, i) => (
                      <li key={i} className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" /><span className="text-muted-foreground">{item}</span></li>
                    ))}
                  </ul>
                  <Button asChild size="lg" className="gap-2"><Link to="/auth"><FileDown className="w-5 h-5" />Essayer gratuitement<ArrowRight className="w-4 h-4 ml-1" /></Link></Button>
                </div>
                <div className="relative">
                  <div className="bg-white rounded-xl shadow-lg p-6 transform rotate-1 hover:rotate-0 transition-transform duration-300 border border-border">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b-2 border-primary pb-3">
                        <div><div className="text-xs text-muted-foreground">Bilan de Suivi</div><div className="text-sm font-bold text-foreground">Patient: Martin D.</div></div>
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><FileText className="w-4 h-4 text-primary" /></div>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[{ label: "SPS Moyen", value: "4.2" }, { label: "Séances", value: "12" }, { label: "Assiduité", value: "85%" }, { label: "Tendance", value: "↑" }].map((stat, i) => (
                          <div key={i} className="text-center p-2 bg-muted/50 rounded-lg"><div className="text-[10px] text-muted-foreground">{stat.label}</div><div className="text-sm font-bold text-foreground">{stat.value}</div></div>
                        ))}
                      </div>
                      <div className="h-16 bg-muted/50 rounded-lg flex items-end justify-around p-2">
                        {[40, 55, 45, 60, 70, 65, 80].map((h, i) => (<div key={i} className="w-3 bg-primary/60 rounded-t" style={{ height: `${h}%` }} />))}
                      </div>
                      <div className="text-[10px] text-muted-foreground text-center">Évolution du SPS sur 4 semaines</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Patient Motivation */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <motion.div className="max-w-5xl mx-auto" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Card className="p-8 md:p-12 border-2 border-accent-foreground/20 bg-gradient-to-br from-accent/30 to-transparent">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-warning text-warning-foreground text-sm font-bold uppercase tracking-wide"><Flame className="w-4 h-4" />Motivation</span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium"><Target className="w-4 h-4" />Évitez le décrochage</span>
              </div>
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                    Gardez vos patients <span className="text-accent-foreground">motivés</span>
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Inspiré de Duolingo, l'application gamifie la rééducation pour maximiser l'assiduité entre les séances.
                    <strong className="text-foreground"> Vos patients reviennent d'eux-mêmes.</strong>
                  </p>
                  <ul className="space-y-3 mb-8">
                    {["Séries de jours : le patient ne veut pas « casser » sa série", "Objectif quotidien : anneau de progression personnalisable", "Feedback encourageant : confettis et célébrations à chaque succès"].map((item, i) => (
                      <li key={i} className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-accent-foreground flex-shrink-0 mt-0.5" /><span className="text-muted-foreground">{item}</span></li>
                    ))}
                  </ul>
                  <Button asChild size="lg" className="gap-2"><Link to="/auth">Démarrer l'essai gratuit<ArrowRight className="w-4 h-4 ml-1" /></Link></Button>
                </div>
                <div className="relative">
                  <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
                    <div className="space-y-5">
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-accent to-accent/50 rounded-xl border border-accent-foreground/20">
                        <div className="w-12 h-12 rounded-full bg-accent-foreground/10 flex items-center justify-center"><Flame className="w-6 h-6 text-accent-foreground" /></div>
                        <div className="flex-1"><div className="text-sm text-muted-foreground">Série en cours</div><div className="text-2xl font-bold text-accent-foreground">7 jours 🔥</div></div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                        <div className="relative">
                          <svg width={60} height={60} className="transform -rotate-90">
                            <circle cx={30} cy={30} r={25} fill="none" stroke="currentColor" strokeWidth={5} className="text-muted/30" />
                            <circle cx={30} cy={30} r={25} fill="none" stroke="hsl(var(--success))" strokeWidth={5} strokeLinecap="round" strokeDasharray={2 * Math.PI * 25} strokeDashoffset={2 * Math.PI * 25 * 0.2} />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center"><CheckCircle2 className="w-6 h-6 text-success" /></div>
                        </div>
                        <div><div className="text-sm text-muted-foreground">Objectif du jour</div><div className="font-bold text-foreground">3/3 min ✅</div></div>
                      </div>
                      <div className="pt-4 border-t border-border">
                        <div className="text-sm text-muted-foreground mb-3 text-center">Cette semaine</div>
                        <div className="flex justify-center gap-2">
                          {["L", "M", "M", "J", "V", "S", "D"].map((day, i) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${i < 5 ? "bg-success text-success-foreground" : i === 5 ? "bg-primary/20 text-primary ring-2 ring-primary" : "bg-muted text-muted-foreground"}`}>{i < 5 ? "✓" : day}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Tout pour le suivi clinique</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Des outils pensés pour les orthophonistes, par des orthophonistes.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                <Card className="p-6 h-full hover:shadow-card-hover transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><feature.icon className="w-6 h-6 text-primary" /></div>
                    {(feature as any).isNew && <span className="px-1.5 py-0.5 text-[10px] font-bold bg-orange-500 text-white rounded-full uppercase">Nouveau</span>}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <motion.div className="max-w-3xl mx-auto text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Prêt à transformer votre pratique ?</h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">Rejoignez les orthophonistes qui utilisent ParlerMoinsVite pour le suivi à domicile de leurs patients.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex flex-col items-center">
                <Button asChild size="lg" className="text-base px-8 h-14 shadow-md hover:shadow-lg">
                  <Link to="/auth">Démarrer mes 30 jours d'essai<ArrowRight className="w-5 h-5 ml-2" /></Link>
                </Button>
                <span className="text-xs text-muted-foreground mt-2">Sans carte bancaire</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};
