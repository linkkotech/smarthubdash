import { usePageHeader } from "@/contexts/PageHeaderContext";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wifi } from "lucide-react";

export default function CartoesNfcPage() {
  const { setConfig } = usePageHeader();

  useEffect(() => {
    setConfig({
      title: "Cartões NFC",
    });
  }, [setConfig]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-primary" />
            Cartões NFC
          </CardTitle>
          <CardDescription>
            Gerencie seus cartões NFC físicos e digitais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Esta página está em desenvolvimento. Em breve você terá acesso às 
            funcionalidades completas de cartões NFC.
          </p>
        </CardContent>
      </Card>

      {/* Grid de Widgets Placeholder */}
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
