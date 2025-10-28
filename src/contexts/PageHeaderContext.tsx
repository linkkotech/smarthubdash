import { createContext, useContext, useState, ReactNode } from "react";

export interface PageHeaderConfig {
  title: string;
  showNotifications?: boolean;
  showHelp?: boolean;
  showSearch?: boolean;
  showShare?: boolean;
  onNotificationClick?: () => void;
  onHelpClick?: () => void;
  onShareClick?: () => void;
  primaryAction?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
  };
  secondaryAction?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
  };
  viewControls?: {
    currentView: "grid" | "list";
    onViewChange: (view: "grid" | "list") => void;
  };
  statusText?: string;
  statusIcon?: React.ReactNode;
  showImports?: boolean;
  showExports?: boolean;
  onImport?: () => void;
  onExport?: () => void;
}

interface PageHeaderContextType {
  config: PageHeaderConfig;
  setConfig: (config: PageHeaderConfig) => void;
  updateConfig: (partial: Partial<PageHeaderConfig>) => void;
}

const PageHeaderContext = createContext<PageHeaderContextType | undefined>(undefined);

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<PageHeaderConfig>({
    title: "",
    showNotifications: true,
    showHelp: true,
    showSearch: true,
    showShare: true,
  });

  const setConfig = (newConfig: PageHeaderConfig) => {
    setConfigState(newConfig);
  };

  const updateConfig = (partial: Partial<PageHeaderConfig>) => {
    setConfigState((prev) => ({ ...prev, ...partial }));
  };

  return (
    <PageHeaderContext.Provider value={{ config, setConfig, updateConfig }}>
      {children}
    </PageHeaderContext.Provider>
  );
}

export function usePageHeader() {
  const context = useContext(PageHeaderContext);
  if (!context) {
    throw new Error("usePageHeader must be used within PageHeaderProvider");
  }
  return context;
}
