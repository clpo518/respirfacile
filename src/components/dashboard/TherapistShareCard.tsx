import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Check, Loader2, Unlink } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LinkedTherapist {
  id: string;
  full_name: string | null;
  therapist_code: string | null;
}

const TherapistShareCard = () => {
  const { user } = useAuth();
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [therapistCode, setTherapistCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [linkedTherapist, setLinkedTherapist] = useState<LinkedTherapist | null>(null);
  const [checkingLink, setCheckingLink] = useState(true);

  // Check if user is already linked to a therapist using SECURITY DEFINER function
  useEffect(() => {
    const checkLinkedTherapist = async () => {
      if (!user) return;
      
      try {
        // Use RPC function that bypasses RLS to get linked therapist info
        const { data: therapistResults, error } = await supabase
          .rpc("get_linked_therapist_info");

        if (error) {
          console.error("Error fetching linked therapist:", error);
          setCheckingLink(false);
          return;
        }

        const therapistData = therapistResults?.[0];
        if (therapistData) {
          setLinkedTherapist(therapistData);
        }
      } catch (error) {
        console.error("Error checking linked therapist:", error);
      } finally {
        setCheckingLink(false);
      }
    };

    checkLinkedTherapist();
  }, [user]);

  const handleClick = () => {
    if (linkedTherapist) {
      // Already linked - show info or allow unlink
      return;
    }
    setShowLinkDialog(true);
  };

  const handleLinkTherapist = async () => {
    if (!therapistCode.trim() || !user) return;

    setLoading(true);
    try {
      // Use security definer function to find therapist by code (bypasses RLS)
      const { data: therapistResults, error: findError } = await supabase
        .rpc("find_therapist_by_code", { code: therapistCode.trim() });

      const therapistData = therapistResults?.[0];

      if (findError || !therapistData) {
        toast.error("Code invalide. Vérifiez le code auprès de votre orthophoniste.");
        return;
      }

      // Update current user's profile to link to therapist
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ linked_therapist_id: therapistData.id })
        .eq("id", user.id);

      if (updateError) {
        console.error("Update error:", updateError);
        toast.error("Erreur lors de la liaison. Réessayez.");
        return;
      }

      setLinkedTherapist(therapistData);
      setShowLinkDialog(false);
      setTherapistCode("");
      toast.success(`Connecté avec ${therapistData.full_name || "votre orthophoniste"} !`);
    } catch (error) {
      console.error("Error linking therapist:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ linked_therapist_id: null })
        .eq("id", user.id);

      if (error) {
        toast.error("Erreur lors de la déconnexion");
        return;
      }

      setLinkedTherapist(null);
      toast.success("Liaison supprimée");
    } catch (error) {
      console.error("Error unlinking:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (checkingLink) {
    return (
      <Card className="border-dashed border-2 border-muted bg-muted/5">
        <CardContent className="py-4 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Already linked state
  if (linkedTherapist) {
    return (
      <Card className="border-2 border-green-500/30 bg-green-500/5">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
              <Check className="w-6 h-6 text-green-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-sm flex items-center gap-2">
                Connecté avec votre orthophoniste
                <span className="text-green-500">✓</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                {linkedTherapist.full_name || "Dr."} peut voir vos progrès
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUnlink}
              disabled={loading}
              className="text-muted-foreground hover:text-destructive"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlink className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-dashed border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors">
        <CardContent className="py-4">
          <button 
            onClick={handleClick}
            className="w-full flex items-center gap-4 text-left"
          >
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-sm">Changer d'Orthophoniste</h3>
              <p className="text-xs text-muted-foreground">
                Entrer un nouveau code praticien
              </p>
            </div>
          </button>
        </CardContent>
      </Card>

      {/* Link Therapist Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-center text-xl">
              Lier mon compte à mon Orthophoniste
            </DialogTitle>
            <DialogDescription className="text-center">
              Entrez le code Pro fourni par votre praticien pour partager vos progrès.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="therapist-code">Code Pro de votre orthophoniste</Label>
              <Input
                id="therapist-code"
                placeholder="Ex: PRO-ABC123"
                value={therapistCode}
                onChange={(e) => setTherapistCode(e.target.value.toUpperCase())}
                className="text-center text-lg font-mono tracking-wider"
                maxLength={10}
              />
              <p className="text-xs text-muted-foreground text-center">
                Ce code est affiché sur le tableau de bord de votre orthophoniste
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button 
              className="w-full gap-2" 
              onClick={handleLinkTherapist}
              disabled={loading || !therapistCode.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Vérification...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Valider et Partager
                </>
              )}
            </Button>
            <Button 
              variant="ghost" 
              className="w-full" 
              onClick={() => {
                setShowLinkDialog(false);
                setTherapistCode("");
              }}
            >
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TherapistShareCard;
