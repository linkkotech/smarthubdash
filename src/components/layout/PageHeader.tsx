import { Bell, HelpCircle, Search, Share2, Sparkles, Settings2, Download, Upload, ChevronDown, CheckCircle2, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePageHeader, PageHeaderAction } from "@/contexts/PageHeaderContext";
import { cn } from "@/lib/utils";

/**
 * Props para o componente PageHeader.
 * 
 * @interface PageHeaderProps
 * @property {string} [title] - Título principal exibido na primeira linha do header
 * @property {boolean} [showNotifications] - Exibe botão de notificações (padrão: true)
 * @property {boolean} [showHelp] - Exibe botão de ajuda (padrão: true)
 * @property {boolean} [showSearch] - Exibe campo de busca (padrão: true)
 * @property {boolean} [showShare] - Exibe botão de compartilhar (padrão: true)
 * @property {() => void} [onNotificationClick] - Callback ao clicar no botão de notificações
 * @property {() => void} [onHelpClick] - Callback ao clicar no botão de ajuda
 * @property {() => void} [onShareClick] - Callback ao clicar no botão de compartilhar
 * @property {PageHeaderAction} [primaryAction] - Ação primária exibida na segunda linha (ex: "Adicionar Cliente")
 * @property {PageHeaderAction} [secondaryAction] - Ação secundária exibida na segunda linha (ex: "Filtros")
 * @property {string} [statusText] - Texto de status exibido no lado direito da segunda linha
 * @property {React.ReactNode} [statusIcon] - Ícone customizado para o status (padrão: CheckCircle2)
 * @property {boolean} [showImports] - Exibe dropdown de importação (CSV, Excel)
 * @property {boolean} [showExports] - Exibe dropdown de exportação (PDF, Excel, CSV)
 * @property {() => void} [onImport] - Callback para ações de importação
 * @property {() => void} [onExport] - Callback para ações de exportação
 * @property {React.ReactNode} [customRightContent] - Conteúdo customizado para o lado direito da segunda linha
 */
interface PageHeaderProps {
  title?: string;

  // Linha 1 - Opções globais
  showNotifications?: boolean;
  showHelp?: boolean;
  showSearch?: boolean;
  showShare?: boolean;
  onNotificationClick?: () => void;
  onHelpClick?: () => void;
  onShareClick?: () => void;
  primaryAction?: PageHeaderAction;
  secondaryAction?: PageHeaderAction;

  // Linha 2 - Status e exports
  statusText?: string;
  statusIcon?: React.ReactNode;
  showImports?: boolean;
  showExports?: boolean;
  onImport?: () => void;
  onExport?: () => void;
  customRightContent?: React.ReactNode;
}

/**
 * PageHeader - Cabeçalho padronizado de duas linhas para todas as páginas internas
 * 
 * Componente flexível e avançado que exibe título, ações, controles de visualização,
 * status e funcionalidades de import/export. Integrado com PageHeaderContext para
 * configuração centralizada, mas aceita props para override quando necessário.
 * 
 * **Estrutura:**
 * - **Linha 1:** Título + Notificações + Ajuda + Busca + Compartilhar
 * - **Linha 2:** Ações Primárias/Secundárias + View Controls + Status + Import/Export
 * 
 * **Modo de Uso:**
 * 1. Via Context: Configure usando `setConfig()` do `usePageHeader()` hook
 * 2. Via Props: Passe props diretamente para override pontual
 * 
 * @component
 * @param {PageHeaderProps} [props] - Propriedades opcionais (override do context)
 * @returns {JSX.Element} Componente de header renderizado
 * 
 * @example
 * // Uso básico - apenas título (configurado via context)
 * useEffect(() => {
 *   setConfig({ title: "Dashboard" });
 * }, [setConfig]);
 * 
 * return <PageHeader />;
 * 
 * @example
 * // Uso avançado - título, ações, view controls e status
 * useEffect(() => {
 *   setConfig({
 *     title: "Clientes",
 *     primaryAction: {
 *       label: "Adicionar Cliente",
 *       icon: <Plus className="h-4 w-4" />,
 *       onClick: () => setIsModalOpen(true),
 *     },
 *     secondaryAction: {
 *       label: "Filtros",
 *       icon: <Filter className="h-4 w-4" />,
 *       onClick: () => setShowFilters(true),
 *       variant: "outline",
 *     },
 *     viewControls: {
 *       currentView: viewMode,
 *       onViewChange: setViewMode,
 *     },
 *     statusText: "Last updated now",
 *     showExports: true,
 *     onExport: handleExport,
 *   });
 * }, [setConfig, viewMode]);
 * 
 * return <PageHeader />;
 */
