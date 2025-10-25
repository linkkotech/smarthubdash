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
      primaryAction: {
        label: "Ask AI",
        icon: <Sparkles className="h-4 w-4" />,
        onClick: () => console.log("Ask AI em Configurações"),
      },
      secondaryAction: {
        label: "Adicionar Novo",
        icon: <Plus className="h-4 w-4" />,
        onClick: () => console.log("Adicionar Novo em Configurações"),
      },
    });
  }, [setConfig]);
  
  return <SettingsLayout />;
}
