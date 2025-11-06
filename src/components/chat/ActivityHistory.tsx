import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, Calendar, CheckCircle2, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Activity } from "@/types/chat";

/**
 * @typedef {object} ActivityHistoryProps
 * @property {Activity[]} activities - Array de objetos Activity com type, description, created_at, created_by, etc
 */

/**
 * Componente ActivityHistory
 *
 * Renderiza um timeline visual de atividades/eventos associados ao lead/conversa.
 * Integrado dentro da aba "Atividades" do componente ContactTabs.
 *
 * **Tipos de Atividades Suportadas:**
 * - **call** → ícone Phone
 * - **email** → ícone Mail
 * - **meeting** → ícone Calendar
 * - **task** → ícone CheckCircle2
 * - **note** → ícone MessageSquare
 * - **status_change** → ícone CheckCircle2
 * - **default** → ícone MessageSquare
 *
 * **Layout de Cada Atividade:**
 * - Ícone à esquerda (flex-shrink-0, mt-1, h-4 w-4, muted-foreground)
 * - Ícone + label em bold (ex: "Chamada", "Email")
 * - Description truncado com text-xs
 * - Timestamp relativo usando date-fns formatDistanceToNow (locale pt-BR)
 * - Border-b entre atividades, último sem borda
 *
 * **Casos Especiais:**
 * - Se activities vazio: renderiza Card com mensagem "Nenhuma atividade registrada"
 * - Usa formatDistanceToNow para timestamps relativos (ex: "há 2 dias")
 *
 * **Design:**
 * - Card wrapper com título "Atividades"
 * - Ícones em muted-foreground (cinza claro)
 * - Space-y-3 entre atividades
 * - Text-xs para labels, descriptions e timestamps
 *
 * @param {ActivityHistoryProps} props - Props do componente
 * @returns {JSX.Element} Timeline visual de atividades ou mensagem vazia
 */
export function ActivityHistory({
  activities = [],
}: {
  activities?: Activity[];
}) {
  const getActivityIcon = (type: Activity["type"]) => {
    const iconProps = "h-4 w-4 text-muted-foreground";
    switch (type) {
      case "call":
        return <Phone className={iconProps} />;
      case "email":
        return <Mail className={iconProps} />;
      case "meeting":
        return <Calendar className={iconProps} />;
      case "task":
        return <CheckCircle2 className={iconProps} />;
      case "note":
        return <MessageSquare className={iconProps} />;
      case "status_change":
        return <CheckCircle2 className={iconProps} />;
      default:
        return <MessageSquare className={iconProps} />;
    }
  };

  const getActivityLabel = (type: Activity["type"]) => {
    const labels: Record<Activity["type"], string> = {
      call: "Chamada",
      email: "Email",
      meeting: "Reunião",
      task: "Tarefa",
      note: "Nota",
      status_change: "Mudança de Status",
    };
    return labels[type];
  };

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Atividades</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground text-center py-4">
            Nenhuma atividade registrada
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex gap-3 pb-3 border-b last:border-b-0 last:pb-0"
        >
          <div className="flex-shrink-0 mt-1">
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold">
              {getActivityLabel(activity.type)}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {activity.description}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(activity.created_at), {
                addSuffix: true,
                locale: ptBR,
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}