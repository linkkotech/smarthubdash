import { Outlet } from "react-router-dom";
import { ClientSidebar } from "./ClientSidebar";
import { PageHeader } from "./PageHeader";

export function ClientLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar do Cliente - Fixo à Esquerda */}
      <div className="flex-shrink-0">
        <ClientSidebar />
      </div>

      {/* Coluna Direita: Header + Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header Reutilizável - Fixo no Topo */}
        <div className="flex-shrink-0 sticky top-0 z-10 bg-background mb-0">
          <PageHeader />
        </div>

        {/* Main Content - Área com Scroll */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
