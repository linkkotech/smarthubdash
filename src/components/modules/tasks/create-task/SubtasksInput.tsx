import { Control, useFieldArray } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { TaskFormData } from "@/lib/schemas/task.schema";

interface SubtasksInputProps {
  control: Control<TaskFormData>;
}

export function SubtasksInput({ control }: SubtasksInputProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "subtasks",
  });

  const handleAddSubtask = () => {
    append({ title: "" });
  };

  return (
    <FormItem>
      <FormLabel>Subtarefas</FormLabel>
      <div className="space-y-2">
        {fields.map((field, index) => (
          <FormField
            key={field.id}
            control={control}
            name={`subtasks.${index}.title`}
            render={({ field: fieldProps }) => (
              <FormItem>
                <FormControl>
                  <div className="flex gap-2">
                    <Input
                      placeholder={`Subtarefa ${index + 1}`}
                      {...fieldProps}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddSubtask}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Subtarefa
        </Button>
      </div>
    </FormItem>
  );
}
