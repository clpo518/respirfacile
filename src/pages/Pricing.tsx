import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Shield, Headphones, RotateCcw, ArrowRight, Stethoscope, User, Mic, BarChart3, MessageSquare, Gift, Sparkles, Users, Zap, Coffee, Archive, RefreshCw, UserPlus, Activity } from "lucide-react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const Pricing = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Determine which tab to show based on URL param or default to "pro"
  const audienceParam = searchParams.get("audience");
  const defaultTab = audienceParam === "patient" ? "patient" : "pro";

  const handleTabChange = (value: string) => {
    setSearchParams({ audience: value });
  };

  const proPlans = [
    {
      id: "essentiel",
      name: "Offre 3 patients",
      price: "14,90",
      seats: 3,
      tagline: "L'équivalent de 3 cafés par mois.",
      features: [
        "3 comptes patients actifs",
        "Calcul syllabe/seconde en temps réel",
        "Plus de 60 exercices variés",
        "Bilan pré-rempli automatique",
        "Prescriptions à distance",
        "Analyse audio & waveforms",
      ],
      popular: false,
    },
    {
      id: "expert",
      name: "Offre 5 patients",
      price: "19,90",
      seats: 5,
      tagline: "L'équivalent de 4 cafés par mois.",
      features: [
        "5 comptes patients actifs",
        "Calcul syllabe/seconde en temps réel",
        "Plus de 60 exercices variés",
        "Bilan pré-rempli automatique",
        "Prescriptions à distance",
        "Analyse audio & waveforms",
      ],
      popular: true,
    },
    {
      id: "premium",
      name: "Offre 10 patients",
      price: "29,90",
      seats: 10,
      tagline: "Pour les orthophonistes avec beaucoup de patients à suivre.",
      features: [
        "10 comptes patients actifs",
        "Calcul syllabe/seconde en temps réel",
        "Plus de 60 exercices variés",
        "Bilan pré-rempli automatique",
        "Prescriptions à distance",
        "Analyse audio & waveforms",
      ],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-16">
        {/* Hero Section with Tabs */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl md:text-4xl font-semibold mb-4">
                Nos tarifs
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Une tarification simple et transparente, adaptée à chaque profil.
              </p>

              {/* Audience Toggle Tabs */}
              <Tabs value={defaultTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                  <TabsTrigger value="pro" className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" />
                    Orthophonistes
                  </TabsTrigger>
                  <TabsTrigger value="patient" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Patients
                  </TabsTrigger>
                </TabsList>

                {/* PRO CONTENT */}
                <TabsContent value="pro" className="mt-0">
                  <ProPricingContent plans={proPlans} navigate={navigate} />
                </TabsContent>

                {/* PATIENT CONTENT */}
                <TabsContent value="patient" className="mt-0">
                  <PatientPricingContent navigate={navigate} />
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

// ============ PRO PRICING CONTENT ============
interface PlanType {
  id: string;
  name: string;
  price: string;
  seats: number;
  tagline: string;
  features: string[];
  popular: boolean;
}

const ProPricingContent = ({ 
  plans, 
  navigate 
}: { 
  plans: PlanType[]; 
  navigate: ReturnType<typeof useNavigate>;
}) => (
  <>
    {/* Hero text for Pro */}
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-10"
    >
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
        <Zap className="w-4 h-4" />
        Essai gratuit 30 jours
      </div>
      <h2 className="text-2xl md:text-3xl font-semibold mb-3">
        Gagnez du temps clinique, gardez le lien.
      </h2>
      <p className="text-muted-foreground max-w-2xl mx-auto">
        Suivez la progression de vos patients entre les séances avec des métriques objectives. 
        <strong className="text-foreground"> Gratuit pour vos patients</strong>, c'est vous qui gérez l'abonnement.
      </p>
    </motion.div>

    {/* Pricing Cards */}
    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
      {plans.map((plan, index) => (
        <motion.div
          key={plan.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`relative h-full ${
            plan.popular 
              ? "border-2 border-primary shadow-lg shadow-primary/10" 
              : "border-border"
          }`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  Populaire
                </span>
              </div>
            )}

            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.tagline}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Price */}
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">{plan.price}€</span>
                  <span className="text-muted-foreground">/mois</span>
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Coffee className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {plan.id === "essentiel" ? "3 cafés" : plan.id === "expert" ? "4 cafés" : "6 cafés"}
                  </span>
                </div>
              </div>

              {/* Sans engagement badge */}
              <div className="flex items-center justify-center gap-2 mt-2 text-emerald-600 dark:text-emerald-400">
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Sans engagement — annulez quand vous voulez</span>
              </div>

              {/* Patient accounts highlight */}
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-center">
                <div className="flex items-center justify-center gap-2 text-primary font-bold">
                  <Users className="w-5 h-5" />
                  {plan.seats} Comptes Patients Actifs
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2.5">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                className={`w-full ${plan.popular ? "" : ""}`}
                size="lg"
                onClick={() => navigate("/auth?tab=signup")}
              >
                Essai gratuit 30 jours
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>

    {/* How Patient Accounts Work */}
    <div className="max-w-5xl mx-auto space-y-8 mt-16">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">
          Comment fonctionne le système de comptes patients ?
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Gérez votre file active en toute flexibilité. Archivez les patients en pause, réactivez-les quand ils reviennent.
        </p>
      </div>

      {/* Visual explanation */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="relative p-6 rounded-xl bg-muted/50 border border-border"
        >
          <div className="absolute -top-3 left-4">
            <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4 mt-2">
            <UserPlus className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold mb-2 text-center">Patients actifs</h3>
          <p className="text-sm text-muted-foreground text-center">
            Vos patients en cours de suivi utilisent un compte actif. Ils s'entraînent, vous suivez leur progression.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="relative p-6 rounded-xl bg-muted/50 border border-border"
        >
          <div className="absolute -top-3 left-4">
            <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4 mt-2">
            <Archive className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="font-semibold mb-2 text-center">Archiver un patient</h3>
          <p className="text-sm text-muted-foreground text-center">
            Patient en pause ? Archivez-le en un clic. Ses données sont conservées, le compte est libéré.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4" />
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Archive className="w-4 h-4 text-amber-600" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="relative p-6 rounded-xl bg-muted/50 border border-border"
        >
          <div className="absolute -top-3 left-4">
            <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4 mt-2">
            <RefreshCw className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold mb-2 text-center">Rotation flexible</h3>
          <p className="text-sm text-muted-foreground text-center">
            Réactivez un patient archivé à tout moment. Gérez des dizaines de patients avec seulement 3 ou 5 comptes actifs.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-blue-600 text-sm">
            <RefreshCw className="w-4 h-4" />
            <span>∞ patients au total</span>
          </div>
        </motion.div>
      </div>

      {/* En pratique banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="max-w-3xl mx-auto mt-8 p-5 rounded-xl bg-card border border-border shadow-sm"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="font-semibold mb-1">En pratique</h4>
            <p className="text-sm text-muted-foreground">
              Chaque offre correspond à un nombre de comptes patients actifs simultanés (3, 5 ou 10). Quand l'un termine sa rééducation, archivez-le et activez un nouveau patient. L'historique complet reste accessible pour les bilans.
            </p>
          </div>
        </div>
      </motion.div>
    </div>

    {/* Trust badges */}
    <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mt-12">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4" />
        Paiement sécurisé
      </div>
      <div className="flex items-center gap-2">
        <RotateCcw className="w-4 h-4" />
        Sans engagement
      </div>
      <div className="flex items-center gap-2">
        <Headphones className="w-4 h-4" />
        Support réactif
      </div>
    </div>

    {/* FAQ Pro */}
    <div className="max-w-2xl mx-auto mt-16">
      <h3 className="text-xl font-semibold text-center mb-6">
        Questions fréquentes
      </h3>
      
      <Accordion type="single" collapsible className="space-y-3">
        <AccordionItem value="trial" className="bg-card border border-border rounded-xl px-5">
          <AccordionTrigger className="text-left hover:no-underline py-4">
            <span className="font-medium text-sm">Comment fonctionne l'essai gratuit ?</span>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground pb-4 text-sm">
            Vous avez 30 jours pour tester toutes les fonctionnalités avec jusqu'à 3 patients. Aucune carte bancaire requise pendant l'essai. À la fin, choisissez l'offre qui vous convient : 3, 5 ou 10 patients.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="patients" className="bg-card border border-border rounded-xl px-5">
          <AccordionTrigger className="text-left hover:no-underline py-4">
            <span className="font-medium text-sm">Mes patients doivent-ils payer ?</span>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground pb-4 text-sm">
            Non, <strong className="text-foreground">c'est gratuit pour vos patients</strong>. Votre abonnement couvre leurs accès. Ils créent simplement leur compte avec votre Code Pro.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="cancel" className="bg-card border border-border rounded-xl px-5">
          <AccordionTrigger className="text-left hover:no-underline py-4">
            <span className="font-medium text-sm">Puis-je annuler à tout moment ?</span>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground pb-4 text-sm">
            Oui, sans engagement. Vous pouvez annuler depuis votre espace à tout moment. L'accès reste actif jusqu'à la fin de la période payée.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="data" className="bg-card border border-border rounded-xl px-5">
          <AccordionTrigger className="text-left hover:no-underline py-4">
            <span className="font-medium text-sm">Les données sont-elles sécurisées ?</span>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground pb-4 text-sm">
            Absolument. Hébergement européen, chiffrement, conformité RGPD. Seuls vous et votre patient avez accès aux données de progression.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  </>
);

// ============ PATIENT PRICING CONTENT ============
const PatientPricingContent = ({ 
  navigate 
}: { 
  navigate: ReturnType<typeof useNavigate>;
}) => (
  <>
    {/* Hero text for Patient */}
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-10"
    >
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 text-sm font-medium mb-4">
        <Gift className="w-4 h-4" />
        Accès complet inclus
      </div>
      <h2 className="text-2xl md:text-3xl font-semibold mb-3">
        Gratuit pour vous.
      </h2>
      <p className="text-muted-foreground max-w-2xl mx-auto">
        Votre orthophoniste prend en charge l'abonnement. 
        Vous accédez à <strong className="text-foreground">toutes les fonctionnalités</strong> sans rien payer.
      </p>
    </motion.div>

    {/* Single Patient Card */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="max-w-xl mx-auto mb-12"
    >
      <Card className="p-6 md:p-8 border-2 border-green-500/50 shadow-xl shadow-green-500/10 relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-sm font-semibold px-4 py-1 rounded-full flex items-center gap-1">
          <Sparkles className="w-4 h-4" />
          Tout est inclus
        </div>

        <div className="text-center mb-6 pt-2">
          <h3 className="text-lg font-semibold mb-2">Accès Patient Complet</h3>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-bold text-green-500">0€</span>
            <span className="text-muted-foreground">/mois</span>
          </div>
          <p className="text-muted-foreground mt-2 text-sm">
            Inclus dans l'abonnement de votre orthophoniste
          </p>
        </div>

        <div className="space-y-2.5 mb-6 max-w-sm mx-auto">
          {[
            "Bibliothèque complète : +60 exercices",
            "Mesure de vitesse en temps réel",
            "Détection des disfluences",
            "Objectifs personnalisés selon votre âge",
            "Historique et courbes de progression",
            "Partage audio avec votre orthophoniste",
          ].map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button 
            onClick={() => navigate("/auth?tab=signup")}
            className="shadow-lg shadow-primary/25 hover:shadow-xl transition-all"
            size="lg"
          >
            Créer mon compte patient
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Vous aurez besoin du code Pro de votre orthophoniste
          </p>
        </div>
      </Card>
    </motion.div>

    {/* How it Works Section */}
    <div className="max-w-3xl mx-auto mb-12">
      <h3 className="text-lg font-semibold text-center mb-6">
        Comment ça fonctionne ?
      </h3>
      
      <Card className="p-5 md:p-8 overflow-hidden">
        {/* Flow Steps */}
        <div className="grid sm:grid-cols-4 gap-4 sm:gap-2">
          {[
            { icon: Stethoscope, step: 1, title: "Votre orthophoniste", desc: "S'abonne et vous donne son code unique" },
            { icon: User, step: 2, title: "Vous vous inscrivez", desc: "Créez votre compte avec le code Pro" },
            { icon: Mic, step: 3, title: "Vous vous entraînez", desc: "5 min/jour avec mesure en temps réel" },
            { icon: BarChart3, step: 4, title: "Suivi à distance", desc: "Votre ortho suit vos progrès" },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <span className="inline-block bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full mb-1">
                {item.step}
              </span>
              <h4 className="font-medium text-sm mb-0.5">{item.title}</h4>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Important Notice */}
        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">Pourquoi un code orthophoniste ?</h4>
              <p className="text-xs text-muted-foreground">
                Le bredouillement est un trouble clinique. L'application est <strong className="text-foreground">complémentaire à un suivi professionnel</strong>, 
                pas un substitut. Le code garantit que vous êtes accompagné(e) par un spécialiste.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>

    {/* FAQ Patient */}
    <div className="max-w-2xl mx-auto mt-12">
      <h3 className="text-lg font-semibold text-center mb-6">
        Questions fréquentes
      </h3>
      
      <Accordion type="single" collapsible className="space-y-3">
        <AccordionItem value="code" className="bg-card border border-border rounded-xl px-5">
          <AccordionTrigger className="text-left hover:no-underline py-4">
            <span className="font-medium text-sm">Comment obtenir un code orthophoniste ?</span>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground pb-4 text-sm">
            Demandez à votre orthophoniste s'il/elle utilise ParlerMoinsVite. Si oui, il/elle vous donnera son code Pro unique (format: PRO-XXXXXX). 
            Si votre praticien ne connaît pas encore l'application, invitez-le à découvrir <Link to="/" className="text-primary hover:underline">l'espace Pro</Link>.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="free" className="bg-card border border-border rounded-xl px-5">
          <AccordionTrigger className="text-left hover:no-underline py-4">
            <span className="font-medium text-sm">Pourquoi c'est gratuit pour moi ?</span>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground pb-4 text-sm">
            Votre orthophoniste paye un abonnement qui inclut un nombre de "sièges patients". 
            En vous liant à son compte via le code Pro, vous bénéficiez automatiquement de <strong className="text-foreground">toutes les fonctionnalités</strong> sans frais supplémentaires.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="no-therapist" className="bg-card border border-border rounded-xl px-5">
          <AccordionTrigger className="text-left hover:no-underline py-4">
            <span className="font-medium text-sm">Je n'ai pas d'orthophoniste, que faire ?</span>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground pb-4 text-sm">
            Bonne nouvelle : vous pouvez vous inscrire en{" "}
            <a href="/auth" className="text-primary hover:underline font-semibold">Mode Autonomie</a>{" "}
            et commencer à vous entraîner dès aujourd'hui, avec un essai gratuit de 7 jours. 
            Nous recommandons tout de même de consulter un orthophoniste pour un diagnostic personnalisé. 
            Et si vous trouvez un praticien plus tard, vous pourrez lier votre compte à tout moment pour bénéficier de son suivi.{" "}
            <a href="/contact" className="text-primary hover:underline">Des questions ?</a>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="data" className="bg-card border border-border rounded-xl px-5">
          <AccordionTrigger className="text-left hover:no-underline py-4">
            <span className="font-medium text-sm">Mes données sont-elles sécurisées ?</span>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground pb-4 text-sm">
            Absolument. Toutes les données sont hébergées en Europe, chiffrées, et conformes au RGPD. 
            Seul vous et votre orthophoniste avez accès à vos enregistrements et données de progression.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>

    {/* Reassurance Icons */}
    <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mt-10">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4" />
        Données sécurisées RGPD
      </div>
      <div className="flex items-center gap-2">
        <RotateCcw className="w-4 h-4" />
        Accès instantané
      </div>
      <div className="flex items-center gap-2">
        <Headphones className="w-4 h-4" />
        Support réactif
      </div>
    </div>
  </>
);

export default Pricing;
