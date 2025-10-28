import { usePageHeader } from "@/contexts/PageHeaderContext";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Library, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AiBasesDeConhecimento() {
  const { setConfig } = usePageHeader();

  useEffect(() => {
    setConfig({
      title: "Bases de Conhecimento",
    });
  }, [setConfig]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Library className="h-5 w-5 text-primary" />
            Bases de Conhecimento
          </CardTitle>
          <CardDescription>
            Gerencie documentos, FAQs e conteúdos que alimentam seus agentes de IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Adicione documentos, manuais, políticas e outros conteúdos para que seus agentes 
            de IA possam responder com informações precisas e contextualizadas do seu negócio.
          </p>
          
          <div className="flex items-center gap-4">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Criar Nova Base
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Importar Documentos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder para lista de bases */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="h-48 flex flex-col items-center justify-center space-y-3">
          <Library className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center px-4">
            Nenhuma base de conhecimento cadastrada ainda
          </p>
        </Card>
        <Card className="h-48 flex items-center justify-center border-dashed">
          <p className="text-muted-foreground">Slot para nova base</p>
        </Card>
        <Card className="h-48 flex items-center justify-center border-dashed">
          <p className="text-muted-foreground">Slot para nova base</p>
        </Card>
      </div>
    </div>
  );
}