export function PageHeader(props?: PageHeaderProps) {
  const {
    config
  } = usePageHeader();

  // Merge props with context (props override context)
  const {
    title = config.title,
    showNotifications = config.showNotifications ?? true,
    showHelp = config.showHelp ?? true,
    showSearch = config.showSearch ?? true,
    showShare = config.showShare ?? true,
    onNotificationClick = config.onNotificationClick,
    onHelpClick = config.onHelpClick,
    onShareClick = config.onShareClick,
    primaryAction = config.primaryAction,
    secondaryAction = config.secondaryAction,
    statusText = config.statusText,
    statusIcon = config.statusIcon,
    showImports = config.showImports ?? false,
    showExports = config.showExports ?? false,
    onImport = config.onImport,
    onExport = config.onExport,
    customRightContent = config.customRightContent
  } = props || {};
  const viewControls = config.viewControls;
  return <div className="flex flex-col justify-center border-b h-[121px]">
      {/* LINHA 1: Título + Ações Globais */}
      <div className="flex items-center justify-between px-8 py-3 border-b">
        {/* Esquerda: Título */}
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        
        {/* Direita: Ações Globais */}
        <div className="flex items-center gap-2">
          {showNotifications && <Button variant="ghost" size="icon" onClick={onNotificationClick} className="h-9 w-9">
              <Bell className="h-4 w-4" />
            </Button>}
          
          {showHelp && <Button variant="ghost" size="icon" onClick={onHelpClick} className="h-9 w-9">
              <HelpCircle className="h-4 w-4" />
            </Button>}
          
          {showSearch && <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search something..." className="w-64 pl-9 h-9" />
            </div>}
          
          {showShare && <Button variant="outline" size="sm" onClick={onShareClick} className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>}
        </div>
      </div>

      {/* LINHA 2: Botões de Ação + View Controls + Status + Imports/Exports */}
      <div className="flex items-center justify-between px-8 py-3">
        {/* Esquerda: Botões de Ação da Página */}
        <div className="flex items-center gap-2">
          {primaryAction && (
            <Button
              type="button"
              onClick={primaryAction.onClick}
              variant={primaryAction.variant || "default"}
              size="sm"
              disabled={primaryAction.disabled}
              className="gap-2"
            >
              {primaryAction.icon}
              {primaryAction.label}
            </Button>
          )}
          
          {secondaryAction && (
            <Button
              type="button"
              onClick={secondaryAction.onClick}
              variant={secondaryAction.variant || "outline"}
              size="sm"
              disabled={secondaryAction.disabled}
              className="gap-2"
            >
              {secondaryAction.icon}
              {secondaryAction.label}
            </Button>
          )}
        </div>
        
        {/* Direita: Status/View Controls/Imports/Exports/Custom Content */}
        <div className="flex items-center gap-3">
          {/* Conteúdo Customizado (prioridade máxima) */}
          {customRightContent}
          
          {viewControls && <div className="flex items-center gap-1 border rounded-md p-1">
                  <Button variant={viewControls.currentView === "grid" ? "default" : "ghost"} size="sm" onClick={() => viewControls.onViewChange("grid")} className="h-8 px-3">
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button variant={viewControls.currentView === "list" ? "default" : "ghost"} size="sm" onClick={() => viewControls.onViewChange("list")} className="h-8 px-3">
                    <List className="h-4 w-4" />
                  </Button>
                </div>}
              
              {statusText && <div className="flex items-center gap-1.5 text-sm text-green-600">
                  {statusIcon || <CheckCircle2 className="h-4 w-4" />}
                  <span className="font-medium">{statusText}</span>
                </div>}
              
              {showImports && <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      Imports
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onImport}>
                      Import CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onImport}>
                      Import Excel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>}
              
              {showExports && <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Exports
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onExport}>
                      Export as PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onExport}>
                      Export as Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onExport}>
                      Export as CSV
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>}
        </div>
      </div>
    </div>;
}}

