import { useEffect } from "react";
import { Sparkles, Plus } from "lucide-react";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { usePageHeader } from "@/contexts/PageHeaderContext";

export default function Settings() {
  const { setConfig } = usePageHeader();
  
  useEffect(() => {
    setConfig({
      title: "Configurações",
      showSearch: true,
      showShare: true,
      showNotifications: true,
      showHelp: true,
    });
  }, [setConfig]);
  
  return <SettingsLayout />;
}
