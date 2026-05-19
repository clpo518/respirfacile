import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Wind, Users, Activity, Stethoscope, RefreshCw, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";

interface AdminStats {
  totalUsers: number;
  totalTherapists: number;
  totalPatients: number;
  totalSessions: number;
}

interface UserRow {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  therapist_code: string | null;
  created_at: string;
}

const Admin = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect non-admins
  useEffect(() => {
    if (profile && profile.role !== "admin") {
      navigate("/dashboard");
    }
  }, [profile, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profilesRes, sessionsRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email, role, therapist_code, created_at").order("created_at", { ascending: false }),
        supabase.from("sessions").select("id", { count: "exact", head: true }),
      ]);

      const allProfiles = profilesRes.data || [];
      setUsers(allProfiles);
      setStats({
        totalUsers:      allProfiles.length,
        totalTherapists: allProfiles.filter((p) => ["therapist","kine"].includes(p.role)).length,
        totalPatients:   allProfiles.filter((p) => p.role === "patient").length,
        totalSessions:   sessionsRes.count || 0,
      });
    } catch {
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const STAT_CARDS = [
    { icon: Users,       label: "Utilisateurs totaux",  value: stats?.totalUsers },
    { icon: Stethoscope, label: "Professionnels",        value: stats?.totalTherapists },
    { icon: Users,       label: "Patients",              value: stats?.totalPatients },
    { icon: Activity,    label: "Séances réalisées",     value: stats?.totalSessions },
  ];

  const ROLE_BADGE: Record<string, string> = {
    admin:     "bg-red-100 text-red-700",
    therapist: "bg-primary/10 text-primary",
    kine:      "bg-blue-100 text-blue-700",
    patient:   "bg-muted text-muted-foreground",
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container px-4 md:px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Wind className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-semibold text-foreground text-lg">RespirFacile</span>
          </button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-primary" />
            Admin
          </div>
          <button onClick={fetchData} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      </header>

      <div className="pt-28 pb-20 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">

          <h1 className="font-display text-3xl font-semibold text-foreground mb-8">Tableau de bord admin</h1>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {STAT_CARDS.map((s) => (
                  <div key={s.label} className="card-rf p-5 text-center">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <s.icon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="font-display text-3xl font-semibold text-foreground">{s.value ?? "—"}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Table utilisateurs */}
              <div className="card-rf overflow-hidden">
                <div className="p-6 border-b border-border/50">
                  <h2 className="font-semibold text-foreground">Tous les utilisateurs</h2>
                  <p className="text-sm text-muted-foreground">{users.length} comptes</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/30">
                        <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Nom</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Rôle</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Code PRO</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Inscription</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, i) => (
                        <tr key={u.id} className={`border-b border-border/30 ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                          <td className="px-6 py-3 font-medium text-foreground">{u.full_name || "—"}</td>
                          <td className="px-6 py-3 text-muted-foreground">{u.email || "—"}</td>
                          <td className="px-6 py-3">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ROLE_BADGE[u.role] || "bg-muted text-muted-foreground"}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{u.therapist_code || "—"}</td>
                          <td className="px-6 py-3 text-muted-foreground text-xs">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString("fr-FR") : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
