import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Activity, ArrowRight, Play } from "lucide-react";
import { KaraokeDemo } from "./KaraokeDemo";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 gradient-subtle" />
      
      {/* Decorative shapes */}
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
        <motion.div
          className="absolute bottom-20 right-1/4 w-[200px] h-[200px] rounded-full bg-secondary/50"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      <div className="container relative z-10 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Trust badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap justify-center gap-2 mb-8"
          >
            <span className="badge-clinical inline-flex">
              <Activity className="w-3.5 h-3.5" />
              Bredouillement · Tachylalie · Bégaiement
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-medium">
              Recommandé par les orthophonistes
            </span>
          </motion.div>
          
          {/* Main headline */}
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6 leading-[1.1] tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Vous parlez trop vite ?{" "}
            <span className="gradient-text">Reprenez le contrôle.</span>
          </motion.h1>
          
          {/* Subheadline */}
          <motion.p
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            L'application d'entraînement pour les troubles de la fluence : bredouillement, tachylalie et bégaiement. 
            Mesurez votre débit, visualisez vos progrès et entraînez-vous 5 min/jour.
          </motion.p>
          
          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button asChild size="lg" className="text-base px-8 h-14 shadow-md hover:shadow-lg">
              <Link to="/diagnostic">
                Tester ma vitesse
                <ArrowRight className="w-5 h-5 ml-1" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-base px-8 h-14" asChild>
              <a href="#exercises">
                <Play className="w-4 h-4 mr-2" />
                Voir la démo
              </a>
            </Button>
          </motion.div>
          
          {/* Karaoke Demo */}
          <motion.div
            className="mt-16 relative"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-border/60 bg-card">
              <KaraokeDemo />
            </div>
            
            <p className="text-center text-sm text-muted-foreground mt-5">
              👆 Voici exactement ce que vous utiliserez. Le surligneur vous guide mot à mot.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
