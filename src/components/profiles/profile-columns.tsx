import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Link2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProfileContent {
  name?: string;
  position?: string;
  company?: string;
  avatar_url?: string;
  plan_badge?: string;
  responsible?: string;
}

interface DigitalProfile {
  id: string;
  client_id: string;
  active_template_id: string;
  content: ProfileContent;
  status: string;
  short_id: string;
  slug: string | null;
  type: string;
  created_at: string;
  updated_at: string;
}

// Função auxiliar para extrair iniciais
const getInitials = (name?: string) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Função auxiliar para obter variante da badge de status
const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "published":
      return "default";
    case "draft":
      return "secondary";
    case "archived":
      return "outline";
    default:
      return "secondary";
  }
};

// Função auxiliar para obter label do status
const getStatusLabel = (status: string): string => {
  switch (status) {
    case "published":
      return "Publicado";
    case "draft":
      return "Rascunho";
    case "archived":
      return "Arquivado";
    default:
      return status;
  }
};

export const profileColumns: ColumnDef<DigitalProfile>[] = [
  {
    accessorKey: "content.name",
    header: "Nome",
    cell: ({ row }) => {
      const name = row.original.content.name;
      const avatarUrl = row.original.content.avatar_url;

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl} alt={name || "Perfil"} />
            <AvatarFallback className="text-xs">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{name || "Sem nome"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "content.position",
    header: "Cargo",
    cell: ({ row }) => {
      const position = row.original.content.position;
      return <span className="text-muted-foreground">{position || "—"}</span>;
    },
  },
  {
    accessorKey: "content.company",
    header: "Empresa",
    cell: ({ row }) => {
      const company = row.original.content.company;
      return <span>{company || "—"}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={getStatusVariant(status)}>
          {getStatusLabel(status)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "content.plan_badge",
    header: "Plano",
    cell: ({ row }) => {
      const planBadge = row.original.content.plan_badge;
      return (
        <Badge variant="outline">
          {planBadge || "BÁSICO"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "content.responsible",
    header: "Responsável",
    cell: ({ row }) => {
      const responsible = row.original.content.responsible;
      return <span className="text-muted-foreground">{responsible || "—"}</span>;
    },
  },
  {
    accessorKey: "created_at",
    header: "Criado em",
    cell: ({ row }) => {
      const createdAt = row.original.created_at;
      try {
        return (
          <span className="text-muted-foreground">
            {format(new Date(createdAt), "dd/MM/yyyy", { locale: ptBR })}
          </span>
        );
      } catch {
        return <span className="text-muted-foreground">—</span>;
      }
    },
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const profile = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => console.log("Ver perfil:", profile.id)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Ver Perfil
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => console.log("Editar perfil:", profile.id)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => console.log("Compartilhar:", profile.short_id)}
            >
              <Link2 className="mr-2 h-4 w-4" />
              Compartilhar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => console.log("Excluir perfil:", profile.id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
