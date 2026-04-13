import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Wind } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    // Add noindex meta to prevent Google from indexing 404 pages
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => { meta.remove(); };
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-secondary via-background to-accent/30 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Wind className="w-10 h-10 text-primary" />
        </div>
        
        <h1 className="text-4xl font-display font-bold mb-3">
          Oups, on est allé trop vite.
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8">
          Cette page n'existe pas. Revenons à un rythme plus calme.
        </p>
        
        <Button asChild size="lg" className="gap-2">
          <Link to="/">
            <Home className="w-4 h-4" />
            Retour à l'accueil
          </Link>
        </Button>

        <p className="mt-8 text-sm text-muted-foreground">
          Inspirez... Expirez... 🌿
        </p>
      </motion.div>
    </div>
  );
};

export default NotFound;