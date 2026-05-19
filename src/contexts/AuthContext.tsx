// @refresh reset
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type User, type Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type UserRole = "patient" | "therapist" | "kine" | "admin" | "solo_patient";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  therapist_code: string | null;
  subscription_status: "trialing" | "active" | "canceled" | "past_due" | "incomplete" | null;
  subscription_tier: "starter" | "pro" | "cabinet" | null;
  trial_ends_at: string | null;
  onboarding_completed: boolean;
  created_at: string;
}

interface SignUpOptions {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  therapistCode?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  signUp: (opts: SignUpOptions) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isTherapist: boolean;
  isPatient: boolean;
  isAdmin: boolean;
  isSoloPatient: boolean;
  isTrialing: boolean;
  isSubscribed: boolean;
}

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // ─── Fetch profile ───
  const fetchProfile = async (userId: string): Promise<void> => {
    setProfileLoading(true);
    try {
      // Use raw fetch to bypass supabase-js AbortController issues
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
      const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

      // Get current access token from localStorage
      const storageKey = `sb-${SUPABASE_URL.split("//")[1]?.split(".")[0]}-auth-token`;
      const raw = localStorage.getItem(storageKey);
      const token = raw ? (JSON.parse(raw) as { access_token: string }).access_token : null;

      if (!token) {
        console.warn("fetchProfile: no token found");
        return;
      }

      const resp = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`,
        {
          headers: {
            apikey: ANON_KEY,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!resp.ok) {
        console.error("fetchProfile HTTP error:", resp.status, await resp.text());
        return;
      }

      const rows = await resp.json();
      const data = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
      setProfile(data as Profile | null);
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
    } finally {
      setProfileLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  // ─── Auth state listener ───
  useEffect(() => {
    let resolved = false;

    const resolveSession = (session: import("@supabase/supabase-js").Session | null) => {
      if (resolved) return;
      resolved = true;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    };

    // Fallback: read session directly from localStorage if getSession() aborts
    const readSessionFromStorage = () => {
      try {
        const key = `sb-${import.meta.env.VITE_SUPABASE_URL?.split("//")[1]?.split(".")[0]}-auth-token`;
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.user && parsed?.access_token) {
            // Reconstruct a minimal session object
            return parsed as import("@supabase/supabase-js").Session;
          }
        }
      } catch {}
      return null;
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      resolveSession(session);
    }).catch((err) => {
      console.warn("getSession error, falling back to localStorage:", err?.name);
      const fallbackSession = readSessionFromStorage();
      resolveSession(fallbackSession);
    });

    // Safety net: if nothing resolved after 3s, unlock loading
    const timeout = setTimeout(() => {
      if (!resolved) {
        console.warn("Auth init timeout — unlocking loading");
        const fallbackSession = readSessionFromStorage();
        resolveSession(fallbackSession);
      }
    }, 3000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  // ─── signUp ───
  const signUp = async ({ email, password, fullName, role, therapistCode }: SignUpOptions) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role, // utilisé par le trigger handle_new_user() en DB
          ...(therapistCode ? { therapist_code: therapistCode.trim().toUpperCase() } : {}),
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) return { error };

    // Le trigger Supabase (handle_new_user) crée le profil automatiquement
    // avec therapist_code et trial_ends_at selon le rôle.
    // On attend un peu puis on fetch le profil pour avoir le therapist_code généré.
    if (data.user) {
      await waitForProfile(data.user.id);

      // Email de bienvenue — fire and forget
      supabase.functions
        .invoke("send-welcome-email", {
          body: { userId: data.user.id, email, fullName, role },
        })
        .catch((err) => console.error("Welcome email error:", err));
    }

    return { error: null };
  };

  // ─── signIn ───
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  // ─── signOut ───
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setSession(null);
      setUser(null);
      setProfile(null);
    }
  };

  // ─── Derived booleans ───
  const isTherapist = profile?.role === "therapist" || profile?.role === "kine";
  const isPatient = profile?.role === "patient";
  const isSoloPatient = profile?.role === "solo_patient";
  const isAdmin = profile?.role === "admin";
  const isTrialing = profile?.subscription_status === "trialing";
  const isSubscribed = profile?.subscription_status === "active";

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        profileLoading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
        isTherapist,
        isPatient,
        isAdmin,
        isSoloPatient,
        isTrialing,
        isSubscribed,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/**
 * Attend que le trigger Supabase ait créé le profil (max 3 tentatives × 600ms).
 * Utile juste après un signUp pour récupérer therapist_code etc.
 */
async function waitForProfile(userId: string, retries = 3): Promise<void> {
  for (let i = 0; i < retries; i++) {
    await new Promise((r) => setTimeout(r, 600));
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
    if (data) return;
  }
  console.warn("waitForProfile: profile not found after retries");
}
