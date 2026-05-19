import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, Copy, Check, Sparkles, ChevronDown, ArrowRight, CreditCard, UserPlus, PartyPopper, Loader2, TicketCheck } from "lucide-react";
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

const ReferralCard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [referrerCodeInput, setReferrerCodeInput] = useState("");
  const [applyingCode, setApplyingCode] = useState(false);
  const [hasExistingReferral, setHasExistingReferral] = useState(false);

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

        // Check if this user was already referred by someone
        const { data: existingReferral } = await supabase
          .from("referrals")
          .select("id")
          .eq("referred_id", user.id)
          .maybeSingle();

        setHasExistingReferral(!!existingReferral);

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

    const referralLink = `https://www.respirfacile.fr/auth?ref=${stats.referralCode}`;
    const success = await copyToClipboard(referralLink);
    
    if (success) {
      setCopied(true);
      toast.success("Lien de parrainage copié !");
      setTimeout(() => setCopied(false), 3000);
    } else {
      toast.error("Erreur lors de la copie");
    }
  };

  const handleCopyMessage = async () => {
    if (!stats?.referralCode) return;

    const referralLink = `https://www.respirfacile.fr/auth?ref=${stats.referralCode}`;
    const message = `Salut ! Je te recommande RespirFacile, un outil génial pour le suivi des patients en rééducation du débit. 

En t'inscrivant avec mon lien, on bénéficie tous les deux d'1 mois offert 🎁

👉 ${referralLink}

C'est simple : tu crées ton compte via ce lien, tu testes gratuitement pendant 30 jours, et si tu passes à l'abonnement, on gagne chacun 1 mois gratuit !`;
    
    const success = await copyToClipboard(message);
    if (success) {
      toast.success("Message copié ! Prêt à envoyer à un(e) collègue");
    } else {
      toast.error("Erreur lors de la copie");
    }
  };

  const handleApplyReferralCode = async () => {
    if (!user || !referrerCodeInput.trim()) return;
    setApplyingCode(true);

    try {
      const code = referrerCodeInput.trim().toUpperCase();

      // Don't allow self-referral
      if (stats?.referralCode && code === stats.referralCode) {
        toast.error("Vous ne pouvez pas utiliser votre propre code");
        setApplyingCode(false);
        return;
      }

      // Find the referrer by their referral code
      const { data: referrerProfile, error: findError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("referral_code", code)
        .maybeSingle();

      if (findError) throw findError;

      if (!referrerProfile) {
        toast.error("Code parrain invalide");
        setApplyingCode(false);
        return;
      }

      // Create the referral record
      const { error: insertError } = await supabase
        .from("referrals")
        .insert({
          referrer_id: referrerProfile.id,
          referred_id: user.id,
          status: "pending",
        });

      if (insertError) {
        if (insertError.code === "23505") {
          toast.error("Vous avez déjà utilisé un code parrain");
        } else {
          throw insertError;
        }
        setApplyingCode(false);
        return;
      }

      // Get current user's profile for name
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      const myName = myProfile?.full_name || "Un(e) collègue";
      const referrerName = referrerProfile.full_name || "Votre parrain";

      // Send confirmation email to the REFERRED (current user)
      supabase.functions.invoke("send-email", {
        body: {
          type: "referral_applied",
          to: user.email!,
          data: {
            userName: myName,
            referrerName: referrerName,
            dashboardUrl: "https://www.respirfacile.fr/patient/list",
            isReferrer: false,
          },
        },
      }).catch(console.error);

      // Notify the REFERRER via edge function (has access to auth emails)
      supabase.functions.invoke("notify-referral-applied", {
        body: {
          referrerId: referrerProfile.id,
          referredName: myName,
        },
      }).catch(console.error);

      setHasExistingReferral(true);
      setReferrerCodeInput("");
      toast.success("Code parrain appliqué ! Le bonus sera activé lors de votre premier paiement.");
    } catch (error) {
      console.error("Error applying referral code:", error);
      toast.error("Erreur lors de l'application du code");
    } finally {
      setApplyingCode(false);
    }
  };

  if (loading || !stats?.referralCode) return null;

  return (
    <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 via-background to-chart-2/5">
      <CardHeader 
        className="cursor-pointer select-none pb-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Gift className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                Parrainez, gagnez 1 mois
              </CardTitle>
              <CardDescription className="text-sm">
                1 mois offert pour vous, 1 mois offert pour votre filleul(e)
              </CardDescription>
            </div>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
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
            <CardContent className="pt-0 space-y-5">
              {/* Stats if any */}
              {(stats.completedReferrals > 0 || stats.pendingReferrals > 0) && (
                <div className="flex gap-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  {stats.pendingReferrals > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-500">{stats.pendingReferrals}</div>
                      <div className="text-xs text-muted-foreground">En attente</div>
                    </div>
                  )}
                  {stats.completedReferrals > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{stats.completedReferrals}</div>
                      <div className="text-xs text-muted-foreground">Validés</div>
                    </div>
                  )}
                  {stats.bonusMonths > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{stats.bonusMonths}</div>
                      <div className="text-xs text-muted-foreground">Mois gagnés</div>
                    </div>
                  )}
                </div>
              )}

              {/* Pending referral explanation */}
              {stats.pendingReferrals > 0 && (
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    ⏳ <strong>{stats.pendingReferrals} parrainage{stats.pendingReferrals > 1 ? 's' : ''} en attente</strong> — 
                    Le mois gratuit s'active dès que votre filleul(e) passe à l'abonnement payant après son essai gratuit.
                  </p>
                </div>
              )}

              {/* Enter a referral code received from someone */}
              {!hasExistingReferral && (
                <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
                  <div className="flex items-center gap-2">
                    <TicketCheck className="w-4 h-4 text-primary" />
                    <p className="text-sm font-medium">Vous avez un code parrain ?</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Un(e) collègue vous a partagé un code ? Saisissez-le ici. Vous pouvez le faire même si vous êtes <strong>déjà inscrit(e)</strong>.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="REF-XXXXXX"
                      value={referrerCodeInput}
                      onChange={(e) => setReferrerCodeInput(e.target.value.toUpperCase())}
                      className="font-mono"
                    />
                    <Button
                      onClick={handleApplyReferralCode}
                      disabled={applyingCode || !referrerCodeInput.trim()}
                      size="sm"
                    >
                      {applyingCode ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {hasExistingReferral && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Code parrain appliqué — votre prochain mois sera offert dès votre premier paiement.
                  </p>
                </div>
              )}

              {/* How it works - Step by step */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
                  <span className="text-base">📋</span> Comment ça marche ?
                </h4>
                
                <div className="space-y-2">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                      1
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Partagez votre lien ou code</p>
                      <p className="text-xs text-muted-foreground">
                        Envoyez le lien ci-dessous à un(e) collègue. Si il/elle est <strong>déjà inscrit(e)</strong>, il/elle peut entrer votre code directement depuis cette même section.
                      </p>
                    </div>
                    <UserPlus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                      2
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">L'un(e) de vous passe à l'abonnement</p>
                      <p className="text-xs text-muted-foreground">
                        L'essai de 30 jours continue normalement. Le bonus se déclenche au premier paiement de votre filleul(e).
                      </p>
                    </div>
                    <CreditCard className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>

                  {/* Step 3 - Reward */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      ✓
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-700 dark:text-green-400">1 mois offert pour chacun !</p>
                      <p className="text-xs text-muted-foreground">
                        Un coupon <strong>100% de réduction</strong> est automatiquement appliqué sur la prochaine facture du parrain et du filleul. Pas besoin de faire quoi que ce soit.
                      </p>
                    </div>
                    <PartyPopper className="w-4 h-4 text-green-500 flex-shrink-0" />
                  </div>
                </div>
              </div>

              {/* FAQ inline */}
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  <strong>💡 Questions fréquentes :</strong>
                </p>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1.5">
                  <li>• <strong>Déjà inscrit(e) ?</strong> Pas de souci ! Entrez le code de votre collègue dans le champ ci-dessus. Pas besoin de se réinscrire.</li>
                  <li>• <strong>Parrainage croisé ?</strong> Oui ! Vous pouvez parrainer une collègue ET être parrainé(e) par une autre. Les bonus se cumulent.</li>
                  <li>• <strong>Encore en essai gratuit ?</strong> Le coupon sera appliqué automatiquement dès votre premier abonnement.</li>
                  <li>• <strong>Combien de parrainages ?</strong> Illimité ! Chaque filleul(e) qui s'abonne = 1 mois gratuit de plus.</li>
                </ul>
              </div>

              {/* Referral Code Display */}
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Votre code parrain</p>
                <code className="text-lg font-mono font-bold text-primary">
                  {stats.referralCode}
                </code>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleCopyLink}
                  variant="default"
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
                      Copier le lien d'invitation
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleCopyMessage}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Copier un message type prêt à envoyer
                </Button>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default ReferralCard;
