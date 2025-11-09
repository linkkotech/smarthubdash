import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { PageHeader } from "./PageHeader";

export function AppLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar - Fixo à Esquerda */}
      <div className="flex-shrink-0">
        <Sidebar />
      </div>

      {/* Coluna Direita: Header + Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header - Fixo no Topo */}
        <div className="flex-shrink-0 sticky top-0 z-10 bg-white mb-0">
          <PageHeader />
        </div>

        {/* Main Content - Área com Scroll */}
        <div className="flex-1 overflow-y-auto pb-4 pr-4 p-4 bg-white">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
