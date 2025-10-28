import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Palette, 
  Settings, 
  AlertTriangle,
  ChevronLeft 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export type EditorSection = 
  | "conteudo" 
  | "design" 
  | "configuracoes" 
  | "avancado";

interface NavigationItem {
  id: EditorSection;
  label: string;
  icon: React.ElementType;
  description: string;
  enabled: boolean;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: "conteudo",
    label: "Conteúdo",
    icon: FileText,
    description: "Adicione e edite blocos de conteúdo",
    enabled: true,
  },
  {
    id: "design",
    label: "Design",
    icon: Palette,
    description: "Personalize cores, fontes e estilos",
    enabled: false,
  },
  {
    id: "configuracoes",
    label: "Configurações",
    icon: Settings,
    description: "Gerencie URLs e privacidade",
    enabled: true,
  },
  {
    id: "avancado",
    label: "Avançado",
    icon: AlertTriangle,
    description: "Exclusão e configurações críticas",
    enabled: true,
  },
];

interface EditorSidebarProps {
  activeSection: EditorSection;
  onSectionChange: (section: EditorSection) => void;
}

export function EditorSidebar({ 
  activeSection, 
  onSectionChange 
}: EditorSidebarProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full">
      {/* Header com botão de voltar */}
      <div className="p-4 border-b">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/templates-digitais")}
          className="w-full justify-start"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Navegação Principal */}
      <div className="p-4 space-y-1 flex-1 overflow-y-auto">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Editor
        </h3>
        
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`
                w-full justify-start h-auto py-3 px-3
                ${!item.enabled && "opacity-50 cursor-not-allowed"}
              `}
              onClick={() => item.enabled && onSectionChange(item.id)}
              disabled={!item.enabled}
            >
              <div className="flex items-start gap-3 text-left w-full">
                <Icon className="h-5 w-5 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className={`
                    text-xs mt-0.5 
                    ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}
                  `}>
                    {item.description}
                  </div>
                </div>
              </div>
            </Button>
          );
        })}
      </div>

      {/* Footer com informações */}
      <div className="p-4 border-t bg-muted/30">
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-medium">💡 Dica</p>
          <p>Use Ctrl+S para salvar rapidamente</p>
        </div>
      </div>
    </div>
  );
}