/**
 * ============================================================================
 * EXEMPLOS DE USO DO COMPONENTE PAGEHEADER
 * ============================================================================
 * 
 * Este componente � altamente flex�vel e pode ser usado de v�rias formas.
 * Abaixo est�o alguns exemplos pr�ticos de implementa��o.
 */

/**
 * EXEMPLO 1: USO B�SICO - Apenas T�tulo
 * 
 * Ideal para p�ginas simples que precisam apenas de um t�tulo no header.
 * Configure via PageHeaderContext dentro de um useEffect.
 * 
 * ```tsx
 * import { usePageHeader } from "@/contexts/PageHeaderContext";
 * import { PageHeader } from "@/components/layout/PageHeader";
 * 
 * export default function SimplePage() {
 *   const { setConfig } = usePageHeader();
 * 
 *   useEffect(() => {
 *     setConfig({
 *       title: "Minha P�gina Simples"
 *     });
 * 
 *     // Limpar configura��o ao desmontar
 *     return () => setConfig({ title: "" });
 *   }, [setConfig]);
 * 
 *   return (
 *     <>
 *       <PageHeader />
 *       <div className="p-6">
 *         {/* Conte�do da p�gina */}
 *       </div>
 *     </>
 *   );
 * }
 * ```
 */

/**
 * EXEMPLO 2: USO AVAN�ADO - T�tulo + A��es + View Controls + Status + Export
 * 
 * Ideal para p�ginas de listagem (ex: Clientes, Produtos, etc) que precisam
 * de funcionalidades completas: adicionar itens, alternar visualiza��es,
 * exportar dados, etc.
 * 
 * ```tsx
 * import { usePageHeader } from "@/contexts/PageHeaderContext";
 * import { PageHeader } from "@/components/layout/PageHeader";
 * import { Plus, Filter } from "lucide-react";
 * import { useState } from "react";
 * 
 * export default function ClientsPage() {
 *   const { setConfig } = usePageHeader();
 *   const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
 *   const [isModalOpen, setIsModalOpen] = useState(false);
 * 
 *   useEffect(() => {
 *     setConfig({
 *       title: "Clientes",
 *       showSearch: true,
 *       showNotifications: true,
 *       showHelp: true,
 *       
 *       // A��o prim�ria: Adicionar Cliente
 *       primaryAction: {
 *         label: "Adicionar Cliente",
 *         icon: <Plus className="h-4 w-4" />,
 *         onClick: () => setIsModalOpen(true),
 *       },
 *       
 *       // A��o secund�ria: Abrir Filtros
 *       secondaryAction: {
 *         label: "Filtros",
 *         icon: <Filter className="h-4 w-4" />,
 *         onClick: () => console.log("Abrir filtros"),
 *         variant: "outline",
 *       },
 *       
 *       // Controles de visualiza��o (Grid/Lista)
 *       viewControls: {
 *         currentView: viewMode,
 *         onViewChange: setViewMode,
 *       },
 *       
 *       // Status e �ltima atualiza��o
 *       statusText: "Atualizado agora",
 *       
 *       // Funcionalidades de exporta��o
 *       showExports: true,
 *       onExport: () => console.log("Exportar dados"),
 *     });
 * 
 *     return () => setConfig({ title: "" });
 *   }, [setConfig, viewMode]);
 * 
 *   return (
 *     <>
 *       <PageHeader />
 *       <div className="p-6">
 *         {viewMode === "grid" ? (
 *           <div className="grid grid-cols-3 gap-4">
 *             {/* Grid de clientes */}
 *           </div>
 *         ) : (
 *           <DataTable data={clients} />
 *         )}
 *       </div>
 *       
 *       {/* Modal de adicionar cliente */}
 *       <AddClientModal open={isModalOpen} onOpenChange={setIsModalOpen} />
 *     </>
 *   );
 * }
 * ```
 */
