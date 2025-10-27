import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { usePageHeader } from "@/contexts/PageHeaderContext";
import { Button } from "@/components/ui/button";
import { 
  Save, 
  Eye, 
  Settings, 
  Image as ImageIcon, 
  Type, 
  Layout,
  ChevronLeft 
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";

// Componentes placeholder para as colunas
function EditorSidebar() {
  return (
    <div className="p-6 space-y-6">
      <h3 className="font-semibold text-lg">Conteúdo</h3>
      <Separator />
      
      <div className="space-y-2">
        <Button variant="outline" className="w-full justify-start" size="sm">
          <Type className="h-4 w-4 mr-2" />
          Texto
        </Button>
        <Button variant="outline" className="w-full justify-start" size="sm">
          <ImageIcon className="h-4 w-4 mr-2" />
          Imagem
        </Button>
        <Button variant="outline" className="w-full justify-start" size="sm">
          <Layout className="h-4 w-4 mr-2" />
          Container
        </Button>
      </div>
      
      <Separator />
      
      <div>
        <h4 className="text-sm font-medium mb-2">Design</h4>
        <p className="text-xs text-muted-foreground">
          Opções de estilo aparecerão aqui
        </p>
      </div>
    </div>
  );
}

function CanvasArea({ mode }: { mode: "profile" | "block" }) {
  return (
    <div className="h-full overflow-y-auto p-8 flex flex-col items-start">
      {/* Sempre alinhado ao topo (items-start no flex) */}
      
      {mode === "profile" ? (
        // Modo Perfil: Carrega com bloco Hero
        <Card className="w-full bg-blue-500 text-white p-8 min-h-[300px]">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">Hero Section</h1>
            <p className="text-lg">
              Este é o bloco Hero inicial do Perfil Digital
            </p>
            <Button variant="secondary">Call to Action</Button>
          </div>
        </Card>
      ) : (
        // Modo Bloco: Vazio
        <div className="w-full h-[200px] border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Arraste elementos aqui para começar
          </p>
        </div>
      )}
    </div>
  );
}

function PreviewArea({ mode }: { mode: "profile" | "block" }) {
  if (mode === "profile") {
    // Modo Perfil: Mockup de Smartphone
    return (
      <div className="p-6 flex items-start justify-center">
        <div className="relative w-[280px] h-[580px] bg-gray-900 rounded-[40px] border-8 border-gray-800 shadow-2xl">
          {/* Notch do smartphone */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10"></div>
          
          {/* Tela do smartphone */}
          <div className="w-full h-full bg-white rounded-[32px] overflow-hidden">
            <div className="p-4 space-y-3">
              <div className="w-full h-24 bg-blue-500 rounded-lg"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </div>
          
          {/* Botão home */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-gray-700 rounded-full"></div>
        </div>
      </div>
    );
  } else {
    // Modo Bloco: Canvas pontilhado com conteúdo centralizado
    return (
      <div className="p-6 h-full">
        <div className="w-full h-full border-2 border-dashed border-muted-foreground/50 rounded-lg flex items-center justify-center">
          {/* Conteúdo do preview é centralizado verticalmente (items-center no flex) */}
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">Preview do Bloco</p>
            <p className="text-xs text-muted-foreground">
              O conteúdo aparecerá aqui
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default function TemplateEditorPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setConfig } = usePageHeader();
  
  const mode = (searchParams.get("mode") || "profile") as "profile" | "block";
  const templateId = searchParams.get("id");

  useEffect(() => {
    setConfig({
      title: mode === "profile" ? "Editor de Perfil Digital" : "Editor de Bloco de Conteúdo",
      showSearch: false,
      showNotifications: false,
      primaryAction: {
        label: "Salvar",
        icon: <Save className="h-4 w-4" />,
        onClick: () => {
          console.log("Salvar template");
          // TODO: Implementar salvamento
        },
      },
      secondaryAction: {
        label: "Preview",
        icon: <Eye className="h-4 w-4" />,
        onClick: () => {
          console.log("Abrir preview em tela cheia");
          // TODO: Implementar preview
        },
      },
    });
  }, [setConfig, mode]);

  return (
    <div className="flex h-full bg-background -m-8">
      {/* Coluna 1: Sidebar Esquerda (Ferramentas) */}
      <aside className="w-[300px] border-r bg-card h-full overflow-y-auto">
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
        <EditorSidebar />
      </aside>

      {/* Coluna 2: Canvas Central (Tela de Pintura) */}
      <main className="flex-1 overflow-x-hidden h-full bg-muted/20">
        <CanvasArea mode={mode} />
      </main>

      {/* Coluna 3: Preview Direita */}
      <aside className="w-[360px] border-l bg-card h-full overflow-y-auto">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Preview</h3>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <PreviewArea mode={mode} />
      </aside>
    </div>
  );
}
