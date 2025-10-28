import { usePageHeader } from "@/contexts/PageHeaderContext";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Binoculars } from "lucide-react";

export default function CrmProspeccao() {
  const { setConfig } = usePageHeader();

  useEffect(() => {
    setConfig({
      title: "Prospecção",
    });
  }, [setConfig]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Binoculars className="h-5 w-5 text-primary" />
            Prospecção
          </CardTitle>
          <CardDescription>
            Identifique e qualifique novos prospects para seu funil de vendas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Esta página está em desenvolvimento. Em breve você terá acesso a 
            ferramentas avançadas de prospecção e qualificação de leads.
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
