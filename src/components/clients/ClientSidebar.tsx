import { ClientWithDetails } from "@/pages/ClientDetails";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, Building2, User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClientSidebarProps {
  client: ClientWithDetails;
}

export function ClientSidebar({ client }: ClientSidebarProps) {
  const activeContract = client.contracts?.find((c) => c.is_active);

  return (
    <div className="p-6 space-y-6">
      {/* Avatar + Nome */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
          {client.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-semibold">{client.name}</h2>
          <Badge variant="outline" className="mt-1">
            {client.client_type === "pessoa_juridica" ? (
              <><Building2 className="h-3 w-3 mr-1" /> Empresa</>
            ) : (
              <><User className="h-3 w-3 mr-1" /> Pessoa Física</>
            )}
          </Badge>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex flex-col items-center py-3 h-auto"
          onClick={() => window.location.href = `mailto:${client.admin_email}`}
        >
          <Mail className="h-4 w-4 mb-1" />
          <span className="text-xs">Email</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex flex-col items-center py-3 h-auto"
        >
          <Phone className="h-4 w-4 mb-1" />
          <span className="text-xs">Ligar</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex flex-col items-center py-3 h-auto"
        >
          <Calendar className="h-4 w-4 mb-1" />
          <span className="text-xs">Agendar</span>
        </Button>
      </div>

      <Separator />

      {/* Informações do Administrador */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Administrador
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{client.admin_name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{client.admin_email}</span>
          </div>
          {client.document && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{client.document}</span>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Informações do Contrato */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Contrato Atual
        </h3>
        {activeContract ? (
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <span className="text-sm text-muted-foreground">Plano:</span>
              <span className="text-sm font-medium text-right">
                {activeContract.plans.name}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-sm text-muted-foreground">Tipo:</span>
              <Badge variant="secondary" className="text-xs">
                {activeContract.contract_type === "recurring" ? "Recorrente" : "Prazo Fixo"}
              </Badge>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-sm text-muted-foreground">Início:</span>
              <span className="text-sm font-medium">
                {format(new Date(activeContract.start_date), "dd/MM/yyyy", { locale: ptBR })}
              </span>
            </div>
            {activeContract.end_date && (
              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground">Término:</span>
                <span className="text-sm font-medium">
                  {format(new Date(activeContract.end_date), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
            )}
            {activeContract.billing_day && (
              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground">Dia de Cobrança:</span>
                <span className="text-sm font-medium">Dia {activeContract.billing_day}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Nenhum contrato ativo
          </p>
        )}
      </div>

      <Separator />

      {/* Última Atividade */}
      <div className="text-xs text-muted-foreground">
        Última atualização: {format(new Date(client.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
      </div>
    </div>
  );
}
