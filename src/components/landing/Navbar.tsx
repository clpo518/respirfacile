import { Button } from "@/components/ui/button";
import { Activity, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const [isTherapist, setIsTherapist] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase.from("profiles").select("is_therapist").eq("id", user.id).single();
        if (data) setIsTherapist(data.is_therapist || false);
      } else {
        setIsTherapist(false);
      }
    };
    fetchProfile();
  }, [user]);

  const getLogoDestination = () => {
    if (!user) return "/";
    return isTherapist ? "/patient/list" : "/dashboard";
  };

  const logoDestination = getLogoDestination();

  const navLinks = [
    { href: "/#patients", label: "Patients" },
    { href: "/#orthophonistes", label: "Orthophonistes" },
    { href: "/diagnostic", label: "Test vocal" },
    { href: "/pricing", label: "Tarifs" },
    { href: "/about", label: "À propos" },
  ];

  const handleAnchorClick = (href: string) => {
    setIsOpen(false);
    if (href.startsWith("/#")) {
      const hash = href.substring(1);
      if (location.pathname === "/") {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = href;
      }
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to={logoDestination} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground hidden sm:block">
              ParlerMoinsVite
            </span>
          </Link>
          
          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center">
            {navLinks.map((link) => (
              link.href.startsWith("/#") ? (
                <button
                  key={link.href}
                  onClick={() => handleAnchorClick(link.href)}
                  className="px-3 py-2 text-muted-foreground hover:text-foreground transition-colors text-sm rounded-lg hover:bg-muted/50"
                >
                  {link.label}
                </button>
              ) : (
                <Link 
                  key={link.href}
                  to={link.href} 
                  className="px-3 py-2 text-muted-foreground hover:text-foreground transition-colors text-sm rounded-lg hover:bg-muted/50"
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <Button asChild>
                <Link to={logoDestination}>Mon espace</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Connexion</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth?tab=signup">Essai gratuit</Link>
                </Button>
              </>
            )}
          </div>
          
          {/* Mobile menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <button className="p-2 rounded-lg hover:bg-muted/50 transition-colors" aria-label="Ouvrir le menu">
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Link to={logoDestination} className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                    <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                      <Activity className="w-4 h-4 text-primary-foreground" />
                    </div>
                    ParlerMoinsVite
                  </Link>
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex flex-col gap-6 mt-8">
                <div className="flex flex-col gap-0.5">
                  {navLinks.map((link) => (
                    link.href.startsWith("/#") ? (
                      <button
                        key={link.href}
                        onClick={() => handleAnchorClick(link.href)}
                        className="text-left text-foreground hover:text-primary transition-colors py-2.5 px-3 rounded-lg hover:bg-muted"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link 
                        key={link.href}
                        to={link.href} 
                        className="text-foreground hover:text-primary transition-colors py-2.5 px-3 rounded-lg hover:bg-muted"
                        onClick={() => setIsOpen(false)}
                      >
                        {link.label}
                      </Link>
                    )
                  ))}
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-border mt-auto">
                  {user ? (
                    <Button asChild className="w-full justify-center">
                      <Link to={logoDestination} onClick={() => setIsOpen(false)}>Mon espace</Link>
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" asChild className="w-full justify-center">
                        <Link to="/auth" onClick={() => setIsOpen(false)}>Connexion</Link>
                      </Button>
                      <Button asChild className="w-full justify-center">
                        <Link to="/auth?tab=signup" onClick={() => setIsOpen(false)}>Essai gratuit</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
