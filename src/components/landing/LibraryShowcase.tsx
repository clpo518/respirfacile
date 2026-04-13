import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, Sparkles, FileText } from "lucide-react";

const categories = [
  { icon: "📖", title: "Ralentissement", count: 10, bg: "bg-emerald-50 dark:bg-emerald-950/40", iconBg: "bg-emerald-100 dark:bg-emerald-900/50", text: "text-emerald-700 dark:text-emerald-400" },
  { icon: "🎯", title: "Articulation", count: 20, bg: "bg-red-50 dark:bg-red-950/40", iconBg: "bg-red-100 dark:bg-red-900/50", text: "text-red-700 dark:text-red-400" },
  { icon: "🧘", title: "Gestion du Souffle", count: 10, bg: "bg-pink-50 dark:bg-pink-950/40", iconBg: "bg-pink-100 dark:bg-pink-900/50", text: "text-pink-700 dark:text-pink-400" },
  { icon: "⚡", title: "Défis Moteurs", count: 12, bg: "bg-cyan-50 dark:bg-cyan-950/40", iconBg: "bg-cyan-100 dark:bg-cyan-900/50", text: "text-cyan-700 dark:text-cyan-400" },
  { icon: "🏋️", title: "Échauffement", count: 5, bg: "bg-orange-50 dark:bg-orange-950/40", iconBg: "bg-orange-100 dark:bg-orange-900/50", text: "text-orange-700 dark:text-orange-400" },
  { icon: "🧠", title: "Pièges Cognitifs", count: 8, bg: "bg-purple-50 dark:bg-purple-950/40", iconBg: "bg-purple-100 dark:bg-purple-900/50", text: "text-purple-700 dark:text-purple-400" },
  { icon: "💬", title: "Dialogue Multi-voix", count: 0, isNew: true, bg: "bg-primary/5 dark:bg-primary/10", iconBg: "bg-primary/15 dark:bg-primary/20", text: "text-primary" },
  { icon: "🧘", title: "Tolérance au Silence", count: 0, isNew: true, bg: "bg-blue-50 dark:bg-blue-950/40", iconBg: "bg-blue-100 dark:bg-blue-900/50", text: "text-blue-700 dark:text-blue-400" },
];

const rebusCategory = {
  icon: "🖼️",
  title: "Mode Rébus",
  subtitle: "Spécial enfants & non-lecteurs",
  count: 25,
};

export const LibraryShowcase = () => {
  const totalCount = categories.reduce((sum, c) => sum + c.count, 0) + rebusCategory.count;

  return (
    <section className="py-24 bg-gradient-to-b from-secondary/30 to-background overflow-hidden">
      <div className="container px-4 md:px-6">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            Vos Exercices
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            +{totalCount} exercices variés
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Du contenu riche et diversifié pour éviter la monotonie et progresser dans toutes les dimensions de la parole.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start max-w-5xl mx-auto">
          {/* Left: category list */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {categories.map((category, index) => (
              <motion.div
                key={index}
                className={`flex items-center gap-4 p-4 rounded-xl ${category.bg} transition-transform hover:scale-[1.02]`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.06 }}
              >
                <div className={`w-10 h-10 rounded-lg ${category.iconBg} flex items-center justify-center text-xl flex-shrink-0`}>
                  {category.icon}
                </div>
                <span className={`font-medium flex-1 ${category.text}`}>{category.title}</span>
                {(category as any).isNew ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full uppercase">Nouveau</span>
                ) : (
                  <span className={`text-sm font-bold ${category.text} tabular-nums`}>{category.count}</span>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Right: Rebus child card */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/50 dark:via-yellow-950/40 dark:to-orange-950/40 border-2 border-yellow-200 dark:border-yellow-800 p-8">
              {/* Decorative floating emojis */}
              <div className="absolute top-4 right-4 text-3xl opacity-60 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>🐢</div>
              <div className="absolute bottom-6 right-8 text-2xl opacity-50 animate-bounce" style={{ animationDelay: '1s', animationDuration: '2.5s' }}>🌈</div>
              <div className="absolute top-1/2 right-4 text-2xl opacity-40 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}>⭐</div>

              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold uppercase tracking-wide">
                  <Sparkles className="w-3 h-3" />
                  Nouveau
                </span>
              </div>

              <div className="text-5xl mb-4">{rebusCategory.icon}</div>
              <h3 className="text-2xl font-bold text-foreground mb-2">{rebusCategory.title}</h3>
              <p className="text-muted-foreground mb-4">{rebusCategory.subtitle}</p>

              {/* Example rebus preview */}
              <div className="bg-white/70 dark:bg-background/50 rounded-xl p-4 mb-4 border border-yellow-200/60 dark:border-yellow-800/40">
                <p className="text-sm text-muted-foreground mb-2 font-medium">Exemple :</p>
                <div className="flex items-center gap-2 text-2xl flex-wrap">
                  <span>🏠</span>
                  <span className="text-lg text-foreground">→</span>
                  <span className="text-base font-medium text-foreground">"maison"</span>
                  <span className="mx-1 text-muted-foreground">·</span>
                  <span>🐱</span>
                  <span className="text-lg text-foreground">→</span>
                  <span className="text-base font-medium text-foreground">"chat"</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/40 px-3 py-1 rounded-full">
                  {rebusCategory.count} exercices
                </span>
                <span className="text-xs text-muted-foreground">Dès 4 ans</span>
              </div>
            </div>
          </motion.div>

          {/* Custom Text Feature Highlight */}
          <motion.div
            className="max-w-5xl mx-auto mt-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5 border-2 border-primary/20 p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
                  <FileText className="w-7 h-7 text-primary" />
                </div>
                <div className="text-center md:text-left flex-1">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <h3 className="text-lg font-bold text-foreground">Importez votre propre texte</h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full uppercase">
                      Nouveau
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm max-w-xl">
                    Préparez un oral, un discours ou un texte clinique spécifique ? Collez votre texte et entraînez-vous avec le biofeedback en temps réel.
                    Idéal pour répéter une présentation ou travailler un support personnalisé.
                  </p>
                </div>
                <Button asChild variant="outline" className="gap-2 shrink-0 border-primary/30 hover:bg-primary/10">
                  <Link to="/auth">
                    Essayer
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="text-center mt-14"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-muted-foreground mb-6">
            Nouveaux exercices ajoutés chaque mois pour maintenir la motivation.
          </p>
          <Button asChild size="lg" className="gap-2">
            <Link to="/auth">
              Découvrir les exercices
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
