import { motion } from "framer-motion";
import { Flame, Target, Users, TrendingUp, Bell, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// Mockup versions of gamification components for the landing page
const MockStreakBadge = () => (
  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30">
    <Flame className="w-5 h-5 text-orange-500 fill-orange-500/30" />
    <span className="text-lg font-bold text-orange-500 tabular-nums">12</span>
    <span className="text-sm text-orange-400">jours</span>
  </div>
);

const MockDailyGoalRing = ({ progress = 66 }: { progress?: number }) => {
  const size = 56;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-white tabular-nums">2/3</span>
      </div>
    </div>
  );
};

const MockRetentionTable = () => {
  const patients = [
    { name: "Marie L.", status: "active", days: 0 },
    { name: "Thomas B.", status: "slipping", days: 4 },
    { name: "Sophie M.", status: "dropout", days: 8 },
  ];

  const statusConfig = {
    active: { label: "Actif", color: "bg-emerald-500", textColor: "text-emerald-400" },
    slipping: { label: "En baisse", color: "bg-amber-500", textColor: "text-amber-400" },
    dropout: { label: "Abandon", color: "bg-red-500", textColor: "text-red-400" },
  };

  return (
    <div className="bg-slate-800/80 rounded-lg border border-slate-700/50 overflow-hidden">
      <div className="px-3 py-2 bg-slate-700/50 border-b border-slate-600/50">
        <span className="text-xs font-medium text-slate-300">Suivi Rétention</span>
      </div>
      <div className="divide-y divide-slate-700/50">
        {patients.map((patient, idx) => (
          <div key={idx} className="flex items-center justify-between px-3 py-2">
            <span className="text-sm text-white">{patient.name}</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${statusConfig[patient.status as keyof typeof statusConfig].color}`} />
              <span className={`text-xs ${statusConfig[patient.status as keyof typeof statusConfig].textColor}`}>
                {statusConfig[patient.status as keyof typeof statusConfig].label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const EngagementSection = () => {
  const features = [
    {
      icon: Flame,
      title: "Série de jours consécutifs",
      description: "Le patient voit son nombre de jours d'entraînement d'affilée. S'il rate un jour, la série repart à zéro — un levier psychologique puissant.",
    },
    {
      icon: Target,
      title: "Objectif quotidien personnalisable",
      description: "Par défaut : 3 minutes/jour. Quand l'objectif est atteint, une animation de félicitations renforce la motivation.",
    },
    {
      icon: Bell,
      title: "Alertes de décrochage automatiques",
      description: "Voyez instantanément quels patients sont Actifs, En baisse ou en Abandon. Intervenez avant qu'il ne soit trop tard.",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 via-slate-800/50 to-slate-900">
      <div className="container px-4 md:px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex justify-center gap-2 mb-6">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30">
              Nouveau
            </Badge>
            <Badge variant="outline" className="text-slate-400 border-slate-600">
              Inspiré des apps de coaching
            </Badge>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            L'application qui motive vos patients
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Comment savoir si votre patient s'entraîne vraiment ? Notre système gamifié l'encourage à pratiquer tous les jours — et vous alerte s'il décroche.
          </p>
        </motion.div>

        {/* Main content: 2 columns */}
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left: Feature list */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex gap-4"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Bonus callout */}
            <motion.div
              className="flex items-start gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mt-8"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-emerald-400 font-medium">
                  Résultat observé
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Les patients avec un objectif quotidien s'entraînent <span className="text-white font-medium">3x plus régulièrement</span> que ceux sans suivi.
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Visual mockups */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="bg-slate-800/50 border-slate-700/50 overflow-hidden">
              <CardContent className="p-6 space-y-6">
                {/* Patient view header */}
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">
                    Vue Patient
                  </span>
                </div>

                {/* Gamification elements row */}
                <div className="flex items-center justify-center gap-8 py-4">
                  <div className="text-center">
                    <MockStreakBadge />
                    <p className="text-xs text-slate-500 mt-2">Série en cours</p>
                  </div>
                  <div className="text-center">
                    <MockDailyGoalRing progress={66} />
                    <p className="text-xs text-slate-500 mt-2">Objectif du jour</p>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-700/50" />

                {/* Therapist view header */}
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">
                    Vue Orthophoniste
                  </span>
                  <Users className="w-4 h-4 text-slate-500" />
                </div>

                {/* Retention table */}
                <MockRetentionTable />

                {/* Insight callout */}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  <p className="text-xs text-amber-400">
                    2 patients nécessitent une relance cette semaine
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Decorative gradient */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/5 via-emerald-500/5 to-primary/5 rounded-2xl blur-xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
