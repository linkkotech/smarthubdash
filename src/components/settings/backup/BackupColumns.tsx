import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Download, Trash2, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Backup {
  id: string;
  filename: string;
  size: number;
  created_at: string;
  status: "completed" | "in_progress" | "failed";
}

interface CreateColumnsProps {
  onDownload: (backup: Backup) => void;
  onDelete: (backup: Backup) => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

export function createBackupColumns({
  onDownload,
  onDelete,
}: CreateColumnsProps): ColumnDef<Backup>[] {
  return [
    {
      accessorKey: "filename",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Arquivo do Backup
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("filename")}</span>
      ),
    },
    {
      accessorKey: "size",
      header: "Tamanho",
      cell: ({ row }) => {
        const bytes = row.getValue("size") as number;
        return formatFileSize(bytes);
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Data e Hora
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variants = {
          completed: "default" as const,
          in_progress: "secondary" as const,
          failed: "destructive" as const,
        };
        const labels = {
          completed: "Concluído",
          in_progress: "Em Progresso",
          failed: "Falhou",
        };
        return (
          <Badge variant={variants[status as keyof typeof variants]}>
            {labels[status as keyof typeof labels]}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const backup = row.original;
        const isCompleted = backup.status === "completed";

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onDownload(backup)}
                disabled={!isCompleted}
              >
                <Download className="mr-2 h-4 w-4" />
                Baixar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(backup)}
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
}
