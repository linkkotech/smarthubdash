import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { ClientActionsDropdown } from "./ClientActionsDropdown";

// Componente estável para o header de Cliente
function ClientColumnHeader({ column }: { column: any }) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      Cliente
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}

// Componente estável para o header de Data de Início
function StartDateColumnHeader({ column }: { column: any }) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      Data de Início
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}

export interface ClientWithContract {
  id: string;
  name: string;
  client_type: string;
  admin_name: string;
  admin_email: string;
  document?: string;
  contracts: Array<{
    is_active: boolean;
    start_date: string;
    plan_id?: string;
    contract_type?: string;
    end_date?: string | null;
    billing_day?: number | null;
    plans: {
      name: string;
    };
  }>;
}

interface CreateClientColumnsProps {
  navigate: (path: string) => void;
  onEdit: (client: ClientWithContract) => void;
  onViewContract: (client: ClientWithContract) => void;
  onLoginAs: (client: ClientWithContract) => void;
  onDeactivate: (client: ClientWithContract) => void;
}

export function createClientColumns({
  navigate,
  onEdit,
  onViewContract,
  onLoginAs,
  onDeactivate,
}: CreateClientColumnsProps): ColumnDef<ClientWithContract>[] {
  return [
    {
      accessorKey: "name",
      header: ClientColumnHeader,
      cell: ({ row }) => (
        <Button
          variant="link"
          className="font-medium p-0 h-auto"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/clientes/${row.original.id}`);
          }}
        >
          {row.getValue("name")}
        </Button>
      ),
    },
    {
      id: "plan",
      header: "Plano",
      cell: ({ row }) => {
        const contract = row.original.contracts?.[0];
        return contract?.plans.name ? (
          <span>{contract.plans.name}</span>
        ) : (
          <span className="text-muted-foreground">Sem plano</span>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const contract = row.original.contracts?.[0];
        const isActive = contract?.is_active ?? false;

        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Ativo" : "Inativo"}
          </Badge>
        );
      },
    },
    {
      id: "start_date",
      header: StartDateColumnHeader,
      cell: ({ row }) => {
        const contract = row.original.contracts?.[0];
        if (!contract?.start_date) {
          return <span className="text-muted-foreground">-</span>;
        }

        return format(new Date(contract.start_date), "dd/MM/yyyy");
      },
      sortingFn: (rowA, rowB) => {
        const dateA = rowA.original.contracts?.[0]?.start_date;
        const dateB = rowB.original.contracts?.[0]?.start_date;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => (
        <ClientActionsDropdown
          client={row.original}
          onEdit={onEdit}
          onViewContract={onViewContract}
          onLoginAs={onLoginAs}
          onDeactivate={onDeactivate}
        />
      ),
    },
  ];
}
