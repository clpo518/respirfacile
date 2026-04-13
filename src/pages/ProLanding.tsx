import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Activity, ArrowRight, BarChart3, Headphones, FileText, Users, Shield, 
  Clock, FlaskConical, MessageCircleWarning, AudioWaveform, Timer, 
  FileDown, Sparkles, Zap, Dna, CheckCircle2, Play, Pause, Flame, Target,
  BookOpen, Wind, Brain, Mic2, Gauge, MessageSquare
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { FounderStorySection } from "@/components/landing/FounderStorySection";
import { ProDemoSection } from "@/components/landing/ProDemoSection";

const benefits = [
  {
    icon: Timer,
    title: "Mesure objective du débit",
    description: "Mesure les Syllabes Par Seconde en excluant les pauses. Métrique clinique de Van Zaalen.",
    isNew: true
  },
  {
    icon: Dna,
    title: "Calibrage par Âge",
    description: "Objectifs adaptés automatiquement au profil du patient (enfant, ado, adulte, senior).",
    isNew: true
  },
  {
    icon: MessageCircleWarning,
    title: "Détection des Disfluences",
    description: "Repérage automatique des mots d'appui ('euh', 'du coup', 'en fait'...)."
  },
  {
    icon: Headphones,
    title: "Suivi à distance",
    description: "Vérifiez l'assiduité entre deux séances. Écoutez les enregistrements à distance."
  }
];

const features = [
  {
    icon: Users,
    title: "Gestion des patients",
    description: "Invitez vos patients avec un code unique. Suivez leur progression depuis votre tableau de bord."
  },
  {
    icon: Activity,
    title: "SPS & Ratio de Fluence",
    description: "Syllabes/seconde calculées sur le temps de parole réel + ratio parole/silence."
  },
  {
    icon: AudioWaveform,
    title: "Retour visuel & Disfluences",
    description: "Visualisez la forme d'onde et la répartition des mots d'appui."
  },
  {
    icon: BarChart3,
    title: "Courbes d'évolution",
    description: "Visualisez l'évolution du SPS moyen sur plusieurs semaines."
  },
  {
    icon: Clock,
    title: "Historique complet",
    description: "Accédez à toutes les sessions avec enregistrements audio et métriques."
  },
  {
    icon: Shield,
    title: "Données sécurisées",
    description: "Hébergement conforme RGPD. Données chiffrées et accessibles uniquement par vous."
  },
  {
    icon: Sparkles,
    title: "Mode Pédiatrique",
    description: "Exercices visuels par emojis pour les patients non-lecteurs. Barres de souffle intégrées, bilan simplifié par étoiles.",
    isNew: true
  }
];

const ageNorms = [
  { label: "Enfant", age: "<12 ans", sps: 4.2, emoji: "👶", color: "bg-blue-500" },
  { label: "Adolescent", age: "13-20", sps: 5.5, emoji: "🧑", color: "bg-purple-500" },
  { label: "Adulte", age: "21-60", sps: 5.0, emoji: "👤", color: "bg-primary" },
  { label: "Senior", age: ">60 ans", sps: 4.5, emoji: "🧓", color: "bg-amber-500" },
];

// Animated Speed Gauge Mock Component
const speedStates = [
  { sps: 3.2, label: "Posé", emoji: "🐢", color: "text-sky-600 dark:text-sky-400", bgColor: "bg-sky-500", progress: 40 },
  { sps: 4.1, label: "Parfait", emoji: "✅", color: "text-success", bgColor: "bg-success", progress: 51 },
  { sps: 5.3, label: "Rapide", emoji: "⚡", color: "text-warning", bgColor: "bg-warning", progress: 66 },
  { sps: 6.8, label: "Trop vite", emoji: "🔴", color: "text-destructive", bgColor: "bg-destructive", progress: 85 },
];

