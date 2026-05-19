import { Navigate } from "react-router-dom";
import { useAuth, type UserRole } from "@/contexts/AuthContext";
import PageLoader from "@/components/PageLoader";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Si fourni, seuls les utilisateurs ayant un de ces rôles peuvent accéder */
  roles?: UserRole[];
}

const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { user, profile, loading, profileLoading } = useAuth();

  if (loading || profileLoading) {
    return <PageLoader />;
  }

  // Non connecté → login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Rôle requis mais profil pas encore chargé → on attend
  if (roles && !profile) {
    return <PageLoader />;
  }

  // Rôle requis mais pas le bon → accueil
  if (roles && profile && !roles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
