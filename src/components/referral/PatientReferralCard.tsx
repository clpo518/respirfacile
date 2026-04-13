import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Copy, Check, ChevronDown, Gift, CreditCard, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { copyToClipboard } from "@/lib/clipboard";

interface ReferralStats {
  referralCode: string | null;
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  bonusMonths: number;
}

const PatientReferralCard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchReferralData = async () => {
      if (!user) return;

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("referral_code, referral_bonus_months")
          .eq("id", user.id)
          .maybeSingle();

        const { data: referrals } = await supabase
          .from("referrals")
          .select("status")
          .eq("referrer_id", user.id);

        const totalReferrals = referrals?.length || 0;
        const completedReferrals = referrals?.filter(r => r.status === "completed" || r.status === "rewarded").length || 0;
        const pendingReferrals = referrals?.filter(r => r.status === "pending").length || 0;

        setStats({
          referralCode: profile?.referral_code || null,
          totalReferrals,
          completedReferrals,
          pendingReferrals,
          bonusMonths: profile?.referral_bonus_months || 0,
        });
      } catch (error) {
        console.error("Error fetching referral data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferralData();
  }, [user]);

  const handleCopyLink = async () => {
    if (!stats?.referralCode) return;

    const referralLink = `https://www.parlermoinsvite.fr/auth?tab=signup&ref=${stats.referralCode}`;
    const success = await copyToClipboard(referralLink);
    
    if (success) {
      setCopied(true);
      toast.success("Lien copié !");
      setTimeout(() => setCopied(false), 3000);
    } else {
      toast.error("Erreur lors de la copie");
    }
  };

  const handleCopyMessage = async () => {
    if (!stats?.referralCode) return;

    const referralLink = `https://www.parlermoinsvite.fr/auth?tab=signup&ref=${stats.referralCode}`;
    const message = `Hey ! Je m'entraîne à parler plus lentement avec ParlerMoinsVite, et c'est vraiment bien fait 🎙️

Si tu veux essayer, inscris-toi avec mon lien et on gagne chacun 1 mois gratuit quand tu t'abonnes 🎁

👉 ${referralLink}

C'est gratuit pendant 7 jours, sans engagement !`;
    
    const success = await copyToClipboard(message);
    if (success) {
      toast.success("Message copié ! Prêt à envoyer");
    } else {
      toast.error("Erreur lors de la copie");
    }
  };

  if (loading || !stats?.referralCode) return null;

  return (
    <Card className="border border-border/60 bg-gradient-to-br from-accent/30 via-background to-primary/5">
      <CardHeader 
        className="cursor-pointer select-none pb-3"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm">
                Aidez un ami, gagnez 1 mois 🎁
              </CardTitle>
              <CardDescription className="text-xs">
                Partagez le mot, c'est gagnant-gagnant
              </CardDescription>
            </div>
          </div>
          <ChevronDown 
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </CardHeader>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <CardContent className="pt-0 space-y-4">
              {/* Stats if any */}
              {(stats.completedReferrals > 0 || stats.pendingReferrals > 0) && (
                <div className="flex gap-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  {stats.pendingReferrals > 0 && (
                    <div className="text-center">
                      <div className="text-xl font-bold text-amber-500">{stats.pendingReferrals}</div>
                      <div className="text-[10px] text-muted-foreground">En attente</div>
                    </div>
                  )}
                  {stats.completedReferrals > 0 && (
                    <div className="text-center">
                      <div className="text-xl font-bold text-primary">{stats.completedReferrals}</div>
                      <div className="text-[10px] text-muted-foreground">Validés</div>
                    </div>
                  )}
                  {stats.bonusMonths > 0 && (
                    <div className="text-center">
                      <div className="text-xl font-bold text-primary">{stats.bonusMonths}</div>
                      <div className="text-[10px] text-muted-foreground">Mois gagnés</div>
                    </div>
                  )}
                </div>
              )}

              {/* Pending referral explanation */}
              {stats.pendingReferrals > 0 && (
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    ⏳ <strong>{stats.pendingReferrals} parrainage{stats.pendingReferrals > 1 ? 's' : ''} en attente</strong> — 
                    Le mois gratuit est offert dès que votre ami passe à l'abonnement payant après son essai de 7 jours.
                  </p>
                </div>
              )}

              {/* Simple explanation */}
              <div className="space-y-2">
                <div className="flex items-start gap-2.5 text-sm">
                  <Gift className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-muted-foreground">
                    Partagez votre lien. Quand votre ami s'inscrit et <strong className="text-foreground">passe à l'abonnement</strong>, vous recevez chacun <strong className="text-foreground">1 mois gratuit</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-2.5 text-sm">
                  <CreditCard className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    L'essai de 7 jours est gratuit pour votre ami. Le bonus parrainage s'active uniquement quand il s'abonne — pas pendant l'essai.
                  </p>
                </div>
                {stats.completedReferrals === 0 && stats.pendingReferrals === 0 && (
                  <div className="flex items-start gap-2.5 text-sm">
                    <PartyPopper className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Illimité : plus vous parrainez, plus vous gagnez !
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleCopyLink}
                  variant="default"
                  size="sm"
                  className="w-full gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copié !
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copier mon lien d'invitation
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleCopyMessage}
                  variant="ghost"
                  size="sm"
                  className="w-full gap-2 text-muted-foreground"
                >
                  Copier un message prêt à envoyer
                </Button>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default PatientReferralCard;
