import { usePageHeader } from "@/contexts/PageHeaderContext";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GitBranch } from "lucide-react";

export default function CrmNegocios() {
  const { setConfig } = usePageHeader();

  useEffect(() => {
    setConfig({
      title: "Negócios",
    });
  }, [setConfig]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            Negócios
          </CardTitle>
          <CardDescription>
            Acompanhe o progresso de seus negócios em andamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Esta página está em desenvolvimento. Em breve você terá acesso a 
            ferramentas de acompanhamento de negócios e pipeline.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="h-48 flex items-center justify-center">
          <p className="text-muted-foreground">Widget 1 em desenvolvimento</p>
        </Card>
        <Card className="h-48 flex items-center justify-center">
          <p className="text-muted-foreground">Widget 2 em desenvolvimento</p>
        </Card>
        <Card className="h-48 flex items-center justify-center">
          <p className="text-muted-foreground">Widget 3 em desenvolvimento</p>
        </Card>
      </div>
    </div>
  );
}
