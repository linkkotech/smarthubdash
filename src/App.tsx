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
import CartoesPerfis from "./pages/client/CartoesPerfis";
import AiBasesDeConhecimento from "./pages/client/AiBasesDeConhecimento";
import AiMetricas from "./pages/client/AiMetricas";
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

// === Client Panel - Menu Principal ===
import TarefasPage from "./pages/client/TarefasPage";
import InboxPage from "./pages/client/InboxPage";
import EquipePage from "./pages/client/EquipePage";

// === Client Panel - Ferramentas ===
import CartoesTemplatesPage from "./pages/client/ferramentas/CartoesTemplatesPage";
import GoogleWalletPage from "./pages/client/ferramentas/GoogleWalletPage";
import CartoesNfcPage from "./pages/client/ferramentas/CartoesNfcPage";
import CalendarioPage from "./pages/client/ferramentas/CalendarioPage";
import IntegracoesPage from "./pages/client/ferramentas/IntegracoesPage";

// === Client Panel - Marketing ===
import CampanhasAtivasPage from "./pages/client/marketing/CampanhasAtivasPage";
import CampanhasAgendadasPage from "./pages/client/marketing/CampanhasAgendadasPage";
import CampanhasConcluidasPage from "./pages/client/marketing/CampanhasConcluidasPage";
import NovaCampanhaPage from "./pages/client/marketing/NovaCampanhaPage";
import RelatoriosPage from "./pages/client/marketing/RelatoriosPage";

// === Client Panel - Configurações ===
import ConfiguracoesClientePage from "./pages/client/ConfiguracoesClientePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
            
            {/* === Menu Principal === */}
            <Route path="tarefas" element={<TarefasPage />} />
            <Route path="inbox" element={<InboxPage />} />
            <Route path="equipe" element={<EquipePage />} />
            
            {/* === CRM Routes === */}
            <Route path="crm/dashboard" element={<CrmDashboard />} />
            <Route path="crm/prospeccao" element={<CrmProspeccao />} />
            <Route path="crm/leads" element={<CrmLeads />} />
            <Route path="crm/contatos" element={<CrmContatos />} />
            <Route path="crm/empresas" element={<CrmEmpresas />} />
            <Route path="crm/negocios" element={<CrmNegocios />} />
            <Route path="crm/metricas" element={<CrmMetricas />} />
            
            {/* === Ferramentas - Cartões Inteligentes === */}
            <Route path="ferramentas/cartoes/perfis" element={<CartoesPerfis />} />
            <Route path="ferramentas/cartoes/templates" element={<CartoesTemplatesPage />} />
            <Route path="ferramentas/cartoes/google-wallet" element={<GoogleWalletPage />} />
            <Route path="ferramentas/cartoes/nfc" element={<CartoesNfcPage />} />
            
            {/* === Ferramentas - Outras === */}
            <Route path="ferramentas/calendario" element={<CalendarioPage />} />
            <Route path="ferramentas/integracoes" element={<IntegracoesPage />} />
            
            {/* === AI Routes === */}
            <Route path="ai/workflows" element={<WorkflowsPage />} />
            <Route path="ai/bases-de-conhecimento" element={<AiBasesDeConhecimento />} />
            <Route path="ai/metricas" element={<AiMetricas />} />
            
            {/* === Marketing - Campanhas === */}
            <Route path="marketing/campanhas/ativas" element={<CampanhasAtivasPage />} />
            <Route path="marketing/campanhas/agendadas" element={<CampanhasAgendadasPage />} />
            <Route path="marketing/campanhas/concluidas" element={<CampanhasConcluidasPage />} />
            <Route path="marketing/campanhas/nova" element={<NovaCampanhaPage />} />
            
            {/* === Marketing - Relatórios === */}
            <Route path="marketing/relatorios" element={<RelatoriosPage />} />
            
            {/* === Configurações === */}
            <Route path="configuracoes" element={<ConfiguracoesClientePage />} />
            
            {/* === Agent Settings === */}
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
  </QueryClientProvider>
);

export default App;
