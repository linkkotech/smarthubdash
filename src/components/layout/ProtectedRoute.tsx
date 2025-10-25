import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionsContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requirePlatformAdmin?: boolean;
}

export function ProtectedRoute({ children, requirePlatformAdmin }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { isPlatformAdmin, isLoading: permissionsLoading } = usePermissions();

  const loading = authLoading || permissionsLoading;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requirePlatformAdmin && !isPlatformAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Acesso Negado</h1>
          <p className="mt-2 text-muted-foreground">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
