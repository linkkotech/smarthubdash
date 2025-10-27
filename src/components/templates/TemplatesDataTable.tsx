import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  ChevronDown, 
  Edit, 
  Link, 
  Trash2, 
  FileText, 
  Blocks,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Template {
  id: string;
  type: "profile" | "block";
  title: string;
  subtitle: string;
  created_at: string;
}

interface TemplatesDataTableProps {
  data: Template[];
  onEdit: (id: string, type: "profile" | "block") => void;
  onLink: (id: string) => void;
  onDelete: (id: string) => void;
}

// Componente de Detalhes Expansíveis
function ExpandedRowContent({ template, onEdit }: { template: Template; onEdit: (id: string, type: "profile" | "block") => void }) {
  return (
    <div className="p-6 bg-muted/30">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coluna 1: Informações Básicas */}
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-1">
              Título
            </h4>
            <p className="text-sm">{template.title}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-1">
              Descrição
            </h4>
            <p className="text-sm text-muted-foreground">
              {template.subtitle || "Sem descrição"}
            </p>
          </div>
        </div>

        {/* Coluna 2: Metadados */}
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-1">
              Criado por
            </h4>
            <p className="text-sm">Admin Sistema</p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-1">
              Usado por
            </h4>
            <p className="text-sm text-muted-foreground">
              5 clientes
            </p>
          </div>
        </div>

        {/* Coluna 3: Ações */}
        <div className="flex items-start justify-end">
          <Button size="default" onClick={() => onEdit(template.id, template.type)}>
            <Edit className="h-4 w-4 mr-2" />
            Abrir Editor
          </Button>
        </div>
      </div>
    </div>
  );
}

export function TemplatesDataTable({
  data,
  onEdit,
  onLink,
  onDelete,
}: TemplatesDataTableProps) {
  // Estado para controlar quais linhas estão expandidas
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (rowId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  // Definição das colunas
  const columns: ColumnDef<Template>[] = [
    // Coluna 1: Toggle de Expansão
    {
      id: "expander",
      header: () => null,
      cell: ({ row }) => {
        const isExpanded = expandedRows.has(row.id);
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleRow(row.id)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        );
      },
    },
    // Coluna 2: Nome + Tipo (ícone)
    {
      accessorKey: "title",
      header: "Nome",
      cell: ({ row }) => {
        const template = row.original;
        return (
          <div className="flex items-center gap-2">
            {template.type === "profile" ? (
              <FileText className="h-4 w-4 text-blue-500" />
            ) : (
              <Blocks className="h-4 w-4 text-purple-500" />
            )}
            <div>
              <div className="font-medium">{template.title}</div>
              <div className="text-xs text-muted-foreground">
                {template.subtitle}
              </div>
            </div>
          </div>
        );
      },
    },
    // Coluna 3: Tipo (badge)
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return (
          <Badge variant={type === "profile" ? "default" : "secondary"}>
            {type === "profile" ? "Perfil Digital" : "Bloco"}
          </Badge>
        );
      },
    },
    // Coluna 4: Data de Criação
    {
      accessorKey: "created_at",
      header: "Data de Criação",
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        return format(date, "dd/MM/yyyy", { locale: ptBR });
      },
    },
    // Coluna 5: Ações (Dropdown)
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const template = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => onEdit(template.id, template.type)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onLink(template.id)}>
                <Link className="h-4 w-4 mr-2" />
                Vincular
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(template.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <>
                {/* Linha principal */}
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                
                {/* Linha expansível (condicional) */}
                {expandedRows.has(row.id) && (
                  <TableRow key={`${row.id}-expanded`}>
                    <TableCell colSpan={columns.length} className="p-0">
                      <ExpandedRowContent template={row.original} onEdit={onEdit} />
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Nenhum template encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
