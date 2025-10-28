import { usePageHeader } from "@/contexts/PageHeaderContext";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Contact2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CartoesPerfis() {
  const { setConfig } = usePageHeader();

  useEffect(() => {
    setConfig({
      title: "Perfis Digitais",
    });
  }, [setConfig]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Contact2 className="h-5 w-5 text-primary" />
            Perfis Digitais
          </CardTitle>
          <CardDescription>
            Gerencie os perfis dos seus cartões digitais inteligentes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Configure informações de contato, links de redes sociais, portfólios e outros dados 
            que serão compartilhados através dos seus cartões inteligentes.
          </p>
          
          <div className="flex items-center gap-4">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Criar Novo Perfil
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder para lista de perfis */}
      <Card>
        <CardHeader>
          <CardTitle>Seus Perfis</CardTitle>
          <CardDescription>
            Lista de perfis digitais cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent className="h-48 flex items-center justify-center">
          <p className="text-muted-foreground">
            Nenhum perfil cadastrado ainda. Crie seu primeiro perfil para começar.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
