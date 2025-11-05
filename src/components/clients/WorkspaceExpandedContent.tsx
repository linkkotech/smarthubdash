/**
 * WorkspaceExpandedContent - Detalhes expansíveis de um workspace
 * 
 * Exibido quando o usuário clica no chevron de uma linha da tabela.
 * Mostra informações detalhadas do workspace em 3 colunas responsivas:
 * - Coluna 1: Dados básicos (nome, tipo, documento, slug)
 * - Coluna 2: Metadados (owner, datas de criação/atualização)
 * - Coluna 3: Ações rápidas (abrir detalhes, editar, logar como)
 * 
 * @component
 * @param {Object} props - Props do componente
 * @param {WorkspaceTableRow} props.workspace - Objeto com dados completos do workspace
 * @param {Function} props.onEdit - Callback para editar workspace
 * @param {Function} props.onLoginAs - Callback para logar como admin do workspace
 * @param {Function} props.onOpenDetails - Callback para abrir página de detalhes
 * 
 * @example
 * <WorkspaceExpandedContent 
 *   workspace={workspace}
 *   onEdit={() => handleEdit(workspace)}
 *   onLoginAs={() => handleLoginAs(workspace)}
 *   onOpenDetails={() => navigate(`/clientes/${workspace.id}`)}
 * />
 */

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WorkspaceTableRow } from "@/types/workspace";
import { Edit, ExternalLink, UserCog } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WorkspaceExpandedContentProps {
  workspace: WorkspaceTableRow;
  onEdit: () => void;
  onLoginAs: () => void;
  onOpenDetails: () => void;
}

/**
 * Formata CPF (xxx.xxx.xxx-xx) ou CNPJ (xx.xxx.xxx/xxxx-xx)
 */
function formatDocument(doc: string | null): string {
  if (!doc) return "—";
  
  // Remove tudo que não é número
  const numbers = doc.replace(/\D/g, "");
  
  // CPF: 11 dígitos
  if (numbers.length === 11) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  
  // CNPJ: 14 dígitos
  if (numbers.length === 14) {
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  
  return doc;
}

export function WorkspaceExpandedContent({
  workspace,
  onEdit,
  onLoginAs,
  onOpenDetails,
}: WorkspaceExpandedContentProps) {
  return (
    <div className="p-6 bg-muted/30">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coluna 1: Informações Básicas */}
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-1">
              Nome do Workspace
            </h4>
            <p className="text-sm font-medium">{workspace.name}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-1">
              Tipo
            </h4>
            <Badge variant={workspace.client_type === "pessoa_juridica" ? "default" : "secondary"}>
              {workspace.client_type === "pessoa_juridica" ? "Pessoa Jurídica" : "Pessoa Física"}
            </Badge>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-1">
              Documento
            </h4>
            <p className="text-sm">{formatDocument(workspace.document)}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-1">
              Slug
            </h4>
            <p className="text-sm text-muted-foreground font-mono">{workspace.slug}</p>
          </div>
        </div>

        {/* Coluna 2: Metadados */}
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-1">
              Proprietário
            </h4>
            <p className="text-sm font-medium">{workspace.owner?.full_name || "—"}</p>
            <p className="text-xs text-muted-foreground">{workspace.owner?.email || "—"}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-1">
              Criado em
            </h4>
            <p className="text-sm">
              {format(new Date(workspace.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-1">
              Última atualização
            </h4>
            <p className="text-sm text-muted-foreground">
              {format(new Date(workspace.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
        </div>

        {/* Coluna 3: Ações Rápidas */}
        <div className="flex flex-col gap-2 items-start md:items-end md:justify-start">
          <Button size="sm" onClick={onOpenDetails} className="w-full md:w-auto">
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir Detalhes
          </Button>
          
          <Button size="sm" variant="outline" onClick={onEdit} className="w-full md:w-auto">
            <Edit className="h-4 w-4 mr-2" />
            Editar Workspace
          </Button>
          
          <Button size="sm" variant="outline" onClick={onLoginAs} className="w-full md:w-auto">
            <UserCog className="h-4 w-4 mr-2" />
            Logar como Admin
          </Button>
        </div>
      </div>
    </div>
  );
}
