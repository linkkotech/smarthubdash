import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageHeader } from "@/contexts/PageHeaderContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTemplateDialog } from "@/components/templates/CreateTemplateDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FileText, Blocks, Edit, Link, Trash2, Plus, MoreVertical } from "lucide-react";
import { TemplatesDataTable } from "@/components/templates/TemplatesDataTable";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Template {
  id: string;
  name: string;
  type: "profile_template" | "content_block";
  description: string | null;
  content: any;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Skeleton para Grid View
function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 flex-1">
                <Skeleton className="h-5 w-5" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="aspect-video w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Skeleton para List View
function ListSkeleton() {
  return (
    <div className="rounded-md border">
      <div className="p-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { setConfig } = usePageHeader();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Buscar templates do banco de dados
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('digital_templates')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar templates:', error);
          toast({
            title: "Erro ao carregar templates",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        setTemplates(data || []);
      } catch (error) {
        console.error('Erro inesperado:', error);
        toast({
          title: "Erro inesperado",
          description: "Não foi possível carregar os templates.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [toast]);

  useEffect(() => {
    setConfig({
      title: "Templates Digitais",
      showSearch: true,
      showNotifications: true,
      showHelp: true,
      primaryAction: {
        label: "+ Adicionar Novo",
        icon: <Plus className="h-4 w-4" />,
        onClick: () => setIsCreateDialogOpen(true),
      },
      viewControls: {
        currentView: viewMode,
        onViewChange: setViewMode,
      },
    });
  }, [setConfig, viewMode]);

  const handleEdit = (id: string, type: "profile" | "block") => {
    navigate(`/templates-digitais/editor?id=${id}&mode=${type}`);
  };

  const handleLink = (id: string) => {
    console.log("Vincular template:", id);
    // TODO: Implementar lógica de vinculação
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('digital_templates')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar template:', error);
        toast({
          title: "Erro ao deletar",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Atualiza o estado local removendo o item deletado
      setTemplates(templates.filter(t => t.id !== id));
      
      toast({
        title: "Template deletado",
        description: "O template foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível deletar o template.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <CreateTemplateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
      
      <div className="space-y-6">
      {loading ? (
        // Loading State
        viewMode === "grid" ? <GridSkeleton /> : <ListSkeleton />
      ) : viewMode === "grid" ? (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {templates.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum template criado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Crie seu primeiro perfil digital ou bloco de conteúdo
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Template
              </Button>
            </div>
          ) : (
            templates.map((template) => (
              <Card key={template.id} className="relative hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {template.type === "profile_template" ? (
                        <FileText className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Blocks className="h-5 w-5 text-purple-500" />
                      )}
                      <div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {template.description || "Sem descrição"}
                        </p>
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
                        <DropdownMenuItem onClick={() => handleEdit(
                          template.id, 
                          template.type === "profile_template" ? "profile" : "block"
                        )}>
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
            ))
          )}
        </div>
      ) : (
        // List View
        templates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum template criado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Crie seu primeiro perfil digital ou bloco de conteúdo
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Template
              </Button>
            </CardContent>
          </Card>
        ) : (
          <TemplatesDataTable
            data={templates}
            onEdit={(id, type) => handleEdit(id, type)}
            onLink={handleLink}
            onDelete={handleDelete}
          />
        )
      )}
      </div>
    </>
  );
}
