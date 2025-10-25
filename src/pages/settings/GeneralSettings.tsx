import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GeneralSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações Gerais</h1>
        <p className="text-muted-foreground">
          Configure as preferências gerais da plataforma
        </p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Informações Gerais</CardTitle>
          <CardDescription>
            Gerencie as configurações básicas do sistema
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
