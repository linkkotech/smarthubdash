import { useMemo, useState } from "react";
import { Control, Controller } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskFormData } from "@/lib/schemas/task.schema";

interface User {
  id: string;
  full_name: string;
  email: string;
}

interface AssigneesComboboxProps {
  control: Control<TaskFormData>;
  users: User[];
  isLoading?: boolean;
}

export function AssigneesCombobox({
  control,
  users,
  isLoading = false,
}: AssigneesComboboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={control}
      name="assignees"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Responsáveis</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                  disabled={isLoading}
                >
                  {field.value?.length === 0
                    ? "Selecionar responsáveis..."
                    : `${field.value?.length || 0} selecionado(s)`}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Buscar responsáveis..." />
                <CommandEmpty>Nenhum responsável encontrado.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {users.map((user) => (
                      <CommandItem
                        key={user.id}
                        value={user.id}
                        onSelect={(currentValue) => {
                          const updatedValue = field.value?.includes(
                            currentValue
                          )
                            ? field.value.filter((id) => id !== currentValue)
                            : [...(field.value || []), currentValue];
                          field.onChange(updatedValue);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value?.includes(user.id)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span>{user.full_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Selected badges */}
          {field.value && field.value.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {field.value.map((userId) => {
                const user = users.find((u) => u.id === userId);
                return (
                  <Badge key={userId} variant="secondary">
                    {user?.full_name}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer"
                      onClick={() => {
                        field.onChange(
                          field.value.filter((id) => id !== userId)
                        );
                      }}
                    />
                  </Badge>
                );
              })}
            </div>
          )}

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
