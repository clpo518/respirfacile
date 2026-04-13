import { Activity, Shield, CreditCard, HeadphonesIcon, MapPin, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      {/* Reassurance Icons */}
      <div className="border-b border-border/60">
        <div className="container px-4 md:px-6 py-8">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium">Paiement sécurisé</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium">Annulable en 1 clic</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <HeadphonesIcon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium">Support réactif</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-12">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Column 1: Logo + Description */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">ParlerMoinsVite</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Outil d'accompagnement à la fluence, recommandé par les orthophonistes.
            </p>
          </div>
          
          {/* Column 2: Navigation */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">Navigation</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Tarifs
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Notre Histoire
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Connexion
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 3: Ressources */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">Ressources</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/assessment" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Auto-diagnostic
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Aide & Contact
                </Link>
              </li>
              <li>
                <Link to="/partenaires" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Partenaires
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Patients */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">Patients</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/patients" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Espace Patient
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* APB Membership + Bottom */}
        <div className="border-t border-border/60 mt-10 pt-8">
          <div className="flex flex-col items-center gap-6 text-muted-foreground text-sm">
            <span className="inline-flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary" />
              <span>Membre de l'Association Parole Bégaiement (APB)</span>
            </span>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Hébergé en France/Europe. Vos données sont protégées.</span>
              </div>
              <div className="flex items-center gap-4">
                <Link to="/legal/privacy" className="hover:text-primary transition-colors">
                  Confidentialité
                </Link>
                <Link to="/legal/terms" className="hover:text-primary transition-colors">
                  CGU
                </Link>
                <span>© {new Date().getFullYear()} ParlerMoinsVite</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
