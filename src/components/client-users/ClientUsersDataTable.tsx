import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { createColumns, ClientUser } from "./columns";

interface ClientUsersDataTableProps {
  data: ClientUser[];
  loading: boolean;
  onEdit: (user: ClientUser) => void;
  onResetPassword: (user: ClientUser) => void;
  onDeactivate: (user: ClientUser) => void;
  onRemove: (user: ClientUser) => void;
}

function DataTableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full max-w-sm" />
      <div className="rounded-md border">
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex space-x-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  );
}

export function ClientUsersDataTable({
  data,
  loading,
  onEdit,
  onResetPassword,
  onDeactivate,
  onRemove,
}: ClientUsersDataTableProps) {
  const columns = createColumns({
    onEdit,
    onResetPassword,
    onDeactivate,
    onRemove,
  });

  if (loading) {
    return <DataTableSkeleton />;
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="full_name"
      searchPlaceholder="Buscar por nome do usuário..."
    />
  );
}
