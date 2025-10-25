import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface PermissionsContextType {
  isPlatformAdmin: boolean;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPermissions = async () => {
    if (!user) {
      setIsPlatformAdmin(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.rpc('is_platform_admin', {
        _user_id: user.id
      });

      if (error) {
        console.error("Error fetching platform admin status:", error);
        setIsPlatformAdmin(false);
      } else {
        setIsPlatformAdmin(data || false);
      }
    } catch (error) {
      console.error("Error in fetchPermissions:", error);
      setIsPlatformAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [user]);

  const refetch = async () => {
    await fetchPermissions();
  };

  return (
    <PermissionsContext.Provider value={{ isPlatformAdmin, isLoading, refetch }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
}
