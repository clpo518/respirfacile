import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface TherapistStatus {
  isValid: boolean;
  isTrialExpired: boolean;
  daysRemaining: number | null;
  subscriptionPlan: string;
  seatsUsed: number;
  seatsLimit: number;
}

interface UseLimitCheckResult {
  isPremium: boolean;
  isTherapist: boolean;
  loading: boolean;
  therapistStatus: TherapistStatus | null;
  linkedTherapistValid: boolean;
  /** B2C solo patient has an active trial */
  hasActiveTrial: boolean;
  /** Days remaining in B2C trial (null if no trial) */
  trialDaysRemaining: number | null;
  /** True if user is a solo patient (no linked therapist) */
  isSolo: boolean;
}

export const useLimitCheck = (): UseLimitCheckResult => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [isTherapist, setIsTherapist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [therapistStatus, setTherapistStatus] = useState<TherapistStatus | null>(null);
  const [linkedTherapistValid, setLinkedTherapistValid] = useState(false);
  const [hasActiveTrial, setHasActiveTrial] = useState(false);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number | null>(null);
  const [isSolo, setIsSolo] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // trial_end_date is a recent migration column - cast to handle type lag
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_premium, is_therapist, trial_start_date, subscription_plan, seats_limit, subscription_status, linked_therapist_id, trial_end_date" as any)
          .eq("id", user.id)
          .maybeSingle();

        if (profile) {
          const profileData = profile as any;
          setIsPremium(profileData.is_premium || false);
          setIsTherapist(profileData.is_therapist || false);

          // If user is a therapist, compute their status
          if (profileData.is_therapist) {
            const now = new Date();
            const trialEndDate = profileData.trial_end_date ? new Date(profileData.trial_end_date) : null;
            const trialStartDate = profileData.trial_start_date ? new Date(profileData.trial_start_date) : null;

            const fallbackDaysSinceStart = trialStartDate
              ? Math.floor((now.getTime() - trialStartDate.getTime()) / (1000 * 60 * 60 * 24))
              : 0;

            const isTrialExpired = trialEndDate
              ? trialEndDate <= now
              : trialStartDate
                ? fallbackDaysSinceStart >= 30
                : false;

            const daysRemaining = trialEndDate
              ? Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
              : trialStartDate
                ? Math.max(0, 30 - fallbackDaysSinceStart)
                : null;

            const isSubscriptionActive = profileData.subscription_status === 'active' || profileData.is_premium === true;
            const isValid = !isTrialExpired || isSubscriptionActive;

            // Get active patient count using RPC
            const { data: countData } = await supabase
              .rpc('count_active_patients', { therapist_uuid: user.id });
            
            setTherapistStatus({
              isValid,
              isTrialExpired: isTrialExpired && !isSubscriptionActive,
              daysRemaining,
              subscriptionPlan: profileData.subscription_plan || 'trial',
              seatsUsed: countData || 0,
              seatsLimit: profileData.seats_limit || 3,
            });
          }

          // If user is a patient, check access
          if (!profileData.is_therapist) {
            const hasTherapist = !!profileData.linked_therapist_id;
            setIsSolo(!hasTherapist);

            if (hasTherapist) {
              // B2B patient: check therapist subscription validity
              const { data: isValid } = await supabase
                .rpc('is_therapist_subscription_valid', { therapist_uuid: profileData.linked_therapist_id });
              setLinkedTherapistValid(isValid || false);
            } else {
              // Solo patient: check trial or premium status
              const trialEndDate = profileData.trial_end_date ? new Date(profileData.trial_end_date) : null;
              const now = new Date();
              
              if (trialEndDate) {
                const daysLeft = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
                const trialActive = trialEndDate > now;
                setHasActiveTrial(trialActive);
                setTrialDaysRemaining(daysLeft);
              } else {
                // No trial_end_date yet = trial pending activation (just signed up)
                // Treat as active trial to avoid showing "Essai terminé" prematurely
                setHasActiveTrial(true);
                setTrialDaysRemaining(7);
              }

              // Solo patient has access if premium, trial active, or trial not yet activated
              const trialActive = trialEndDate ? trialEndDate > now : true;
              setLinkedTherapistValid(profileData.is_premium || trialActive);
            }
          }
        }
      } catch (error) {
        console.error("Error checking status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [user]);

  return {
    isPremium,
    isTherapist,
    loading,
    therapistStatus,
    linkedTherapistValid,
    hasActiveTrial,
    trialDaysRemaining,
    isSolo,
  };
};
