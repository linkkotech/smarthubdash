import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ModulesSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Módulos e Integrações</h1>
        <p className="text-muted-foreground">
          Ative ou desative módulos e configure integrações externas
        </p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Gerenciamento de Módulos</CardTitle>
          <CardDescription>
            Configure módulos opcionais e integrações com serviços externos
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
