import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Mail, Check, Stethoscope, User } from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/clipboard";

interface NoCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SUPPORT_EMAIL = "contact@parlermoinsvite.fr";

// Template for option A: Ortho doesn't know the app - we contact them
const CONTACT_ORTHO_TEMPLATE = `Bonjour,

Je souhaite utiliser l'application ParlerMoinsVite pour m'entraîner.

Mon orthophoniste ne connaît pas encore l'application. Voici ses coordonnées pour que vous puissiez le/la contacter :

Nom de l'orthophoniste : [À compléter]
Email ou téléphone : [À compléter]
Ville / Cabinet : [À compléter]

Mon nom : [À compléter]
Mon email : [À compléter]

Merci de votre aide !`;

// Template for option B: Solo training request
const SOLO_TEMPLATE = `Bonjour,

Je souhaite utiliser ParlerMoinsVite pour m'entraîner à contrôler mon débit de parole, sans suivi orthophonique pour le moment.

Pouvez-vous me renseigner sur les options d'accès individuel ?

Mon nom : [À compléter]
Mon email : [À compléter]

Merci !`;

const NoCodeModal = ({ open, onOpenChange }: NoCodeModalProps) => {
  const [copiedOrtho, setCopiedOrtho] = useState(false);
  const [copiedSolo, setCopiedSolo] = useState(false);

  const handleCopyOrthoTemplate = async () => {
    const success = await copyToClipboard(CONTACT_ORTHO_TEMPLATE);
    if (success) {
      setCopiedOrtho(true);
      toast.success("Modèle de mail copié !");
      setTimeout(() => setCopiedOrtho(false), 3000);
    } else {
      toast.error("Erreur lors de la copie");
    }
  };

  const handleMailtoOrtho = () => {
    const subject = encodeURIComponent("Contacter mon orthophoniste - ParlerMoinsVite");
    const body = encodeURIComponent(CONTACT_ORTHO_TEMPLATE);
    window.open(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`, "_blank");
  };

  const handleCopySoloTemplate = async () => {
    const success = await copyToClipboard(SOLO_TEMPLATE);
    if (success) {
      setCopiedSolo(true);
      toast.success("Modèle de mail copié !");
      setTimeout(() => setCopiedSolo(false), 3000);
    } else {
      toast.error("Erreur lors de la copie");
    }
  };

  const handleMailtoSolo = () => {
    const subject = encodeURIComponent("Demande d'accès individuel - ParlerMoinsVite");
    const body = encodeURIComponent(SOLO_TEMPLATE);
    window.open(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Je n'ai pas de code</DialogTitle>
          <DialogDescription>
            L'accès à l'application est réservé aux patients suivis par un orthophoniste
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Option A: Ortho doesn't know the app */}
          <div className="p-4 rounded-xl border border-border bg-muted/30">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                <Stethoscope className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Mon orthophoniste ne connaît pas l'appli</h3>
                <p className="text-sm text-muted-foreground">
                  Donnez-nous ses coordonnées, <strong className="text-foreground">nous le contacterons pour vous</strong>.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={handleMailtoOrtho}
              >
                <Mail className="w-4 h-4" />
                Envoyer un mail
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyOrthoTemplate}
                title="Copier le modèle"
              >
                {copiedOrtho ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Option B: Solo training */}
          <div className="p-4 rounded-xl border border-border bg-muted/30">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Je veux m'entraîner seul</h3>
                <p className="text-sm text-muted-foreground">
                  Pour un accès sans suivi orthophonique, contactez-nous et nous étudierons votre demande.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={handleMailtoSolo}
              >
                <Mail className="w-4 h-4" />
                Envoyer un mail
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopySoloTemplate}
                title="Copier le modèle"
              >
                {copiedSolo ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Email display for webmail users */}
          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              Ou écrivez directement à : <span className="font-mono text-foreground">{SUPPORT_EMAIL}</span>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => onOpenChange(false)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Fermer
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NoCodeModal;
