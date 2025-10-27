import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageHeader } from "@/contexts/PageHeaderContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TemplatesDataTable } from "@/components/templates/TemplatesDataTable";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Link, Trash2, Plus, FileText, Blocks } from "lucide-react";

// Interface para Templates (mockado por enquanto)
interface Template {
  id: string;
  type: "profile" | "block";
  title: string;
  subtitle: string;
  created_at: string;
}

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { setConfig } = usePageHeader();
  
  // Estado para controlar modo de visualização
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Estado para templates (mockado por enquanto)
  const [templates, setTemplates] = useState<Template[]>([
    { id: "1", type: "profile", title: "Perfil Digital", subtitle: "Mapfre", created_at: new Date().toISOString() },
    { id: "2", type: "block", title: "Bloco Hero", subtitle: "Cliente ABC", created_at: new Date().toISOString() },
    { id: "3", type: "profile", title: "Landing Page", subtitle: "Tech Corp", created_at: new Date().toISOString() },
    { id: "4", type: "block", title: "Call to Action", subtitle: "Promo 2024", created_at: new Date().toISOString() },
    { id: "5", type: "profile", title: "Cartão Digital", subtitle: "Consultor X", created_at: new Date().toISOString() },
    { id: "6", type: "block", title: "Footer", subtitle: "Padrão", created_at: new Date().toISOString() },
  ]);

  useEffect(() => {
    setConfig({
      title: "Templates Digitais",
      showSearch: true,
      showNotifications: true,
      showHelp: true,
      primaryAction: {
        label: "Criar Perfil Digital",
        icon: <Plus className="h-4 w-4" />,
        onClick: () => navigate("/templates-digitais/editor?mode=profile"),
      },
      secondaryAction: {
        label: "Criar Bloco de Conteúdo",
        icon: <Plus className="h-4 w-4" />,
        onClick: () => navigate("/templates-digitais/editor?mode=block"),
      },
      viewControls: {
        currentView: viewMode,
        onViewChange: setViewMode,
      },
    });
  }, [setConfig, navigate, viewMode]);

  const handleEdit = (id: string, type: "profile" | "block") => {
    navigate(`/templates-digitais/editor?mode=${type}&id=${id}`);
  };

  const handleLink = (id: string) => {
    console.log("Vincular template:", id);
    // TODO: Implementar lógica de vinculação
  };

  const handleDelete = (id: string) => {
    console.log("Excluir template:", id);
    // TODO: Implementar lógica de exclusão
    setTemplates(templates.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6">
      {viewMode === "grid" ? (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="relative hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {template.type === "profile" ? (
                      <FileText className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Blocks className="h-5 w-5 text-purple-500" />
                    )}
                    <div>
                      <CardTitle className="text-base">{template.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{template.subtitle}</p>
                    </div>
                  </div>
                  
                  {/* Dropdown Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleEdit(template.id, template.type)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleLink(template.id)}>
                        <Link className="h-4 w-4 mr-2" />
                        Vincular
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(template.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                  <p className="text-xs text-muted-foreground">Preview (em breve)</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // List View
        <TemplatesDataTable
          data={templates}
          onEdit={handleEdit}
          onLink={handleLink}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
