import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionsContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requirePlatformAdmin?: boolean;
  blockPlatformAdmin?: boolean;
}

export function ProtectedRoute({ children, requirePlatformAdmin, blockPlatformAdmin }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { isPlatformAdmin, isLoading: permissionsLoading } = usePermissions();

  const loading = authLoading || permissionsLoading;

  console.log("[ProtectedRoute] State:", { 
    user: user?.id, 
    authLoading, 
    isPlatformAdmin, 
    permissionsLoading, 
    loading,
    requirePlatformAdmin,
    blockPlatformAdmin
  });

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

  // Se requer admin E usuário não é admin → bloquear
  if (requirePlatformAdmin && !isPlatformAdmin) {
    console.log("[ProtectedRoute] Blocking: requirePlatformAdmin=true but isPlatformAdmin=false");
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

  // Se bloqueia admin E usuário é admin → redirecionar
  if (blockPlatformAdmin && isPlatformAdmin) {
    console.log("[ProtectedRoute] Redirecting admin to /dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  console.log("[ProtectedRoute] Access granted");
  return <>{children}</>;
}
