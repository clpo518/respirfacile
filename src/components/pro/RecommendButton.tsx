import { useState } from "react";
import { Share2, MessageCircle, Mail, Copy, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/clipboard";
import { AnimatePresence, motion } from "framer-motion";

interface RecommendButtonProps {
  referralCode: string;
  therapistName: string;
}

const RecommendButton = ({ referralCode, therapistName }: RecommendButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const referralLink = `https://www.parlermoinsvite.fr/auth?ref=${referralCode}`;
  
  const getMessage = () => {
    const firstName = therapistName.split(" ")[0] || "Un(e) collègue";
    return `Salut ! C'est ${firstName}. Je te recommande ParlerMoinsVite pour le suivi du débit de parole. C'est un outil qui permet aux patients de s'entraîner entre les séances avec un biofeedback en temps réel.\n\nEn t'inscrivant avec mon lien, on gagne chacun 1 mois offert 🎁\n\n👉 ${referralLink}\n\nTest gratuit 30 jours, sans engagement.`;
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(getMessage());
    window.open(`https://wa.me/?text=${text}`, "_blank");
    toast.success("WhatsApp ouvert !");
    setIsOpen(false);
  };

  const handleEmail = () => {
    const subject = encodeURIComponent("Un outil pour le suivi du débit de parole 🗣️");
    const body = encodeURIComponent(getMessage());
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
    toast.success("Client email ouvert !");
    setIsOpen(false);
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(getMessage());
    if (success) {
      setCopied(true);
      toast.success("Message copié !");
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Share2 className="w-4 h-4" />
        <span className="hidden sm:inline">Recommander</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 w-72 rounded-xl border border-border bg-background shadow-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Recommander à un(e) collègue</p>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                1 mois offert pour vous et votre filleul(e) 🎁
              </p>

              <div className="space-y-2">
                <Button
                  onClick={handleWhatsApp}
                  variant="outline"
                  className="w-full gap-2 justify-start"
                >
                  <MessageCircle className="w-4 h-4 text-green-600" />
                  Envoyer par WhatsApp
                </Button>
                <Button
                  onClick={handleEmail}
                  variant="outline"
                  className="w-full gap-2 justify-start"
                >
                  <Mail className="w-4 h-4 text-blue-600" />
                  Envoyer par email
                </Button>
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="w-full gap-2 justify-start"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                  {copied ? "Copié !" : "Copier le message"}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecommendButton;
