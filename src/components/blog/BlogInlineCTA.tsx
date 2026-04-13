import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Gauge } from "lucide-react";

interface BlogInlineCTAProps {
  ctaLink?: string;
  ctaLabel?: string;
}

export default function BlogInlineCTA({ ctaLink, ctaLabel }: BlogInlineCTAProps) {
  const link = ctaLink || '/auth?tab=signup';
  const label = ctaLabel || "Essayer l'outil gratuitement";
  return (
    <div className="my-10 p-6 md:p-8 bg-muted/40 rounded-2xl border border-border/60">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Gauge className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-bold text-foreground mb-2">
            Mesurez un débit en 10 secondes.
          </h4>
          <p className="text-muted-foreground text-sm mb-4">
            Il existe une méthode plus simple. Testez ParlerMoinsVite gratuitement.
          </p>
          <Button asChild size="sm">
            <Link to={link}>
              {label}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
