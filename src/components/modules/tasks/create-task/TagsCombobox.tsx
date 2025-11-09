import { useState } from "react";
import { Control } from "react-hook-form";
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
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskFormData } from "@/lib/schemas/task.schema";
import { Input } from "@/components/ui/input";

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TagsComboboxProps {
  control: Control<TaskFormData>;
  tags: Tag[];
  isLoading?: boolean;
  onCreateTag?: (tagName: string) => Promise<Tag>;
}

export function TagsCombobox({
  control,
  tags,
  isLoading = false,
  onCreateTag,
}: TagsComboboxProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTag = async () => {
    if (!inputValue.trim() || !onCreateTag) return;

    setIsCreating(true);
    try {
      const newTag = await onCreateTag(inputValue.trim());
      // The new tag will be added via the mutation callback
      setInputValue("");
    } catch (error) {
      console.error("Failed to create tag:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <FormField
      control={control}
      name="tags"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tags</FormLabel>
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
                    ? "Selecionar tags..."
                    : `${field.value?.length || 0} tag(s) selecionada(s)`}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput
                  placeholder="Buscar ou criar tag..."
                  value={inputValue}
                  onValueChange={setInputValue}
                />
                <CommandList>
                  {/* Create new tag option */}
                  {inputValue.trim() && (
                    <CommandGroup>
                      <CommandItem
                        value={`create-${inputValue}`}
                        onSelect={handleCreateTag}
                        disabled={isCreating}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Criar tag "{inputValue}"
                      </CommandItem>
                    </CommandGroup>
                  )}

                  <CommandEmpty>Nenhuma tag encontrada.</CommandEmpty>

                  {/* Existing tags */}
                  <CommandGroup>
                    {tags.map((tag) => (
                      <CommandItem
                        key={tag.id}
                        value={tag.id}
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
                            field.value?.includes(tag.id)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <div
                          className="h-3 w-3 rounded-full mr-2"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
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
              {field.value.map((tagId) => {
                const tag = tags.find((t) => t.id === tagId);
                return (
                  <Badge key={tagId} variant="secondary">
                    <div
                      className="h-2 w-2 rounded-full mr-1"
                      style={{ backgroundColor: tag?.color }}
                    />
                    {tag?.name}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer"
                      onClick={() => {
                        field.onChange(
                          field.value.filter((id) => id !== tagId)
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
