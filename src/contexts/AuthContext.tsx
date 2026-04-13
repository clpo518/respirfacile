import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type User, type Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, isTherapist?: boolean, isSolo?: boolean) => Promise<{ error: Error | null; isTherapist: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Activate the 7-day trial for solo patients once their email is confirmed
  const activateSoloTrialIfNeeded = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_therapist, linked_therapist_id, trial_end_date, trial_start_date" as any)
        .eq("id", userId)
        .maybeSingle();

      if (!profile) return;
      const p = profile as any;

      // NEVER touch therapist accounts — they get 30-day trials at signup
      if (p.is_therapist) return;

      // Only activate for solo patients (no linked therapist) with no trial yet
      const isSoloPatient = !p.linked_therapist_id;
      const trialNotStarted = !p.trial_end_date;

      if (isSoloPatient && trialNotStarted) {
        await supabase
          .from("profiles")
          .update({
            trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          } as any)
          .eq("id", userId);
        console.log("Solo trial activated after email verification");
      }
    } catch (error) {
      console.error("Error activating solo trial:", error);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Activate solo trial when email is confirmed for the first time
        if (session?.user) {
          const emailConfirmedAt = session.user.email_confirmed_at;
          if (emailConfirmedAt) {
            setTimeout(() => {
              activateSoloTrialIfNeeded(session.user.id);
            }, 0);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, isTherapist: boolean = false, isSolo: boolean = false) => {
    // Generate therapist code if signing up as therapist
    const therapistCode = isTherapist 
      ? `PRO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      : null;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          is_therapist: isTherapist,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    // If signup successful and we have a user, update their profile with therapist/patient info
    if (!error && data.user) {
      // Use a promise-based approach with retry to ensure profile is updated
      const updateProfile = async (retries = 3): Promise<boolean> => {
        for (let i = 0; i < retries; i++) {
          // Wait a bit for the trigger to create the profile
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Build update data based on role
          let updateData: Record<string, unknown>;
          
          if (isTherapist) {
            updateData = { 
              is_therapist: true, 
              therapist_code: therapistCode,
              trial_start_date: new Date().toISOString(),
              trial_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              subscription_plan: 'trial',
              seats_limit: 3,
              onboarding_completed_at: null,
            };
          } else if (isSolo) {
            // B2C solo patient - trial NOT started yet, will activate after email verification
            updateData = {
              is_premium: false,
              onboarding_completed_at: null,
            };
          } else {
            // B2B patient (linked to therapist) - full access via therapist
            updateData = {
              is_premium: true,
              onboarding_completed_at: null,
            };
          }
          
          const { error: updateError } = await supabase
            .from("profiles")
            .update(updateData)
            .eq("id", data.user!.id);
          
          if (!updateError) {
            console.log(`${isTherapist ? 'Therapist' : isSolo ? 'Solo patient' : 'Patient'} profile updated successfully`);
            return true;
          }
          console.log(`Retry ${i + 1} updating profile...`);
        }
        return false;
      };
      
      // ATTENDRE la mise à jour avant de retourner (plus de race condition)
      await updateProfile();

      // Fetch the generated referral_code from the database (generated by trigger for all users)
      let referralCode: string | null = null;
      const { data: profileData } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("id", data.user.id)
        .maybeSingle();
      referralCode = profileData?.referral_code || null;

      // Send welcome email via edge function (fire and forget)
      try {
        supabase.functions.invoke('send-welcome-email', {
          body: {
            userId: data.user.id,
            email: email,
            fullName: fullName,
            isTherapist: isTherapist,
            isSolo: isSolo,
            therapistCode: therapistCode,
            referralCode: referralCode,
          },
        }).then((result) => {
          if (result.error) {
            console.error('Failed to send welcome email:', result.error);
          } else {
            console.log('Welcome email sent successfully');
          }
        }).catch((err) => {
          console.error('Error calling send-welcome-email:', err);
        });
      } catch (emailError) {
        // Don't block signup if email fails
        console.error('Error initiating welcome email:', emailError);
      }
    }

    return { error, isTherapist };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local state, even if server call fails
      setSession(null);
      setUser(null);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
