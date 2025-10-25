import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaymentSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Credenciais de Pagamento</h1>
        <p className="text-muted-foreground">
          Configure integrações com gateways de pagamento
        </p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Gateways de Pagamento</CardTitle>
          <CardDescription>
            Stripe, PayPal, Mercado Pago e outras integrações
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
