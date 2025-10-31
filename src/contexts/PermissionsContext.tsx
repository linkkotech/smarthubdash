import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface PermissionsContextType {
  isPlatformAdmin: boolean;
  isLoading: boolean;
  refetch: () => Promise<void>;
  setPlatformAdmin: (value: boolean) => void;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPermissions = async () => {
    if (!user) {
      console.log("[PermissionsContext] No user, setting isPlatformAdmin=false");
      setIsPlatformAdmin(false);
      setIsLoading(false);
      return;
    }

    try {
      console.log("[PermissionsContext] Fetching permissions for user:", user.id);
      setIsLoading(true);
      
      console.log("[PermissionsContext] About to call supabase.rpc");
      const response = await supabase.rpc('is_platform_admin', {
        _user_id: user.id
      });
      
      console.log("[PermissionsContext] Raw RPC response object:", response);
      const { data, error } = response;
      
      console.log("[PermissionsContext] Destructured data:", data);
      console.log("[PermissionsContext] Destructured error:", error);
      console.log("[PermissionsContext] Type of data:", typeof data);

      if (error) {
        console.error("[PermissionsContext] RPC Error object:", error);
        console.error("[PermissionsContext] Error message:", error.message);
        console.error("[PermissionsContext] Error code:", error.code);
        setIsPlatformAdmin(false);
      } else {
        const isAdmin = Boolean(data);
        console.log("[PermissionsContext] Final isAdmin value:", isAdmin);
        setIsPlatformAdmin(isAdmin);
      }
    } catch (error) {
      console.error("[PermissionsContext] Exception:", error);
      setIsPlatformAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("[PermissionsContext] useEffect triggered, user changed:", user?.id);
    console.log("[PermissionsContext] About to call fetchPermissions");
    fetchPermissions();
  }, [user]);

  const refetch = async () => {
    await fetchPermissions();
  };

  const setPlatformAdmin = (value: boolean) => {
    setIsPlatformAdmin(value);
  };

  return (
    <PermissionsContext.Provider value={{ isPlatformAdmin, isLoading, refetch, setPlatformAdmin }}>
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
