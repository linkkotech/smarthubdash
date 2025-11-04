import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Building2, User, Calendar, Hash, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDocument } from "@/lib/utils";
import type { WorkspaceWithDetails } from "@/types/workspace";

/**
 * Props do componente WorkspaceDetailCard
 */
interface WorkspaceDetailCardProps {
  /**
   * Dados completos do workspace incluindo informações do owner
   */
  workspace: WorkspaceWithDetails;
}

/**
 * WorkspaceDetailCard - Card com informações detalhadas do workspace
 * 
 * @description
 * Exibe as informações principais do workspace organizadas em cards:
 * - Card 1: Nome, Tipo (badge), Documento formatado
 * - Card 2: Administrador (nome + email do owner)
 * - Card 3: Metadados (slug, data de criação)
 * 
 * @param {WorkspaceDetailCardProps} props - Props do componente
 * @param {WorkspaceWithDetails} props.workspace - Dados do workspace
 * 
 * @example
 * <WorkspaceDetailCard workspace={workspace} />
 */
export function WorkspaceDetailCard({ workspace }: WorkspaceDetailCardProps) {
  const clientTypeDisplay =
    workspace.client_type === "pessoa_juridica"
      ? "Pessoa Jurídica"
      : "Pessoa Física";

  const documentFormatted = formatDocument(
    workspace.document,
    workspace.client_type
  );

  const createdAtFormatted = format(
    new Date(workspace.created_at),
    "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
    { locale: ptBR }
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Card 1: Informações Principais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Informações do Workspace
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Nome
            </label>
            <p className="text-lg font-semibold">{workspace.name}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Tipo de Cliente
            </label>
            <div className="mt-1">
              <Badge
                variant={
                  workspace.client_type === "pessoa_juridica"
                    ? "default"
                    : "secondary"
                }
              >
                {clientTypeDisplay}
              </Badge>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {workspace.client_type === "pessoa_juridica" ? "CNPJ" : "CPF"}
            </label>
            <p className="text-base font-mono">{documentFormatted}</p>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Administrador */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Administrador
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Nome Completo
            </label>
            <p className="text-lg font-semibold">{workspace.owner_name}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              E-mail
            </label>
            <p className="text-base text-muted-foreground">
              {workspace.owner_email}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Metadados */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Metadados
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Slug
            </label>
            <p className="text-base font-mono text-muted-foreground">
              {workspace.slug}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Data de Criação
            </label>
            <p className="text-base text-muted-foreground">
              {createdAtFormatted}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
