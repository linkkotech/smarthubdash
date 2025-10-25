import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LogsSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Logs e Auditoria</h1>
        <p className="text-muted-foreground">
          Visualize logs de sistema e auditoria de ações
        </p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Registro de Atividades</CardTitle>
          <CardDescription>
            Acompanhe logs de sistema e trilhas de auditoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Configurações disponíveis em breve...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
