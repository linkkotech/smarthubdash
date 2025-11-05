import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRoles: string[] | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRoles, setUserRoles] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Setup auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user roles when session changes
        if (session?.user) {
          setTimeout(async () => {
            const { data } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", session.user.id);
            
            setUserRoles(data?.map(r => r.role) ?? null);
          }, 0);
        } else {
          setUserRoles(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .then(({ data }) => {
            setUserRoles(data?.map(r => r.role) ?? null);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // 1. Autenticar
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Usuário não encontrado após login.");

      // 2. Verificar papel do usuário
      const { data: isAdmin, error: rpcError } = await supabase.rpc('is_platform_admin', {
        _user_id: authData.user.id
      });

      if (rpcError) {
        console.error("Erro ao verificar papel do usuário:", rpcError);
        throw new Error("Erro ao verificar permissões do usuário.");
      }

      // 3. Redirecionar condicionalmente baseado no papel (ordem de precedência)
      toast.success("Login realizado com sucesso!");
      
      if (isAdmin) {
        // Prioridade 1: Admin da Plataforma
        navigate("/dashboard");
      } else {
        // Prioridade 2: Verificar se é Owner/Manager de Workspace
        const { data: workspaceMembership, error: membershipError } = await supabase
          .from('workspace_members')
          .select('role')
          .eq('profile_id', authData.user.id)
          .in('role', ['owner', 'manager']);

        if (membershipError) {
          console.error("Erro ao verificar workspace membership:", membershipError);
        }

        if (workspaceMembership && workspaceMembership.length > 0) {
          // Owner ou Manager de pelo menos um workspace
          navigate("/app/dashboard");
        } else {
          // Prioridade 3: Membro normal (user)
          navigate("/app/dashboard");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
      
      toast.success("Conta criada com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar conta");
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success("Logout realizado com sucesso!");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer logout");
    }
  };

  const hasRole = (role: string) => {
    return userRoles?.includes(role) ?? false;
  };

  const hasAnyRole = (roles: string[]) => {
    return roles.some(role => userRoles?.includes(role)) ?? false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userRoles,
        loading,
        signIn,
        signUp,
        signOut,
        hasRole,
        hasAnyRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
