import { Bell, HelpCircle, Search, Share2, Sparkles, Settings2, Download, Upload, ChevronDown, CheckCircle2, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePageHeader } from "@/contexts/PageHeaderContext";
import { cn } from "@/lib/utils";

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
  
  // Linha 2 - Ações específicas
  primaryAction?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
  
  // Linha 2 - Status e exports
  statusText?: string;
  statusIcon?: React.ReactNode;
  showImports?: boolean;
  showExports?: boolean;
  onImport?: () => void;
  onExport?: () => void;
}

export function PageHeader(props?: PageHeaderProps) {
  const { config } = usePageHeader();
  
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
  } = props || {};
  
  const viewControls = config.viewControls;
  const breadcrumb = config.breadcrumb;
  
  return (
    <div className={cn(
      "flex flex-col justify-center border-b",
      breadcrumb ? "h-[145px]" : "h-[121px]"
    )}>
      {/* LINHA 1: Título + Breadcrumb + Ações Globais */}
      <div className="flex items-start justify-between px-8 py-3 border-b">
        {/* Esquerda: Título + Breadcrumb */}
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {breadcrumb && (
            <div className="text-sm">{breadcrumb}</div>
          )}
        </div>
        
        {/* Direita: Ações Globais */}
        <div className="flex items-center gap-2">
          {showNotifications && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onNotificationClick}
              className="h-9 w-9"
            >
              <Bell className="h-4 w-4" />
            </Button>
          )}
          
          {showHelp && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onHelpClick}
              className="h-9 w-9"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          )}
          
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search something..."
                className="w-64 pl-9 h-9"
              />
            </div>
          )}
          
          {showShare && (
            <Button
              variant="outline"
              size="sm"
              onClick={onShareClick}
              className="gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          )}
        </div>
      </div>

      {/* LINHA 2: Ações Específicas + Conteúdo Personalizado à Direita */}
      <div className="flex items-center justify-between px-8 py-3">
        {/* Esquerda: Botões de Ação da Página */}
        <div className="flex items-center gap-2">
          {primaryAction && (
            <Button
              size="sm"
              onClick={primaryAction.onClick}
              className="gap-2"
            >
              {primaryAction.icon || <Sparkles className="h-4 w-4" />}
              {primaryAction.label}
            </Button>
          )}
          
          {secondaryAction && (
            <Button
              variant="outline"
              size="sm"
              onClick={secondaryAction.onClick}
              className="gap-2"
            >
              {secondaryAction.icon || <Settings2 className="h-4 w-4" />}
              {secondaryAction.label}
            </Button>
          )}
        </div>
        
        {/* Direita: Conteúdo Customizado OU Status/View Controls/Imports/Exports */}
        <div className="flex items-center gap-3">
          {config.customRightContent ? (
            config.customRightContent
          ) : (
            <>
              {viewControls && (
                <div className="flex items-center gap-1 border rounded-md p-1">
                  <Button
                    variant={viewControls.currentView === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => viewControls.onViewChange("grid")}
                    className="h-8 px-3"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewControls.currentView === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => viewControls.onViewChange("list")}
                    className="h-8 px-3"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              {statusText && (
                <div className="flex items-center gap-1.5 text-sm text-green-600">
                  {statusIcon || <CheckCircle2 className="h-4 w-4" />}
                  <span className="font-medium">{statusText}</span>
                </div>
              )}
              
              {showImports && (
                <DropdownMenu>
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
                </DropdownMenu>
              )}
              
              {showExports && (
                <DropdownMenu>
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
                </DropdownMenu>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
