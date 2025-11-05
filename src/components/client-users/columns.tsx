import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ClientUserActionsMenu } from "./ClientUserActionsMenu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface ClientUser {
  id: string;
  full_name: string;
  email: string;
  workspace_id: string;
  workspace_name: string;
  client_user_role: 'client_admin' | 'client_manager' | 'client_member';
  created_at: string;
}

interface CreateColumnsProps {
  onEdit: (user: ClientUser) => void;
  onResetPassword: (user: ClientUser) => void;
  onDeactivate: (user: ClientUser) => void;
  onRemove: (user: ClientUser) => void;
}

function getRoleVariant(role: string): "default" | "secondary" | "outline" {
  switch (role) {
    case 'client_admin':
      return 'default';
    case 'client_manager':
      return 'secondary';
    case 'client_member':
      return 'outline';
    default:
      return 'outline';
  }
}

function getRoleLabel(role: string): string {
  const labels = {
    client_admin: 'Administrador',
    client_manager: 'Gerente',
    client_member: 'Membro',
  };
  return labels[role as keyof typeof labels] || role;
}

export function createColumns({
  onEdit,
  onResetPassword,
  onDeactivate,
  onRemove,
}: CreateColumnsProps): ColumnDef<ClientUser>[] {
  return [
    {
      accessorKey: "full_name",
      header: "Nome",
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {row.getValue("full_name")}
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        return (
          <div className="text-muted-foreground">
            {row.getValue("email")}
          </div>
        );
      },
    },
    {
      accessorKey: "workspace_name",
      header: "Cliente",
      cell: ({ row }) => {
        return (
          <div>
            {row.getValue("workspace_name")}
          </div>
        );
      },
    },
    {
      accessorKey: "client_user_role",
      header: "Papel",
      cell: ({ row }) => {
        const role = row.getValue("client_user_role") as string;
        return (
          <Badge variant={getRoleVariant(role)}>
            {getRoleLabel(role)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Data de Criação",
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        return format(date, "dd/MM/yyyy", { locale: ptBR });
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;

        return (
          <ClientUserActionsMenu
            user={user}
            onEdit={onEdit}
            onResetPassword={onResetPassword}
            onDeactivate={onDeactivate}
            onRemove={onRemove}
          />
        );
      },
    },
  ];
}
