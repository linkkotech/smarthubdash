import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
export default function CompanySettings() {
  return <div className="space-y-6">
      <div>
        <h1 className="font-bold text-2xl">Configurações da Empresa</h1>
        <p className="text-muted-foreground">
          Gerencie informações institucionais e identidade da organização
        </p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Dados da Empresa</CardTitle>
          <CardDescription>
            Nome, CNPJ, endereço, logo e informações de contato
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Configurações disponíveis em breve...
          </p>
        </CardContent>
      </Card>
    </div>;
}