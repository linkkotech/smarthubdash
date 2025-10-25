import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CustomFieldsSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Custom Fields</h1>
        <p className="text-muted-foreground">
          Crie campos personalizados para clientes, planos e outros módulos
        </p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Campos Personalizados</CardTitle>
          <CardDescription>
            Adicione campos extras às entidades do sistema
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
