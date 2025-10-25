import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RolesSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Roles & Permissions</h1>
        <p className="text-muted-foreground">
          Configure papéis de usuário e permissões granulares
        </p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Gerenciamento de Papéis</CardTitle>
          <CardDescription>
            Crie e edite roles personalizadas com permissões específicas
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