const RealTimeFeedbackMock = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % speedStates.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);
  
  const current = speedStates[currentIndex];
  const targetSps = 4.0;
  const targetProgress = (targetSps / 8) * 100; // 50%
  
  return (
    <div className="relative">
      <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
        <div className="space-y-5">
          {/* Target display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="w-4 h-4 text-primary" />
              <span>Objectif :</span>
              <span className="font-bold text-foreground">{targetSps.toFixed(1)} syll/s</span>
            </div>
          </div>
          
          {/* Main gauge */}
          <div className="space-y-3">
            {/* Current state with animation */}
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <span className="text-3xl">{current.emoji}</span>
              <div className="flex-1">
                <div className={`text-lg font-bold ${current.color}`}>
                  {current.label}
                </div>
                <div className="text-sm text-muted-foreground">
                  {current.sps.toFixed(1)} syllabes/seconde
                </div>
              </div>
            </motion.div>
            
            {/* Progress bar */}
            <div className="relative h-4 bg-muted rounded-full overflow-hidden">
              {/* Target zone indicator */}
              <div 
                className="absolute h-full bg-success/20"
                style={{ left: `${targetProgress - 8}%`, width: '16%' }}
              />
              
              {/* Animated bar */}
              <motion.div
                className={`h-full rounded-full ${current.bgColor}`}
                initial={{ width: 0 }}
                animate={{ width: `${current.progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              
              {/* Target marker */}
              <div 
                className="absolute top-0 h-full w-0.5 bg-foreground/40"
                style={{ left: `${targetProgress}%` }}
              />
            </div>
            
            {/* Scale labels */}
            <div className="flex justify-between text-[10px] text-muted-foreground px-1">
              <span>Lent</span>
              <span className="text-success font-medium">Zone cible</span>
              <span>Rapide</span>
            </div>
          </div>
          
          {/* State indicators */}
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-border">
            {speedStates.map((state, i) => (
              <motion.div
                key={i}
                className={`text-center p-2 rounded-lg transition-all duration-200 ${
                  i === currentIndex 
                    ? "bg-muted ring-2 ring-primary" 
                    : "bg-muted/30"
                }`}
                animate={{ scale: i === currentIndex ? 1.05 : 1 }}
              >
                <div className="text-lg">{state.emoji}</div>
                <div className="text-[10px] text-muted-foreground">{state.sps}</div>
              </motion.div>
            ))}
          </div>
          
          {/* Van Zaalen reference */}
          <div className="text-[10px] text-center text-muted-foreground pt-2 border-t border-border">
            <FlaskConical className="w-3 h-3 inline mr-1" />
            Articulatory Rate (Van Zaalen) — silences exclus
          </div>
        </div>
      </div>
    </div>
  );
};

const ProLanding = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 gradient-subtle" />
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-primary/[0.03]"
              animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute top-1/2 -left-24 w-[400px] h-[400px] rounded-full bg-accent/30"
              animate={{ scale: [1.1, 1, 1.1], y: [0, 20, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="container relative z-10 px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                className="flex flex-wrap items-center justify-center gap-3 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="badge-clinical">
                  <Activity className="w-3.5 h-3.5" />
                  Bredouillement & Tachylalie
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-medium">
                  Espace Orthophonistes
                </span>
              </motion.div>
              
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6 leading-[1.1] tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Prolongez l'efficacité de vos séances{" "}
                <span className="gradient-text">à la maison.</span>
              </motion.h1>
              
              <motion.p
                className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                L'outil de suivi pour vos patients qui bredouillent ou parlent trop vite. 
                Assurez le transfert des acquis à domicile et générez vos bilans chiffrés en un clic.
              </motion.p>
              
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex flex-col items-center">
                  <Button asChild size="lg" className="text-base px-8 h-14 shadow-md hover:shadow-lg">
                    <Link to="/auth">
                      Démarrer mes 30 jours d'essai
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <span className="text-xs text-muted-foreground mt-2">Sans carte bancaire</span>
                </div>
                <Button variant="outline" size="lg" className="text-base px-8 h-14" asChild>
                  <a href="#demo">
                    <Play className="w-4 h-4 mr-2" />
                    Voir la démo
                  </a>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Trust badges */}
        <section className="py-8 bg-muted/50 border-y border-border/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-2 text-muted-foreground"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <benefit.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{benefit.title}</span>
                  {benefit.isNew && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-orange-500 text-white rounded-full uppercase">
                      Nouveau
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <ProDemoSection />

        {/* Age Calibration Feature Section */}
        <section className="py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <motion.div
              className="max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 md:p-12 border-2 border-primary/20 bg-gradient-to-br from-primary/[0.02] to-transparent">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-bold uppercase tracking-wide">
                    <Dna className="w-4 h-4" />
                    Exclusif
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-sm font-medium">
                    <FlaskConical className="w-4 h-4" />
                    Basé sur Van Zaalen
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
                      {[
                        "Fini les faux positifs : objectifs adaptés à l'âge",
                        "Normes cliniques Van Zaalen intégrées",
                        "Alerte si objectif dépasse la norme physiologique"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="relative">
                    <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
                      <div className="text-center text-sm text-muted-foreground mb-4">
                        Normes SPS par tranche d'âge
                      </div>
                      
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
                                <div 
                                  className={`h-full ${group.color} rounded-full transition-all duration-500`}
                                  style={{ width: `${(group.sps / 6) * 100}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-primary font-bold w-12 text-right">{group.sps}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="text-[10px] text-center text-muted-foreground pt-3 mt-4 border-t border-border">
                        Van Zaalen — Articulatory Rate Norms
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* PDF Report Feature */}
        <section className="py-20 md:py-28 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <motion.div
              className="max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 md:p-12 border-2 border-primary/20">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-bold uppercase tracking-wide">
                    <Sparkles className="w-4 h-4" />
                    Nouveau
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-600 text-sm font-medium">
                    <Zap className="w-4 h-4" />
                    Gain de temps considérable
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
                      {[
                        "Analyse intelligente : interprétations cliniques auto-générées",
                        "Graphiques intégrés : courbe d'évolution du SPS dans le PDF",
                        "Assiduité documentée : sessions, temps de pratique, série en cours"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button asChild size="lg" className="gap-2">
                      <Link to="/auth">
                        <FileDown className="w-5 h-5" />
                        Essayer gratuitement
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                  
                  {/* PDF Preview Mock */}
                  <div className="relative">
                    <div className="bg-white rounded-xl shadow-lg p-6 transform rotate-1 hover:rotate-0 transition-transform duration-300 border border-border">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b-2 border-primary pb-3">
                          <div>
                            <div className="text-xs text-muted-foreground">Bilan de Suivi</div>
                            <div className="text-sm font-bold text-foreground">Patient: Martin D.</div>
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { label: "SPS Moyen", value: "4.2" },
                            { label: "Sessions", value: "12" },
                            { label: "Assiduité", value: "85%" },
                            { label: "Tendance", value: "↑" },
                          ].map((stat, i) => (
                            <div key={i} className="text-center p-2 bg-muted/50 rounded-lg">
                              <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                              <div className="text-sm font-bold text-foreground">{stat.value}</div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Mini chart */}
                        <div className="h-16 bg-muted/50 rounded-lg flex items-end justify-around p-2">
                          {[40, 55, 45, 60, 70, 65, 80].map((h, i) => (
                            <div key={i} className="w-3 bg-primary/60 rounded-t" style={{ height: `${h}%` }} />
                          ))}
                        </div>
                        
                        <div className="text-[10px] text-muted-foreground text-center">
                          Évolution du SPS sur 4 semaines
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Real-Time Biofeedback Section */}
        <section className="py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <motion.div
              className="max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 md:p-12 border-2 border-success/20 bg-gradient-to-br from-success/[0.02] to-transparent">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-success text-success-foreground text-sm font-bold uppercase tracking-wide">
                    <Target className="w-4 h-4" />
                    Biofeedback Temps Réel
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-sm font-medium">
                    <FlaskConical className="w-4 h-4" />
                    Basé sur Van Zaalen
                  </span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-10 items-center">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                      Feedback visuel <span className="text-success">instantané</span>
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      Le patient sait immédiatement s'il parle trop vite ou pas assez grâce à une jauge colorée intuitive. 
                      <strong className="text-foreground"> Plus besoin de chiffres anxiogènes.</strong>
                    </p>
                    
                    <ul className="space-y-3 mb-8">
                      {[
                        "Métrique SPS : Syllabes Par Seconde, pas mots/minute — plus précise cliniquement",
                        "Articulatory Rate : calcul excluant les silences (pauses non comptées)",
                        "Feedback émotionnel : emojis et couleurs au lieu de données brutes",
                        "Zone cible personnalisée : le patient voit son objectif en vert"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Animated Speed Gauge Mock */}
                  <RealTimeFeedbackMock />
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Audio Replay + SPS Overlay Section */}
        <section className="py-20 md:py-28 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <motion.div
              className="max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 md:p-12 border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/[0.02] to-transparent">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600 text-white text-sm font-bold uppercase tracking-wide">
                    <AudioWaveform className="w-4 h-4" />
                    Nouveau
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 text-sm font-medium">
                    <Headphones className="w-4 h-4" />
                    Réécoute clinique augmentée
                  </span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-10 items-center">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                      Réécouter en <span className="text-blue-600">voyant</span> sa vitesse
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      Superposez la courbe SPS en temps réel sur la forme d'onde audio.
                      <strong className="text-foreground"> Le patient entend ET voit exactement où il accélère.</strong>
                    </p>
                    
                    <ul className="space-y-3 mb-8">
                      {[
                        "Biofeedback double : auditif + visuel pour une prise de conscience maximale",
                        "Courbe colorée : bleu = zone idéale, orange/rouge = accélération détectée",
                        "Curseur synchronisé : le SPS instantané s'affiche pendant la lecture",
                        "Analyse seconde par seconde : identifiez les micro-accélérations invisibles"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button asChild size="lg" className="gap-2">
                      <Link to="/auth">
                        Essayer la réécoute augmentée
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                  
                  {/* Waveform + SPS Overlay Mock */}
                  <div className="relative">
                    <div className="bg-card rounded-xl shadow-lg p-5 border border-border">
                      <div className="text-center text-sm text-muted-foreground mb-3">
                        Analyse Audio — Session du 5 mars
                      </div>
                      
                      {/* Mock waveform with SPS overlay */}
                      <div className="relative bg-muted/30 rounded-lg p-3 h-40 overflow-hidden">
                        {/* Waveform bars */}
                        <div className="absolute inset-x-3 bottom-6 top-3 flex items-end gap-[2px]">
                          {[20,35,50,30,65,45,70,40,55,80,35,60,45,75,30,50,65,40,55,35,70,50,40,60,45,35,55,30,45,65,50,40,55,35,25].map((h, i) => (
                            <div 
                              key={i} 
                              className="flex-1 rounded-t bg-muted-foreground/15" 
                              style={{ height: `${h}%` }} 
                            />
                          ))}
                        </div>
                        
                        {/* SPS curve overlay */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="none">
                          {/* Target zone */}
                          <rect x="0" y="35" width="300" height="25" fill="rgba(59,130,246,0.06)" rx="2" />
                          <line x1="0" y1="48" x2="300" y2="48" stroke="#3b82f6" strokeWidth="1" strokeDasharray="6 4" opacity="0.4" />
                          
                          {/* SPS curve - colored segments */}
                          <path d="M 10 55 C 30 50, 40 45, 55 42" stroke="#3b82f6" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                          <path d="M 55 42 C 70 38, 80 35, 95 30" stroke="#3b82f6" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                          <path d="M 95 30 C 110 25, 120 22, 135 18" stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                          <path d="M 135 18 C 150 15, 155 14, 165 12" stroke="#ef4444" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                          <path d="M 165 12 C 180 20, 190 35, 200 42" stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                          <path d="M 200 42 C 215 48, 225 50, 240 46" stroke="#3b82f6" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                          <path d="M 240 46 C 255 42, 265 40, 280 44" stroke="#3b82f6" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                          
                          {/* Playback cursor */}
                          <line x1="165" y1="8" x2="165" y2="110" stroke="#1e293b" strokeWidth="1.5" opacity="0.5" />
                          
                          {/* SPS badge at cursor */}
                          <rect x="141" y="2" width="48" height="18" rx="9" fill="#ef4444" opacity="0.9" />
                          <text x="165" y="14" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">6.8</text>
                        </svg>
                        
                        {/* Time markers */}
                        <div className="absolute bottom-0 inset-x-3 flex justify-between text-[9px] text-muted-foreground font-mono">
                          <span>0:00</span>
                          <span>0:15</span>
                          <span>0:30</span>
                          <span>0:45</span>
                          <span>1:00</span>
                        </div>
                      </div>
                      
                      {/* Mock controls */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Pause className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <span className="text-xs text-muted-foreground font-mono">0:33 / 1:02</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-[10px] text-muted-foreground">Courbe SPS</span>
                          <div className="w-7 h-4 rounded-full bg-blue-500 relative">
                            <div className="absolute right-0.5 top-0.5 w-3 h-3 rounded-full bg-white" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Legend */}
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border flex-wrap">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-0.5 rounded-full bg-blue-500" />
                          <span className="text-[9px] text-muted-foreground">Zone idéale</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-0.5 rounded-full bg-amber-500" />
                          <span className="text-[9px] text-muted-foreground">Un peu rapide</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-0.5 rounded-full bg-red-500" />
                          <span className="text-[9px] text-muted-foreground">Trop rapide</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-0.5 rounded-full bg-blue-500 border-dashed border border-blue-400" style={{ width: 12 }} />
                          <span className="text-[9px] text-muted-foreground">Cible</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Dialogue Mode Feature Section */}
        <section className="py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <motion.div
              className="max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 md:p-12 border-2 border-primary/20 bg-gradient-to-br from-primary/[0.02] to-transparent">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-bold uppercase tracking-wide">
                    <Sparkles className="w-4 h-4" />
                    Nouveau
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    💬 Transfert en situation réelle
                  </span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-10 items-center">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                      Mode Dialogue : <span className="text-primary">la conversation guidée</span>
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      Vos patients posent le téléphone sur la table et discutent librement. 
                      <strong className="text-foreground"> Un indicateur visuel leur signale en temps réel s'ils parlent trop vite.</strong>
                    </p>
                    
                    <ul className="space-y-3 mb-8">
                      {[
                        "Transfert des acquis : de l'exercice à la conversation réelle",
                        "Interface épurée : un seul emoji visible de loin, zéro stress",
                        "Sessions courtes : 30 sec à 5 min pour s'intégrer à la séance",
                        "Données traçées : SPS, durée et résultats dans le dossier patient"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button asChild size="lg" className="gap-2">
                      <Link to="/auth">
                        Essayer le Mode Dialogue
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                  
                  {/* Dialogue Mode Preview Mock */}
                  <div className="relative">
                    <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
                      <div className="text-center text-sm text-muted-foreground mb-4">
                        Aperçu Mode Dialogue
                      </div>
                      
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-32 h-32 rounded-full border-4 border-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 flex flex-col items-center justify-center">
                          <span className="text-4xl">✅</span>
                          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">Parfait</span>
                          <span className="text-[10px] text-muted-foreground">4.0 syll/s</span>
                        </div>
                        
                        <p className="text-xs text-muted-foreground text-center max-w-[200px]">
                          Un seul gros indicateur visible de loin — l'emoji change en temps réel
                        </p>
                        
                        <div className="flex items-center gap-3 w-full mt-2">
                          {[
                            { emoji: "🐢", label: "Lent", color: "bg-sky-100 dark:bg-sky-900/30" },
                            { emoji: "✅", label: "Parfait", color: "bg-emerald-100 dark:bg-emerald-900/30 ring-2 ring-primary" },
                            { emoji: "⚡", label: "Rapide", color: "bg-amber-100 dark:bg-amber-900/30" },
                          ].map((state, i) => (
                            <div key={i} className={`flex-1 text-center p-2 rounded-lg ${state.color}`}>
                              <div className="text-lg">{state.emoji}</div>
                              <div className="text-[10px] text-muted-foreground">{state.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-[10px] text-center text-muted-foreground pt-3 mt-4 border-t border-border">
                        💬 Posez le téléphone et discutez naturellement
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Patient Motivation Section */}
        <section className="py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <motion.div
              className="max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 md:p-12 border-2 border-accent-foreground/20 bg-gradient-to-br from-accent/30 to-transparent">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-warning text-warning-foreground text-sm font-bold uppercase tracking-wide">
                    <Flame className="w-4 h-4" />
                    Motivation
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium">
                    <Target className="w-4 h-4" />
                    Évitez le décrochage
                  </span>
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
                      {[
                        "Séries de jours : le patient ne veut pas « casser » sa série",
                        "Objectif quotidien : anneau de progression personnalisable",
                        "Feedback encourageant : confettis et célébrations à chaque succès"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-accent-foreground flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button asChild size="lg" className="gap-2">
                      <Link to="/auth">
                        Démarrer l'essai gratuit
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                  
                  {/* Gamification Preview Mock */}
                  <div className="relative">
                    <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
                      <div className="space-y-5">
                        {/* Streak */}
                        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-accent to-accent/50 rounded-xl border border-accent-foreground/20">
                          <div className="w-12 h-12 rounded-full bg-accent-foreground/10 flex items-center justify-center">
                            <Flame className="w-6 h-6 text-accent-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm text-muted-foreground">Série en cours</div>
                            <div className="text-2xl font-bold text-accent-foreground">7 jours 🔥</div>
                          </div>
                        </div>
                        
                        {/* Daily Goal Ring */}
                        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                          <div className="relative">
                            <svg width={60} height={60} className="transform -rotate-90">
                              <circle cx={30} cy={30} r={25} fill="none" stroke="currentColor" strokeWidth={5} className="text-muted/30" />
                              <circle cx={30} cy={30} r={25} fill="none" stroke="hsl(var(--success))" strokeWidth={5} strokeLinecap="round" 
                                strokeDasharray={2 * Math.PI * 25} strokeDashoffset={2 * Math.PI * 25 * 0.2} />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <CheckCircle2 className="w-6 h-6 text-success" />
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Objectif du jour</div>
                            <div className="font-bold text-foreground">3/3 min ✅</div>
                          </div>
                        </div>
                        
                        {/* Week Progress */}
                        <div className="pt-4 border-t border-border">
                          <div className="text-sm text-muted-foreground mb-3 text-center">Cette semaine</div>
                          <div className="flex justify-center gap-2">
                            {["L", "M", "M", "J", "V", "S", "D"].map((day, i) => (
                              <div key={i} className="flex flex-col items-center gap-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                                  ${i < 5 ? "bg-success text-success-foreground" : i === 5 ? "bg-primary/20 text-primary ring-2 ring-primary" : "bg-muted text-muted-foreground"}`}>
                                  {i < 5 ? "✓" : day}
                                </div>
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

        {/* Exercise Library Section */}
        <section className="py-20 md:py-28 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <motion.div
              className="max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 md:p-12 border-2 border-primary/20 bg-gradient-to-br from-primary/[0.02] to-transparent">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-bold uppercase tracking-wide">
                    <BookOpen className="w-4 h-4" />
                    Bibliothèque
                  </span>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    +90 exercices variés
                  </span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-10 items-center">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                      Du contenu <span className="text-primary">pour chaque objectif</span>
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      Une bibliothèque riche et variée pour maintenir l'engagement de vos patients. 
                      <strong className="text-foreground"> Fini la monotonie des exercices répétitifs.</strong>
                    </p>
                    
                    <ul className="space-y-3 mb-8">
                      {[
                        "Exercices progressifs adaptés à chaque niveau",
                        "Catégories ciblées : articulation, souffle, contrôle...",
                        "Import de texte personnalisé : vos patients s'entraînent sur leur propre contenu",
                        "Nouveaux contenus ajoutés régulièrement"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button asChild size="lg" className="gap-2">
                      <Link to="/auth">
                        Découvrir la bibliothèque
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                  
                  {/* Exercise Categories Preview */}
                  <div className="relative space-y-4">
                    <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
                      <div className="text-center text-sm text-muted-foreground mb-4">
                        Catégories d'exercices
                      </div>
                      
                      <div className="space-y-3">
                        {[
                          { icon: Gauge, label: "Ralentissement", count: 10, color: "bg-primary/10 text-primary" },
                          { icon: Mic2, label: "Articulation", count: 20, color: "bg-success/10 text-success" },
                          { icon: Activity, label: "Défis Moteurs", count: 12, color: "bg-warning/10 text-warning" },
                          { icon: Wind, label: "Gestion du Souffle", count: 10, color: "bg-sky-500/10 text-sky-600" },
                          { icon: Brain, label: "Pièges Cognitifs", count: 8, color: "bg-purple-500/10 text-purple-600" },
                          { icon: Zap, label: "Échauffement Vocal", count: 5, color: "bg-orange-500/10 text-orange-600" },
                          { icon: MessageSquare, label: "Mode Dialogue", count: null, color: "bg-primary/10 text-primary", isNew: true },
                        ].map((cat, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                            <div className={`w-9 h-9 rounded-lg ${cat.color} flex items-center justify-center`}>
                              <cat.icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground">{cat.label}</span>
                              {(cat as any).isNew && (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full uppercase">
                                  Nouveau
                                </span>
                              )}
                            </div>
                            {cat.count && (
                              <span className="text-xs font-bold text-muted-foreground bg-background px-2 py-1 rounded-full">
                                {cat.count}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div className="text-[10px] text-center text-muted-foreground pt-3 mt-4 border-t border-border">
                        Contenus créés par des orthophonistes
                      </div>
                    </div>

                    {/* Rebus Child Mode Card */}
                    <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/50 dark:via-yellow-950/40 dark:to-orange-950/40 border-2 border-yellow-200 dark:border-yellow-800 p-5">
                      <div className="absolute top-3 right-3 text-2xl opacity-50 animate-bounce" style={{ animationDuration: '3s' }}>🐢</div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">🖼️</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-foreground">Mode Rébus</span>
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full uppercase">
                              Nouveau
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">Enfants & non-lecteurs · Dès 4 ans</p>
                        </div>
                        <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/40 px-2.5 py-1 rounded-full">
                          25 ex.
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xl bg-white/60 dark:bg-background/40 rounded-lg px-3 py-2">
                        <span>🏠</span>
                        <span className="text-sm text-foreground">→</span>
                        <span className="text-sm font-medium text-foreground">"maison"</span>
                        <span className="text-muted-foreground mx-1">·</span>
                        <span>🐱</span>
                        <span className="text-sm text-foreground">→</span>
                        <span className="text-sm font-medium text-foreground">"chat"</span>
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
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Tout pour le suivi clinique
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Des outils pensés pour les orthophonistes, par des orthophonistes.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="p-6 h-full hover:shadow-card-hover transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      {(feature as any).isNew && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-orange-500 text-white rounded-full uppercase">
                          Nouveau
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-16 md:py-20">
          <div className="container px-4 md:px-6">
            <motion.div
              className="max-w-3xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative bg-card rounded-2xl p-8 md:p-12 shadow-lg border border-primary/10">
                <div className="text-4xl mb-6">💬</div>
                <blockquote className="text-lg md:text-xl text-foreground italic leading-relaxed mb-6">
                  "Bien conçu et facile d'utilisation. C'est vraiment l'outil qu'il me manquait pour mesurer objectivement le débit de parole."
                </blockquote>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">O</span>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Orthophoniste</p>
                    <p className="text-sm text-muted-foreground">Professionnelle de santé</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 md:py-28 bg-muted/30">
          <div className="container px-4 md:px-6">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Questions fréquentes
              </h2>
              <p className="text-lg text-muted-foreground">
                Tout ce que vous devez savoir sur ParlerMoinsVite Pro
              </p>
            </motion.div>

            <motion.div
              className="max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Accordion type="single" collapsible className="space-y-3">
                <AccordionItem value="item-1" className="bg-card border border-border rounded-xl px-6 overflow-hidden">
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="text-foreground font-medium">
                      Comment mes patients accèdent-ils à l'application ?
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    Vos patients téléchargent l'application et entrent votre code Pro unique. 
                    Ils apparaissent ensuite dans votre tableau de bord.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="bg-card border border-border rounded-xl px-6 overflow-hidden">
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="text-foreground font-medium">
                      Comment fonctionne l'abonnement Pro ?
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    Vous bénéficiez de <strong className="text-foreground">30 jours d'essai gratuit</strong> sans carte bancaire. 
                    Ensuite, l'abonnement inclut un nombre de comptes patients actifs (3 ou 5). 
                    Vos patients accèdent gratuitement à toutes les fonctionnalités via votre code Pro.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="bg-card border border-border rounded-xl px-6 overflow-hidden">
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="text-foreground font-medium">
                      Comment calculez-vous la vitesse de parole ?
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    Nous utilisons le Taux d'Articulation (SPS) tel que défini par Van Zaalen. 
                    Les Syllabes Par Seconde sont calculées en excluant les pauses, 
                    ce qui correspond à l'indicateur clinique pertinent pour le bredouillement.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="bg-card border border-border rounded-xl px-6 overflow-hidden">
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="text-foreground font-medium">
                      Les données sont-elles sécurisées ?
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    Absolument. Toutes les données sont hébergées en Europe, chiffrées, 
                    et conformes au RGPD. Seul vous et votre patient avez accès aux enregistrements.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" className="bg-card border border-border rounded-xl px-6 overflow-hidden">
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="text-foreground font-medium">
                      Faut-il installer quelque chose ?
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    Aucune installation n'est nécessaire. ParlerMoinsVite fonctionne directement 
                    depuis un navigateur web, sur téléphone, tablette ou ordinateur. Vos patients 
                    peuvent s'entraîner n'importe où, n'importe quand.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6" className="bg-card border border-border rounded-xl px-6 overflow-hidden">
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="text-foreground font-medium">
                      Puis-je avoir une démonstration personnalisée ?
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    Bien sûr ! Nous proposons un accompagnement personnalisé pour vous aider à prendre 
                    en main l'outil. Envoyez-nous un mail à{" "}
                    <a href="mailto:contact@parlermoinsvite.fr" className="text-primary hover:underline font-medium">
                      contact@parlermoinsvite.fr
                    </a>{" "}
                    et nous prendrons le temps de vous présenter ParlerMoinsVite en détail.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* Founder Story Section */}
        <FounderStorySection audience="therapist" />

        {/* CTA Section */}
        <section className="py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <motion.div
              className="max-w-3xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Prêt à améliorer le suivi de vos patients ?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Créez votre compte gratuit en 30 secondes. Aucune carte bancaire requise.
              </p>
              <Button asChild size="lg" className="text-base px-8 h-14 shadow-md hover:shadow-lg">
                <Link to="/auth">
                  Créer un compte Pro gratuit
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProLanding;