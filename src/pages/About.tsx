import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import { 
  Mountain, 
  Timer, 
  Lightbulb, 
  Heart, 
  Waves, 
  Play, 
  ArrowRight, 
  Quote,
  PenLine,
  Smartphone,
  Target,
  Sparkles
} from "lucide-react";
import clementPhoto from "@/assets/clement-founder.jpg";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section - Personal Story */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-emerald-800 to-slate-900" />
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-blue-500/30 to-transparent" />
          <svg className="absolute bottom-0 w-full h-48 text-slate-900/50" preserveAspectRatio="none" viewBox="0 0 1200 120">
            <path d="M0,120 L200,60 L400,90 L600,30 L800,75 L1000,45 L1200,80 L1200,120 Z" fill="currentColor" />
          </svg>
          <svg className="absolute bottom-0 w-full h-32 text-slate-900/80" preserveAspectRatio="none" viewBox="0 0 1200 120">
            <path d="M0,120 L150,80 L350,100 L550,60 L750,95 L950,70 L1200,90 L1200,120 Z" fill="currentColor" />
          </svg>
        </div>
        
        <div className="container relative z-10 px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-teal-200 text-sm font-medium mb-6">
              <Heart className="w-4 h-4" />
              Une histoire personnelle
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              J'ai créé l'outil <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-300">
                dont j'avais besoin.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-teal-100/80 max-w-2xl mx-auto">
              Mon parcours avec le bredouillement, et comment cette frustration 
              est devenue une mission.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Section 1: Founder Photo + Personal Story */}
      <section className="py-20 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex justify-center lg:justify-start"
            >
              <div className="relative">
                <div className="w-72 h-80 md:w-80 md:h-96 rounded-3xl overflow-hidden shadow-2xl">
                  <img 
                    src={clementPhoto} 
                    alt="Clément, fondateur de ParlerMoinsVite" 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Decorative elements */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/10 rounded-2xl -z-10" />
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-teal-500/20 rounded-xl -z-10" />
                
                {/* Name badge */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white dark:bg-card px-4 py-2 rounded-full shadow-lg border border-border">
                  <p className="font-semibold text-foreground">Clément</p>
                  <p className="text-xs text-muted-foreground text-center">Fondateur</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-2 text-primary font-medium mb-4">
                <Lightbulb className="w-5 h-5" />
                Mon Histoire
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Le bredouillement, depuis tout petit
              </h2>
              <div className="prose prose-slate dark:prose-invert">
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Aussi loin que je me souvienne, j'ai toujours parlé trop vite. Les mots se bousculaient, 
                  mes idées allaient plus vite que ma bouche ne pouvait suivre. Le <strong>bredouillement</strong>, 
                  c'était mon quotidien.
                </p>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  En <strong>2022</strong>, j'ai enfin franchi le pas et consulté une orthophoniste, 
                  <strong> Audrey Laydernier</strong>. Ce suivi a été un tournant. Pour la première fois, 
                  j'ai compris ce qui se passait et j'ai découvert des techniques qui fonctionnaient.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-16 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-y border-primary/10">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <Quote className="w-12 h-12 text-primary/40 mx-auto mb-6" />
            <blockquote className="text-xl md:text-2xl font-medium text-foreground italic leading-relaxed">
              "J'avais décroché. J'aurais eu besoin d'une app pour me motiver, 
              faire les exercices à la maison, sans avoir à m'enregistrer sur mon téléphone."
            </blockquote>
            <p className="text-muted-foreground mt-4">— La frustration qui a tout déclenché</p>
          </motion.div>
        </div>
      </section>

      {/* Section 2: The Frustrations */}
      <section className="py-20 bg-background">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 text-primary font-medium mb-4">
              <Timer className="w-5 h-5" />
              Les Frustrations
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ce qui manquait cruellement
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Malgré l'efficacité des séances, il y avait des freins qui m'ont fait décrocher.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Smartphone,
                title: "S'enregistrer sur le téléphone",
                description: "Personne n'aime réécouter sa propre voix. C'était un frein psychologique énorme pour pratiquer à la maison.",
                color: "text-red-500",
                bg: "bg-red-500/10"
              },
              {
                icon: PenLine,
                title: "Compter les syllabes au crayon",
                description: "En séance, on comptait manuellement les syllabes pour calculer le débit. Une perte de temps précieuse sur les 30 minutes.",
                color: "text-amber-500",
                bg: "bg-amber-500/10"
              },
              {
                icon: Target,
                title: "Pas de motivation entre les séances",
                description: "Sans outil ludique ni suivi, j'ai fini par décrocher. La motivation s'érodait entre chaque rendez-vous.",
                color: "text-blue-500",
                bg: "bg-blue-500/10"
              }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative bg-card rounded-2xl p-8 shadow-lg border border-border/50"
              >
                <div className={`w-16 h-16 ${item.bg} rounded-2xl flex items-center justify-center mb-4`}>
                  <item.icon className={`w-8 h-8 ${item.color}`} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: The Solution */}
      <section className="py-20 bg-gradient-to-b from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/20">
        <div className="container px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 font-medium mb-4">
                <Sparkles className="w-5 h-5" />
                La Naissance
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Alors j'ai créé ParlerMoinsVite
              </h2>
              <div className="prose prose-slate dark:prose-invert">
                <p className="text-muted-foreground text-lg leading-relaxed">
                  La rééducation m'a aidé. Vraiment. Mais j'ai réalisé qu'il manquait un <strong>outil moderne</strong> 
                  pour accompagner les patients entre les séances.
                </p>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Un outil qui <strong>calcule automatiquement</strong> le débit de parole. Qui donne un 
                  <strong> feedback visuel en temps réel</strong>. Qui <strong>motive</strong> à pratiquer 
                  régulièrement avec des objectifs et des streaks.
                </p>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  C'est ainsi qu'est né <strong>parlermoinsvite.fr</strong> — l'outil que j'aurais 
                  voulu avoir dès le premier jour de ma rééducation.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Lake & Mountains Illustration - Annecy */}
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-b from-sky-400 via-sky-300 to-blue-400">
                <div className="absolute inset-0 bg-gradient-to-b from-sky-300 to-sky-100" />
                <div className="absolute top-8 right-12 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-200 to-amber-300 shadow-lg shadow-amber-200/50" />
                <svg className="absolute bottom-1/3 w-full h-1/3 text-teal-700/60" preserveAspectRatio="none" viewBox="0 0 100 50">
                  <path d="M0,50 L15,20 L30,35 L50,10 L70,30 L85,15 L100,40 L100,50 Z" fill="currentColor" />
                </svg>
                <svg className="absolute bottom-1/4 w-full h-1/3 text-teal-800/80" preserveAspectRatio="none" viewBox="0 0 100 50">
                  <path d="M0,50 L20,25 L40,40 L60,15 L80,35 L100,20 L100,50 Z" fill="currentColor" />
                </svg>
                <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-blue-500 to-blue-400">
                  <div className="absolute inset-0 opacity-30">
                    {[...Array(8)].map((_, i) => (
                      <div 
                        key={i}
                        className="absolute h-px bg-white/50"
                        style={{ 
                          top: `${20 + i * 10}%`, 
                          left: `${10 + i * 5}%`, 
                          width: `${30 + Math.random() * 30}%` 
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-teal-800 flex items-center gap-1.5 shadow-lg">
                  <Mountain className="w-4 h-4" />
                  Annecy, France
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Waves className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Prêt à trouver votre rythme ?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
              Rejoignez des centaines de personnes qui ont repris le contrôle de leur parole.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2" asChild>
                <Link to="/auth">
                  <Play className="w-5 h-5" />
                  Commencer l'entraînement
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2" asChild>
                <Link to="/pricing">
                  Voir les tarifs
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
