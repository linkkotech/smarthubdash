import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { TaskFormData } from "@/lib/schemas/task.schema";

interface FavoriteToggleProps {
  control: Control<TaskFormData>;
}

export function FavoriteToggle({ control }: FavoriteToggleProps) {
  return (
    <FormField
      control={control}
      name="is_favorite"
      render={({ field }) => (
        <FormItem className="flex items-center justify-between p-3 rounded-lg border">
          <FormLabel className="cursor-pointer">
            Adicionar aos Favoritos
          </FormLabel>
          <FormControl>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => field.onChange(!field.value)}
              className={field.value ? "text-yellow-500" : "text-gray-400"}
            >
              <Star
                className="h-5 w-5"
                fill={field.value ? "currentColor" : "none"}
              />
            </Button>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
