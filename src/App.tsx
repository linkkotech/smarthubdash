import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PermissionsProvider } from "@/contexts/PermissionsContext";
import { PageHeaderProvider } from "@/contexts/PageHeaderContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Teams from "./pages/Teams";
import Plans from "./pages/Plans";
import Clients from "./pages/Clients";
import ClientDetails from "./pages/ClientDetails";
import ClientUsers from "./pages/ClientUsers";
import Settings from "./pages/Settings";
import DashboardCliente from "./pages/DashboardCliente";
import WorkflowsPage from "./pages/client/WorkflowsPage";
import CrmDashboard from "./pages/client/CrmDashboard";
import CrmProspeccao from "./pages/client/CrmProspeccao";
import CrmLeads from "./pages/client/CrmLeads";
import CrmContatos from "./pages/client/CrmContatos";
import CrmEmpresas from "./pages/client/CrmEmpresas";
import CrmNegocios from "./pages/client/CrmNegocios";
import CrmMetricas from "./pages/client/CrmMetricas";
import AgentSettingsPage from "./pages/client/AgentSettingsPage";
import TemplatesPage from "./pages/TemplatesPage";
import TemplateEditorPage from "./pages/TemplateEditorPage";
import CompanySettings from "./pages/settings/CompanySettings";
import GeneralSettings from "./pages/settings/GeneralSettings";
import SecuritySettings from "./pages/settings/SecuritySettings";
import RolesSettings from "./pages/settings/RolesSettings";
import AuthenticationSettings from "./pages/settings/AuthenticationSettings";
import StorageSettings from "./pages/settings/StorageSettings";
import ModulesSettings from "./pages/settings/ModulesSettings";
import PaymentSettings from "./pages/settings/PaymentSettings";
import CustomFieldsSettings from "./pages/settings/CustomFieldsSettings";
import CronSettings from "./pages/settings/CronSettings";
import LogsSettings from "./pages/settings/LogsSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <PermissionsProvider>
            <PageHeaderProvider>
              <Routes>
              {/* Public Routes (No Layout) */}
              <Route path="/login" element={<Login />} />
              
              {/* Routes with Sidebar/Layout */}
              <Route element={<SidebarLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* Protected Routes with AppLayout */}
                <Route element={<ProtectedRoute requirePlatformAdmin><AppLayout /></ProtectedRoute>}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/clientes" element={<Clients />} />
                  <Route path="/planos" element={<Plans />} />
                  <Route path="/equipe" element={<Teams />} />
                  <Route path="/templates-digitais" element={<TemplatesPage />} />
                  <Route path="/templates-digitais/editor" element={<TemplateEditorPage />} />
                  <Route path="/configuracoes" element={<Settings />}>
                    <Route index element={<Navigate to="/configuracoes/empresa" replace />} />
                    <Route path="empresa" element={<CompanySettings />} />
                    <Route path="geral" element={<GeneralSettings />} />
                    <Route path="seguranca" element={<SecuritySettings />} />
                    <Route path="roles" element={<RolesSettings />} />
                    <Route path="autenticacao" element={<AuthenticationSettings />} />
                    <Route path="storage" element={<StorageSettings />} />
                    <Route path="modulos" element={<ModulesSettings />} />
                    <Route path="pagamento" element={<PaymentSettings />} />
                    <Route path="campos" element={<CustomFieldsSettings />} />
                    <Route path="cron" element={<CronSettings />} />
                    <Route path="logs" element={<LogsSettings />} />
                  </Route>
                </Route>

          {/* Client Panel Routes */}
          <Route path="/app" element={<ProtectedRoute><ClientLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<DashboardCliente />} />
            
            {/* CRM Routes */}
            <Route path="crm/dashboard" element={<CrmDashboard />} />
            <Route path="crm/prospeccao" element={<CrmProspeccao />} />
            <Route path="crm/leads" element={<CrmLeads />} />
            <Route path="crm/contatos" element={<CrmContatos />} />
            <Route path="crm/empresas" element={<CrmEmpresas />} />
            <Route path="crm/negocios" element={<CrmNegocios />} />
            <Route path="crm/metricas" element={<CrmMetricas />} />
            
            <Route path="workflows" element={<WorkflowsPage />} />
            <Route path="settings/agents" element={<AgentSettingsPage />} />
          </Route>

                {/* Routes with special layout */}
                <Route path="/usuarios-clientes" element={<ProtectedRoute requirePlatformAdmin><AppLayout /></ProtectedRoute>}>
                  <Route index element={<ClientUsers />} />
                </Route>

                <Route path="/clientes/:id" element={<ProtectedRoute requirePlatformAdmin><AppLayout /></ProtectedRoute>}>
                  <Route index element={<ClientDetails />} />
                </Route>
              </Route>
              
              {/* 404 Route (No Layout) */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </PageHeaderProvider>
          </PermissionsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
