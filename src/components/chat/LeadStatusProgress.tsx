import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { KanbanStatus } from "@/types/chat";
import { cn } from "@/lib/utils";

/**
 * @typedef {object} LeadStatusProgressProps
 * @property {KanbanStatus} currentStatus - Status atual do lead: 'prospect'|'qualified_lead'|'opportunity'|'negotiation'|'closed'
 * @property {string} [statusLabel] - Texto descritivo do status atual (ex: "Novo Lead").
 * @property {(status: KanbanStatus) => void} [onStatusChange] - Disparado ao clicar em novo estágio (arg: novo KanbanStatus)
 */

/**
 * Componente LeadStatusProgress
 *
 * Barra visual de progresso com 5 botões representando o funil Kanban do CRM:
 * 1. Prospect → 2. Qualified Lead → 3. Opportunity → 4. Negotiation → 5. Closed
 *
 * **Funcionalidade:**
 * - Buttons 1-N: Passados em azul (blue-600) se position <= currentPosition
 * - Buttons N+1-5: Futuros em cinza (gray-200) se position > currentPosition
 * - Clique em qualquer botão dispara onStatusChange com novo status
 * - Permite avançar ou retroceder no funil (sem restrições de sequência)
 *
 * **Visual:**
 * - 5 buttons com flex-1 distribuição igual de largura
 * - Current stage e anteriores: bg-blue-600 text-white (ativo)
 * - Próximos estágios: bg-gray-200 text-gray-700 (inativo)
 * - Labels: números 1-5 (text-xs font-semibold)
 * - Card wrapper com espaçamento padrão
 *
 * **Integração:**
 * - Usado em ChatDetails para gerenciar status do lead
 * - Atualizado automaticamente quando kanbanStatus prop mudar
 * - onStatusChange tipicamente salva em Supabase via context/API
 *
 * @param {LeadStatusProgressProps} props - Props do componente
 * @returns {JSX.Element} Card com barra de 5 botões de progresso
 */
export function LeadStatusProgress({
  currentStatus,
  statusLabel,
  onStatusChange,
}: {
  currentStatus: KanbanStatus;
  statusLabel?: string;
  onStatusChange?: (status: KanbanStatus) => void;
}) {
  const statusStages: { status: KanbanStatus; label: string; position: number }[] = [
    { status: "prospect", label: "1", position: 1 },
    { status: "qualified_lead", label: "2", position: 2 },
    { status: "opportunity", label: "3", position: 3 },
    { status: "negotiation", label: "4", position: 4 },
    { status: "closed", label: "5", position: 5 },
  ];

  const currentPosition =
    statusStages.find((s) => s.status === currentStatus)?.position || 1;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Status</CardTitle>
          {statusLabel && (
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
              <span className="text-xs text-muted-foreground">{statusLabel}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex space-x-1">
          {statusStages.map((stage, index) => (
            <Button
              key={stage.status}
              onClick={() => onStatusChange?.(stage.status)}
              className={cn(
                "flex-1 h-8 text-xs font-semibold",
                {
                  "rounded-l-full": index === 0,
                  "rounded-r-full": index === statusStages.length - 1,
                  "rounded-none": index > 0 && index < statusStages.length - 1,
                },
                stage.position <= currentPosition
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              )}
            >
              {stage.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}