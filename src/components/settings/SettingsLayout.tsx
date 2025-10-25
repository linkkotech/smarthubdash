import { Outlet } from "react-router-dom";
import { SettingsSidebar } from "./SettingsSidebar";

export function SettingsLayout() {
  return (
    <div className="flex h-full -m-8">
      {/* Coluna 1: Sidebar de Navegação (Fixa) */}
      <SettingsSidebar />

      {/* Coluna 2: Conteúdo (Scrollable) */}
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
