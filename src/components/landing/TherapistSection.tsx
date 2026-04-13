import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Stethoscope, 
  CheckCircle, 
  BarChart3, 
  Headphones, 
  Target,
  ArrowRight,
  FileText,
  Gauge
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    text: "Taux d'Articulation (SPS) : Mesure le débit réel en excluant les silences (méthode Van Zaalen)."
  },
  {
    icon: Gauge,
    text: "Débitmètre en séance : Mesurez le débit de votre patient en direct, sur votre tablette, pendant la consultation."
  },
  {
    icon: Headphones,
    text: "Écoute différée : Recevez les enregistrements de vos patients entre les séances."
  },
  {
    icon: Target,
    text: "Ratio de Fluence : Visualisez le temps de parole vs temps de pause pour chaque session."
  },
  {
    icon: FileText,
    text: "Aide au bilan : Données objectives prêtes à intégrer dans vos comptes-rendus cliniques."
  }
];

export const TherapistSection = () => {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="container px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium mb-6">
              <Stethoscope className="w-4 h-4" />
              Espace Orthophoniste
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Un outil de télé-soin pensé pour votre pratique.
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8">
              « Le bredouillement nécessite un entraînement quotidien intensif » 
              <span className="text-sm">(Van Zaalen)</span>. 
              <br />
              <strong>Déléguez l'entraînement, gardez l'expertise.</strong>
            </p>

            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <feature.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-foreground">{feature.text}</p>
                </motion.div>
              ))}
            </div>

            <Button asChild size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Link to="/pro">
                Créer un compte Pro (Gratuit)
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>

          {/* Right: Visual */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-border/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold">Tableau de bord Pro</p>
                  <p className="text-sm text-muted-foreground">Jusqu'à 10 patients actifs</p>
                </div>
              </div>

              {/* Mock patient cards */}
              <div className="space-y-3">
                {[
                  { name: "Marie D.", progress: 78, sessions: 12 },
                  { name: "Thomas L.", progress: 45, sessions: 5 },
                  { name: "Sophie M.", progress: 92, sessions: 18 }
                ].map((patient, index) => (
                  <div key={index} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{patient.name}</span>
                      <span className="text-xs text-muted-foreground">{patient.sessions} séances</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${patient.progress}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {patient.progress}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Nouvelle session de Sophie M. disponible</span>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-4 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-border/50">
              <span className="text-sm font-medium">🔬 Compatible PRAAT</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
