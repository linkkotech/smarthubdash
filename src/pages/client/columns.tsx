import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

export type TeamMember = {
  id: string;
  full_name: string;
  email: string;
  client_user_role: string | null;
  status: 'ativo' | 'inativo';
  unidade: string | null;
  telefone: string | null;
  celular: string | null;
  cargo: string | null;
  avatarUrl?: string;
};

export const columns: ColumnDef<TeamMember>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Selecionar todos"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Selecionar linha"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 48,
  },
  {
    accessorKey: "full_name",
    header: "Nome",
    cell: ({ row }) => {
      const member = row.original;
      const initials = member.full_name
        ? member.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "?";
      return (
        <div className="flex items-center gap-3 min-w-[180px]">
          <Avatar className="h-8 w-8">
            <AvatarImage src={member.avatarUrl} alt={member.full_name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="font-medium leading-tight">{member.full_name}</span>
        </div>
      );
    },
    size: 200,
  },
  {
    accessorKey: "cargo",
    header: "Cargo",
    cell: ({ row }) => <span>{row.original.cargo || "-"}</span>,
    size: 120,
  },
  {
    accessorKey: "email",
    header: "E-mail",
    cell: ({ row }) => <span>{row.original.email}</span>,
    size: 200,
  },
  {
    accessorKey: "celular",
    header: "Celular",
    cell: ({ row }) => <span>{row.original.celular || "-"}</span>,
    size: 130,
  },
  {
    accessorKey: "unidade",
    header: "Unidade",
    cell: ({ row }) => <span>{row.original.unidade || "-"}</span>,
    size: 130,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "ativo" ? "default" : "secondary"}>
        {row.original.status === "ativo" ? "Ativo" : "Inativo"}
      </Badge>
    ),
    size: 100,
  },
  {
    accessorKey: "client_user_role",
    header: "Permissão",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.original.client_user_role || "-"}</Badge>
    ),
    size: 120,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="hover:bg-muted">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="flex items-center gap-2">
            <Pencil className="h-4 w-4" /> Editar
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-4 w-4" /> Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 64,
  },
];
